/* Inline SVG icon set, drawn on a 24x24 grid with a 1.75px stroke (SF Symbols-like).
   Each entry is the inner markup; `filled` variants are used for the active tab. */
(function () {
  'use strict';
  var P = {
    'chevron-right': '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
    'chevron-left': '<path d="M15 4.5 7.5 12 15 19.5"/>',
    'chevron-down': '<path d="M5.5 9.5 12 16l6.5-6.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    xmark: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".6" fill="currentColor"/>',
    lightbulb: '<path d="M9.2 18.2h5.6M10.2 21h3.6"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1 1.2 1 2v.4h5.2v-.4c0-.8.3-1.5 1-2A6 6 0 0 0 12 3z"/>',
    bolt: '<path d="M13.2 2.8 4.8 13.6h6.6l-.9 7.6 8.7-11h-6.7l.7-7.4z"/>',
    bean: '<ellipse cx="12" cy="12" rx="6.3" ry="9" transform="rotate(35 12 12)"/><path d="M16.3 5.6c-3.6 1.8-2.4 5.3-4.3 6.9-1.9 1.6-4.6 1.4-4.9 5.9"/>',
    drop: '<path d="M12 3.2c-3.4 4.3-6 7.9-6 11a6 6 0 0 0 12 0c0-3.1-2.6-6.7-6-11z"/>',
    thermometer: '<path d="M10 14.3V5.2a2 2 0 0 1 4 0v9.1a4 4 0 1 1-4 0z"/><path d="M12 10v7"/>',
    flame: '<path d="M12 3c.8 3.6 5.2 5.6 5.2 10.4a5.2 5.2 0 0 1-10.4 0c0-2.6 1.3-4.2 2.4-5.2.2 1.7 1 2.8 2 3.2-.3-3.1-.1-5.8.8-8.4z"/>',
    leaf: '<path d="M5 19C5 10.2 10.2 5 19 5c0 8.8-5.2 14-14 14z"/><path d="M5 19l8.5-8.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="3.8" ry="9"/><path d="M3.3 9h17.4M3.3 15h17.4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.3 2"/>',
    scale: '<path d="M6.5 7.5h11M12 7.5V10"/><rect x="3.5" y="10" width="17" height="10" rx="2.5"/><rect x="9" y="13.2" width="6" height="3.4" rx=".8"/>',
    cup: '<path d="M5 8.5h11v4.2a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8.5z"/><path d="M16 10h1.4a2.4 2.4 0 0 1 0 4.8H15.6"/><path d="M3.5 21h14"/><path d="M9 3.2c-.9 1 .9 2 0 3M12.5 3.2c-.9 1 .9 2 0 3"/>',
    milk: '<path d="M8.5 3h7v2.8l2 3.2V21h-11V9l2-3.2z"/><path d="M6.5 9h11M8.5 5.8h7"/><path d="M10.5 13.5h3"/>',
    book: '<path d="M12 6.6C10 5 7.1 4.5 3.5 5v13.2c3.6-.5 6.5 0 8.5 1.6 2-1.6 4.9-2.1 8.5-1.6V5c-3.6-.5-6.5 0-8.5 1.6z"/><path d="M12 6.6v13.2"/>',
    quiz: '<path d="M7.2 17.2 4 20.5V6.2a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3z"/><path d="M9.9 8.5a2.2 2.2 0 1 1 3.4 1.8c-.8.5-1.3 1-1.3 2"/><circle cx="12" cy="14.6" r=".6" fill="currentColor"/>',
    warning: '<path d="M12 3.8 2.8 19.6h18.4L12 3.8z"/><path d="M12 9.6v4.8"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    wrench: '<path d="M14.6 3.6a4.6 4.6 0 0 0-4.3 6.2L3.8 16.3a1.9 1.9 0 0 0 2.7 2.7l6.5-6.5a4.6 4.6 0 0 0 6.2-4.3c0-.5-.1-.9-.2-1.4l-2.7 2.7-2.6-.5-.5-2.6L16 3.8c-.5-.1-.9-.2-1.4-.2z"/>',
    sprout: '<path d="M12 21v-8.5"/><path d="M12 12.5C12 8.6 9.3 6.5 5 6.5c0 3.9 2.7 6 7 6z"/><path d="M12 10.2c0-3.4 2.5-5.7 7-5.7 0 3.9-2.5 5.9-7 5.7z"/><path d="M8 21h8"/>',
    nose: '<path d="M10.5 3.2c.6 4.3 4.6 8.6 4.6 11.6 0 1.4-1.1 2.5-2.5 2.5h-2.2"/><path d="M10.4 14.6c1 0 1.8.7 1.8 1.5"/><path d="M7.5 20.5c1.4.6 3 .6 4.5 0"/>',
    list: '<path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10"/><circle cx="5" cy="6.5" r=".9" fill="currentColor"/><circle cx="5" cy="12" r=".9" fill="currentColor"/><circle cx="5" cy="17.5" r=".9" fill="currentColor"/>',
    map: '<path d="M3.5 6.5 9 4.2l6 2.3 5.5-2.3v13.3L15 19.8l-6-2.3-5.5 2.3z"/><path d="M9 4.2v13.3M15 6.5v13.3"/>',
    flag: '<path d="M5.5 21V3.8"/><path d="M5.5 4.2h11.8l-2.2 4.3 2.2 4.3H5.5"/>',
    timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.6M9.8 2.8h4.4M12 2.8V6M18 6.8l1.4-1.4"/>',
    steam: '<path d="M8 20c-1.5-2 1.5-3.5 0-5.5s1.5-3.5 0-5.5"/><path d="M12 20c-1.5-2 1.5-3.5 0-5.5s1.5-3.5 0-5.5S13.5 5.5 12 3.5"/><path d="M16 20c-1.5-2 1.5-3.5 0-5.5s1.5-3.5 0-5.5"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20 20"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
    pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/>',
    reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.2 3.8v3.6h3.6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13.3 13.3 8.5 15.5l2.2-4.8z"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7h7M8.8 12h.4M11.8 12h.4M14.8 12h.4M8.8 16h.4M11.8 16h.4M14.8 16h.4"/>',
    stethoscope: '<path d="M6 3.5v5a4 4 0 0 0 8 0v-5"/><path d="M10 12.5v2a4.5 4.5 0 0 0 9 0v-2"/><circle cx="19" cy="10.5" r="2"/>'
  };
  // Active-tab (filled) variants. Interior details are cut out with the bar colour.
  var F = {
    flag: '<path d="M5.5 21V3.8" fill="none"/><path d="M5.5 4.2h11.8l-2.2 4.3 2.2 4.3H5.5z" fill="currentColor"/>',
    cup: '<path d="M5 8.5h11v4.2a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8.5z" fill="currentColor"/><path d="M16 10h1.4a2.4 2.4 0 0 1 0 4.8H15.6" fill="none"/><path d="M3.5 21h14"/><path d="M9 3.2c-.9 1 .9 2 0 3M12.5 3.2c-.9 1 .9 2 0 3" fill="none"/>',
    timer: '<circle cx="12" cy="13.5" r="7.5" fill="currentColor"/><path d="M12 13.5V9.6" stroke="var(--tab-cut)"/><path d="M9.8 2.8h4.4M12 2.8V6M18 6.8l1.4-1.4"/>',
    book: '<path d="M12 6.6C10 5 7.1 4.5 3.5 5v13.2c3.6-.5 6.5 0 8.5 1.6 2-1.6 4.9-2.1 8.5-1.6V5c-3.6-.5-6.5 0-8.5 1.6z" fill="currentColor"/><path d="M12 7.2v12" stroke="var(--tab-cut)"/>'
  };
  var aliases = { 'sparkle-none': null };

  function icon(name, opts) {
    opts = opts || {};
    if (name in aliases) name = aliases[name];
    var body = (opts.filled && F[name]) || P[name];
    if (!body) return '';
    var size = opts.size || 24;
    var sw = opts.stroke || 1.75;
    return '<svg class="ic' + (opts.cls ? ' ' + opts.cls : '') + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }
  icon.has = function (name) { return !!P[name]; };
  window.ICONS = P;
  window.icon = icon;
})();
