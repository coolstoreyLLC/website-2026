/* ------------------------------------------------------------------
   Cool Story — pointer tracking for the foil shimmer (assets/cs-foil.css).

   Progressive enhancement only: the film and the highlight are pure CSS,
   this just moves the highlight with the cursor so the card reads as a
   surface catching the light rather than a fixed gradient.

   Delegated from the document, so cards added later by collection
   filtering, infinite scroll or quick-view pick it up with no re-init.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var SELECTOR = 'product-card[data-cs-printing], .cs-foil-surface';

  // Nothing to track without a real pointer, and nothing to animate if the
  // visitor asked for reduced motion — CSS already handles both cases.
  if (!window.matchMedia('(hover: hover)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var active = null;
  var clientX = 0;
  var clientY = 0;
  var frame = null;

  function clamp(value) {
    return value < 0 ? 0 : value > 100 ? 100 : value;
  }

  function paint() {
    frame = null;
    if (!active) return;

    var rect = active.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var x = clamp(((clientX - rect.left) / rect.width) * 100);
    var y = clamp(((clientY - rect.top) / rect.height) * 100);

    active.style.setProperty('--cs-foil-x', x.toFixed(1) + '%');
    active.style.setProperty('--cs-foil-y', y.toFixed(1) + '%');
  }

  function release(card) {
    if (!card) return;
    card.style.removeProperty('--cs-foil-x');
    card.style.removeProperty('--cs-foil-y');
  }

  document.addEventListener(
    'pointermove',
    function (event) {
      if (event.pointerType === 'touch') return;

      var card = event.target.closest ? event.target.closest(SELECTOR) : null;

      if (card !== active) {
        release(active);
        active = card;
      }
      if (!active) return;

      clientX = event.clientX;
      clientY = event.clientY;
      if (frame === null) frame = requestAnimationFrame(paint);
    },
    { passive: true }
  );

  // Leaving the window mid-hover would otherwise strand the highlight.
  document.addEventListener(
    'pointerleave',
    function () {
      release(active);
      active = null;
    },
    { passive: true }
  );
})();
