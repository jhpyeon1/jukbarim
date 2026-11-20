/* Presentation only: no answers, product data, or saved results are changed. */
(function () {
  'use strict';
  var root = document.documentElement;
  var mode = new URLSearchParams(location.search).get('render');
  var tv = /web[o0]s|netcast|smart[ -]?tv|lg browser/i.test(navigator.userAgent || '');
  var lite = mode === 'lite' || mode === 'still' || (mode !== 'full' && tv);
  window.JUKBARIM_LITE = lite;
  root.setAttribute('data-render', lite ? 'lite' : 'full');
  if (mode === 'still') root.setAttribute('data-still', 'true');

  function setup() {
    var paused = true, timer = 0, lastInput = 0;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    function sync() {
      var screen = document.body.dataset.screen;
      paused = document.hidden || (screen !== 'home' && screen !== 'question') ||
        !!document.querySelector('dialog[open]') || reduced.matches || mode === 'still';
      root.classList.toggle('painting-paused', paused);
      if (paused) {
        clearTimeout(timer); timer = 0;
        root.classList.remove('painting-held');
      }
    }
    function release() {
      var remaining = 1000 - (Date.now() - lastInput);
      if (remaining > 0) { timer = setTimeout(release, remaining); return; }
      timer = 0;
      root.classList.remove('painting-held');
    }
    function interact() {
      if (paused) return;
      lastInput = Date.now();
      if (timer) return;
      root.classList.add('painting-held');
      timer = setTimeout(release, 1000);
    }
    var observer = new MutationObserver(sync);
    observer.observe(document.body, {attributes: true, attributeFilter: ['data-screen']});
    document.querySelectorAll('dialog').forEach(function (dialog) {
      observer.observe(dialog, {attributes: true, attributeFilter: ['open']});
    });
    ['scroll', 'pointerdown', 'keydown'].forEach(function (event) {
      document.addEventListener(event, interact, {capture: true, passive: true});
    });
    document.addEventListener('visibilitychange', sync);
    if (reduced.addEventListener) reduced.addEventListener('change', sync);
    else if (reduced.addListener) reduced.addListener(sync);
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, {once: true});
  else setup();
})();
