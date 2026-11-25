/* Hand-drawn diagrams used by { type: "art", name: "..." } blocks.
   Colours come from CSS variables (see the "Drawings" section of styles.css), so each one follows light and dark.
   All drawings share a 340-unit width: at phone widths one unit is about one pixel, so 13-unit text stays legible. */
(function () {
  'use strict';

  function t(x, y, text, cls, anchor) {
    return '<text x="' + x + '" y="' + y + '" class="' + cls + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + text + '</text>';
  }
  function mid(x, y, text, cls) { return t(x, y, text, cls, 'middle'); }
  function path(d, cls) { return '<path d="' + d + '" class="' + cls + '"/>'; }
  function dot(x, y, r, cls) { return '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(r) + '" class="' + cls + '"/>'; }
  function n(v) { return Math.round(v * 10) / 10; }
  function svg(h, label, body) {
    return '<svg viewBox="0 0 340 ' + h + '" role="img" aria-label="' + label + '">' + body + '</svg>';
  }
  /* Small seeded generator: the "random" grains land in the same place on every visit. */
  function rng(seed) {
    var s = seed;
    return function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
  }
  /* A downward or sideways arrow: shaft from (x1,y1) to (x2,y2) with an open head. */
  function arrow(x1, y1, x2, y2) {
    var a = Math.atan2(y2 - y1, x2 - x1), k = 7;
    function head(off) { return n(x2 - k * Math.cos(a + off)) + ' ' + n(y2 - k * Math.sin(a + off)); }
    return path('M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + ' M' + head(.62) + ' L' + x2 + ' ' + y2 + ' L' + head(-.62), 'a-arrow');
  }
  /* Speckles that make a flat brown shape read as ground coffee. */
  function speckle(x0, x1, y0, y1, count, seed) {
    var r = rng(seed), out = '';
    for (var i = 0; i < count; i++) out += dot(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), .9 + r() * .9, 'a-grain');
    return out;
  }
  /* A perforated floor: short pieces of metal with a gap (a hole) between each pair. */
  function perforated(x0, x1, y, pieces, gap) {
    var w = (x1 - x0 - gap * (pieces - 1)) / pieces, out = '', gaps = [];
    for (var i = 0; i < pieces; i++) {
      var a = x0 + i * (w + gap);
      out += '<rect x="' + n(a) + '" y="' + (y - 2) + '" width="' + n(w) + '" height="4" rx="1" class="a-solid"/>';
      if (i < pieces - 1) gaps.push(a + w + gap / 2);
    }
    return { svg: out, gaps: gaps };
  }

  /* A mineral-water label with the one line worth reading circled. Values are an example. */
  function waterLabel() {
    var rows = [['Bicarbonato', '45,10'], ['Cálcio', '11,80'], ['Magnésio', '3,90'], ['Sódio', '8,25']];
    var y = 92, body = '';
    rows.forEach(function (r) {
      body += t(40, y, r[0], 'a-text') + t(300, y, r[1], 'a-text', 'end') +
        path('M40 ' + (y + 8) + ' H300', 'a-hair');
      y += 27;
    });
    return svg(292, 'Exemplo de rótulo de água mineral. A linha resíduo de evaporação a 180 graus, 96,20 miligramas por litro, está marcada.',
      path('M18 10 C90 4 250 4 322 10 L326 282 C250 288 90 288 14 282 Z', 'a-paper') +
      mid(170, 38, 'ÁGUA MINERAL NATURAL', 'a-head') +
      t(40, 62, 'Composição química (mg/L)', 'a-small') +
      path('M40 70 H300', 'a-rule') + body +
      path('M30 207 C60 196 285 193 314 208 C326 226 322 252 300 257 C220 266 80 266 40 256 C18 246 18 218 30 207 Z', 'a-mark') +
      t(40, 222, 'Resíduo de evaporação', 'a-strong') + t(40, 243, 'a 180 °C', 'a-strong') +
      t(300, 237, '96,20', 'a-big', 'end'));
  }

  /* Cross-sections of the two kinds of basket, then the same two seen from below. */
  function baskets() {
    var L = 85, R = 255, body = '';
    function walls(c, floorY) {
      // rim lips, slightly tapered walls
      return path('M' + (c - 70) + ' 62 L' + (c - 59) + ' 62 C' + (c - 58) + ' 90 ' + (c - 55) + ' 118 ' + (c - 53) + ' ' + floorY, 'a-metal') +
        path('M' + (c + 70) + ' 62 L' + (c + 59) + ' 62 C' + (c + 58) + ' 90 ' + (c + 55) + ' 118 ' + (c + 53) + ' ' + floorY, 'a-metal');
    }
    function grounds(c, bottom, seed) {
      return path('M' + (c - 57) + ' 77 C' + (c - 20) + ' 75 ' + (c + 24) + ' 78 ' + (c + 57) + ' 76 L' + (c + 53.5) + ' ' + bottom + ' L' + (c - 53.5) + ' ' + bottom + ' Z', 'a-ground') +
        speckle(c - 49, c + 49, 82, bottom - 5, 46, seed);
    }

    body += mid(L, 22, 'Pressurizado', 'a-title') + mid(L, 41, 'parede dupla', 'a-small');
    body += mid(R, 22, 'Parede simples', 'a-title') + mid(R, 41, 'fundo vazado', 'a-small');

    // Pressurized: perforated inner floor, a small chamber, then a solid floor with ONE small hole.
    var inner = perforated(L - 53, L + 53, 130, 9, 3.5);
    body += grounds(L, 129, 11);
    body += '<rect x="' + (L - 52) + '" y="136" width="104" height="14" class="a-liquid" opacity=".45"/>';
    body += inner.svg + walls(L, 153);
    body += path('M' + (L - 53) + ' 153 L' + (L - 3.5) + ' 153 M' + (L + 3.5) + ' 153 L' + (L + 53) + ' 153', 'a-metal');
    body += path('M' + L + ' 153 L' + L + ' 181', 'a-flow') + path('M' + L + ' 187 q-4 6 0 8 q4 -2 0 -8 z', 'a-liquid');

    // Single wall: one floor full of holes; the coffee itself has to hold the water back.
    var floor = perforated(R - 53, R + 53, 151, 10, 4);
    body += grounds(R, 150, 23);
    body += floor.svg + walls(R, 152);
    floor.gaps.forEach(function (x, i) {
      body += path('M' + n(x) + ' 156 L' + n(x) + ' ' + [172, 181, 168, 186, 176, 190, 170, 183, 174][i % 9], 'a-flow thin');
    });

    // Seen from below.
    body += path('M18 214 H104 M236 214 H322', 'a-hair') + mid(170, 219, 'vistos por baixo', 'a-small');
    [L, R].forEach(function (c) { body += '<circle cx="' + c + '" cy="274" r="42" class="a-paper"/><circle cx="' + c + '" cy="274" r="34" class="a-line-soft"/>'; });
    body += dot(L, 274, 3.6, 'a-hole');
    for (var row = -3; row <= 3; row++) {
      for (var col = -4; col <= 4; col++) {
        var x = col * 8.4 + (row % 2 ? 4.2 : 0), y = row * 7.8;
        if (Math.sqrt(x * x + y * y) <= 28) body += dot(R + x, 274 + y, 1.9, 'a-hole');
      }
    }
    body += mid(L, 340, 'um furo só', 'a-label') + mid(R, 340, 'muitos furos', 'a-label');
    return svg(350, 'Cortes de dois cestos de porta-filtro. No pressurizado, de parede dupla, o café passa por um fundo vazado, chega a uma pequena câmara e sai por um único furo pequeno no fundo de fora. No de parede simples há um só fundo, com muitos furos. Vistos por baixo, o pressurizado mostra um furo e o simples mostra muitos.', body);
  }

  /* Three grind sizes drawn to the same scale of circle. */
  function grind() {
    var R = 50, body = '';
    function pile(c, step, size, seed) {
      var r = rng(seed), out = '', rowH = step * .87, rows = Math.ceil(R / rowH);
      for (var j = -rows; j <= rows; j++) {
        for (var i = -Math.ceil(R / step) - 1; i <= Math.ceil(R / step) + 1; i++) {
          var x = i * step + (j % 2 ? step / 2 : 0) + (r() - .5) * step * .3;
          var y = j * rowH + (r() - .5) * step * .3;
          var s = size * (.82 + r() * .36);
          if (Math.sqrt(x * x + y * y) + s > R - 2) continue;
          if (size < 2.5) { out += dot(c + x, 62 + y, s, 'a-ground'); continue; }
          var pts = [], k = 6, a0 = r() * 6.28;
          for (var q = 0; q < k; q++) {
            var a = a0 + q / k * 6.283, rad = s * (.74 + r() * .5);
            pts.push(n(c + x + Math.cos(a) * rad) + ',' + n(62 + y + Math.sin(a) * rad));
          }
          out += '<polygon points="' + pts.join(' ') + '" class="a-ground"/>';
        }
      }
      return '<circle cx="' + c + '" cy="62" r="' + R + '" class="a-paper"/>' + out;
    }
    body += pile(56, 21, 9.4, 7) + pile(170, 11.2, 4.8, 19) + pile(284, 5.4, 1.9, 31);
    body += path('M236 123 C256 117 316 116 332 124 C338 142 334 160 322 165 C300 170 262 170 244 164 C232 154 230 133 236 123 Z', 'a-mark');
    body += mid(56, 141, 'Grossa', 'a-title') + mid(56, 159, 'prensa francesa', 'a-small');
    body += mid(170, 141, 'Média', 'a-title') + mid(170, 159, 'coado', 'a-small');
    body += mid(284, 141, 'Fina', 'a-title on-mark') + mid(284, 159, 'espresso', 'a-small on-mark');
    body += arrow(24, 188, 316, 188) + mid(170, 207, 'cada vez mais fina', 'a-small');
    return svg(214, 'Três tamanhos de moagem lado a lado: grossa, em pedaços grandes, para prensa francesa; média, para coado; e fina, quase um pó, para espresso.', body);
  }

  /* Levelling, then a light press, in a pressurized basket. */
  function tamping() {
    var body = '';
    function basket(c, top, seed) {
      var s = path('M' + (c - 56) + ' ' + top + ' C' + (c - 20) + ' ' + (top - .8) + ' ' + (c + 20) + ' ' + (top + .8) + ' ' + (c + 56) + ' ' + top + ' L' + (c + 52.5) + ' 160 L' + (c - 52.5) + ' 160 Z', 'a-ground') +
        speckle(c - 48, c + 48, top + 5, 155, 36, seed);
      s += perforated(c - 52, c + 52, 161, 9, 3.5).svg;
      s += path('M' + (c - 70) + ' 112 L' + (c - 59) + ' 112 C' + (c - 57) + ' 135 ' + (c - 54) + ' 157 ' + (c - 53) + ' 178 L' + (c - 3.5) + ' 178', 'a-metal');
      s += path('M' + (c + 70) + ' 112 L' + (c + 59) + ' 112 C' + (c + 57) + ' 135 ' + (c + 54) + ' 157 ' + (c + 53) + ' 178 L' + (c + 3.5) + ' 178', 'a-metal');
      return s;
    }
    var L = 85, R = 255;
    body += mid(L, 22, '1. Nivele', 'a-title') + mid(R, 22, '2. Aperte de leve', 'a-title');

    // 1: the heap (dashed) is swept flat, level with the rim.
    body += basket(L, 113, 5);
    body += path('M' + (L - 48) + ' 109 C' + (L - 24) + ' 74 ' + (L + 8) + ' 66 ' + (L + 46) + ' 108', 'a-ghost');
    body += arrow(L - 50, 62, L + 50, 62);

    // 2: tamper held straight; the surface ends up flat, a little below the rim.
    body += basket(R, 126, 9);
    body += '<rect x="' + (R - 53) + '" y="111" width="106" height="15" rx="3" class="a-tool"/>';
    body += path('M' + (R - 10) + ' 111 C' + (R - 7) + ' 96 ' + (R - 8) + ' 86 ' + (R - 14) + ' 78 L' + (R + 14) + ' 78 C' + (R + 8) + ' 86 ' + (R + 7) + ' 96 ' + (R + 10) + ' 111 Z', 'a-tool');
    body += path('M' + (R - 21) + ' 78 C' + (R - 28) + ' 60 ' + (R - 17) + ' 45 ' + R + ' 45 C' + (R + 17) + ' 45 ' + (R + 28) + ' 60 ' + (R + 21) + ' 78 Z', 'a-tool');
    body += arrow(R + 44, 58, R + 44, 94);

    body += mid(L, 204, 'passe o dedo e tire', 'a-small') + mid(L, 221, 'o monte, rente à borda', 'a-small');
    body += mid(R, 204, 'compactador reto,', 'a-small') + mid(R, 221, 'quase sem força', 'a-small');
    return svg(232, 'Preparo do pó no cesto pressurizado em dois passos. Primeiro, nivele: passe o dedo sobre o monte até o pó ficar reto, rente à borda. Segundo, aperte de leve com o compactador reto, quase sem força.', body);
  }

  /* Where the tip of the steam wand sits in each of the two phases. */
  function wand() {
    var body = '';
    function jug(c, level, foam) {
      var s = '';
      s += path('M' + (c - 55.5) + ' ' + level + ' C' + (c - 25) + ' ' + (level - 2) + ' ' + (c + 20) + ' ' + (level + 2) + ' ' + (c + 52.5) + ' ' + level +
        ' L' + (c + 48) + ' 204 Q' + (c + 47) + ' 212 ' + (c + 39) + ' 212 L' + (c - 43) + ' 212 Q' + (c - 51) + ' 212 ' + (c - 52) + ' 204 Z', 'a-milk');
      if (foam) {
        s += path('M' + (c - 55.5) + ' ' + level + ' C' + (c - 25) + ' ' + (level - 2) + ' ' + (c + 20) + ' ' + (level + 2) + ' ' + (c + 52.5) + ' ' + level + ' L' + (c + 52) + ' ' + (level + 12) + ' C' + (c + 18) + ' ' + (level + 15) + ' ' + (c - 24) + ' ' + (level + 9) + ' ' + (c - 55) + ' ' + (level + 12) + ' Z', 'a-foam');
      }
      return s;
    }
    function outline(c) {
      // jug seen from the side: pouring lip on the left, handle on the right
      return path('M' + (c - 70) + ' 84 C' + (c - 62) + ' 85 ' + (c - 58) + ' 90 ' + (c - 57) + ' 100 L' + (c - 52) + ' 204 Q' + (c - 51) + ' 212 ' + (c - 43) + ' 212 L' + (c + 39) + ' 212 Q' + (c + 47) + ' 212 ' + (c + 48) + ' 204 L' + (c + 55) + ' 84', 'a-metal') +
        path('M' + (c + 54.5) + ' 98 C' + (c + 76) + ' 96 ' + (c + 76) + ' 160 ' + (c + 51) + ' 166', 'a-metal');
    }
    function steam(x1, y1, x2, y2) {
      var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len;
      return path('M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2, 'a-wand-edge') +
        path('M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2, 'a-wand') +
        path('M' + n(x2 - ux * 3) + ' ' + n(y2 - uy * 3) + ' L' + n(x2 + ux * 4) + ' ' + n(y2 + uy * 4), 'a-nozzle');
    }
    var L = 82, R = 252;
    body += mid(L, 22, '1. Injetar ar', 'a-title') + mid(R, 22, '2. Girar', 'a-title');

    // Phase 1: tip just under the surface, off centre. Bubbles and the hissing marks.
    body += jug(L, 146, false) + outline(L);
    body += steam(L + 34, 42, L - 12, 151);
    [[-34, 142, 3.5], [-26, 150, 2.4], [-4, 141, 3], [5, 149, 2.2], [14, 143, 2.6], [-43, 150, 2]].forEach(function (b) { body += dot(L + b[0], b[1], b[2], 'a-bubble'); });
    body += path('M' + (L - 27) + ' 133 l-8 -7 M' + (L - 20) + ' 128 l-4 -10 M' + (L - 34) + ' 139 l-11 -3', 'a-arrow thin');

    // Phase 2: milk has grown, tip goes a little deeper and the milk spins.
    body += jug(R, 130, true) + outline(R);
    body += steam(R + 34, 42, R - 15, 155);
    body += path('M' + (R - 34) + ' 176 C' + (R - 34) + ' 162 ' + (R + 30) + ' 160 ' + (R + 32) + ' 176 C' + (R + 33) + ' 189 ' + (R + 2) + ' 193 ' + (R - 14) + ' 190', 'a-swirl');
    body += path('M' + (R - 5) + ' 184 L' + (R - 15) + ' 190 L' + (R - 6) + ' 197', 'a-swirl');

    body += mid(L, 238, 'ponta logo abaixo', 'a-small') + mid(L, 255, 'da superfície, chiando', 'a-small');
    body += mid(R, 238, 'ponta um pouco mais', 'a-small') + mid(R, 255, 'funda, sem chiado', 'a-small');
    return svg(264, 'Posição do bico de vapor na jarra em duas fases. Na primeira, para injetar ar, a ponta fica logo abaixo da superfície, um pouco fora do centro, e o leite chia. Na segunda, a ponta desce um pouco, o chiado para e o leite gira em redemoinho.', body);
  }

  /* 17 g of grounds in, 34 g of drink out. The blocks underneath show the same thing by size. */
  function ratio() {
    var body = '', L = 76, R = 258;
    // basket with grounds
    body += path('M' + (L - 45) + ' 34 C' + (L - 15) + ' 32 ' + (L + 18) + ' 35 ' + (L + 45) + ' 34 L' + (L + 41.5) + ' 76 L' + (L - 41.5) + ' 76 Z', 'a-ground') + speckle(L - 37, L + 37, 39, 72, 30, 3);
    body += path('M' + (L - 58) + ' 24 L' + (L - 47) + ' 24 C' + (L - 46) + ' 45 ' + (L - 43) + ' 62 ' + (L - 42) + ' 78 L' + (L + 42) + ' 78 C' + (L + 43) + ' 62 ' + (L + 46) + ' 45 ' + (L + 47) + ' 24 L' + (L + 58) + ' 24', 'a-metal');
    // arrow
    body += arrow(146, 51, 192, 51);
    // cup with espresso and crema
    var cup = 'M' + (R - 40) + ' 20 L' + (R + 40) + ' 20 C' + (R + 40) + ' 58 ' + (R + 28) + ' 76 ' + (R + 8) + ' 78 L' + (R - 8) + ' 78 C' + (R - 28) + ' 76 ' + (R - 40) + ' 58 ' + (R - 40) + ' 20 Z';
    body += path('M' + (R - 38.5) + ' 40 L' + (R + 38.5) + ' 40 C' + (R + 36) + ' 62 ' + (R + 26) + ' 76 ' + (R + 8) + ' 77 L' + (R - 8) + ' 77 C' + (R - 26) + ' 76 ' + (R - 36) + ' 62 ' + (R - 38.5) + ' 40 Z', 'a-coffee');
    body += path('M' + (R - 39.3) + ' 34 L' + (R + 39.3) + ' 34 L' + (R + 38.3) + ' 43 L' + (R - 38.3) + ' 43 Z', 'a-liquid');
    body += path(cup, 'a-metal') + path('M' + (R + 38) + ' 31 C' + (R + 62) + ' 29 ' + (R + 60) + ' 61 ' + (R + 31) + ' 62', 'a-metal') + path('M' + (R - 54) + ' 86 Q' + R + ' 93 ' + (R + 54) + ' 86', 'a-metal');

    body += mid(L, 129, '17 g', 'a-num') + mid(L, 158, 'de pó no cesto', 'a-small');
    body += mid(R, 129, '34 g', 'a-num') + mid(R, 158, 'de bebida na xícara', 'a-small');
    // one block of weight becomes two equal ones
    body += '<rect x="' + (L - 29) + '" y="172" width="58" height="18" class="a-ground"/>';
    body += '<rect x="' + (R - 60) + '" y="172" width="58" height="18" class="a-coffee"/><rect x="' + (R + 2) + '" y="172" width="58" height="18" class="a-coffee"/>';
    body += mid(152, 188, '1 : 2', 'a-label');
    return svg(196, 'Proporção um para dois: 17 gramas de pó no cesto viram 34 gramas de bebida na xícara, o dobro do peso.', body);
  }

  window.ART = { waterLabel: waterLabel, baskets: baskets, grind: grind, tamping: tamping, wand: wand, ratio: ratio };
})();
