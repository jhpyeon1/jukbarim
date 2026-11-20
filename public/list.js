/* 주류 리스트: 주종 · 검색 · 정렬 · 조건(가격·도수·태그) · 상세.
   상품은 JukbarimCatalog 한 곳에서 읽는다. 추천 화면과 같은 목록이다. */
(function () {
  'use strict';
  var C = window.JukbarimCatalog;
  var BASE = new URL('.', document.currentScript.src).href;

  var PRICE = [
    ['p1', '2만 원 이하', function (p) { return p.price <= 20000; }],
    ['p2', '2~3만 원', function (p) { return p.price > 20000 && p.price <= 30000; }],
    ['p3', '3~5만 원', function (p) { return p.price > 30000 && p.price <= 50000; }],
    ['p4', '5만 원 초과', function (p) { return p.price > 50000; }]
  ];
  var ABV = [
    ['a1', '10도 이하', function (p) { return p.abv !== null && p.abv <= 10; }],
    ['a2', '11~19도', function (p) { return p.abv !== null && p.abv > 10 && p.abv < 20; }],
    ['a3', '20~39도', function (p) { return p.abv !== null && p.abv >= 20 && p.abv < 40; }],
    ['a4', '40도 이상', function (p) { return p.abv !== null && p.abv >= 40; }]
  ];
  var SORTS = [['order', '기본'], ['price-asc', '가격 낮은 순'], ['price-desc', '가격 높은 순'], ['abv-asc', '도수 낮은 순'], ['abv-desc', '도수 높은 순']];

  function bucket(list, key) { for (var i = 0; i < list.length; i++) if (list[i][0] === key) return list[i]; return null; }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }

  window.JukbarimList = function (host) {
    var esc = host.esc, money = host.money;
    var f = fresh(), root = null, shown = 0, rows = [], observer = null, entered = false, hay = {};
    var STEP = host.lite ? 18 : 24;

    function fresh() { return { group: '', q: '', sort: 'order', tags: [], price: '', abv: '' }; }
    function products() { return C.products; }
    function haystack(p) {
      if (!hay[p.id]) hay[p.id] = norm([p.name, p.original, p.maker, p.grape, p.country, p.cat, p.group, p.aroma.join(' '), p.tagList.join(' ')].join(' '));
      return hay[p.id];
    }
    function match(p, s, skip) {
      if (skip !== 'group' && s.group && p.group !== s.group) return false;
      if (skip !== 'price' && s.price && !bucket(PRICE, s.price)[2](p)) return false;
      if (skip !== 'abv' && s.abv && !bucket(ABV, s.abv)[2](p)) return false;
      for (var i = 0; i < s.tags.length; i++) if (p.tagList.indexOf(s.tags[i]) < 0) return false;
      if (s.q) {
        var terms = s.q.toLowerCase().split(/\s+/).filter(Boolean), h = haystack(p);
        for (var j = 0; j < terms.length; j++) if (h.indexOf(terms[j]) < 0) return false;
      }
      return true;
    }
    function count(s, skip, extra) {
      var n = 0, list = products();
      for (var i = 0; i < list.length; i++) if (match(list[i], s, skip) && (!extra || extra(list[i]))) n++;
      return n;
    }
    function withTag(t) { var s = Object.assign({}, f); s.tags = f.tags.concat([t]); return s; }
    function result() {
      var list = products().filter(function (p) { return match(p, f); });
      var by = {
        'price-asc': function (a, b) { return a.price - b.price; },
        'price-desc': function (a, b) { return b.price - a.price; },
        'abv-asc': function (a, b) { return (a.abv === null ? 999 : a.abv) - (b.abv === null ? 999 : b.abv); },
        'abv-desc': function (a, b) { return (b.abv === null ? -1 : b.abv) - (a.abv === null ? -1 : a.abv); }
      }[f.sort];
      if (by) list.sort(function (a, b) { return by(a, b) || a.order - b.order; });
      return list;
    }
    function groups() {
      var names = C.groups.slice();
      products().forEach(function (p) { if (names.indexOf(p.group) < 0) names.push(p.group); });
      return names.filter(function (g) { return products().some(function (p) { return p.group === g; }); });
    }
    function allTags() {
      var names = C.tags.slice();
      products().forEach(function (p) { p.tagList.forEach(function (t) { if (names.indexOf(t) < 0) names.push(t); }); });
      return names;
    }
    var SPOT_BY_GROUP = { '탁주': '#d8cfb4', '약주·청주': '#cdb878', '과실주': '#c98a8f', '증류주': '#a9c3c9', '레드 와인': '#a8404f', '화이트 와인': '#cfc98a', '기타 와인': '#c9a06a' };
    function spot(p) {
      var map = window.JUKBARIM_SPOTS || {}, stem = p.photo.replace(/\.[a-z]+$/i, '');
      return map[stem] || SPOT_BY_GROUP[p.group] || '#bfb7a4';
    }
    /* 병 사진을 바꾸면 이 값을 올린다: 브라우저가 오래 보관한 이전 사진 대신 새 사진을 받게 */
    var PHOTO_V = '20261120';
    function photoURL(p, small) {
      if (!p.photo) return '';
      return BASE + 'assets/bottles/' + p.photo.replace(/\.[a-z]+$/i, '') + '.webp?p=' + PHOTO_V;
    }
    /* 선반에 올릴 병: 신상이 있으면 신상, 없으면 날짜마다 바뀌는 여덟 병(주종이 겹치지 않게) */
    function featured() {
      var pool = products().filter(function (p) { return !p.soldOut && p.photo; });
      var fresh = pool.filter(function (p) { return p.badge === '신상'; });
      if (fresh.length >= 3) return { title: '신상', items: fresh.slice(0, 10) };
      var d = new Date(), seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate(), byGroup = {}, order = [], out = [];
      pool.forEach(function (p) { if (!byGroup[p.group]) { byGroup[p.group] = []; order.push(p.group); } byGroup[p.group].push(p); });
      for (var round = 0; out.length < 8 && round < 4; round++) {
        order.forEach(function (g, gi) {
          var list = byGroup[g];
          if (out.length < 8 && list.length > round) out.push(list[(seed * 7 + gi * 13 + round * 5) % list.length]);
        });
      }
      return { title: '오늘의 추천', items: out.filter(function (p, i) { return out.indexOf(p) === i; }) };
    }
    function activeCount() { return f.tags.length + (f.price ? 1 : 0) + (f.abv ? 1 : 0); }

    /* ---------- 조각 HTML ---------- */
    function photo(p, cls, small) {
      var url = photoURL(p, small);
      return '<span class="' + cls + (url ? '' : ' no-photo') + '" data-initial="' + esc(p.group.charAt(0)) + '">' +
        (url ? '<img decoding="async" alt="" src="' + esc(url) + '">' : '') + '</span>';
    }
    function won(n) { return '<span class="won">₩</span>' + money(n); }
    function priceHTML(p) { return '<b>' + won(p.price) + '</b>' + (p.salePrice !== null ? '<s>' + won(p.listPrice) + '</s>' : ''); }
    function meta(p) {
      return [p.abv !== null ? p.abv + '%' : '', p.vol !== null ? p.vol + 'ml' : ''].filter(Boolean).join(' · ');
    }
    function sub(p) {
      var who = p.maker || [p.grape, p.country && p.country !== '한국' ? p.country : ''].filter(Boolean).join(' · ');
      return [p.cat, who].filter(Boolean).join(' · ');
    }
    function badge(p) { return p.badge ? '<em class="badge' + (p.badge === '할인' ? ' badge-sale' : '') + '">' + esc(p.badge) + '</em>' : ''; }
    function row(p, i) {
      return '<li><button class="tile' + (p.soldOut ? ' is-soldout' : '') + '" data-id="' + esc(p.id) + '">' + photo(p, 'tile-photo', false) +
        '<span class="tile-name">' + esc(p.name) + '</span>' +
        '<span class="tile-sub">' + esc([p.cat, p.abv !== null ? p.abv + '%' : ''].filter(Boolean).join(' · ')) + '</span>' +
        '<span class="tile-price">' + (p.soldOut ? '<span class="soldout">품절</span>' : priceHTML(p)) + badge(p) + '</span></button></li>';
    }
    function shelfHTML() {
      var f = featured();
      if (f.items.length < 3) return '';
      var item = function (p, clone) {
        return '<button class="feature-item" data-id="' + esc(p.id) + '"' + (clone ? ' aria-hidden="true" tabindex="-1"' : '') + '>' + photo(p, 'feature-photo', false) + '<span class="feature-cap"><strong>' + esc(p.name) + '</strong><small>' + won(p.price) + '</small></span></button>';
      };
      /* 같은 줄을 한 번 더 이어 붙여 끝없이 흐르게 한다(뒤쪽은 화면 낭독기에서 숨김) */
      return '<section class="feature fade" style="--i:2" aria-label="' + esc(f.title) + '"><div class="feature-head"><h2>' + esc(f.title) + '</h2></div><div class="feature-track" data-count="' + f.items.length + '">' +
        f.items.map(function (p) { return item(p, false); }).join('') + f.items.map(function (p) { return item(p, true); }).join('') + '</div></section>';
    }

    /* ---------- 화면 갱신 ---------- */
    function paintRail() {
      var el = root.querySelector('#cat-rail');
      el.innerHTML = '<button class="cat" data-group="" aria-pressed="' + (!f.group) + '">전체</button>' +
        groups().map(function (g) {
          var n = count(f, 'group', function (p) { return p.group === g; });
          return '<button class="cat" data-group="' + esc(g) + '" aria-pressed="' + (f.group === g) + '"' + (!n && f.group !== g ? ' disabled' : '') + '>' + esc(g) + '</button>';
        }).join('');
      var on = el.querySelector('[aria-pressed=true]');
      if (!f.group) el.scrollLeft = 0;
      else if (on) { var r = on.getBoundingClientRect(), box = el.getBoundingClientRect(); if (r.left < box.left + 16 || r.right > box.right - 16) el.scrollLeft += r.left - box.left - 24; }
    }
    function paintActive() {
      var chips = f.tags.map(function (t) { return ['tag', t, t]; });
      if (f.price) chips.push(['price', f.price, bucket(PRICE, f.price)[1]]);
      if (f.abv) chips.push(['abv', f.abv, bucket(ABV, f.abv)[1]]);
      root.querySelector('#active-filters').innerHTML = chips.map(function (c) {
        return '<button class="chip chip-on" data-remove="' + c[0] + '" data-value="' + esc(c[1]) + '" aria-label="' + esc(c[2]) + ' 조건 지우기"><span>' + esc(c[2]) + '</span><small aria-hidden="true">×</small></button>';
      }).join('') + (chips.length > 1 ? '<button class="clear-all" data-clear>모두 지우기</button>' : '');
      var n = activeCount(), badgeEl = root.querySelector('#filter-n');
      badgeEl.textContent = n ? String(n) : '';
      badgeEl.hidden = !n;
      badgeEl.parentNode.classList.toggle('on', !!n);
    }
    /* 다음에 붙일 병 사진을 미리 받아 둔다: 스크롤이 닿았을 때는 이미 그려져 있도록 */
    var warmed = {};
    function warm(list) {
      list.forEach(function (p) {
        var url = photoURL(p);
        if (!url || warmed[url]) return;
        warmed[url] = 1;
        var im = new Image(); im.decoding = 'async'; im.src = url;
      });
    }
    function paintSort() {
      var el = root.querySelector('#sort-label'), name = '';
      SORTS.forEach(function (s) { if (s[0] === f.sort) name = s[1]; });
      if (el) el.textContent = f.sort === 'order' ? '정렬' : name;
    }
    function appendRows() {
      var list = root.querySelector('#bottle-list'), next = rows.slice(shown, shown + STEP);
      if (!next.length) return;
      var from = shown, before = list.children.length;
      list.insertAdjacentHTML('beforeend', next.map(function (p, i) { return row(p, from === 0 ? i : 0); }).join(''));
      shown += next.length;
      root.querySelector('#list-sentinel').hidden = shown >= rows.length;
      warm(rows.slice(shown, shown + STEP));
    }
    function paintList() {
      rows = result(); shown = 0;
      var list = root.querySelector('#bottle-list');
      list.innerHTML = '';
      entered = true;
      root.querySelector('#list-count').textContent = rows.length + '종';
      root.querySelector('#list-empty').hidden = rows.length > 0;
      appendRows();
    }
    function paint() { paintRail(); paintActive(); paintSort(); paintList(); }

    function frame() {
      return '<section class="intro enter"><h1 class="fade" tabindex="-1">주류 리스트</h1><p class="intro-sub fade" style="--i:1">우리술과 와인 ' + products().length + '종</p></section>' +
        '<div class="enter">' + shelfHTML() + '</div>' +
        '<div class="bar"><div class="cats" id="cat-rail" role="group" aria-label="주종"></div>' +
        '<div class="bar-tools"><label class="find"><span class="visually-hidden">술 찾기</span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="M14 14l4 4"/></svg>' +
        '<input id="list-q" type="search" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="검색" value="' + esc(f.q) + '"></label>' +
        '<button class="tune" id="filter-open" aria-haspopup="dialog"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M3 6h7M14 6h3M3 14h3M10 14h7"/><circle cx="12" cy="6" r="2"/><circle cx="8" cy="14" r="2"/></svg><span>필터</span><b id="filter-n" hidden></b></button></div></div>' +
        '<div class="status"><p id="list-count" aria-live="polite"></p><label class="sort"><span class="sort-label" id="sort-label" aria-hidden="true"></span><select id="list-sort" aria-label="정렬">' +
        SORTS.map(function (s) { return '<option value="' + s[0] + '"' + (f.sort === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="active-filters" id="active-filters"></div>' +
        '<ol class="grid" id="bottle-list"></ol><div id="list-sentinel" class="list-sentinel"></div>' +
        '<div class="list-empty" id="list-empty" hidden><p>조건에 맞는 술이 없습니다.</p><button class="btn btn-line" data-clear>조건 지우기</button></div>' +
        '<footer class="foot"><span class="art foot-art" aria-hidden="true"><img class="art-ink" alt="" loading="lazy" src="' + BASE + 'assets/art-cat.webp"><img class="art-paper" alt="" loading="lazy" src="' + BASE + 'assets/art-cat-paper.webp"></span><span class="foot-text"><span class="foot-mark" role="img" aria-label="적바림"></span><small>가격과 재고는 매장에서 확인해 주세요.</small></span></footer>';
    }

    function clear() { var keep = f.sort; f = fresh(); f.sort = keep; var q = root && root.querySelector('#list-q'); if (q) q.value = ''; }
    function toTop() {
      var bar = root.querySelector('.bar'), status = root.querySelector('.status');
      if (bar && status && status.getBoundingClientRect().top < bar.offsetHeight) window.scrollTo(0, window.pageYOffset + status.getBoundingClientRect().top - bar.offsetHeight);
    }

    /* 오늘의 추천: 왼쪽으로 천천히 흐른다. 손이 닿으면 멈췄다가 4초 뒤 다시 흐른다 */
    var drift = (function () {
      var SPEED = 24, raf = 0, track = null, last = 0, pos = 0, half = 0, wait = 0, seen = true, io = null;
      function measure() {
        var n = Number(track.dataset.count) || 0, kids = track.children;
        return n && kids[n] ? kids[n].offsetLeft - kids[0].offsetLeft : 0;
      }
      function hold() { wait = performance.now() + 4000; }
      function frame(t) {
        raf = requestAnimationFrame(frame);
        if (!track || !track.isConnected) { stop(); return; }
        var dt = last ? Math.min(t - last, 64) : 0; last = t;
        if (!seen || document.hidden || t < wait) { pos = track.scrollLeft; return; }
        if (!half) half = measure();
        if (!half) return;
        if (pos >= half) pos -= half;
        pos += SPEED * dt / 1000;
        track.scrollLeft = pos;
      }
      function stop() { cancelAnimationFrame(raf); raf = 0; if (io) io.disconnect(); io = null; track = null; }
      function start() {
        stop();
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        track = root.querySelector('.feature-track');
        if (!track) return;
        half = 0; last = 0; pos = track.scrollLeft; wait = performance.now() + 1200;
        ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach(function (ev) { track.addEventListener(ev, hold, { passive: true }); });
        track.addEventListener('scroll', function () { if (performance.now() < wait) hold(); }, { passive: true });
        if (window.IntersectionObserver) { io = new IntersectionObserver(function (e) { seen = e[0].isIntersecting; }); io.observe(track); }
        raf = requestAnimationFrame(frame);
      }
      return { start: start, stop: stop };
    })();

    function mount(el) {
      root = el; hay = {};
      root.innerHTML = frame();
      paint();
      drift.start();
      if (root.dataset.bound) return;
      root.dataset.bound = '1';
      root.addEventListener('click', function (e) {
        var t = e.target.closest('[data-id],[data-group],[data-remove],[data-clear],#filter-open');
        if (!t || !root.contains(t)) return;
        if (t.dataset.id) return openDetail(t.dataset.id, t.querySelector('img'));
        if (t.id === 'filter-open') return openFilter();
        if (t.hasAttribute('data-group')) f.group = t.dataset.group;
        else if (t.hasAttribute('data-clear')) clear();
        else if (t.dataset.remove === 'tag') f.tags = f.tags.filter(function (x) { return x !== t.dataset.value; });
        else if (t.dataset.remove) f[t.dataset.remove] = '';
        paint(); toTop();
      });
      var typing = 0;
      root.addEventListener('input', function (e) {
        if (e.target.id !== 'list-q') return;
        clearTimeout(typing);
        typing = setTimeout(function () { f.q = e.target.value.trim(); paintRail(); paintList(); }, host.lite ? 220 : 120);
      });
      root.addEventListener('change', function (e) { if (e.target.id === 'list-sort') { f.sort = e.target.value; paintSort(); paintList(); } });
      root.addEventListener('keydown', function (e) { if (e.target.id === 'list-q' && e.key === 'Enter') e.target.blur(); });
      root.addEventListener('error', function (e) {
        if (e.target.tagName === 'IMG' && e.target.parentNode) { e.target.parentNode.classList.add('no-photo'); e.target.remove(); }
      }, true);
      if (observer) observer.disconnect();
      if (window.IntersectionObserver) {
        observer = new IntersectionObserver(function (entries) { if (entries[0].isIntersecting) appendRows(); }, { rootMargin: '1600px 0px' });
        observer.observe(root.querySelector('#list-sentinel'));
      } else { STEP = 9999; appendRows(); }
    }

    /* ---------- 조건 고르기 ---------- */
    function chip(attr, key, label, n, on) {
      return '<button class="chip" ' + attr + '="' + esc(key) + '" aria-pressed="' + on + '"' + (!n && !on ? ' disabled' : '') + '><span>' + esc(label) + '</span><small>' + n + '</small></button>';
    }
    function filterHTML() {
      var total = count(f), info = C.tagInfo, byGroup = {};
      allTags().forEach(function (t) {
        var g = info[t] ? info[t].group : '그 밖에';
        (byGroup[g] = byGroup[g] || []).push(t);
      });
      var scope = [f.group, f.q ? '‘' + f.q + '’ 검색' : ''].filter(Boolean).join(' · ');
      return '<div class="filter-body">' +
        (scope ? '<p class="filter-scope">' + esc(scope) + '</p>' : '') +
        '<section><h3>가격</h3><div class="chips">' + PRICE.map(function (b) {
          return chip('data-price', b[0], b[1], count(f, 'price', b[2]), f.price === b[0]);
        }).join('') + '</div></section>' +
        '<section><h3>도수</h3><div class="chips">' + ABV.map(function (b) {
          return chip('data-abv', b[0], b[1], count(f, 'abv', b[2]), f.abv === b[0]);
        }).join('') + '</div></section>' +
        C.tagGroups.filter(function (g) { return byGroup[g]; }).map(function (g) {
          return '<section><h3>' + esc(g) + '</h3><div class="chips">' + byGroup[g].map(function (t) {
            var on = f.tags.indexOf(t) >= 0;
            return chip('data-tag', t, t, on ? total : count(withTag(t)), on);
          }).join('') + '</div></section>';
        }).join('') + '</div>' +
        '<div class="filter-bar"><button class="link" data-filter-clear' + (activeCount() ? '' : ' disabled') + '>모두 지우기</button>' +
        '<button class="btn" data-filter-apply' + (total ? '' : ' disabled') + '><strong id="filter-total">' + total + '</strong><span>종 보기</span></button></div>';
    }
    function tween(el, to) {
      var from = Number(el.textContent) || 0;
      if (host.lite || from === to || !window.requestAnimationFrame) { el.textContent = to; return; }
      var start = 0, token = (el._tw = (el._tw || 0) + 1);
      requestAnimationFrame(function step(now) {
        if (el._tw !== token || !el.isConnected) return;
        if (!start) start = now;
        var k = Math.min(1, (now - start) / 320), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(step);
      });
    }
    function openFilter() {
      host.modal(filterHTML(), true, '필터', 'filter-sheet');
      var content = host.dialog.querySelector('.sheet-content');
      content.onclick = function (e) {
        var t = e.target.closest('[data-tag],[data-price],[data-abv],[data-filter-clear],[data-filter-apply]');
        if (!t || t.disabled) return;
        if (t.hasAttribute('data-filter-apply')) { host.dialog.close(); return; }
        if (t.hasAttribute('data-filter-clear')) { f.tags = []; f.price = ''; f.abv = ''; }
        else if (t.dataset.tag) {
          var i = f.tags.indexOf(t.dataset.tag);
          if (i < 0) f.tags.push(t.dataset.tag); else f.tags.splice(i, 1);
        } else if (t.dataset.price) f.price = f.price === t.dataset.price ? '' : t.dataset.price;
        else if (t.dataset.abv) f.abv = f.abv === t.dataset.abv ? '' : t.dataset.abv;
        var before = Number(content.querySelector('#filter-total').textContent) || 0, top = content.scrollTop;
        content.innerHTML = filterHTML();
        content.scrollTop = top;
        var total = content.querySelector('#filter-total'), to = Number(total.textContent);
        total.textContent = before; tween(total, to);
      };
      host.dialog.addEventListener('close', function done() {
        host.dialog.removeEventListener('close', done);
        if (root && root.isConnected) { paint(); toTop(); }
      });
    }

    /* ---------- 상세 ---------- */
    function dots(v) {
      var s = '';
      for (var i = 0; i < 5; i++) s += '<i' + (i < v ? ' class="on" style="--d:' + i + '"' : '') + '></i>';
      return s;
    }
    function detailHTML(p) {
      var spec = [['주종', p.cat], ['도수', p.abv !== null ? p.abv + '%' : ''], ['용량', p.vol !== null ? p.vol + 'ml' : ''], ['양조장·생산자', p.maker], ['품종', p.grape], ['국가', p.country], ['보관', p.storage]].filter(function (x) { return x[1]; });
      var url = photoURL(p, false);
      return '<article class="bottle' + (p.soldOut ? ' is-soldout' : '') + '">' +
        '<div class="bottle-stage' + (url ? '' : ' no-photo') + '" data-initial="' + esc(p.group.charAt(0)) + '">' + (url ? '<img class="bottle-img" alt="' + esc(p.name) + ' 병 사진" src="' + esc(url) + '">' : '') + '</div>' +
        '<div class="bottle-body"><p class="bottle-cat">' + esc(p.group) + badge(p) + '</p><h2>' + esc(p.name) + '</h2>' +
        (p.original ? '<p class="bottle-original" lang="en">' + esc(p.original) + '</p>' : '') +
        '<p class="bottle-price">' + (p.soldOut ? '<span class="soldout">품절</span>' : '') + priceHTML(p) + '</p>' +
        (p.aroma.length ? '<p class="bottle-aroma">' + esc(p.aroma.join(' · ')) + '</p>' : '') +
        (p.long || p.short ? '<p class="bottle-long">' + esc(p.long || p.short) + '</p>' : '') +
        (p.scale.length ? '<div class="scale" role="list">' + p.scale.map(function (s) {
          return '<p class="scale-row" role="listitem" aria-label="' + esc(s.label) + ' 5칸 중 ' + s.value + '칸"><span>' + esc(s.label) + '</span><span class="dots" aria-hidden="true">' + dots(s.value) + '</span></p>';
        }).join('') + '</div>' : '') +
        '<dl class="spec">' + spec.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>' +
        (p.tagList.length ? '<div class="bottle-similar"><h3>비슷한 술</h3><div class="chips">' + p.tagList.map(function (t) {
          return '<button class="chip" data-detail-tag="' + esc(t) + '"><span>' + esc(t) + '</span><small>' + count({ group: '', q: '', tags: [t], price: '', abv: '' }) + '</small></button>';
        }).join('') + '</div></div>' : '') +
        '<p class="bottle-note">' + (p.soldOut ? '현재 품절입니다. 재입고는 카운터에 문의해 주세요.' : '카운터에 술 이름을 알려주시면 찾아드립니다.') + '</p></div></article>';
    }
    function openDetail(id, fromImg) {
      var p = null;
      products().forEach(function (x) { if (x.id === id) p = x; });
      if (!p) return;
      function show() {
        host.modal(detailHTML(p), true, p.name, 'bottle-sheet');
        var content = host.dialog.querySelector('.sheet-content');
        content.addEventListener('error', function (e) {
          if (e.target.tagName === 'IMG' && e.target.parentNode) { e.target.parentNode.classList.add('no-photo'); e.target.remove(); }
        }, true);
        content.onclick = function (e) {
          var t = e.target.closest('[data-detail-tag]');
          if (!t) return;
          var keep = f.sort; f = fresh(); f.sort = keep; f.tags = [t.dataset.detailTag];
          host.dialog.close();
          host.showList();
        };
      }
      /* 누른 병이 그대로 커지며 무대로 올라간다(지원하는 브라우저만) */
      if (!host.lite && fromImg && document.startViewTransition && !host.dialog.open) {
        fromImg.style.viewTransitionName = 'bottle';
        var vt = document.startViewTransition(function () {
          fromImg.style.viewTransitionName = '';
          show();
          var big = host.dialog.querySelector('.bottle-img');
          if (big) big.style.viewTransitionName = 'bottle';
        });
        vt.finished.then(function () { var big = host.dialog.querySelector('.bottle-img'); if (big) big.style.viewTransitionName = ''; }, function () {});
      } else show();
    }

    return {
      mount: mount, openDetail: openDetail,
      reset: function () { f = fresh(); entered = false; },
      refresh: function () {
        hay = {};
        var valid = allTags(), names = groups();
        f.tags = f.tags.filter(function (t) { return valid.indexOf(t) >= 0; });
        if (f.group && names.indexOf(f.group) < 0) f.group = '';
        if (root && root.isConnected) paint();
      },
      total: function () { return products().length; },
      spot: spot, photoURL: photoURL, featured: featured, won: won
    };
  };
})();
