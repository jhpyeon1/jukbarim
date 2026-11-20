/* 하나의 상품 DB → 리스트와 추천이 함께 쓰는 상품 목록.
   내장 스냅샷(db.js)과 구글 시트 CSV가 같은 열 이름을 쓰고, 같은 build()를 거친다. */
(function () {
  'use strict';

  var TAGS = [
    ['달콤', '맛', 'sweet'], ['은은한 단맛', '맛', 'offdry'], ['드라이', '맛', 'dry'],
    ['산미', '맛', 'fresh'], ['탄산', '맛', 'fizz'], ['타닌', '맛', 'tannic'],
    ['가벼움', '무게', 'light'], ['묵직', '무게', 'rich'],
    ['사과·배', '과일 향', 'fruit'], ['복숭아·자두', '과일 향', 'fruit'], ['멜론·열대과일', '과일 향', 'fruit'],
    ['포도', '과일 향', 'fruit'], ['베리', '과일 향', 'berry'], ['시트러스', '과일 향', 'citrus'],
    ['꽃', '꽃·허브 향', 'floral'], ['허브', '꽃·허브 향', 'herbal'],
    ['쌀', '곡물 향', 'grain'], ['누룩', '곡물 향', 'grain'], ['구수함', '곡물 향', 'grain'],
    ['견과', '숙성·고소한 향', 'nutty'], ['오크', '숙성·고소한 향', 'wood'], ['로스팅', '숙성·고소한 향', 'roasted'],
    ['부드러움', '느낌', 'soft'], ['깔끔', '느낌', 'clean'], ['긴 여운', '느낌', 'long']
  ];
  var TAG_GROUPS = ['맛', '무게', '과일 향', '꽃·허브 향', '곡물 향', '숙성·고소한 향', '느낌', '그 밖에'];
  /* 진열 순서: 와인 먼저(레드·화이트), 우리술은 작은 갈래부터, 가장 많은 증류주는 그 뒤, 기타 와인은 맨 끝 */
  var GROUPS = ['레드 와인', '화이트 와인', '탁주', '약주·청주', '과실주', '증류주', '기타 와인'];
  var SCALE = [['단맛', '단맛'], ['산미', '산미'], ['바디', '바디'], ['타닌', '타닌'], ['탄산', '탄산'], ['향 강도', '향']];
  var AXIS_RULES = [
    ['달콤', '단맛', function (v) { return v >= 4; }], ['은은한 단맛', '단맛', function (v) { return v === 3; }],
    ['드라이', '단맛', function (v) { return v <= 1; }], ['산미', '산미', function (v) { return v >= 4; }],
    ['탄산', '탄산', function (v) { return v >= 3; }], ['타닌', '타닌', function (v) { return v >= 4; }],
    ['가벼움', '바디', function (v) { return v <= 2; }], ['묵직', '바디', function (v) { return v >= 4; }]
  ];
  var tagInfo = {};
  TAGS.forEach(function (t, i) { tagInfo[t[0]] = { group: t[1], feature: t[2], order: i }; });

  function text(v) { return v === null || v === undefined ? '' : String(v).replace(/\s+/g, ' ').trim(); }
  function num(v) {
    if (typeof v === 'number') return isFinite(v) ? v : null;
    var s = text(v).replace(/[^0-9.\-]/g, '');
    if (!s) return null;
    var n = parseFloat(s);
    return isFinite(n) ? n : null;
  }
  function split(v, re) {
    return text(v).split(re).map(function (x) { return x.trim(); }).filter(Boolean);
  }

  /* 따옴표·줄바꿈이 들어간 칸까지 처리하는 CSV 파서 */
  function parseCSV(src) {
    var rows = [], row = [], cell = '', quoted = false, i = 0, c;
    src = String(src).replace(/^﻿/, '');
    for (; i < src.length; i++) {
      c = src[i];
      if (quoted) {
        if (c === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else quoted = false; }
        else cell += c;
      } else if (c === '"') quoted = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && src[i + 1] === '\n') i++;
        row.push(cell); cell = ''; rows.push(row); row = [];
      } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  function tableToRecords(columns, rows) {
    var names = columns.map(text);
    return rows.map(function (r) {
      var d = {};
      names.forEach(function (n, i) { if (n) d[n] = r[i]; });
      return d;
    });
  }

  function build(records) {
    var seen = {}, products = [];
    records.forEach(function (d, index) {
      var id = text(d['번호']), name = text(d['이름']), listPrice = num(d['가격']);
      var status = text(d['상태']);
      if (!id || !name || listPrice === null || listPrice <= 0 || seen[id] || status === '숨김') return;
      seen[id] = true;
      var sale = num(d['할인가']);
      if (sale === null || sale <= 0 || sale >= listPrice) sale = null;
      var badge = text(d['표시']);
      if (sale !== null && !badge) badge = '할인';
      var tags = [], features = [];
      split(d['태그'], /[,，、]/).forEach(function (t) {
        if (tags.indexOf(t) < 0) tags.push(t);
        var info = tagInfo[t];
        if (info && features.indexOf(info.feature) < 0) features.push(info.feature);
      });
      /* 맛·무게 태그 8개는 눈금이 있으면 눈금에서 정한다. 눈금과 태그가 어긋날 수 없게 하기 위해서다.
         해당 눈금 칸이 비어 있을 때만 태그 칸에 적힌 값을 따른다(예: 탄산 눈금이 없는 스파클링 와인). */
      AXIS_RULES.forEach(function (r) {
        var v = num(d[r[1]]);
        if (v === null) return;
        var at = tags.indexOf(r[0]);
        if (at >= 0) tags.splice(at, 1);
        if (r[2](v)) tags.push(r[0]);
      });
      features = [];
      tags.forEach(function (t) { var info = tagInfo[t]; if (info && features.indexOf(info.feature) < 0) features.push(info.feature); });
      tags.sort(function (a, b) {
        return (tagInfo[a] ? tagInfo[a].order : 999) - (tagInfo[b] ? tagInfo[b].order : 999);
      });
      var aroma = split(d['향미'], /[·,]/);
      /* 추천의 '과실 향'은 과일 계열 태그가 있거나 향미에 과일이 적힌 술 */
      if (features.indexOf('fruit') < 0 && (features.indexOf('berry') >= 0 || features.indexOf('citrus') >= 0 ||
          /과일|과실|무화과/.test(aroma.join(' ')))) features.push('fruit');
      var scale = [];
      SCALE.forEach(function (s) {
        var v = num(d[s[0]]);
        if (v !== null) scale.push({ label: s[1], value: Math.max(0, Math.min(5, Math.round(v))) });
      });
      var sweet = num(d['단맛']);
      var short = text(d['짧은 설명']);
      var order = num(d['순서']);
      var photo = text(d['사진']);
      if (!/^[A-Za-z0-9_\-]+\.(webp|png|jpg|jpeg)$/.test(photo)) photo = '';
      var group = text(d['분류']) || '그 밖의 술';
      products.push({
        id: id, name: name, base: name.replace(/\s+\d+(\.\d+)?%$/, ''),
        original: text(d['원어명']), group: group, cat: text(d['주종']) || group,
        listPrice: listPrice, salePrice: sale, price: sale !== null ? sale : listPrice,
        abv: num(d['도수(%)']), vol: num(d['용량(ml)']),
        maker: text(d['양조장·생산자']), grape: text(d['품종']), country: text(d['국가']),
        scale: scale, aroma: aroma, tags: aroma, tagList: tags, features: features.sort(),
        mood: split(d['분위기(추천용)'], /[,，]/),
        short: short, note: short.replace(/([.!?]["”']?)\s+/g, '$1\n'), long: text(d['긴 설명']),
        storage: text(d['보관']), order: order === null ? 100000 + index : order,
        photo: photo, soldOut: status === '품절', badge: badge,
        available: status !== '품절',
        sensorySource: { graph: sweet === null ? {} : { '당도': sweet } },
        merchandising: null, sources: []
      });
    });
    products.sort(function (a, b) { return a.order - b.order; });
    return products;
  }

  var db = window.JUKBARIM_DB || { columns: [], rows: [] };
  var config = window.JUKBARIM_CONFIG || {};
  var listeners = [];
  var catalog = {
    tags: TAGS.map(function (t) { return t[0]; }), tagInfo: tagInfo, tagGroups: TAG_GROUPS, groups: GROUPS,
    products: build(tableToRecords(db.columns, db.rows)),
    source: 'snapshot', updated: null,
    parseCSV: parseCSV, build: build, tableToRecords: tableToRecords,
    onChange: function (fn) { listeners.push(fn); },
    refresh: refresh
  };
  window.JukbarimCatalog = catalog;
  window.JUKBARIM_PRODUCTS = catalog.products;

  function fingerprint(list) {
    return JSON.stringify(list.map(function (p) {
      return [p.id, p.name, p.price, p.listPrice, p.soldOut, p.badge, p.abv, p.vol, p.group, p.cat, p.tagList, p.aroma,
        p.short, p.long, p.order, p.scale, p.mood, p.maker, p.grape, p.country, p.storage, p.photo, p.original];
    }));
  }
  function applyCSV(csv, source) {
    var table = parseCSV(csv);
    if (table.length < 2) return false;
    var head = table[0].map(text);
    if (head.indexOf('번호') < 0 || head.indexOf('이름') < 0 || head.indexOf('가격') < 0) return false;
    var next = build(tableToRecords(head, table.slice(1)));
    if (!next.length) return false;
    var changed = fingerprint(next) !== fingerprint(catalog.products);
    catalog.source = source; catalog.updated = Date.now();
    if (!changed) return true;
    catalog.products = next;
    window.JUKBARIM_PRODUCTS = next;
    listeners.forEach(function (fn) { try { fn(next); } catch (e) { /* 화면 한 곳의 오류가 다른 곳을 막지 않게 */ } });
    return true;
  }

  var CACHE = 'jukbarim-sheet-v1', loading = false;
  function refresh() {
    var url = text(config.sheetCsv);
    if (!url || loading || !window.fetch) return;
    loading = true;
    var done = function () { loading = false; };
    var timer = setTimeout(done, 12000);
    fetch(url + (url.indexOf('?') < 0 ? '?' : '&') + 't=' + Math.floor(Date.now() / 60000), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('sheet ' + r.status); return r.text(); })
      .then(function (csv) {
        if (applyCSV(csv, 'sheet')) {
          try { localStorage.setItem(CACHE, JSON.stringify({ url: url, at: Date.now(), csv: csv })); } catch (e) { /* 저장 공간이 없어도 계속 */ }
        }
      })
      .catch(function () { /* 시트를 못 읽으면 지금 목록을 그대로 쓴다 */ })
      .then(function () { clearTimeout(timer); done(); });
  }

  if (text(config.sheetCsv)) {
    try {
      var saved = JSON.parse(localStorage.getItem(CACHE) || 'null');
      if (saved && saved.url === text(config.sheetCsv) && saved.csv) applyCSV(saved.csv, 'cache');
    } catch (e) { /* 저장된 값이 깨졌으면 무시 */ }
    refresh();
    var minutes = Math.max(2, Number(config.refreshMinutes) || 10);
    setInterval(function () { if (!document.hidden) refresh(); }, minutes * 60000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && (!catalog.updated || Date.now() - catalog.updated > 120000)) refresh();
    });
  }
})();
