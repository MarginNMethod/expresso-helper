/* content.js: todo o texto do app, em português do Brasil.
   Escrito à parte da interface: o layout lê window.CONTENT.
   Textos aceitam só <strong> e <em>.

   ARTIGO (comecar.alerts, comecar.sections[].items, preparar.leite, entender.sections[].items)
     { id, title, subtitle?, icon, band: { tone, num?, unit?, line? }, blocks: [...], related: [...] }
     subtitle só existe quando diz algo que o título não diz; o código precisa aceitar a ausência.
     Tons: volt, ink, agua, leite, torra, temperatura, processos, regioes, frescor, sabor,
     espresso, gelo, brasil, shot.
     O alerta de voltagem tem ainda home: { num, line, go } para o bloco da tela Começar.

   BEBIDA
     { id, name, aka?, short, ratio, espresso, volume, cup, band: { tone, num, unit?, line },
       layers: [ { kind, pct, float? } ], fill, steps: [2 a 7 textos], tip?, related? }
     "espresso" é a dose. kind "americano" = café diluído, de cor uniforme.

   BLOCOS
     {type:"p", text, lead?}                  lead marca o parágrafo de abertura
     {type:"h", text, id?}                    id vira âncora
     {type:"list", items:[texto]}
     {type:"steps", items:[{title, text}]}
     {type:"table", head, rows, caption?}     no máximo 3 colunas
     {type:"range", label, min, max, unit, low, high, markers?:[{value,label}]}
                                              low–high é a faixa boa
     {type:"timeline", items:[{label, text}]}
     {type:"leader", items:[{label, value}]}  rótulo, pontilhado, valor curto
     {type:"rule", text}                      a regra que não se quebra
     {type:"more", title, blocks}             conteúdo recolhido
     {type:"art", name, caption?}             desenho de art.js: waterLabel, baskets, grind,
                                              tamping, wand, ratio
     {type:"roast", levels:[{id, name, color, summary, items:[{label,value}]}]}
                                              um nível por vez; "media" começa selecionado
     {type:"origin", id, name, country?, altitude, process, notes:[texto], espresso}
                                              linha que abre; "espresso" é como se comporta
     {type:"claim", myth, truth, big?}        big mostra aberto; sem big, abre ao tocar
     {type:"roastbar"}, {type:"cherry"}
     {type:"compass", top, bottom, left, right, center, quadrants?}
                                              quadrants: [baixo-esq, baixo-dir, cima-esq, cima-dir]
     {type:"worldmap", focus?, regions:[{id, name, x, y, link?}]}
                                              x/y em % do mapa-múndi; o id aponta para um bloco
                                              origin ou um h na mesma tela; link abre outra rota;
                                              focus:"brasil" pede o mapa aproximado no Brasil
     {type:"glossary", items:[{id, termo, def}]}

   preparar.ratio.note e .mlNote ({min} e {max} são trocados pelo app), preparar.diagnosticoSub,
   preparar.diagnosticoBlocks (acima da lista), diagnostico[].related.
   Links: comecar/…, bebidas/…, preparar/…, entender/…; "entender/glossario#<id>" rola até o termo.
   Quiz: a ordem das opções é fixa. Não embaralhe, senão "correct" deixa de valer.
*/
(function () {
var C = {};

C.meta = {
  appName: "Bambino",
  tabs: { comecar: "Começar", bebidas: "Bebidas", preparar: "Preparar", entender: "Entender" }
};

/* ============================== COMEÇAR ============================== */

C.comecar = {
  intro: "Dá pra tirar um bom espresso na sua Bambino mesmo sem moedor. Antes de ligar, veja a voltagem.",

  alerts: [
    {
      id: "voltagem",
      title: "Voltagem no Brasil",
      icon: "bolt",
      home: { num: "127 ou 220 V?", line: "A Bambino americana é de 120 V. Numa tomada de 220 V ela queima.", go: "Veja antes de ligar" },
      band: { tone: "volt", num: "127 ou 220 V?", line: "Descubra qual é a sua tomada antes de ligar a máquina pela primeira vez." },
      blocks: [
        { type: "p", lead: true, text: "A sua Bambino é a americana, de 120 V. O Brasil tem tomada de 127 e de 220, e isso muda de cidade pra cidade e até de parede pra parede." },
        { type: "rule", text: "Nunca ligue a máquina de 120 V numa tomada de 220 V." },
        { type: "p", text: "Resistência e eletrônica queimam em segundos, e a garantia não cobre." },
        { type: "leader", items: [
          { label: "Tomada de 127 V", value: "liga direto" },
          { label: "Tomada de 220 V", value: "só com transformador" }
        ] },
        { type: "p", text: "A Bambino puxa cerca de 1.560 W em 60 Hz. O Brasil também usa 60 Hz, e a bomba depende disso, então o problema é só a tensão." },
        { type: "h", id: "tomada", text: "Descubra a sua tomada" },
        { type: "p", text: "Quem define a tensão é a distribuidora, e ela muda até dentro do mesmo estado." },
        { type: "table", head: ["Tensão", "Maioria das cidades de"],
          rows: [
            ["127 V", "SP, RJ, MG, PR, AM"],
            ["220 V", "DF, GO, SC, CE, PE, RN"]
          ],
          caption: "Quase todo estado tem exceção. Confirme no imóvel." },
        { type: "p", text: "Mesmo em cidade de 127 V, muita casa tem tomada de 220 V pra chuveiro, ar-condicionado ou secadora, geralmente igual às outras por fora." },
        { type: "steps", items: [
          { title: "Procure a etiqueta", text: "Olhe a tomada e o disjuntor dela. Depois de reforma, adesivo de “110” ou “220” pode estar errado." },
          { title: "Pergunte", text: "Proprietário, síndico, imobiliária ou um eletricista sabem a tensão." },
          { title: "Na dúvida, meça", text: "Um multímetro simples, de loja de material de construção, mede em segundos na escala de tensão alternada (V~)." }
        ] },
        { type: "h", text: "Deu 127 V" },
        { type: "p", text: "Liga sem transformador, porque 127 V cabe na tolerância de 120 V. Falta cuidar do plugue e da corrente." },
        { type: "list", items: [
          "O plugue americano tem três pinos. O padrão brasileiro (NBR 14136) também, em versões de 10 A e 20 A.",
          "Em 127 V a resistência rende um pouco mais e a máquina pode puxar 13–14 A. Isso passa do limite de uma tomada de 10 A.",
          "Use uma tomada de 20 A, a de pinos mais grossos, com adaptador de 20 A que mantenha o pino de terra.",
          "Nada de benjamim, “T” ou extensão fina. Com aparelho de resistência eles esquentam e podem derreter."
        ] },
        { type: "h", text: "Deu 220 V" },
        { type: "p", text: "Você precisa de um transformador abaixador de 220 pra 110 V, com 2.000 VA no mínimo. O ideal é 3.000 VA, que trabalha com folga." },
        { type: "list", items: [
          "Serve transformador ou autotransformador de marca confiável, com saída de 20 A e terra.",
          "Deixe em lugar ventilado e ligue só enquanto usa."
        ] },
        { type: "p", text: "Conversor de viagem pequeno, filtro de linha e estabilizador não baixam a tensão com segurança pra uma máquina dessas." }
      ],
      related: ["comecar/sem-moedor"]
    }
  ],

  manual: {
    title: "Manual contra o amigo metido a barista",
    intro: "Respostas pro amigo que fala de café como se fosse vinho, sem perder a amizade.",
    cards: [
      { id: "torra-forte",
        ele: "“Gosto de torra escura porque é mais forte, tem mais cafeína.”",
        voce: "“Mais amarga, com certeza. A cafeína é quase a mesma.”",
        porque: "A cafeína aguenta a torra. Quem muda a conta é a espécie do grão e a dose.",
        link: "entender/torra" },
      { id: "crema",
        ele: "“Olha essa crema grossa. Café bom é assim.”",
        voce: "“Bonita mesmo. Quer dizer que o café é fresco e ainda tem gás. Agora vamos ver o gosto.”",
        porque: "Torra escura e cesto pressurizado também fazem espuma, sem melhorar o sabor.",
        link: "comecar/crema" },
      { id: "grao-espresso",
        ele: "“Vou comprar aquele grão de espresso.”",
        voce: "“Qualquer grão serve. Espresso é o jeito de fazer.”",
        link: "comecar/o-que-e-espresso" },
      { id: "arabica",
        ele: "“Robusta é café ruim. Bom mesmo é 100% arábica.”",
        voce: "“Tem arábica ruim e tem conilon excelente. Rondônia e Espírito Santo estão aí pra provar.”",
        porque: "Conilon bem cuidado dá chocolate, corpo e crema. Arábica mal colhido decepciona igual.",
        link: "entender/regioes-brasil" },
      { id: "natural",
        ele: "“Prefiro café natural, sem química.”",
        voce: "“Ih, natural é outra história. É o café que secou com a fruta inteira em volta.”",
        porque: "Natural é um jeito de processar depois da colheita. Contra agrotóxico, procure orgânico, que é outra certificação.",
        link: "entender/processos" },
      { id: "torrado-ontem",
        ele: "“Esse aqui foi torrado ontem, está no auge.”",
        voce: "“Pra espresso ainda é cedo. Deixa ele soltar o gás uns dias.”",
        porque: "CO₂ demais bagunça a extração. Em grão, uma semana costuma bastar.",
        link: "entender/frescor" },
      { id: "forte-curto",
        ele: "“Espresso é só café forte com pouca água.”",
        voce: "“A água é pouca, mas passa empurrada a uns 9 bar. E sai mais ou menos o dobro do peso do pó.”",
        porque: "A pressão dissolve compostos e emulsiona óleos de um jeito que nenhum coado concentrado consegue.",
        link: "comecar/dose-proporcao-tempo" },
      { id: "ristretto-cafeina",
        ele: "“Peço ristretto porque é mais forte, tem mais cafeína.”",
        voce: "“No gosto é mais concentrado. De cafeína, tem até um pouco menos.”",
        porque: "Mesma dose, menos água. A cafeína sai cedo, só que não toda nos primeiros segundos.",
        link: "bebidas/ristretto" },
      { id: "brasileiro-amargo",
        ele: "“Café brasileiro é tudo igual: forte e amargo.”",
        voce: "“O maior produtor do mundo ia ter um café só? Tem de chocolate e nozes a fruta e flor.”",
        porque: "O amargor do café comum vem da torra muito escura e do grão ruim.",
        link: "entender/regioes-brasil" },
      { id: "agua-fervendo",
        ele: "“Café tem que ser feito com água fervendo.”",
        voce: "“Espresso não. Vai de 86 a 96 graus, depende da torra.”",
        porque: "Quanto mais quente, mais rápido extrai, e o amargor vem junto.",
        link: "entender/temperatura" },
      { id: "leite-quente",
        ele: "“Leite do cappuccino tem que vir pelando.”",
        voce: "“Pelando ele perde o doce. Gostoso é entre 55 e 65 graus.”",
        porque: "Passando de uns 70 °C as proteínas se desfazem e a espuma murcha.",
        link: "preparar/leite" },
      { id: "15-bar",
        ele: "“Minha máquina tem 15 bar, então faz espresso melhor.”",
        voce: "“Quinze é o máximo da bomba. No café, o clássico fica perto de 9.”",
        link: "entender/mitos" }
    ],
    quiz: [
      { q: "O que é espresso, afinal?",
        options: ["Um jeito de preparar café sob pressão", "Um grão de torra bem escura", "Uma variedade de café arábica"],
        correct: 0,
        explain: "É água quente passando sob pressão pelo pó fino. Qualquer grão serve." },
      { q: "Num espresso normal, quanta bebida sai?",
        options: ["1:1, o mesmo peso do pó", "1:5, cinco vezes o pó", "1:2, o dobro do pó"],
        correct: 2,
        explain: "Comece em 1:2. De 1:1 a 1:1,5 é ristretto, de 1:2,5 a 1:3 é lungo." },
      { q: "Crema grossa e bonita mostra principalmente que o café…",
        options: ["é de qualidade superior", "ainda tem bastante gás", "tem mais cafeína"],
        correct: 1,
        explain: "É o CO₂ que o café fresco guarda. Dá pra ter espuma de sobra e pouco sabor." },
      { q: "Você abriu um pacote que acaba esta semana. Onde ele fica?",
        options: ["No armário, em pote vedado", "Na geladeira, bem fechado", "Num vidro bonito na bancada"],
        correct: 0,
        explain: "Geladeira traz umidade e cheiro, e vidro deixa a luz entrar." },
      { q: "Pelo mesmo peso, a torra escura tem…",
        options: ["bem mais cafeína que a clara", "quase nenhuma cafeína", "praticamente a mesma cafeína"],
        correct: 2,
        explain: "Só em colheradas a escura entrega um pouco menos, porque o grão é mais leve." }
    ],
    palavras: [
      { termo: "Extração", significado: "Quanto café a água dissolveu. De menos azeda, demais amarga.", link: "entender/glossario#extracao" },
      { termo: "Proporção", significado: "Bebida comparada ao pó, em peso. Solte um “tirei um 1:2” e veja a cara dele.", link: "comecar/dose-proporcao-tempo" },
      { termo: "Perfil sensorial", significado: "Acidez, doçura, amargor, corpo e aromas, tudo junto.", link: "entender/sabor" },
      { termo: "Corpo", significado: "O peso na boca. Vai de leve como chá a grosso como xarope.", link: "entender/glossario#corpo" },
      { termo: "Doçura", significado: "Café bem extraído parece doce até sem açúcar.", link: "entender/sabor" },
      { termo: "Acidez brilhante", significado: "Aquela acidez gostosa, de fruta. É elogio e passa longe do azedo.", link: "entender/glossario#acidez" },
      { termo: "Finalização", significado: "O gosto que fica depois de engolir. Quanto mais longo e doce, melhor.", link: "entender/glossario#finalizacao" },
      { termo: "Descanso", significado: "Os dias depois da torra em que o grão solta gás.", link: "entender/frescor" },
      { termo: "Processo natural", significado: "A cereja secou inteira. Costuma vir mais corpo e gosto de fruta.", link: "entender/processos" },
      { termo: "Torra média", significado: "Equilibra doçura, acidez e corpo. A mais fácil pra começar.", link: "entender/niveis-torra" },
      { termo: "Canalização", significado: "A água acha um atalho no pó e extrai mal o resto.", link: "entender/glossario#canalizacao" },
      { termo: "Microespuma", significado: "Leite vaporizado com bolhas tão miúdas que brilha feito tinta fresca.", link: "preparar/leite" }
    ]
  },

  sections: [
    {
      title: "Primeiros passos",
      items: [
        {
          id: "sem-moedor",
          title: "Sem moedor: como começar",
          icon: "bean",
          band: { tone: "torra", num: "1 furo", line: "É assim que se reconhece o cesto pressurizado, o que você vai usar agora." },
          blocks: [
            { type: "art", name: "baskets", caption: "Olhe o cesto por baixo. O pressurizado tem um furo no centro; o de parede simples, centenas." },
            { type: "p", lead: true, text: "Dá pra fazer um espresso gostoso sem moedor. Use o cesto pressurizado e escolha bem o pó." },
            { type: "p", text: "A Bambino vem com quatro cestos de 54 mm, um simples e um duplo de cada tipo. Fique com os pressurizados, de parede dupla, e guarde os outros pro dia em que tiver moedor." },
            { type: "p", text: "A água precisa de resistência pra passar devagar. Com grão moído na hora, quem faz isso é a moagem fina e uniforme. Pó de pacote não tem ajuste e envelhece depressa, então quem segura a água é o furinho." },
            { type: "h", text: "Como encher o cesto" },
            { type: "art", name: "tamping" },
            { type: "p", text: "Encha até perto da borda, nivele com o dedo e aperte de leve. Pode ser bem de leve mesmo, porque quem cria a pressão é o furo." },
            { type: "h", text: "Na hora de comprar" },
            { type: "list", items: [
              "Escrito “torrado e moído para espresso” ou “moagem fina”, em pacote de 250 g.",
              "Com data de torra impressa. A validade sozinha não diz se o café é fresco.",
              "Torra média. A muito clara é difícil de extrair e a muito escura amarga fácil.",
              "Café especial, se achar. Ele passa por avaliação de sabor e costuma informar origem e torra."
            ] },
            { type: "p", text: "Passe reto pelo “extraforte”. Em geral é grão comum, torrado bem escuro pra disfarçar defeito." },
            { type: "h", text: "Melhor ainda, moído na hora" },
            { type: "p", text: "Numa torrefação ou cafeteria de café especial, compre em grão e peça pra moer “para espresso”. Avise que o cesto é pressurizado." },
            { type: "p", text: "Leve pouco por vez, porque café moído perde o aroma em questão de dias." }
          ],
          related: ["entender/frescor", "comecar/moagem", "comecar/primeiro-moedor"]
        },
        {
          id: "o-que-e-espresso",
          title: "O que é espresso",
          icon: "cup",
          band: { tone: "espresso", num: "9 bar", line: "É a pressão que empurra água quente pelo pó fino em coisa de meio minuto." },
          blocks: [
            { type: "p", lead: true, text: "Aquela xicrinha com espuma dourada leva de 25 a 30 segundos pra sair. Nesse tempo, água a 90 e poucos graus atravessa uma pastilha de café moído fino." },
            { type: "p", text: "Sem pressão, a água mal passaria por um pó desses. Forçada por um caminho apertado, ela dissolve muita coisa depressa, emulsiona os óleos do café e carrega o gás que depois vira crema." },
            { type: "p", text: "Sai pouca bebida, concentrada e de corpo denso. O coado vai pro outro lado, com a xícara cheia de um café leve, limpo e sem crema." },
            { type: "leader", items: [
              { label: "Sólidos no espresso", value: "8–12%" },
              { label: "No coado", value: "1,2–1,5%" }
            ] },
            { type: "p", text: "E esqueça a ideia de um grão próprio pra isso. Qualquer café pode ser tirado como espresso." },
            { type: "h", text: "O que você controla" },
            { type: "p", text: "São três medidas, e quase todo o trabalho é mexer nelas." },
            { type: "leader", items: [
              { label: "Dose", value: "pó no cesto, em g" },
              { label: "Rendimento", value: "bebida, em g" },
              { label: "Tempo", value: "do botão até parar" }
            ] }
          ],
          related: ["comecar/dose-proporcao-tempo", "comecar/crema"]
        },
        {
          id: "dose-proporcao-tempo",
          title: "Dose, proporção e tempo",
          icon: "scale",
          band: { tone: "espresso", num: "1:2", unit: "pó pra bebida", line: "Com 17 g de café no cesto, pare quando a balança marcar 34 g." },
          blocks: [
            { type: "p", lead: true, text: "Pese o café e a bebida. Mililitro engana, porque com a crema 34 g podem parecer uns 45 ml." },
            { type: "art", name: "ratio", caption: "Divida a bebida pelo pó e você tem a proporção." },
            { type: "table", head: ["Estilo", "Proporção", "Com 17 g de pó"],
              rows: [
                ["Ristretto", "1:1 a 1:1,5", "17–25 g"],
                ["Normal", "1:2", "34 g"],
                ["Lungo", "1:2,5 a 1:3", "42–51 g"]
              ],
              caption: "Peso da bebida, medido na balança." },
            { type: "p", text: "Ácido e fruta saem primeiro, açúcar e corpo no meio, amargor e boca seca no fim. Parou cedo, vem intenso e ácido. Deixou correr, fica ralo e amargo." },
            { type: "h", text: "Quanto pó em cada cesto" },
            { type: "table", head: ["Cesto de 54 mm", "Dose", "Comece com"],
              rows: [
                ["Simples", "8–10 g", "9 g"],
                ["Duplo", "16–18 g", "17 g"]
              ],
              caption: "Vale pros dois tipos de cesto e muda um pouco com o pó." },
            { type: "h", text: "Seu primeiro espresso" },
            { type: "steps", items: [
              { title: "Aqueça tudo", text: "Ligue e passe água pelo porta-filtro vazio, caindo na xícara." },
              { title: "Pese o pó", text: "Ponha 17 g no cesto duplo seco, nivele e compacte de leve." },
              { title: "Zere a balança", text: "Encaixe o porta-filtro, ponha balança e xícara na bandeja e zere." },
              { title: "Extraia", text: "Aperte o botão de duas xícaras junto com o cronômetro. Perto de 34 g, aperte de novo." },
              { title: "Prove e anote", text: "Escreva dose, peso na xícara e tempo. Da próxima vez, mude uma coisa só." }
            ] },
            { type: "h", text: "Botões e balança" },
            { type: "p", text: "Os botões param por volume, perto de 30 ml e 60 ml de fábrica. Servem bem pra repetir o que já deu certo, mas não sabem nada de proporção." },
            { type: "p", text: "Compre uma balança de 0,1 g. Depois do café, é o que mais faz diferença. A de 1 g quebra o galho, mas erra feio no ristretto." },
            { type: "p", text: "No relógio, a referência pra 1:2 é 25–30 s. No pressurizado, confie mais no peso e no gosto." }
          ],
          related: ["preparar/ratio", "preparar/timer", "preparar/diagnostico"]
        },
        {
          id: "moagem",
          title: "Moagem",
          icon: "list",
          band: { tone: "torra", line: "Pro seu espresso, o pó certo é fino e lembra sal refinado." },
          blocks: [
            { type: "p", lead: true, text: "Quanto mais fino, mais superfície e mais rápido a água tira sabor. No espresso o pó ainda precisa segurar a água sob pressão." },
            { type: "art", name: "grind" },
            { type: "table", head: ["Moagem", "Lembra", "Serve pra"],
              rows: [
                ["Grossa", "Sal grosso", "Prensa francesa"],
                ["Média", "Areia de praia", "Coado"],
                ["Média-fina", "Areia fina", "Italiana"],
                ["Fina", "Sal refinado", "Espresso"],
                ["Extrafina", "Talco", "Café turco"]
              ],
              caption: "Comparação aproximada, varia com moedor e café." },
            { type: "h", text: "Quando erra a mão" },
            { type: "p", text: "Grosso demais, a água dispara e sai rala, ácida, quase sem crema." },
            { type: "p", text: "Fino demais, o café pinga devagar ou trava, e vem amargo e áspero. No cesto pressurizado ainda pode entupir o furinho." },
            { type: "h", text: "E o pó do mercado?" },
            { type: "p", text: "O moído comum no Brasil é de coar, médio. No cesto simples a água passa em segundos. No pressurizado vai melhor, mas o “para espresso” costuma dar mais corpo." }
          ],
          related: ["comecar/primeiro-moedor", "preparar/diagnostico"]
        },
        {
          id: "crema",
          title: "Crema",
          icon: "drop",
          band: { tone: "espresso", line: "Ela mostra que o café ainda tem gás, e sobre o gosto conta bem pouco." },
          blocks: [
            { type: "p", lead: true, text: "Prove uma colherinha só de crema. Amarga e seca, né? Por isso muita gente mexe o espresso antes de beber e mistura as camadas." },
            { type: "p", text: "São bolhinhas de CO₂ presas em óleos, proteínas e melanoidinas, os compostos escuros da torra." },
            { type: "p", text: "Sob 9 bar o gás do grão se dissolve na água. Na xícara a pressão cai e ele escapa em bolhinhas, como num refrigerante aberto." },
            { type: "h", text: "O que engorda a crema" },
            { type: "list", items: [
              "Café fresco, que ainda tem bastante CO₂.",
              "Torra mais escura, que gera mais gás.",
              "Robusta e conilon, de crema farta e firme.",
              "Cesto pressurizado, que bate a bebida e faz espuma até com café velho."
            ] },
            { type: "p", text: "Um espresso pode ter crema linda e gosto ruim, ou quase nenhuma e um sabor ótimo." },
            { type: "h", text: "Como a sua vai parecer" },
            { type: "p", text: "No pressurizado sai clara, com bolhas maiores que somem logo. É a válvula fazendo espuma." },
            { type: "p", text: "No cesto simples com café fresco, fica fina e demora a sumir, cor de avelã, às vezes riscada." }
          ],
          related: ["entender/frescor", "entender/mitos"]
        },
        {
          id: "limpeza",
          title: "Limpeza e descalcificação",
          icon: "wrench",
          band: { tone: "agua", num: "2–3 s", unit: "de água", line: "Passe pelo grupo depois de cada café, antes que o óleo tenha chance de ficar velho." },
          blocks: [
            { type: "p", lead: true, text: "Óleo de café velho fica rançoso e amarga o próximo espresso. Calcário entope canos e atrapalha o aquecimento." },
            { type: "timeline", items: [
              { label: "A cada café", text: "Borra no lixo, cesto enxaguado, água pelo grupo. Limpe e purgue o bico de vapor." },
              { label: "Todo dia", text: "Lave a bandeja e passe pano úmido na ducha." },
              { label: "Toda semana", text: "Desentupa o furo do cesto pressurizado com alfinete fino (algumas versões trazem ferramenta). Lave a jarra de leite com detergente." },
              { label: "Todo mês", text: "Cestos e porta-filtro de molho em detergente de máquina de espresso, sem molhar o plástico." }
            ] },
            { type: "p", text: "Retrolavagem com cesto cego é coisa de máquina maior. Na Bambino, siga a limpeza do manual." },
            { type: "h", text: "Descalcificar" },
            { type: "p", text: "É tirar os minerais grudados nas partes quentes, como numa chaleira. Faça quando a máquina ou o manual pedir, ou mais cedo se a água for dura. Com água filtrada e leve, o intervalo estica." },
            { type: "steps", items: [
              { title: "Prepare a solução", text: "Descalcificante de máquina de espresso no reservatório, diluído como diz a embalagem." },
              { title: "Rode o ciclo", text: "Use o modo próprio da Bambino, na sequência exata do manual do seu modelo." },
              { title: "Enxágue bem", text: "Lave o reservatório e passe ao menos um tanque cheio de água limpa." }
            ] },
            { type: "rule", text: "Não descalcifique com vinagre." },
            { type: "p", text: "Deixa cheiro e pode atacar as vedações. Os produtos próprios usam ácido cítrico ou lático." }
          ],
          related: ["entender/agua", "preparar/leite"]
        }
      ]
    },
    {
      title: "Quando quiser ir além",
      items: [
        {
          id: "primeiro-moedor",
          title: "Seu primeiro moedor",
          icon: "wrench",
          band: { tone: "ink", num: "40–90 s", unit: "de manivela", line: "É o que um moedor manual pede por dose, em troca de mais qualidade pelo mesmo dinheiro." },
          blocks: [
            { type: "p", lead: true, text: "Depois da máquina, nada melhora tanto a xícara. Com moedor você compra grão fresco e passa pro cesto de parede simples." },
            { type: "rule", text: "Moedor de lâminas, não compre." },
            { type: "p", text: "Tamanho igual importa tanto quanto finura. O de hélice pica desigual, aí o pó amarga e os pedaços azedam. Procure um de mós, que esmaga o grão entre duas peças ajustáveis." },
            { type: "h", text: "Manual ou elétrico" },
            { type: "p", text: "Vá de manual primeiro. Rende mais pelo preço, é silencioso e dispensa tomada." },
            { type: "p", text: "O elétrico pra espresso é mais confortável. Os de entrada costumam ter mó cônica e ajuste em passos pequenos." },
            { type: "h", text: "Antes de comprar" },
            { type: "list", items: [
              "O fabricante precisa garantir que mói pra espresso, além do coado.",
              "Ajuste contínuo ou de passos pequenos, porque um passo grande pula o ponto.",
              "Pouca retenção, que é o pó preso lá dentro entre doses.",
              "Se for elétrico, voltagem igual à da sua tomada."
            ] },
            { type: "h", text: "Quando ele chegar" },
            { type: "p", text: "Troque de cesto, mantenha dose e proporção e afine a moagem até a extração entrar na faixa de 25–30 s. Daí em diante é nela que você mexe." },
            { type: "p", text: "Um funil de 54 mm poupa sujeira. Agulha fina no pó antes de compactar (WDT) desfaz grumos e reduz canalização." }
          ],
          related: ["comecar/moagem", "preparar/diagnostico"]
        }
      ]
    }
  ]
};

/* ============================== BEBIDAS ============================== */

C.bebidas = {
  intro: "As receitas usam os cestos pressurizados, com 9 g no simples e 17 g no duplo. Onde entra leite ou água, a proporção é em peso e o café vem primeiro.",
  groups: [
    {
      title: "Só espresso",
      items: [
        { id: "ristretto", name: "Ristretto", aka: "Espresso curto",
          short: "Parado cedo, curto e grosso",
          ratio: "1:1 a 1:1,5", espresso: "17 g → 17–25 g", volume: "20–30 ml", cup: "xícara de espresso, 60–90 ml",
          band: { tone: "shot", num: "1:1 a 1:1,5", unit: "em peso", line: "Parando cedo, sobra pouco amargor num gole curto e doce." },
          layers: [ { kind: "espresso", pct: 70 }, { kind: "crema", pct: 30 } ], fill: 35,
          steps: [
            "Prepare um espresso como sempre, com 17 g no cesto duplo.",
            "Com a xícara na balança, pare entre 17 e 25 g.",
            "Sem balança, pare quando tiver um pouco mais da metade do volume de um doppio."
          ],
          tip: "Tem café de torra mais escura em casa? Aqui ele se dá bem.",
          related: ["bebidas/espresso", "preparar/ratio"] },
        { id: "espresso", name: "Espresso", aka: "Café expresso",
          short: "A dose simples, no cesto simples",
          ratio: "1:2", espresso: "9 g → 18 g (cesto simples)", volume: "25–30 ml", cup: "xícara de espresso, 60–90 ml",
          band: { tone: "shot", num: "9 → 18 g", line: "É a bebida de base, e a balança é quem diz a hora de parar." },
          layers: [ { kind: "espresso", pct: 75 }, { kind: "crema", pct: 25 } ], fill: 45,
          steps: [
            "Encaixe o porta-filtro vazio e passe água por ele, caindo na xícara, pra aquecer os dois.",
            "Seque o cesto simples pressurizado e ponha 9 g de pó.",
            "Nivele e compacte de leve.",
            "Ponha a xícara na balança, em cima da bandeja, e zere.",
            "Aperte o botão de uma xícara.",
            "Perto de 18 g, aperte de novo pra parar."
          ],
          tip: "O cesto simples é mais chato de acertar. Saiu ralo? Passe pro duplo e faça um doppio.",
          related: ["comecar/dose-proporcao-tempo", "bebidas/doppio"] },
        { id: "doppio", name: "Doppio", aka: "Espresso duplo",
          short: "O ponto de partida mais fácil",
          ratio: "1:2", espresso: "17 g → 34 g (cesto duplo)", volume: "40–50 ml", cup: "xícara de espresso, 90 ml",
          band: { tone: "shot", num: "17 → 34 g", line: "Comece por este, o mais fácil na Bambino e a base das bebidas com leite." },
          layers: [ { kind: "espresso", pct: 75 }, { kind: "crema", pct: 25 } ], fill: 55,
          steps: [
            "Ponha 17 g no cesto duplo pressurizado, nivele e compacte de leve.",
            "Use o botão de duas xícaras e pare perto de 34 g. Pra servir duas pessoas, ponha duas xícaras sob o bico duplo."
          ],
          related: ["bebidas/espresso", "preparar/timer"] },
        { id: "lungo", name: "Lungo", aka: "Espresso longo",
          short: "Mais água pelo mesmo pó",
          ratio: "1:2,5 a 1:3", espresso: "17 g → 42–51 g", volume: "50–65 ml", cup: "xícara de 90–120 ml",
          band: { tone: "shot", num: "1:2,5 a 1:3", unit: "em peso", line: "A bebida sai mais leve, e o final da extração aparece mais." },
          layers: [ { kind: "espresso", pct: 82 }, { kind: "crema", pct: 18 } ], fill: 60,
          steps: [
            "Prepare como o doppio, com 17 g no cesto duplo.",
            "Deixe correr até a balança marcar entre 42 e 51 g."
          ],
          tip: "Amargou no fim? Pare antes da próxima vez. Toda essa água passa pelo pó, e os últimos gramas trazem amargor e boca seca.",
          related: ["bebidas/americano", "preparar/ratio"] },
        { id: "americano", name: "Americano",
          short: "Um doppio esticado com água quente",
          ratio: "1:3 a 1:4 (café:água)", espresso: "1 doppio (17 g → 34 g)", volume: "140–180 ml", cup: "xícara de 200–240 ml",
          band: { tone: "shot", num: "1:3 a 1:4", unit: "café pra água", line: "A água entra depois do café, sem passar pelo pó como no lungo." },
          layers: [ { kind: "americano", pct: 92 }, { kind: "crema", pct: 8 } ], fill: 75,
          steps: [
            "Ferva água numa chaleira e espere meio minuto.",
            "Tire um doppio na xícara.",
            "Complete com 100–140 ml de água a 85–90 °C. Mexa, prove e ajuste a seu gosto."
          ],
          tip: "A Bambino não tem saída de água quente, por isso a chaleira.",
          related: ["bebidas/long-black", "bebidas/lungo"] },
        { id: "long-black", name: "Long black",
          short: "Água primeiro, café por cima",
          ratio: "1:2 a 1:3 (café:água)", espresso: "1 doppio (17 g → 34 g)", volume: "120–150 ml", cup: "xícara de 150–180 ml",
          band: { tone: "shot", num: "1:2 a 1:3", unit: "café pra água", line: "Comum na Austrália e na Nova Zelândia, menor e mais intenso que o americano." },
          layers: [ { kind: "water", pct: 65 }, { kind: "espresso", pct: 25 }, { kind: "crema", pct: 10 } ], fill: 75,
          steps: [
            "Ponha 80–110 ml de água quente na xícara, a 85–90 °C.",
            "Tire o doppio direto sobre ela e cheire antes de mexer, com a crema ainda inteira."
          ],
          related: ["bebidas/americano"] }
      ]
    },
    {
      title: "Com leite",
      items: [
        { id: "macchiato", name: "Macchiato", aka: "Espresso macchiato",
          short: "Espresso com uma colher de espuma",
          ratio: "Espresso + 1–2 colheres de espuma", espresso: "1 espresso (9 g → 18 g) ou doppio", volume: "40–60 ml", cup: "xícara de espresso, 90 ml",
          band: { tone: "leite", num: "1–2", unit: "colheres de espuma", line: "Em italiano o nome quer dizer manchado, e a mancha é a espuma." },
          layers: [ { kind: "espresso", pct: 60 }, { kind: "crema", pct: 10 }, { kind: "foam", pct: 30 } ], fill: 60,
          steps: [
            "Tire o espresso na xícara.",
            "Vaporize um pouco de leite, deixando entrar bastante ar.",
            "Ponha uma ou duas colheres de espuma bem no meio."
          ],
          tip: "Pediu numa rede e veio um copo grande e doce? Muitas usam esse nome pra outra bebida.",
          related: ["preparar/leite", "bebidas/cortado"] },
        { id: "cortado", name: "Cortado",
          short: "Café e leite quase empatados",
          ratio: "1:1 a 1:2 (café:leite)", espresso: "1 doppio (17 g → 34 g)", volume: "90–120 ml", cup: "copo de vidro de 120–150 ml",
          band: { tone: "leite", num: "1:1 a 1:2", unit: "café pra leite", line: "Receita espanhola em que o leite corta a força do café sem esconder o gosto." },
          layers: [ { kind: "espresso", pct: 40 }, { kind: "milk", pct: 50 }, { kind: "foam", pct: 10 } ], fill: 85,
          steps: [
            "Tire o doppio no copo.",
            "Vaporize 60–80 ml de leite com pouquíssimo ar.",
            "Despeje devagar e deixe só uma camada fina de espuma."
          ],
          related: ["bebidas/flat-white", "preparar/leite"] },
        { id: "flat-white", name: "Flat white",
          short: "Café na frente, espuma bem fina",
          ratio: "1:3 a 1:4 (café:leite)", espresso: "1 doppio ou 2 ristrettos", volume: "150–180 ml", cup: "xícara de 150–180 ml",
          band: { tone: "leite", num: "1:3 a 1:4", unit: "café pra leite", line: "Menor e mais intenso que o latte, com menos de 1 cm de espuma." },
          layers: [ { kind: "espresso", pct: 25 }, { kind: "milk", pct: 65 }, { kind: "foam", pct: 10 } ], fill: 92,
          steps: [
            "Tire o doppio na xícara.",
            "Ponha 120 ml de leite gelado na jarra e limpe o bico com um sopro de vapor.",
            "Aere só um instante, até o leite crescer uns 10%.",
            "Afunde o bico, gire o leite até 55–65 °C e limpe o bico na hora.",
            "Despeje de bem perto, pra espuma fina se misturar com o café."
          ],
          related: ["bebidas/latte", "preparar/leite"] },
        { id: "cappuccino", name: "Cappuccino", short: "Espresso, leite e espuma generosa", ratio: "1:3 a 1:4 (café:leite)", espresso: "1 doppio (17 g → 34 g)", volume: "150–180 ml", cup: "xícara de 150–180 ml",
          band: { tone: "leite", num: "1:3 a 1:4", unit: "café pra leite", line: "Pede mais espuma que os outros, e é aí que mora o treino." },
          layers: [ { kind: "espresso", pct: 22 }, { kind: "milk", pct: 45 }, { kind: "foam", pct: 33 } ], fill: 95,
          steps: [
            "Aqueça a xícara com água quente, jogue fora e tire o doppio nela.",
            "Ponha 120 ml de leite gelado numa jarra com folga. Solte um pouco de vapor fora do leite pra limpar o bico.",
            "Deixe a ponta logo abaixo da superfície, chiando, até o leite crescer 30–40%.",
            "Afunde um pouco o bico e gire o leite até 55–65 °C. Limpe o bico na hora.",
            "Despeje firme no centro. A espuma sobe e deve ficar com 1–2 cm." ],
          tip: "Pode esquecer a regra dos “três terços”. Na xícara de verdade o espresso ocupa 20–25% e a espuma, perto de um terço.",
          related: ["bebidas/latte", "preparar/leite"] },
        { id: "latte", name: "Latte", aka: "Caffè latte",
          short: "Bastante leite, pouca espuma",
          ratio: "1:5 a 1:7 (café:leite)", espresso: "1 doppio (17 g → 34 g)", volume: "240–300 ml", cup: "xícara ou copo de 300 ml",
          band: { tone: "leite", num: "1:5 a 1:7", unit: "café pra leite", line: "É a bebida que mais perdoa um espresso ainda irregular." },
          layers: [ { kind: "espresso", pct: 15 }, { kind: "milk", pct: 75 }, { kind: "foam", pct: 10 } ], fill: 90,
          steps: [
            "Tire o doppio na xícara.",
            "Vaporize 180–240 ml de leite com pouco ar, até crescer uns 20%.",
            "Gire a jarra até o leite brilhar.",
            "Despeje de perto e termine com cerca de 1 cm de espuma."
          ],
          related: ["bebidas/cappuccino", "preparar/leite"] },
        { id: "mocha", name: "Mocha", aka: "Café mocha",
          short: "Um latte com chocolate no fundo",
          ratio: "1:4 a 1:6 (café:leite) + chocolate", espresso: "1 doppio (17 g → 34 g)", volume: "240–300 ml", cup: "xícara ou copo de 300 ml",
          band: { tone: "leite", num: "15–20 g", unit: "de chocolate", line: "Use chocolate em pó com 50% de cacau ou mais, ou então calda." },
          layers: [ { kind: "chocolate", pct: 10 }, { kind: "espresso", pct: 15 }, { kind: "milk", pct: 65 }, { kind: "foam", pct: 10 } ], fill: 90,
          steps: [
            "Ponha o chocolate na xícara.",
            "Tire o doppio por cima dele.",
            "Mexa até dissolver, ainda sem leite.",
            "Complete com 160–200 ml de leite vaporizado, de pouca espuma."
          ],
          tip: "Não inverta a ordem. O pó dissolve bem melhor no café quente que no leite.",
          related: ["bebidas/latte"] }
      ]
    },
    {
      title: "Brasileiros",
      items: [
        { id: "cafe-com-leite", name: "Café com leite",
          short: "Meio a meio, como na padaria",
          ratio: "Cerca de 1:1 (café:leite)", espresso: "1 doppio + 60 ml de água quente", volume: "180–220 ml", cup: "xícara média ou caneca de 200–250 ml",
          band: { tone: "brasil", num: "1:1", unit: "café pra leite", line: "Em casa o tradicional é meio coado, meio leite quente, e aqui o espresso faz o papel do coado." },
          layers: [ { kind: "americano", pct: 45 }, { kind: "milk", pct: 50 }, { kind: "foam", pct: 5 } ], fill: 85,
          steps: [
            "Tire o doppio e junte uns 60 ml de água quente, como num americano curto.",
            "Aqueça 90–110 ml de leite no vapor, quase sem espuma.",
            "Misture. Açúcar, só se quiser."
          ],
          related: ["bebidas/pingado", "bebidas/americano"] },
        { id: "pingado", name: "Pingado",
          short: "No copo americano, cada lugar de um jeito",
          ratio: "Varia por região", espresso: "1 doppio + água quente", volume: "150–190 ml", cup: "copo americano, 190 ml",
          band: { tone: "brasil", num: "190 ml", unit: "copo americano", line: "Em boa parte do país é café com um pingo de leite, mas o contrário também está certo." },
          layers: [ { kind: "americano", pct: 70 }, { kind: "milk", pct: 30 } ], fill: 85,
          steps: [
            "Tire o doppio no copo americano e complete com uns 70 ml de água quente.",
            "Pingue 30–40 ml de leite quente, um pingo generoso."
          ],
          tip: "Na padaria paulistana o costume é o inverso, leite quente quase até a boca e café por cima.",
          related: ["bebidas/cafe-com-leite"] }
      ]
    },
    {
      title: "Gelados e sobremesa",
      items: [
        { id: "affogato", name: "Affogato",
          short: "Sorvete com café quente por cima",
          ratio: "1 doppio para 1–2 bolas", espresso: "1 doppio (17 g → 34 g)", volume: "100–150 ml", cup: "taça ou copo baixo de 150–200 ml",
          band: { tone: "gelo", num: "1–2", unit: "bolas de sorvete", line: "O nome é afogado em italiano, e quem leva o banho de café é o sorvete." },
          layers: [ { kind: "espresso", pct: 100 }, { kind: "icecream", pct: 0, float: true } ], fill: 70,
          steps: [
            "Ponha uma ou duas bolas de sorvete num copo frio. Creme ou baunilha deixam o café aparecer.",
            "Tire o doppio numa xícara à parte e despeje só na hora de comer."
          ],
          related: ["bebidas/doppio"] },
        { id: "iced-latte", name: "Iced latte", aka: "Latte gelado",
          short: "Leite, gelo e o café por cima",
          ratio: "1:4 a 1:6 (café:leite)", espresso: "1 doppio (17 g → 34 g)", volume: "250–300 ml", cup: "copo alto de 350 ml",
          band: { tone: "gelo", num: "1:4 a 1:6", unit: "café pra leite", line: "Servido em copo alto, com o café descansando numa camada sobre o leite." },
          layers: [ { kind: "milk", pct: 82 }, { kind: "espresso", pct: 18 }, { kind: "ice", pct: 0, float: true } ], fill: 80,
          steps: [
            "Encha o copo de gelo.",
            "Complete com 150–200 ml de leite gelado.",
            "Tire o doppio numa xícara à parte.",
            "Despeje devagar por cima, pra formar as camadas."
          ],
          tip: "Tirar o café direto no gelo até funciona, só que derrete mais e a bebida fica aguada.",
          related: ["bebidas/latte"] }
      ]
    }
  ]
};

/* ============================== PREPARAR ============================== */

C.preparar = {
  ratio: {
    presets: [
      { id: "ristretto", name: "Ristretto", ratio: 1.5, note: "Gole curto e grosso, com pouco amargor. Vale de 1:1 a 1:1,5." },
      { id: "normal", name: "Normal", ratio: 2, note: "Comece aqui com quase qualquer café." },
      { id: "lungo", name: "Lungo", ratio: 3, note: "Entre 1:2,5 e 1:3 fica mais leve, e pode amargar no final." }
    ],
    defaultDose: 17,
    doseMin: 7,
    doseMax: 20,
    note: "No cesto simples vão 8–10 g, no duplo 16–18 g. Os botões da máquina medem volume, então acerte o peso com uma balança de 0,1 g.",
    mlNote: "Por causa da crema, isso ocupa de {min} a {max} ml na xícara."
  },

  timer: {
    targetMin: 25,
    targetMax: 30,
    tips: [
      "Dispare o cronômetro junto com o botão da máquina, sem esperar a primeira gota. A Bambino começa molhando o pó com pouca pressão.",
      "Quem manda parar é a balança. Chegou no peso, aperte o mesmo botão de novo, mesmo antes do volume programado.",
      "No cesto pressurizado o tempo diz pouco, porque a válvula segura o fluxo. Ficou gostoso em 20 ou em 35 s? Está bom.",
      "Com moedor e cesto de parede simples, a faixa de 25–30 s passa a valer e mostra se a moagem está certa."
    ]
  },

  leite: {
    id: "leite",
    title: "Vaporizar leite",
    subtitle: "No bico manual da Bambino",
    icon: "milk",
    band: { tone: "leite", num: "55–65 °C", line: "Nessa faixa o leite fica mais doce e a espuma se segura." },
    blocks: [
      { type: "p", lead: true, text: "Primeiro entra ar, depois o leite gira pra quebrar bolhas e esquentar por igual. O alvo é a microespuma, lisa e brilhante." },
      { type: "h", text: "Antes de abrir o vapor" },
      { type: "list", items: [
        "Leite gelado, que dá mais tempo pra criar textura.",
        "Jarra de inox cheia até a base do bico dela, mais ou menos um terço.",
        "Espresso já tirado. Depois do vapor a máquina fica quente demais por um tempo."
      ] },
      { type: "table", head: ["Bebida", "Leite frio", "Quanto cresce"],
        rows: [
          ["Flat white", "120 ml", "10%"],
          ["Latte", "180–240 ml", "20%"],
          ["Cappuccino", "120 ml", "30–40%"]
        ],
        caption: "A espuma do cappuccino ocupa mais, então use uma jarra com folga." },
      { type: "h", text: "No bico" },
      { type: "art", name: "wand" },
      { type: "steps", items: [
        { title: "Purgue", text: "Com o bico virado pra bandeja ou um pano, solte 1–2 s de vapor pra tirar a água." },
        { title: "Posicione", text: "Ponta 1 cm abaixo da superfície, fora do centro. Ligue o vapor." },
        { title: "Aere", text: "Abaixe a jarra devagar até chiar feito papel rasgando. O leite cresce." },
        { title: "Pare de aerar", text: "Jarra morna como a mão, perto de 37 °C? Afunde um pouco o bico e acabe com o chiado." },
        { title: "Gire", text: "Incline a jarra até formar um redemoinho, que desfaz as bolhas grandes." },
        { title: "Desligue", text: "Ficou difícil segurar, perto de 60 °C? Conte mais 2–3 s." },
        { title: "Sirva", text: "Bata a jarra na bancada, gire até brilhar e despeje logo." }
      ] },
      { type: "range", label: "Temperatura do leite", min: 20, max: 80, unit: "°C", low: 55, high: 65,
        markers: [ { value: 37, label: "Para de aerar" }, { value: 60, label: "Mão não aguenta" }, { value: 70, label: "Começa a cozinhar" } ] },
      { type: "p", text: "Passou de uns 70 °C, a doçura cai, vem gosto de cozido e a espuma murcha." },
      { type: "rule", text: "Limpe o bico na hora." },
      { type: "p", text: "Leite seca no metal quente e entope os furos. Pano úmido, vapor de novo, e mão só na parte isolada, porque o resto queima." },
      { type: "h", text: "Que leite usar" },
      { type: "table", head: ["Leite", "Como se comporta"],
        rows: [
          ["Integral", "O mais fácil, cremoso"],
          ["Desnatado", "Espuma alta e seca"],
          ["Sem lactose", "Quase igual, mais doce"],
          ["Aveia (barista)", "A vegetal que mais perdoa"],
          ["Soja", "Boa espuma, pode talhar"],
          ["Amêndoa ou coco", "Espuma fraca e rala"]
        ],
        caption: "Integral de caixinha (UHT) vai bem. Das “bebidas vegetais”, prefira a barista e pare em 55–60 °C." },
      { type: "p", text: "Isso vale pro bico manual. A Bambino Plus vaporiza sozinha, com botões de temperatura e textura, e o resto do app serve igual." }
    ],
    related: ["bebidas/cappuccino", "bebidas/latte", "bebidas/flat-white"]
  },

  diagnosticoSub: "O que mudar quando o café sai errado",

  diagnosticoBlocks: [
    { type: "p", lead: true, text: "Prove primeiro. Veja se puxa pro azedo ou pro amargo, e se está forte ou fraco. Ache o seu canto no desenho e vá na direção contrária." },
    { type: "compass", top: "Forte (concentrado)", bottom: "Fraco (aguado)", left: "Azedo (extraiu pouco)", right: "Amargo (extraiu demais)", center: "Equilibrado",
      quadrants: ["Falta extrair e falta café", "Passou do ponto e ficou ralo", "Concentrado, mas cru", "Forte e passado do ponto"] },
    { type: "p", text: "Com pó pronto você não mexe na moagem. Sobram dose, peso na xícara, aquecimento, frescor, torra e pedir outra moagem na torrefação." }
  ],

  diagnostico: [
    { id: "azedo", sintoma: "Azedo",
      sinais: ["Acidez que morde, tipo limão verde", "Um fundo salgado", "Some rápido da boca"],
      causas: ["A água tirou pouco do pó (extração de menos)", "Máquina, porta-filtro ou xícara frios", "Torra clara demais pro cesto pressurizado", "Pouco pó no cesto"],
      ajustes: [
        "Aqueça tudo. Passe água pelo grupo com o porta-filtro encaixado e também pela xícara.",
        "Deixe correr mais, subindo de 1:2 pra 1:2,5.",
        "Confira se tem 16–18 g no cesto duplo.",
        "Troque por torra média ou peça uma moagem mais fina na torrefação."
      ],
      related: ["entender/temperatura"] },
    { id: "amargo", sintoma: "Amargo",
      sinais: ["Amargor que gruda na língua", "Boca seca e áspera"],
      causas: ["Extração demais", "Torra muito escura", "Óleo velho no cesto ou no grupo"],
      ajustes: [
        "Pare antes, entre 1:1,5 e 1:1,8.",
        "Lave cesto, porta-filtro e ducha. Óleo rançoso amarga qualquer café.",
        "Largue o extraforte e pegue uma torra média.",
        "Se o pó estiver muito fino, peça um pouco mais grosso na próxima compra.",
        "Acabou de vaporizar leite? Espere um pouco antes do próximo espresso."
      ],
      related: ["comecar/limpeza"] },
    { id: "rapido", sintoma: "Rápido demais",
      sinais: ["Sai em jato, em menos de 15 s", "Fica clarinho logo no começo", "Bebida rala"],
      causas: ["Cesto de parede simples com café já moído", "Pouco pó no cesto", "Moagem de coado, grossa demais pro espresso"],
      ajustes: [
        "Vá pro cesto pressurizado, que segura o fluxo do pó pronto.",
        "Encha até perto da borda, com 17–18 g no duplo.",
        "Compre moído “para espresso” ou peça mais fino."
      ],
      related: ["comecar/sem-moedor"] },
    { id: "lento", sintoma: "Lento ou só pingando",
      sinais: ["Fica pingando e não anda", "Passa de 40 s sem chegar no peso"],
      causas: ["Furinho do cesto pressurizado entupido", "Pó fino demais pro cesto", "Pó demais ou socado com força"],
      ajustes: [
        "Desentupa o furo com um alfinete fino.",
        "Aperte bem de leve. No pressurizado, nivelar já resolve.",
        "Tire 1 g de pó.",
        "Na próxima compra, peça um pouco mais grosso, perto da moagem de cafeteira italiana."
      ],
      related: ["comecar/moagem"] },
    { id: "aguado", sintoma: "Aguado, sem corpo",
      sinais: ["Parece chá escuro", "Some quando entra o leite"],
      causas: ["Bebida demais pra dose", "Café velho, aberto há semanas"],
      ajustes: [
        "Pese e pare em 1:2 ou antes. O botão de duas xícaras pode passar do ponto.",
        "Use 17–18 g no cesto duplo.",
        "Compre pacote menor, que acaba antes de envelhecer."
      ],
      related: ["entender/frescor"] },
    { id: "sem-crema", sintoma: "Sem crema",
      sinais: ["Topo escuro e liso, com bolhas grandes que somem"],
      causas: ["Café velho, que já perdeu o gás", "Pó pronto num cesto de parede simples"],
      ajustes: [
        "Passe pro cesto pressurizado e olhe a data de torra do pacote.",
        "Prove antes de se preocupar. Se o gosto está bom, pode beber sossegado."
      ],
      related: ["comecar/crema"] }
  ]
};

/* ============================== ENTENDER ============================== */

var conceitos = [
  {
    id: "torra",
    title: "O que é a torra",
    icon: "flame",
    band: { tone: "torra", num: "9–14", unit: "minutos", line: "É quanto costuma durar a torra de um café especial." },
    blocks: [
      { type: "p", lead: true, text: "Antes de torrar, o café é uma semente dura, com cheiro de grama e 10–12% de umidade, que não rende bebida boa. Quase todo o gosto que você conhece nasce no torrador." },
      { type: "roastbar" },
      { type: "timeline", items: [
        { label: "Secagem", text: "Até uns 150 °C a água vai embora. O grão passa de verde a amarelo e cheira a pão." },
        { label: "Maillard", text: "Açúcares e aminoácidos reagem, criam centenas de aromas e douram o grão, como a casca do pão." },
        { label: "Caramelização", text: "Acima de uns 170 °C os açúcares caramelizam. Vem doçura de caramelo e sobra menos açúcar livre." },
        { label: "Primeiro crack", text: "Entre 195 e 205 °C o vapor e o gás estalam a semente, como pipoca. A torra clara para logo depois." },
        { label: "Segundo crack", text: "Entre 220 e 230 °C a estrutura quebra de novo e o óleo sobe. É território de torra escura." }
      ] },
      { type: "p", text: "Essas temperaturas são do grão e variam de um torrador pra outro." },
      { type: "h", text: "Do claro ao escuro" },
      { type: "table", head: ["", "Torra clara", "Torra escura"],
        rows: [
          ["Acidez", "Alta", "Baixa"],
          ["Amargor", "Baixo", "Alto"],
          ["Notas da origem", "Aparecem", "Somem"],
          ["Corpo", "Leve", "Encorpado"]
        ] },
      { type: "p", text: "A doçura sobe até a torra média e depois cai, porque os açúcares viram amargor e carbono. O corpo ainda cresce até a média-escura." },
      { type: "p", text: "O grão perde 12–20% do peso, quase tudo água, o resto gás e fumaça. Incha, perde densidade, escurece até quase o preto e guarda CO₂, que escapa nas semanas seguintes." }
    ],
    related: ["entender/niveis-torra", "entender/frescor"]
  },
  {
    id: "niveis-torra",
    title: "Níveis de torra no espresso",
    subtitle: "Qual comprar pra sua Bambino",
    icon: "flame",
    band: { tone: "torra", num: "1:2", unit: "na média", line: "Comece pela torra média, a que menos briga com a sua máquina." },
    blocks: [
      { type: "p", lead: true, text: "Quanto mais escura a torra, mais porosa a semente e mais fácil a água dissolver o café. Por isso cada nível pede um espresso um pouco diferente." },
      { type: "roast", levels: [
        { id: "clara", name: "Clara", color: "#A8713F",
          summary: "Ácida, com fruta e flor, de corpo leve. Pede máquina e xícara bem quentes. No cesto pressurizado, melhor não começar por ela.",
          items: [
            { label: "Solubilidade", value: "baixa" },
            { label: "Proporção", value: "1:2,2 a 1:2,5" },
            { label: "Com leite", value: "ácida e some" }
          ] },
        { id: "media", name: "Média", color: "#7A4A27",
          summary: "Doce, lembrando caramelo e fruta madura.",
          items: [
            { label: "Solubilidade", value: "média" },
            { label: "Proporção", value: "1:2" },
            { label: "Com leite", value: "boa, equilibrada" }
          ] },
        { id: "media-escura", name: "Média-escura", color: "#52301A",
          summary: "Puxa pra chocolate e nozes, com bastante corpo. É a que atravessa o leite.",
          items: [
            { label: "Solubilidade", value: "alta" },
            { label: "Proporção", value: "1:1,8 a 1:2" },
            { label: "Com leite", value: "a melhor" }
          ] },
        { id: "escura", name: "Escura", color: "#2C1A10",
          summary: "Gosto de torrado e fumaça, grão oleoso e muito amargor. Fique no lado curto, até 1:1,8, porque o pior sai no fim.",
          items: [
            { label: "Solubilidade", value: "muito alta" },
            { label: "Proporção", value: "1:1,5 a 1:2" },
            { label: "Com leite", value: "cobre as notas" }
          ] }
      ] },
      { type: "p", text: "A Bambino não deixa escolher a temperatura. O que sobra pra você é proporção, dose e aquecimento." },
      { type: "p", text: "Na dúvida, compre média ou média-escura. As duas se dão bem com o cesto pressurizado, e a média-escura é a aposta mais segura pra beber com leite." }
    ],
    related: ["entender/temperatura", "preparar/ratio"]
  },
  { id: "agua", title: "Água", subtitle: "Qual comprar e como ler o rótulo", icon: "drop",
        band: { tone: "agua", num: "50–150", unit: "mg/L", line: "É a faixa de resíduo que você procura no rótulo da água mineral." },
        blocks: [
          { type: "p", lead: true, text: "Um espresso é cerca de 90% água, então vale gastar dois minutos aqui. Compre uma mineral leve ou filtre a da torneira. O básico é isso." },
          { type: "art", name: "waterLabel", caption: "Rótulo de exemplo. Vire a garrafa e ache o resíduo de evaporação: ele mostra quanto mineral tem no total." },
          { type: "leader", items: [
            { label: "Resíduo a 180 °C", value: "50 a 150 mg/L" },
            { label: "Bicarbonato", value: "até 100 mg/L" },
            { label: "pH", value: "6,5 a 7,5" },
            { label: "Cloro", value: "zero" } ] },
          { type: "p", text: "Se for olhar uma segunda linha, olhe o bicarbonato. Passando de uns 100 mg/L ele engole a acidez e o café fica chocho." },
          { type: "p", text: "Cálcio e magnésio são a dureza da água: um pouco ajuda a tirar sabor do pó, muito vira calcário dentro da máquina. Duas águas com o mesmo resíduo podem ter bastante cálcio ou bastante sódio, por isso a tabela inteira conta." },
          { type: "h", text: "Mineral ou filtrada?" },
          { type: "p", text: "Mineral de resíduo baixo é o caminho mais fácil. Muitas marcas ficam entre 20 e 150 mg/L, então confira o número antes de pegar a primeira da prateleira." },
          { type: "p", text: "A da torneira também serve se passar por carvão ativado, num filtro de barro com vela de carvão ou num purificador. Isso tira o cloro, aquele gosto de piscina. Já a dureza muda de cidade pra cidade, e o carvão não resolve." },
          { type: "rule", text: "Água destilada ou de osmose, nem pensar." },
          { type: "p", text: "O fabricante desaconselha na máquina e o café sai sem graça. Abaixo de uns 30 mg/L de resíduo acontece coisa parecida: o espresso tende a ficar azedo e vazio. Se a sua mineral preferida for leve assim, misture com outra mais forte em minerais." },
          { type: "more", title: "Os números da indústria, pra quem gosta", blocks: [
            { type: "leader", items: [
              { label: "TDS", value: "75–250 mg/L, alvo 150" },
              { label: "Dureza", value: "17–85 mg/L, alvo 68" },
              { label: "Alcalinidade", value: "perto de 40 mg/L" },
              { label: "Cloro", value: "zero" } ] },
            { type: "p", text: "TDS é o total de sólidos dissolvidos, e a dureza aqui é a de cálcio, medida em CaCO₃. Essa é a referência do café especial, e pra poupar a máquina vale ficar na metade mais macia." } ] }
        ],
        related: ["comecar/limpeza", "entender/temperatura"] },
  {
    id: "temperatura",
    title: "Temperatura da água",
    subtitle: "A Bambino não tem esse ajuste",
    icon: "thermometer",
    band: { tone: "temperatura", num: "86–96", unit: "°C", line: "É a faixa de referência do espresso, da torra mais escura à mais clara." },
    blocks: [
      { type: "p", lead: true, text: "Água mais quente tira sabor mais depressa, o bom e o amargo juntos." },
      { type: "range", label: "Água do espresso", min: 80, max: 100, unit: "°C", low: 86, high: 96 },
      { type: "leader", items: [
        { label: "Torra clara", value: "93–96 °C" },
        { label: "Média", value: "90–93 °C" },
        { label: "Média-escura", value: "88–91 °C" },
        { label: "Escura", value: "86–90 °C" }
      ] },
      { type: "p", text: "Como faixa geral, o café especial usa 90–96 °C. A torra clara é densa e solta pouco, então pede calor pra entregar doçura. A escura é porosa e amarga fácil, e calor demais piora isso." },
      { type: "h", text: "Na sua máquina" },
      { type: "p", text: "A água esquenta na hora num bloco térmico, e um controle PID segura a temperatura. Não existe ajuste no painel. O que dá pra fazer é não deixar peça fria roubar calor." },
      { type: "steps", items: [
        { title: "Aqueça o porta-filtro", text: "Frio, ele rouba vários graus. Deixe encaixado enquanto a máquina liga e passe água por ele." },
        { title: "Aqueça a xícara", text: "Encha com água quente da chaleira ou da máquina e jogue fora." },
        { title: "Purgue o grupo", text: "Logo antes de pôr o pó, solte 2–3 s de água pra estabilizar a temperatura." }
      ] }
    ],
    related: ["entender/niveis-torra", "entender/agua"]
  },
  {
    id: "processos",
    title: "Processos pós-colheita",
    subtitle: "Os nomes que aparecem no pacote",
    icon: "leaf",
    band: { tone: "processos", line: "Quanto da fruta seca junto com a semente muda o gosto na sua xícara." },
    blocks: [
      { type: "cherry", caption: "Quase sempre são duas sementes por fruta." },
      { type: "p", lead: true, text: "Café é caroço de fruta. O produtor decide quanto de casca, polpa e mucilagem (a camada grudenta e doce) sai antes de secar." },
      { type: "h", text: "Natural" },
      { type: "p", text: "A cereja inteira seca ao sol, em terreiro ou mesa suspensa, por 2 a 4 semanas. É o clássico brasileiro, frutado e encorpado, ótimo com leite." },
      { type: "h", text: "Lavado" },
      { type: "p", text: "Sem casca nem polpa, a mucilagem fermenta em tanque por 12–48 h e é lavada. Seca no pergaminho até perto de 11% de umidade. Limpo, de acidez viva, melhor puro." },
      { type: "h", text: "Cereja descascado (CD) e honey" },
      { type: "p", text: "Sai só a casca e a mucilagem seca grudada. Na América Central chamam de honey, classificado por quanta mucilagem ficou. Doce, de corpo médio, bom com leite." },
      { type: "h", text: "Desmucilado" },
      { type: "p", text: "Uma máquina arranca casca e mucilagem no atrito, sem tanque. Também chamado de semi-lavado. Limpo, com um pouco mais de corpo." },
      { type: "h", text: "Wet-hulled" },
      { type: "p", text: "Em Sumatra, giling basah. O pergaminho sai com o grão ainda bem úmido e a secagem termina sem essa proteção. Terroso e pesado." },
      { type: "h", text: "Anaeróbico" },
      { type: "p", text: "Cerejas ou mucilagem fermentam sem oxigênio, em tanque fechado e por tempo controlado, às vezes com leveduras escolhidas. Lembra vinho e fruta, de encantar ou cansar." },
      { type: "p", text: "São tendências. Variedade, região e torra também pesam." },
      { type: "more", title: "A pegadinha do “semi-washed”", blocks: [
        { type: "p", text: "Em inglês, o termo às vezes quer dizer o wet-hulled da Indonésia. O semi-lavado brasileiro é o desmucilado, um processo diferente." }
      ] }
    ],
    related: ["entender/regioes-brasil", "entender/sabor"]
  },
  {
    id: "regioes",
    title: "Regiões do mundo",
    icon: "globe",
    band: { tone: "regioes", num: "25° N–S", line: "O café cresce num cinturão em volta do equador, mais ou menos entre essas latitudes." },
    blocks: [
      { type: "p", lead: true, text: "Altitude, clima, variedade e processo dão um sotaque a cada lugar." },
      { type: "worldmap", regions: [
        { id: "brasil", name: "Brasil", x: 37.5, y: 60.6, link: "entender/regioes-brasil" },
        { id: "colombia", name: "Colômbia", x: 29.2, y: 47.5 },
        { id: "america-central", name: "América Central", x: 25.6, y: 42.8 },
        { id: "peru", name: "Peru", x: 28.9, y: 55.0 },
        { id: "etiopia", name: "Etiópia", x: 60.7, y: 45.6 },
        { id: "quenia", name: "Quênia", x: 60.3, y: 50.3 },
        { id: "ruanda-burundi", name: "Ruanda e Burundi", x: 58.3, y: 51.4 },
        { id: "iemen", name: "Iêmen", x: 62.2, y: 41.7 },
        { id: "sumatra", name: "Sumatra", x: 77.5, y: 48.9 }
      ] },
      { type: "h", id: "america-do-sul", text: "América do Sul" },
      { type: "origin", id: "colombia", name: "Colômbia", country: "Colômbia", altitude: "1.200–2.000 m", process: "Lavado",
        notes: ["Caramelo", "Frutas vermelhas", "Cítrico"],
        espresso: "Vai bem puro ou com leite, com doçura e acidez na mesma medida." },
      { type: "origin", id: "peru", name: "Peru", country: "Peru", altitude: "1.200–2.000 m", process: "Lavado",
        notes: ["Chocolate", "Nozes"],
        espresso: "Fácil de gostar, macio e de acidez baixinha." },
      { type: "h", id: "america-central", text: "América Central" },
      { type: "origin", id: "guatemala", name: "Guatemala", country: "Guatemala", altitude: "1.300–2.000 m", process: "Lavado",
        notes: ["Chocolate", "Especiarias", "Maçã"],
        espresso: "Encorpado e achocolatado. A acidez vem limpa." },
      { type: "origin", id: "costa-rica", name: "Costa Rica", country: "Costa Rica", altitude: "1.200–1.900 m", process: "Lavado e honey",
        notes: ["Mel", "Cítrico"],
        espresso: "Brilhante e doce, e os honey têm mais corpo." },
      { type: "origin", id: "honduras", name: "Honduras", country: "Honduras", altitude: "1.000–1.700 m", process: "Lavado",
        notes: ["Caramelo", "Frutas de caroço"],
        espresso: "Um café pra todo dia, suave e adocicado." },
      { type: "h", id: "africa", text: "África e Arábia" },
      { type: "p", text: "Guarde os africanos lavados pra quando tiver moedor. Aí a acidez e o perfume deles aparecem de verdade." },
      { type: "origin", id: "etiopia", name: "Etiópia", country: "Etiópia", altitude: "1.500–2.200 m", process: "Lavado e natural",
        notes: ["Lavado: jasmim, bergamota", "Natural: mirtilo, morango"],
        espresso: "Muito perfumado e ácido. Peça torra média e puxe a proporção um pouco mais longa." },
      { type: "origin", id: "quenia", name: "Quênia", country: "Quênia", altitude: "1.400–2.000 m", process: "Lavado",
        notes: ["Cassis", "Toranja", "Acidez suculenta"],
        espresso: "Explode de acidez. No cesto pressurizado é difícil." },
      { type: "origin", id: "ruanda-burundi", name: "Ruanda e Burundi", country: "Ruanda e Burundi", altitude: "1.500–2.000 m", process: "Lavado",
        notes: ["Frutas vermelhas", "Chá preto"],
        espresso: "Delicado. Beba puro." },
      { type: "origin", id: "iemen", name: "Iêmen", country: "Iêmen", altitude: "1.500–2.500 m", process: "Natural, seco em terraços",
        notes: ["Frutas secas", "Vinho", "Especiarias", "Chocolate"],
        espresso: "Raro e cheio de camadas, caro demais pra virar rotina." },
      { type: "h", id: "asia", text: "Ásia" },
      { type: "origin", id: "sumatra", name: "Sumatra", country: "Indonésia", altitude: "1.100–1.500 m", process: "Wet-hulled (giling basah)",
        notes: ["Terroso", "Ervas", "Cedro"],
        espresso: "Pesado e pouco ácido, por isso entra em blends pra dar corpo." }
    ],
    related: ["entender/regioes-brasil", "entender/processos"]
  },
  {
    id: "regioes-brasil",
    title: "Regiões do Brasil",
    subtitle: "Do Cerrado a Rondônia",
    icon: "map",
    band: { tone: "regioes", num: "1/3", unit: "do café do mundo", line: "O Brasil é o maior produtor, e planta mais ou menos essa fatia." },
    blocks: [
      { type: "p", lead: true, text: "O arábica fica nas áreas altas e o conilon nas baixas e quentes. Pro cesto pressurizado, vá de natural ou cereja descascado em torra média, que sai doce e pouco ácido, com corpo." },
      { type: "worldmap", focus: "brasil", regions: [
        { id: "cerrado-mineiro", name: "Cerrado Mineiro", x: 37.0, y: 60.5 },
        { id: "sul-de-minas", name: "Sul de Minas", x: 37.4, y: 62.1 },
        { id: "mogiana", name: "Mogiana", x: 36.9, y: 61.7 },
        { id: "chapada-diamantina", name: "Chapada Diamantina", x: 38.5, y: 57.2 },
        { id: "espirito-santo", name: "Espírito Santo", x: 38.7, y: 60.8 },
        { id: "rondonia", name: "Rondônia", x: 32.6, y: 56.1 }
      ] },
      { type: "origin", id: "cerrado-mineiro", name: "Cerrado Mineiro", country: "Brasil (MG)", altitude: "800–1.300 m", process: "Natural e cereja descascado",
        notes: ["Chocolate", "Caramelo", "Nozes"],
        espresso: "Encorpado e doce, fácil de acertar. Ótimo com leite." },
      { type: "origin", id: "sul-de-minas", name: "Sul de Minas e Mantiqueira", country: "Brasil (MG)", altitude: "900–1.400 m", process: "Natural e cereja descascado",
        notes: ["Chocolate ao leite", "Frutas amarelas"],
        espresso: "Equilibrado, com um pouco mais de acidez que o Cerrado." },
      { type: "origin", id: "mogiana", name: "Mogiana", country: "Brasil (SP e MG)", altitude: "900–1.200 m", process: "Natural",
        notes: ["Chocolate", "Rapadura", "Corpo alto"],
        espresso: "Doce e redondo, presença clássica em blend de espresso." },
      { type: "origin", id: "chapada-diamantina", name: "Chapada Diamantina", country: "Brasil (BA)", altitude: "1.000–1.400 m", process: "Natural, CD e fermentados",
        notes: ["Frutas vermelhas", "Floral", "Mel", "Complexo"],
        espresso: "Mais vivo e frutado. Prefira puro." },
      { type: "origin", id: "espirito-santo", name: "Espírito Santo", country: "Brasil (ES)", altitude: "Conilon até ~500 m; arábica 700–1.300 m", process: "Conilon natural; arábica natural, CD e lavado",
        notes: ["Conilon: cacau, castanha", "Arábica de montanha: frutas, floral"],
        espresso: "O conilon dá crema e corpo em blends. Os arábicas das montanhas e do Caparaó ganham concursos." },
      { type: "h", id: "rondonia", text: "Rondônia" },
      { type: "p", text: "Os Robustas Amazônicos de lá têm indicação geográfica própria e mostram que canéfora bem processada pode ser especial." },
      { type: "h", text: "Arábica e conilon" },
      { type: "p", text: "Quase todo café é Coffea arabica ou Coffea canephora, que inclui o robusta e o conilon, nome mais usado aqui." },
      { type: "table", head: ["", "Arábica", "Robusta/conilon"],
        rows: [
          ["Cafeína", "~1,2–1,5%", "~2,2–2,7%"],
          ["Altitude", "Média a alta", "Baixa"],
          ["Sabor", "Ácido, aromático", "Corpo, cacau, amargor"],
          ["Crema", "Média", "Farta"]
        ],
        caption: "Valores típicos, que mudam com a variedade e o cultivo." },
      { type: "p", text: "A má fama veio do conilon ruim. Bem cultivado e processado, ele dá espresso denso e achocolatado." }
    ],
    related: ["entender/regioes", "entender/processos"]
  },
  {
    id: "frescor",
    title: "Frescor e descanso",
    subtitle: "Onde guardar o pacote aberto",
    icon: "clock",
    band: { tone: "frescor", num: "1–2", unit: "semanas", line: "É o prazo pra usar um pacote de pó depois de aberto." },
    blocks: [
      { type: "p", lead: true, text: "Pó fresco rende mais que ajuste fino. Moído, o café expõe muito mais superfície ao ar e perde aroma em dias." },
      { type: "leader", items: [
        { label: "Pote", value: "vedado e opaco" },
        { label: "Lugar", value: "armário fresco" },
        { label: "Longe de", value: "fogão e sol" }
      ] },
      { type: "p", text: "Se o pó ficar no próprio pacote, tire o ar antes de fechar. Calor e umidade envelhecem o café, então em cidade quente compre ainda menos." },
      { type: "rule", text: "Geladeira é o pior lugar." },
      { type: "p", text: "Ela traz umidade, condensação e cheiro de comida. Estoque longo vai no freezer, em porções vedadas. Tire uma e só abra depois que chegar à temperatura ambiente." },
      { type: "h", text: "Se comprar em grão" },
      { type: "p", text: "O grão torrado solta CO₂ por dias. Cedo demais o gás atrapalha, tarde demais falta aroma." },
      { type: "timeline", items: [
        { label: "Dias 0–3", text: "Gás demais. Sai irregular, com bolhas grandes e gosto áspero." },
        { label: "Dias 4–7", text: "As torras escuras já ficam boas." },
        { label: "Dias 7–21", text: "A melhor janela pra maioria das médias e claras." },
        { label: "Semanas 4–6", text: "Em pacote fechado com válvula ainda vai, com menos crema." },
        { label: "Depois", text: "Pouco aroma e gosto de papelão. Mande pro coado ou pro leite." }
      ] },
      { type: "p", text: "Torra clara pede mais descanso, às vezes 2–3 semanas, e escura menos. A válvula solta o gás sem deixar ar entrar." }
    ],
    related: ["comecar/sem-moedor", "comecar/crema"]
  }
];

var pratica = [
  {
    id: "sabor",
    title: "Sabor e notas",
    icon: "nose",
    band: { tone: "sabor", line: "Cheire, deixe amornar e repare no gosto que sobra depois do gole." },
    blocks: [
      { type: "p", lead: true, text: "A língua pega doce, amargo e companhia. O cheiro que sobe por dentro da boca é o que vira “nota”." },
      { type: "steps", items: [
        { title: "Cheire", text: "Nariz na xícara antes do primeiro gole." },
        { title: "Espere", text: "Pelando não se sente nada. Minutos depois aparecem doçura e acidez." },
        { title: "Puxe com ar", text: "Sorva puxando um pouco de ar, que espalha o café e leva o aroma ao nariz." },
        { title: "Engula e repare", text: "Sobrou doce, limpo, amargo ou seco?" },
        { title: "Compare", text: "Dois cafés lado a lado ensinam mais que dez provados em dias diferentes." }
      ] },
      { type: "h", text: "O que procurar" },
      { type: "table", head: ["Eixo", "Na boca"],
        rows: [
          ["Acidez", "Vivacidade de fruta"],
          ["Doçura", "Açúcar, caramelo, fruta madura"],
          ["Amargor", "Um pouco é normal, como em chocolate amargo"],
          ["Corpo", "Peso e textura, de chá a xarope"]
        ] },
      { type: "p", text: "Acidez boa lembra fruta e vem com doçura. Azedo é áspero, ralo, de fundo salgado, quase sempre extração de menos. No espresso, acidez e amargor parecem maiores, e provando você decide onde parar na próxima." },
      { type: "h", text: "Dois cafés bem diferentes" },
      { type: "table", head: ["", "Cerrado natural", "Quênia lavado"],
        rows: [
          ["Acidez", "Baixa", "Alta"],
          ["Doçura", "Alta", "Média"],
          ["Amargor", "Médio", "Baixo"],
          ["Corpo", "Denso", "Leve"]
        ],
        caption: "Cerrado em torra média, Quênia em torra clara." },
      { type: "h", text: "Famílias de notas" },
      { type: "table", head: ["Família", "Exemplos"],
        rows: [
          ["Frutado", "Cítrico, frutas vermelhas"],
          ["Floral", "Jasmim, laranjeira"],
          ["Doce", "Caramelo, mel, rapadura"],
          ["Chocolate e nozes", "Cacau, avelã, amendoim"],
          ["Especiarias", "Canela, cravo"],
          ["Torrado", "Pão, cereal, fumaça"]
        ],
        caption: "Nota é só semelhança, ninguém pôs fruta ali." }
    ],
    related: ["preparar/diagnostico", "entender/processos"]
  },
  {
    id: "mitos",
    title: "Mitos comuns",
    icon: "quiz",
    band: { tone: "ink", num: "12", unit: "mitos", line: "Os três primeiros são os que mais atrapalham na sua cozinha." },
    blocks: [
      { type: "p", lead: true, text: "Boa parte deles manda julgar o café pela cara ou pela força. Julgue pelo gosto." },
      { type: "claim", big: true, myth: "Crema grossa é sinal de café bom.",
        truth: "Mostra gás. Cesto pressurizado, robusta e torra escura dão espuma sem melhorar o gosto." },
      { type: "claim", big: true, myth: "Geladeira conserva o café.",
        truth: "Passa umidade e cheiro de comida pro pó. Use o armário." },
      { type: "claim", big: true, myth: "Torra escura tem mais cafeína.",
        truth: "Por peso, praticamente igual. Em colher, a escura tem um pouco menos, porque o grão fica mais leve. Espécie e dose pesam bem mais." },
      { type: "claim", myth: "Café bom se faz com água fervendo.",
        truth: "A 100 °C o amargor exagera. O espresso usa 86–96 °C." },
      { type: "claim", myth: "Café brasileiro é sempre forte e amargo.",
        truth: "O amargor vem de torra muito escura e grão comum. Há brasileiro doce, de fruta e de flor." },
      { type: "claim", myth: "Freezer estraga o café.",
        truth: "Vedado e em porções, conserva bem. O erro é abrir gelado." },
      { type: "claim", myth: "Espresso tem mais cafeína que café coado.",
        truth: "Por mililitro, sim. Por xícara, nem sempre. Um espresso simples tem 60–100 mg, e uma caneca de coado pode passar de 100." },
      { type: "claim", myth: "Existe grão de espresso.",
        truth: "Existe um jeito de preparar. “Para espresso” só descreve torra e moagem." },
      { type: "claim", myth: "Arábica é sempre melhor que robusta.",
        truth: "Há arábica ruim e conilon ótimo. Cultivo, colheita e processo decidem." },
      { type: "claim", myth: "Máquina de 15 bar tira espresso melhor que de 9.",
        truth: "15 é o teto da bomba. No café, o clássico fica perto de 9 bar." },
      { type: "claim", myth: "Descafeinado não tem cafeína.",
        truth: "Tira 97% ou mais, mas sobram alguns miligramas por xícara." },
      { type: "claim", myth: "Compactar com toda a força melhora o espresso.",
        truth: "Fazer sempre igual vale mais. No pressurizado, nivelar e apertar de leve basta." }
    ],
    related: ["comecar/crema", "entender/frescor"]
  },
  {
    id: "glossario",
    title: "Glossário",
    icon: "book",
    band: { tone: "ink", num: "A–W", line: "Pra decifrar rótulo e conversar na torrefação sem chutar." },
    blocks: [
      { type: "p", lead: true, text: "Peça “torra média, natural, moído pra cesto pressurizado” e você já disse quase tudo." },
      { type: "glossary", items: [
        { id: "acidez", termo: "Acidez", def: "Vivacidade que lembra fruta. Azedo é outra coisa, falta de extração." },
        { id: "adstringencia", termo: "Adstringência", def: "Aquela boca seca de chá forte ou banana verde. Vem de extração longa." },
        { id: "aeracao", termo: "Aeração", def: "Pôr ar no leite com o vapor, pra fazer espuma." },
        { id: "arabica", termo: "Arábica", def: "Coffea arabica, a mais plantada. Aromática, ácida, com menos cafeína." },
        { id: "bandeja", termo: "Bandeja", def: "Grade com reservatório sob o grupo, pros respingos." },
        { id: "bar", termo: "Bar", def: "Unidade de pressão. 1 bar é a do ar ao nível do mar; o espresso usa perto de 9." },
        { id: "blend", termo: "Blend", def: "Mistura de origens montada pra um sabor." },
        { id: "borra", termo: "Borra", def: "O pó usado que sobra no cesto, em pastilha." },
        { id: "cafe-especial", termo: "Café especial", def: "Pelo menos 80 pontos em 100 na prova, sem defeito grave." },
        { id: "canalizacao", termo: "Canalização", def: "Água cortando caminho no pó. Parte extrai demais, parte de menos." },
        { id: "cereja", termo: "Cereja", def: "O fruto do cafeeiro, em geral com dois grãos." },
        { id: "cereja-descascado", termo: "Cereja descascado", def: "Sai a casca e o grão seca com a mucilagem. Parente do honey." },
        { id: "cesto", termo: "Cesto", def: "Peça furada que segura o pó no porta-filtro. Na Bambino, 54 mm." },
        { id: "cesto-pressurizado", termo: "Cesto pressurizado", def: "Parede dupla e um só furo de saída, que cria a pressão." },
        { id: "compactador", termo: "Compactador", def: "Ou tamper. Aperta o pó por igual." },
        { id: "conilon", termo: "Conilon", def: "Variedade de canéfora muito plantada no Brasil, sobretudo no Espírito Santo e em Rondônia." },
        { id: "corpo", termo: "Corpo", def: "Peso e textura na boca." },
        { id: "crema", termo: "Crema", def: "Espuma dourada de CO₂, óleos e melanoidinas." },
        { id: "descalcificacao", termo: "Descalcificação", def: "Limpeza com ácido que tira o calcário de dentro da máquina." },
        { id: "desmucilado", termo: "Desmucilado", def: "Mucilagem tirada por máquina, sem tanque. Ou semi-lavado." },
        { id: "docura", termo: "Doçura", def: "O adocicado de um café bem extraído, mesmo puro." },
        { id: "doppio", termo: "Doppio", def: "Espresso duplo, com o dobro de pó e de bebida." },
        { id: "dose", termo: "Dose", def: "Peso do pó no cesto." },
        { id: "ducha", termo: "Ducha", def: "Tela do grupo que espalha a água." },
        { id: "espresso", termo: "Espresso", def: "Água quente a uns 9 bar atravessando café moído fino." },
        { id: "expresso", termo: "Expresso", def: "Grafia comum no Brasil. Aqui é “espresso”, a italiana, usada no café especial." },
        { id: "extracao", termo: "Extração", def: "Quanto a água dissolveu do café. Pouco azeda, muito amarga." },
        { id: "finalizacao", termo: "Finalização", def: "O gosto que fica depois de engolir, ou retrogosto." },
        { id: "grupo", termo: "Grupo", def: "Onde o porta-filtro encaixa e sai a água." },
        { id: "honey", termo: "Honey", def: "Nome centro-americano pra secar com mucilagem. Pode ser white, yellow, red ou black, conforme quanto dela fica." },
        { id: "jarra", termo: "Jarra", def: "Ou pitcher. De inox com bico, pra vaporizar e despejar." },
        { id: "latte-art", termo: "Latte art", def: "Desenho feito ao despejar microespuma no espresso." },
        { id: "lavado", termo: "Lavado", def: "Mucilagem fermentada e lavada antes de secar. Limpo e ácido." },
        { id: "lungo", termo: "Lungo", def: "Espresso longo, de 1:2,5 a 1:3." },
        { id: "microespuma", termo: "Microespuma", def: "Leite liso e brilhante, de bolhas invisíveis." },
        { id: "moedor-de-mos", termo: "Moedor de mós", def: "Esmaga o grão por igual entre duas peças ajustáveis." },
        { id: "mucilagem", termo: "Mucilagem", def: "Camada grudenta e doce entre a polpa e o pergaminho." },
        { id: "natural", termo: "Natural", def: "A cereja seca inteira. Mais corpo e fruta." },
        { id: "pergaminho", termo: "Pergaminho", def: "Casquinha dura em volta do grão." },
        { id: "pid", termo: "PID", def: "Controle eletrônico que segura a temperatura, corrigindo o aquecimento o tempo todo." },
        { id: "porta-filtro", termo: "Porta-filtro", def: "A peça com cabo que leva o cesto ao grupo." },
        { id: "pre-infusao", termo: "Pré-infusão", def: "Molhar o pó com pouca pressão antes, pra assentar por igual." },
        { id: "primeiro-crack", termo: "Primeiro crack", def: "Estalo na torra, a 195–205 °C, onde começam as torras claras." },
        { id: "proporcao", termo: "Proporção", def: "Bebida dividida pelo pó, em peso. 1:2 é o dobro." },
        { id: "purga", termo: "Purga", def: "Uns segundos de água ou vapor pra limpar e estabilizar." },
        { id: "rendimento", termo: "Rendimento", def: "Peso da bebida na xícara." },
        { id: "ristretto", termo: "Ristretto", def: "Espresso curto, de 1:1 a 1:1,5." },
        { id: "robusta", termo: "Robusta", def: "Variedade de canéfora, com mais cafeína e corpo que o arábica e menos acidez." },
        { id: "shot", termo: "Shot", def: "Um espresso tirado, no jargão de cafeteria." },
        { id: "tds", termo: "TDS", def: "Sólidos dissolvidos totais. Minerais na água, concentração na bebida." },
        { id: "torra", termo: "Torra", def: "Aquecer o grão verde, criando cor, cheiro e gosto." },
        { id: "torrefacao", termo: "Torrefação", def: "Quem torra café. Muitas moem na hora, sob encomenda." },
        { id: "vaporizador", termo: "Vaporizador", def: "O bico que aquece o leite e dá textura." },
        { id: "wdt", termo: "WDT", def: "Mexer o pó com agulhas finas pra desfazer grumos. Pra quando tiver moedor." },
        { id: "wet-hulled", termo: "Wet-hulled", def: "Ou giling basah, da Indonésia. O pergaminho sai com o grão úmido. Terroso e pesado." }
      ] }
    ],
    related: ["entender/sabor"]
  }
];

C.entender = {
  sections: [
    { title: "Conceitos", items: conceitos },
    { title: "Sabor e prática", items: pratica }
  ]
};

window.CONTENT = C;
})();
