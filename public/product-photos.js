/* Product photos: local assets only. Recommendation data and scoring are unchanged. */
(() => {
  'use strict';
  const script = document.currentScript;
  const base = new URL('assets/product-photos/', script.src);
  const supported = new Set(["C001", "C003", "C004", "C005", "C014", "C017", "C018", "C021", "C023", "C024", "C026", "C027", "C028", "C029", "C031", "C032", "C036", "C037", "C038", "C040", "C041", "C042", "C043", "C044", "C045", "C046", "C047", "C048", "C049", "C050", "C051", "C052", "C053", "C054", "C055", "C056", "C057", "C058", "C059", "C060", "C061", "C062", "C065", "C066", "C067", "C069", "C071", "C072", "C075", "C076", "C077", "C078", "C083", "C084", "C085", "C087", "C088", "C089", "C090", "C091", "C092", "C093", "C094", "C095", "C098", "C099", "C100", "C103", "C104", "C105", "C106", "C107", "C108", "C109", "C110", "C111", "C112", "C113", "C114", "C115", "C117", "C118", "C120", "C121", "C122", "C123", "C125", "C126", "C127", "C128", "C129", "C130", "C131", "C132", "C133", "C134", "C135", "C136", "C137", "C138", "C139", "C140", "C141", "C142", "C143", "C144", "C145", "C146", "C147", "C148", "C149", "C150", "C151", "C152", "C153", "C154", "C155", "C156", "C157", "C158", "C159", "C160", "C161", "C162", "C163", "C164", "C165", "C166"]);
  function apply() {
    const catalog = window.JUKBARIM_PRODUCTS || [];
    for (const art of document.querySelectorAll('.product .category-art:not([data-photo-ready])')) {
      const card = art.closest('.product');
      const name = card.querySelector('h2')?.textContent.trim();
      const numbers = card.querySelector('.meta')?.textContent.match(/[\d.]+/g) || [];
      const product = catalog.find(p => p.name === name && Number(p.abv) === Number(numbers[0]) && Number(p.vol) === Number(numbers[1]));
      if (!product || !supported.has(product.id)) continue;
      art.dataset.photoReady = 'true';
      const img = new Image();
      img.alt = product.name + ' ' + product.abv + '도 ' + product.vol + 'ml 실제 제품 사진';
      img.width = 384; img.height = 512;
      img.decoding = 'async';
      img.loading = 'lazy';
      img.addEventListener('load', () => {
        art.classList.add('product-photo');
        art.removeAttribute('role');
        art.removeAttribute('aria-label');
        art.querySelector('.art-caption')?.remove();
      }, {once:true});
      img.addEventListener('error', () => { img.remove(); }, {once:true});
      img.src = new URL(product.id + '.webp?v=catalog-20261115-1', base).href;
      art.append(img);
    }
  }
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; apply(); });
  });
  observer.observe(document.getElementById('app') || document.body, {childList:true,subtree:true});
  apply();
})();
