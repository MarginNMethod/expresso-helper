/* Inline SVG icon set, drawn on a 24x24 grid with a 1.75px stroke (SF Symbols-like).
   Only controls and the tab bar use icons; reading screens use type, colour and drawings.
   Each entry is the inner markup; `filled` variants are used for the active tab. */
(function () {
  'use strict';
  var P = {
    'chevron-right': '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
    'chevron-left': '<path d="M15 4.5 7.5 12 15 19.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    xmark: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20 20"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
    pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/>',
    reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.2 3.8v3.6h3.6"/>',
    /* tab bar */
    flag: '<path d="M5.5 21V3.8"/><path d="M5.5 4.2h11.8l-2.2 4.3 2.2 4.3H5.5"/>',
    cup: '<path d="M5 8.5h11v4.2a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8.5z"/><path d="M16 10h1.4a2.4 2.4 0 0 1 0 4.8H15.6"/><path d="M3.5 21h14"/><path d="M9 3.2c-.9 1 .9 2 0 3M12.5 3.2c-.9 1 .9 2 0 3"/>',
    timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.6M9.8 2.8h4.4M12 2.8V6M18 6.8l1.4-1.4"/>',
    book: '<path d="M12 6.6C10 5 7.1 4.5 3.5 5v13.2c3.6-.5 6.5 0 8.5 1.6 2-1.6 4.9-2.1 8.5-1.6V5c-3.6-.5-6.5 0-8.5 1.6z"/><path d="M12 6.6v13.2"/>'
  };
  // Active-tab (filled) variants. Interior details are cut out with the bar colour.
  var F = {
    flag: '<path d="M5.5 21V3.8" fill="none"/><path d="M5.5 4.2h11.8l-2.2 4.3 2.2 4.3H5.5z" fill="currentColor"/>',
    cup: '<path d="M5 8.5h11v4.2a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8.5z" fill="currentColor"/><path d="M16 10h1.4a2.4 2.4 0 0 1 0 4.8H15.6" fill="none"/><path d="M3.5 21h14"/><path d="M9 3.2c-.9 1 .9 2 0 3M12.5 3.2c-.9 1 .9 2 0 3" fill="none"/>',
    timer: '<circle cx="12" cy="13.5" r="7.5" fill="currentColor"/><path d="M12 13.5V9.6" stroke="var(--tab-cut)"/><path d="M9.8 2.8h4.4M12 2.8V6M18 6.8l1.4-1.4"/>',
    book: '<path d="M12 6.6C10 5 7.1 4.5 3.5 5v13.2c3.6-.5 6.5 0 8.5 1.6 2-1.6 4.9-2.1 8.5-1.6V5c-3.6-.5-6.5 0-8.5 1.6z" fill="currentColor"/><path d="M12 7.2v12" stroke="var(--tab-cut)"/>'
  };

  function icon(name, opts) {
    opts = opts || {};
    var body = (opts.filled && F[name]) || P[name];
    if (!body) return '';
    var size = opts.size || 24;
    var sw = opts.stroke || 1.75;
    return '<svg class="ic' + (opts.cls ? ' ' + opts.cls : '') + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }
  window.icon = icon;
})();
