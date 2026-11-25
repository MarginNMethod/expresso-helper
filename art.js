/* Hand-drawn diagrams used by { type: "art", name: "..." } blocks. Colours come from CSS variables. */
(function () {
  'use strict';

  function t(x, y, text, cls, anchor) {
    return '<text x="' + x + '" y="' + y + '" class="' + cls + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + text + '</text>';
  }

  /* A mineral-water label with the one line worth reading circled. Values are an example. */
  function waterLabel() {
    var rows = [['Bicarbonato', '45,10'], ['Cálcio', '11,80'], ['Magnésio', '3,90'], ['Sódio', '8,25']];
    var y = 92, body = '';
    rows.forEach(function (r) {
      body += t(40, y, r[0], 'a-text') + t(300, y, r[1], 'a-text', 'end') +
        '<path d="M40 ' + (y + 8) + ' H300" class="a-hair"/>';
      y += 27;
    });
    return '<svg viewBox="0 0 340 292" role="img" aria-label="Exemplo de rótulo de água mineral. A linha resíduo de evaporação a 180 graus, 96,20 miligramas por litro, está marcada.">' +
      '<path d="M18 10 C90 4 250 4 322 10 L326 282 C250 288 90 288 14 282 Z" class="a-paper"/>' +
      t(170, 38, 'ÁGUA MINERAL NATURAL', 'a-head', 'middle') +
      t(40, 62, 'Composição química (mg/L)', 'a-small') +
      '<path d="M40 70 H300" class="a-rule"/>' + body +
      '<path d="M30 207 C60 196 285 193 314 208 C326 226 322 252 300 257 C220 266 80 266 40 256 C18 246 18 218 30 207 Z" class="a-mark"/>' +
      t(40, 222, 'Resíduo de evaporação', 'a-strong') + t(40, 243, 'a 180 °C', 'a-strong') +
      t(300, 237, '96,20', 'a-big', 'end') +
      '</svg>';
  }

  window.ART = { waterLabel: waterLabel };
})();
