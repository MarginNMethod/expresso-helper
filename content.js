/* content.js: todo o texto do app, em português do Brasil.
   Escrito à parte da interface: o layout lê window.CONTENT.

   Formatos além do CONTRACT.md:
   - {type:"spec", items:[{label, value}]}           linhas chave-valor (lista agrupada iOS)
   - {type:"range", label, min, max, unit, low, high, markers:[{value,label}]}
                                                     reta numérica; low–high é a faixa boa
   - {type:"timeline", items:[{label, text}]}        etapas em sequência (torra, limpeza, descanso)
   - {type:"compass", top, bottom, left, right, center}
                                                     bússola de extração; textos dos eixos vêm daqui
   - drink layers: kind "americano" = café diluído, cor uniforme
   - {type:"h", id?}  e  {type:"region", id}         âncoras; worldmap.regions[].id aponta para elas
   - worldmap.regions[].link?                        se existir, o ponto abre essa rota (ex.: Brasil)
   - preparar.ratio.note, preparar.diagnosticoBlocks (blocos acima da lista de diagnóstico)
   - glossary.items[].id; links "entender/glossario#<id>" rolam até o termo
   - links podem apontar para comecar/…, bebidas/…, preparar/…, entender/…
   - quiz: a ordem das opções é fixa; não embaralhe, senão "correct" deixa de valer.
   - Nas bebidas, "espresso" é a dose; nos artigos, "espresso" é o quadro final
     “O que isso muda no seu espresso”; no bloco region, "espresso" é o comportamento como espresso.
*/
(function () {
var C = {};

C.meta = {
  appName: "Bambino",
  tabs: { comecar: "Começar", bebidas: "Bebidas", preparar: "Preparar", entender: "Entender" }
};

/* ============================== COMEÇAR ============================== */

C.comecar = {
  intro: "Um caminho curto para tirar bons espressos na sua Bambino, mesmo sem moedor. Comece pela voltagem: é o único passo que pode estragar a máquina.",

  alerts: [
    {
      id: "voltagem",
      title: "Voltagem no Brasil",
      subtitle: "Sua Bambino é 120 V. Leia antes.",
      icon: "bolt",
      home: { num: "127 ou 220 V?", line: "A Bambino americana é de 120 V. Numa tomada de 220 V ela queima.", go: "Veja antes de ligar" },
        blocks: [
        { type: "callout", tone: "warning", title: "Nunca ligue direto em 220 V",
          text: "A Bambino americana é feita para 120 V. Numa tomada de 220 V, a resistência e a eletrônica queimam em segundos, e a garantia não cobre esse dano." },
        { type: "spec", items: [
          { label: "Sua máquina", value: "120 V, 60 Hz, cerca de 1.560 W" },
          { label: "Brasil", value: "127 V ou 220 V, sempre 60 Hz" },
          { label: "Em 127 V", value: "Funciona direto, sem transformador" },
          { label: "Em 220 V", value: "Só com transformador de 2.000 VA ou mais" }
        ] },
        { type: "p", text: "Os dois países usam 60 Hz, o que importa porque a bomba da máquina depende da frequência. O que muda é a tensão." },
        { type: "h", text: "A tensão varia por cidade e por tomada" },
        { type: "p", text: "Quem define a tensão é a distribuidora local, e ela pode mudar dentro do mesmo estado. Use os exemplos abaixo só como ponto de partida." },
        { type: "table", head: ["Tensão", "Por exemplo, a maioria das cidades de"],
          rows: [
            ["127 V", "SP, RJ, MG, PR, AM"],
            ["220 V", "DF, GO, SC, CE, PE, RN"]
          ],
          caption: "Há exceções em quase todo estado. Confirme sempre no imóvel." },
        { type: "p", text: "Mesmo em cidades de 127 V, muitas casas têm tomadas de 220 V para chuveiro, ar-condicionado ou secadora. Por fora, elas costumam ser iguais às outras." },
        { type: "h", text: "Como confirmar a tomada" },
        { type: "steps", items: [
          { title: "Procure a etiqueta", text: "Veja se a tomada ou o disjuntor correspondente no quadro de luz indica 127 V ou 220 V." },
          { title: "Pergunte", text: "Proprietário, síndico, imobiliária ou um eletricista sabem a tensão do imóvel." },
          { title: "Meça", text: "Um multímetro simples, de loja de material de construção, mede a tomada em segundos. Use a escala de tensão alternada (V~)." },
          { title: "Desconfie de adesivo velho", text: "Etiquetas de “110” ou “220” podem estar erradas depois de uma reforma. Na dúvida, meça." }
        ] },
        { type: "h", text: "Se a tomada for 127 V" },
        { type: "p", text: "127 V está dentro da tolerância de um aparelho de 120 V. Falta só resolver o plugue e a corrente." },
        { type: "list", items: [
          "A Bambino tem plugue americano de três pinos. O padrão brasileiro (NBR 14136) também tem três pinos, em versões de 10 A e 20 A.",
          "Em 127 V, a resistência rende um pouco mais e a máquina pode puxar 13–14 A, acima do limite de uma tomada de 10 A.",
          "Use uma tomada de 20 A (pinos mais grossos) e um adaptador de 20 A que mantenha o pino de terra.",
          "Nada de benjamim, “T” ou extensão fina: aquecem e podem derreter com aparelho de resistência."
        ] },
        { type: "h", text: "Se a tomada for 220 V" },
        { type: "p", text: "Você precisa de um transformador abaixador de 220 V para 110 V. Para cerca de 1.560 W, o mínimo é 2.000 VA; o ideal é 3.000 VA, que trabalha com folga." },
        { type: "compare", items: [
          { label: "Serve", text: "Transformador ou autotransformador de 2.000–3.000 VA, de marca confiável, com saída de 20 A e terra. Deixe ventilado e ligue só durante o uso." },
          { label: "Não serve", text: "Conversor de viagem pequeno, filtro de linha ou estabilizador. Nenhum deles baixa a tensão com segurança para essa potência." }
        ] },
        { type: "callout", tone: "info", title: "Bambino ou Bambino Plus?",
          text: "Este app foi escrito para a Bambino comum, com bico de vapor manual. A Plus tem vapor automático com botões de temperatura e textura; o resto vale igual." }
      ]
    }
  ],

  manual: {
    title: "Manual contra o amigo metido a barista",
    subtitle: "Doze frases dele, doze respostas suas",
    intro: "Todo grupo tem aquele amigo que fala de café como se fosse vinho. Aqui estão as frases dele, o que responder com calma e o porquê. A graça é saber mais e continuar simpático.",
    cards: [
      { id: "torra-forte",
        ele: "“Gosto de torra escura porque é mais forte, tem mais cafeína.”",
        voce: "“A cafeína é praticamente a mesma. O que a torra escura tem a mais é amargor.”",
        porque: "A cafeína aguenta bem a torra. Quem manda nela é a espécie do grão e a dose de pó.",
        link: "entender/torra" },
      { id: "crema",
        ele: "“Olha essa crema grossa. Café bom é assim.”",
        voce: "“Crema mostra que o café é fresco e tem gás. Não garante que ele seja gostoso.”",
        porque: "Robusta, torra escura e cesto pressurizado fazem muita crema sem melhorar o sabor.",
        link: "comecar/crema" },
      { id: "grao-espresso",
        ele: "“Vou comprar aquele grão de espresso.”",
        voce: "“Espresso é o método de preparo, não um tipo de grão. Qualquer café pode virar espresso.”",
        porque: "“Para espresso” no pacote indica só uma torra e uma moagem pensadas para esse método.",
        link: "comecar/o-que-e-espresso" },
      { id: "arabica",
        ele: "“Robusta é café ruim. Bom mesmo é 100% arábica.”",
        voce: "“Tem arábica ruim e conilon excelente. Rondônia e Espírito Santo estão aí pra provar.”",
        porque: "Conilon bem cultivado dá chocolate, corpo e crema; arábica mal colhido decepciona igual.",
        link: "entender/regioes-brasil" },
      { id: "natural",
        ele: "“Prefiro café natural, sem química.”",
        voce: "“Natural é o jeito de secar o grão: a fruta seca inteira. Não tem a ver com agrotóxico.”",
        porque: "Natural, lavado e cereja descascado são processos pós-colheita. Orgânico é outra certificação.",
        link: "entender/processos" },
      { id: "torrado-ontem",
        ele: "“Esse aqui foi torrado ontem, está no auge.”",
        voce: "“Para espresso, ainda não. O grão precisa de alguns dias para soltar gás.”",
        porque: "Recém-torrado libera muito CO₂, que atrapalha a extração. Em grão, uma semana costuma bastar.",
        link: "entender/frescor" },
      { id: "forte-curto",
        ele: "“Espresso é só café forte com pouca água.”",
        voce: "“É café extraído sob uns 9 bar de pressão, numa proporção perto de 1:2 em peso.”",
        porque: "A pressão dissolve compostos e emulsiona óleos que nenhum coado concentrado consegue.",
        link: "comecar/dose-proporcao-tempo" },
      { id: "ristretto-cafeina",
        ele: "“Peço ristretto porque é mais forte, tem mais cafeína.”",
        voce: "“É mais concentrado no gosto, mas tem até um pouco menos cafeína: a extração para antes.”",
        porque: "Mesma dose de pó, menos água passando. A cafeína sai cedo, mas não toda nos primeiros segundos.",
        link: "bebidas/ristretto" },
      { id: "brasileiro-amargo",
        ele: "“Café brasileiro é tudo igual: forte e amargo.”",
        voce: "“O Brasil é o maior produtor do mundo e tem de tudo, de chocolate e nozes a frutas e flores.”",
        porque: "O amargor do café comum vem de torra muito escura e grão de baixa qualidade, não da origem.",
        link: "entender/regioes-brasil" },
      { id: "agua-fervendo",
        ele: "“Café tem que ser feito com água fervendo.”",
        voce: "“Para espresso, a água fica por volta de 86 a 96 °C, conforme a torra. Fervendo, amarga.”",
        porque: "Quanto mais quente, mais rápido a água extrai, inclusive os compostos amargos.",
        link: "entender/temperatura" },
      { id: "leite-quente",
        ele: "“Leite do cappuccino tem que vir pelando.”",
        voce: "“O ponto doce do leite é 55–65 °C. Acima de uns 70 °C ele perde doçura e ganha gosto de cozido.”",
        porque: "Com calor demais, as proteínas do leite se desfazem e a espuma murcha.",
        link: "preparar/leite" },
      { id: "15-bar",
        ele: "“Minha máquina tem 15 bar, então faz espresso melhor.”",
        voce: "“15 bar é o máximo da bomba. O espresso clássico é feito por volta de 9 bar no café.”",
        porque: "O número da caixa fala da bomba, não do que chega ao pó. Mais pressão não é mais sabor.",
        link: "entender/mitos" }
    ],
    quiz: [
      { q: "Espresso é…",
        options: ["Um método de preparo sob pressão", "Um tipo de grão de torra bem escura", "Uma variedade de arábica"],
        correct: 0,
        explain: "Espresso é o método: água quente sob pressão atravessando café moído fino. Qualquer grão pode ser usado." },
      { q: "Qual é a proporção clássica de um espresso normal?",
        options: ["1:1, mesmo peso de pó e bebida", "1:5, cinco vezes o peso do pó", "1:2, o dobro do peso do pó"],
        correct: 2,
        explain: "Perto de 1:2 em peso é o ponto de partida mais comum. 1:1 a 1:1,5 é ristretto; 1:2,5 a 1:3 é lungo." },
      { q: "Uma crema grossa e bonita mostra principalmente que…",
        options: ["O café é de qualidade superior", "O café ainda tem bastante gás", "O café tem mais cafeína"],
        correct: 1,
        explain: "Crema vem do CO₂ que o café fresco ainda guarda. Cesto pressurizado, robusta e torra escura aumentam a crema sem melhorar o sabor." },
      { q: "Onde guardar um pacote aberto que você vai usar nesta semana?",
        options: ["No armário, em pote vedado", "Na geladeira, bem fechado", "Em pote de vidro, à vista"],
        correct: 0,
        explain: "Geladeira traz umidade e cheiro; vidro transparente deixa a luz entrar. Para o dia a dia, armário fresco e pote vedado e opaco." },
      { q: "Comparando por peso, a torra escura tem…",
        options: ["Muito mais cafeína que a clara", "Quase nenhuma cafeína", "Praticamente a mesma cafeína"],
        correct: 2,
        explain: "Por peso a diferença é pequena; o que a torra escura tem a mais é amargor. Medida em colher, ela rende um pouco menos, porque o grão fica mais leve." }
    ],
    palavras: [
      { termo: "Extração", significado: "Quanto do café a água conseguiu dissolver. Pouca deixa azedo; demais deixa amargo.", link: "entender/glossario#extracao" },
      { termo: "Proporção", significado: "Peso da bebida contra peso do pó. “Tirei um 1:2” é frase de quem sabe o que faz.", link: "comecar/dose-proporcao-tempo" },
      { termo: "Perfil sensorial", significado: "O conjunto de acidez, doçura, amargor, corpo e aromas de um café.", link: "entender/sabor" },
      { termo: "Corpo", significado: "A sensação de peso na boca, de leve como chá a denso como xarope.", link: "entender/glossario#corpo" },
      { termo: "Doçura", significado: "Café bem extraído parece doce mesmo sem açúcar.", link: "entender/sabor" },
      { termo: "Acidez brilhante", significado: "Acidez viva e agradável, como de fruta. Não é azedume.", link: "entender/glossario#acidez" },
      { termo: "Finalização", significado: "O gosto que fica depois de engolir. Longa e doce é elogio.", link: "entender/glossario#finalizacao" },
      { termo: "Descanso", significado: "Os dias depois da torra em que o grão solta gás antes de render bem no espresso.", link: "entender/frescor" },
      { termo: "Processo natural", significado: "A cereja seca inteira, com a fruta. Costuma dar mais corpo e notas frutadas.", link: "entender/processos" },
      { termo: "Torra média", significado: "O ponto que equilibra doçura, acidez e corpo. A mais fácil para começar.", link: "entender/niveis-torra" },
      { termo: "Canalização", significado: "Quando a água acha um atalho no pó e extrai mal o resto.", link: "entender/glossario#canalizacao" },
      { termo: "Microespuma", significado: "Leite vaporizado com bolhas tão pequenas que fica brilhante, como tinta.", link: "preparar/leite" }
    ]
  },

  sections: [
    {
      title: "Primeiros passos",
      items: [
        {
          id: "sem-moedor",
          title: "Sem moedor: como começar",
          subtitle: "Cesto pressurizado e o que comprar",
          icon: "bean",
          blocks: [
            { type: "p", text: "Dá para fazer um espresso gostoso sem moedor. O que resolve é usar o cesto certo e comprar o pó certo." },
            { type: "h", text: "Os quatro cestos da Bambino" },
            { type: "p", text: "A Bambino vem com quatro cestos de 54 mm: simples e duplo, cada um em duas versões. A diferença está no fundo." },
            { type: "compare", items: [
              { label: "Pressurizado (parede dupla)", text: "Fundo duplo com um único furinho. Cria a pressão sozinho, então funciona com café já moído. Use este agora." },
              { label: "Parede simples", text: "Fundo cheio de furos. Quem segura a pressão é o próprio café, moído na hora e na medida. Fica para quando tiver moedor." }
            ] },
            { type: "p", text: "Para saber qual é qual, olhe por baixo. O pressurizado tem um único furo no centro; o de parede simples tem centenas de furinhos." },
            { type: "h", text: "Por que o pressurizado ajuda" },
            { type: "p", text: "No espresso, a água precisa encontrar resistência para extrair bem. Com café moído na hora, quem cria essa resistência é a moagem fina e uniforme." },
            { type: "p", text: "O café de pacote não tem ajuste e perde frescor rápido. O furinho do cesto pressurizado segura a água e compensa essa falta de controle." },
            { type: "h", text: "O que comprar no Brasil" },
            { type: "list", items: [
              "Procure “café torrado e moído para espresso” ou “moagem fina”, em pacotes de 250 g.",
              "Prefira pacote com data de torra impressa. A validade sozinha não diz nada sobre frescor.",
              "Comece por torra média. Torra muito clara é difícil de extrair; muito escura amarga fácil.",
              "Desconfie do “extraforte”: em geral é torra bem escura de grão comum, feita para disfarçar defeitos.",
              "Se encontrar, prefira “café especial”, que passa por avaliação sensorial e costuma informar origem e torra."
            ] },
            { type: "h", text: "Peça para moer na hora" },
            { type: "p", text: "A melhor opção sem moedor: comprar grão numa torrefação ou cafeteria de café especial e pedir para moer “para espresso”, avisando que é cesto pressurizado." },
            { type: "callout", tone: "tip", title: "Se a bebida sair só pingando",
              text: "Pó fino demais pode entupir o cesto pressurizado. Na próxima compra, peça um pouco mais grosso, perto da moagem de cafeteira italiana." },
            { type: "h", text: "Faça o pó durar" },
            { type: "p", text: "Café moído perde aroma em dias, porque a superfície exposta ao ar é enorme. Compre pouco por vez e use em até 1–2 semanas depois de aberto." },
            { type: "list", items: [
              "Feche bem o pacote, tirando o ar, ou passe para um pote hermético e opaco.",
              "Guarde em armário fresco, longe do fogão e da luz.",
              "Geladeira não: o pó puxa umidade e cheiro de comida."
            ] }
          ],
          related: ["comecar/primeiro-moedor", "comecar/moagem", "entender/frescor"]
        },
        {
          id: "o-que-e-espresso",
          title: "O que é espresso",
          subtitle: "Água quente, pressão, pouco tempo",
          icon: "cup",
          blocks: [
            { type: "p", text: "Espresso é um método de preparo. Água a 90 e poucos graus atravessa uma pastilha de café moído fino sob cerca de 9 bar de pressão." },
            { type: "p", text: "Em uns 25–30 segundos sai uma bebida pequena, concentrada e com espuma por cima. Não existe grão “de espresso”: qualquer café pode ser preparado assim." },
            { type: "h", text: "Por que a pressão importa" },
            { type: "p", text: "Sem pressão, a água mal passaria pelo pó fino. Com pressão, ela é forçada por um caminho apertado e dissolve muita coisa em pouco tempo." },
            { type: "p", text: "A pressão também emulsiona os óleos do café e dissolve CO₂ na bebida. Quando o líquido chega à xícara, esse gás forma a crema." },
            { type: "compare", items: [
              { label: "Espresso", text: "Pouca bebida, muito concentrada: uns 8–12% de sólidos dissolvidos. Corpo denso e crema." },
              { label: "Coado", text: "Muita bebida, pouco concentrada: uns 1,2–1,5%. Leve, limpo, sem crema." }
            ] },
            { type: "h", text: "As três variáveis" },
            { type: "spec", items: [
              { label: "Dose", value: "Pó no cesto, em gramas" },
              { label: "Rendimento", value: "Bebida na xícara, em gramas" },
              { label: "Tempo", value: "Do botão até parar, em segundos" }
            ] },
            { type: "p", text: "Ajustar essas três coisas é quase todo o trabalho. A próxima lição mostra os números que servem de ponto de partida." },
            { type: "callout", tone: "info", title: "Shot, dose, extração",
              text: "Em cafeteria você vai ouvir “shot” para cada espresso tirado. É o mesmo que uma extração." }
          ],
          related: ["comecar/dose-proporcao-tempo", "comecar/crema", "entender/temperatura"]
        },
        {
          id: "dose-proporcao-tempo",
          title: "Dose, proporção e tempo",
          subtitle: "Os números de um espresso",
          icon: "scale",
          blocks: [
            { type: "p", text: "Espresso se mede em peso, não em mililitros. A crema engana o olho: 34 g de bebida podem ocupar uns 45 ml na xícara." },
            { type: "h", text: "A proporção" },
            { type: "p", text: "Proporção é o peso da bebida dividido pelo peso do pó. Com 17 g de pó e 34 g na xícara, você fez 1:2." },
            { type: "table", head: ["Estilo", "Proporção", "Com 17 g de pó"],
              rows: [
                ["Ristretto", "1:1 a 1:1,5", "17–25 g"],
                ["Normal", "1:2", "34 g"],
                ["Lungo", "1:2,5 a 1:3", "42–51 g"]
              ],
              caption: "Peso da bebida na xícara, medido em balança." },
            { type: "h", text: "Por que mais água muda o sabor" },
            { type: "p", text: "Ácidos e notas de fruta saem primeiro. Açúcares e corpo vêm no meio. Amargor e adstringência chegam por último." },
            { type: "p", text: "Parar cedo dá algo intenso e ácido. Deixar correr dá algo mais ralo e amargo. A proporção escolhe o ponto de parada." },
            { type: "h", text: "A dose na Bambino" },
            { type: "table", head: ["Cesto (54 mm)", "Dose", "Comece com"],
              rows: [
                ["Simples", "8–10 g", "9 g"],
                ["Duplo", "16–18 g", "17 g"]
              ],
              caption: "Vale para as versões pressurizada e simples. A capacidade varia um pouco com o pó." },
            { type: "p", text: "No cesto pressurizado, encha até perto da borda, nivele com o dedo e compacte de leve. Força não ajuda: quem faz a pressão é o furinho." },
            { type: "h", text: "Mililitro não é grama" },
            { type: "p", text: "Os botões da Bambino param por volume (cerca de 30 ml e 60 ml de fábrica). Como a crema ocupa espaço, isso não é o peso." },
            { type: "compare", items: [
              { label: "Pelos botões", text: "Prático e repetível, mas a proporção fica no escuro. Bom para o dia a dia depois de acertar." },
              { label: "Com balança", text: "Aperte o botão e aperte de novo para parar quando a balança marcar o peso certo. É assim que se aprende." }
            ] },
            { type: "callout", tone: "tip", title: "Balança de 0,1 g",
              text: "Uma balança de cozinha com resolução de 0,1 g é o acessório mais útil depois do café. A de 1 g quebra o galho, mas erra feio no ristretto." },
            { type: "h", text: "O tempo" },
            { type: "p", text: "A referência clássica é 25–30 segundos para 1:2. Ela vale de verdade com moedor e cesto simples, quando o tempo mostra se a moagem está certa." },
            { type: "p", text: "No cesto pressurizado, a válvula controla boa parte do fluxo. Use o tempo como pista e confie mais no peso e no gosto." },
            { type: "h", text: "Seu primeiro espresso" },
            { type: "steps", items: [
              { title: "Aqueça tudo", text: "Ligue a máquina. Encaixe o porta-filtro vazio e passe água sobre a xícara para aquecer os dois." },
              { title: "Pese o pó", text: "Seque o cesto duplo pressurizado e coloque 17 g de café. Nivele e compacte de leve." },
              { title: "Prepare a balança", text: "Encaixe o porta-filtro, coloque a xícara sobre a balança na bandeja e zere." },
              { title: "Extraia", text: "Aperte o botão de duas xícaras e inicie o timer. Aperte de novo para parar perto de 34 g." },
              { title: "Prove e anote", text: "Anote dose, rendimento e tempo. Na próxima, mude uma coisa por vez." }
            ] }
          ],
          related: ["preparar/ratio", "preparar/timer", "preparar/diagnostico"]
        },
        {
          id: "moagem",
          title: "Moagem",
          subtitle: "O tamanho do pó manda em tudo",
          icon: "list",
          blocks: [
            { type: "p", text: "Moer é aumentar a superfície do café para a água conseguir dissolvê-lo. Quanto mais fino, mais superfície e mais rápida a extração." },
            { type: "p", text: "No espresso, a moagem também cria resistência. É ela que segura a água sob pressão pelo tempo necessário." },
            { type: "h", text: "Do mais grosso ao mais fino" },
            { type: "table", head: ["Moagem", "Lembra", "Uso"],
              rows: [
                ["Grossa", "Sal grosso", "Prensa francesa"],
                ["Média", "Areia de praia", "Coado"],
                ["Média-fina", "Areia fina", "Italiana"],
                ["Fina", "Sal refinado", "Espresso"],
                ["Extrafina", "Talco", "Café turco"]
              ],
              caption: "Comparações aproximadas. Cada moedor e cada café variam." },
            { type: "h", text: "O problema do pó de supermercado" },
            { type: "p", text: "O moído comum no Brasil é feito para coar, então é médio. No cesto de parede simples, a água passa em poucos segundos e sai uma bebida rala." },
            { type: "p", text: "No cesto pressurizado esse pó funciona melhor, porque o furinho segura a água. Mesmo assim, o moído “para espresso” costuma dar mais corpo." },
            { type: "h", text: "Fino demais ou grosso demais" },
            { type: "compare", items: [
              { label: "Grosso demais", text: "Corre rápido, sai ralo e ácido, com pouca crema." },
              { label: "Fino demais", text: "Pinga devagar ou trava. Sai amargo e áspero. No pressurizado, pode entupir o furo." }
            ] },
            { type: "callout", tone: "info", title: "Uniformidade importa tanto quanto o tamanho",
              text: "Moedor de lâminas (hélice) faz pó e pedaços ao mesmo tempo. O pó amarga e os pedaços azedam na mesma xícara. Para espresso, só moedor de mós." }
          ],
          related: ["comecar/sem-moedor", "comecar/primeiro-moedor", "preparar/diagnostico"]
        },
        {
          id: "crema",
          title: "Crema",
          subtitle: "O que ela é e o que não diz",
          icon: "drop",
          blocks: [
            { type: "p", text: "Crema é a espuma dourada em cima do espresso. São bolhas de CO₂ presas numa mistura de óleos, proteínas e melanoidinas, os compostos escuros da torra." },
            { type: "h", text: "Como ela se forma" },
            { type: "p", text: "Sob 9 bar, o gás que o grão ainda guarda se dissolve na água. Quando a bebida volta à pressão normal, o gás escapa em bolhas minúsculas, como ao abrir um refrigerante." },
            { type: "h", text: "O que aumenta a crema" },
            { type: "list", items: [
              "Café fresco, que ainda tem bastante CO₂.",
              "Torra mais escura, que gera mais gás.",
              "Robusta e conilon, que fazem crema farta e firme.",
              "Cesto pressurizado: o furinho bate a bebida e faz espuma até com café velho."
            ] },
            { type: "callout", tone: "info", title: "Crema não é nota de qualidade",
              text: "Um espresso pode ter crema linda e gosto ruim, ou pouca crema e sabor ótimo. Ela fala de frescor e de gás, não de sabor." },
            { type: "h", text: "Vale provar sozinha" },
            { type: "p", text: "Prove uma colherzinha de crema pura: é amarga e seca. Por isso muita gente mexe o espresso antes de beber, para misturar as camadas." },
            { type: "compare", items: [
              { label: "Cesto pressurizado", text: "Crema mais clara, de bolhas maiores, que some rápido. É espuma feita pela válvula." },
              { label: "Cesto simples, café fresco", text: "Crema fina e persistente, cor de avelã, às vezes com rajadas escuras." }
            ] }
          ],
          related: ["entender/frescor", "entender/mitos", "comecar/o-que-e-espresso"]
        },
        {
          id: "limpeza",
          title: "Limpeza e descalcificação",
          subtitle: "Rotina curta, sabor limpo",
          icon: "wrench",
          blocks: [
            { type: "p", text: "Óleo de café velho fica rançoso e amarga o próximo espresso. Calcário entope canos e atrapalha o aquecimento. Uma rotina curta resolve os dois." },
            { type: "timeline", items: [
              { label: "A cada café", text: "Bata a borra no lixo, enxágue o cesto e passe água pelo grupo por 2–3 s. Limpe e purgue o bico de vapor." },
              { label: "Todo dia", text: "Esvazie e lave a bandeja. Passe um pano úmido na ducha do grupo." },
              { label: "Toda semana", text: "Desentupa o furinho do cesto pressurizado com um alfinete fino (algumas versões trazem uma ferramenta de limpeza). Lave a jarra de leite com detergente." },
              { label: "Todo mês", text: "Deixe cestos e porta-filtro de molho em detergente para máquina de espresso, sem molhar a parte plástica." },
              { label: "Descalcificação", text: "Quando a máquina ou o manual indicar. Com água dura, mais cedo." }
            ] },
            { type: "h", text: "Retrolavagem não" },
            { type: "p", text: "Máquinas maiores limpam o grupo com um cesto cego e retrolavagem. Siga a limpeza descrita no manual; ela não pede retrolavagem como as máquinas profissionais." },
            { type: "h", text: "Descalcificação" },
            { type: "p", text: "A água deixa minerais nas partes quentes, como numa chaleira por dentro. Com o tempo isso reduz o fluxo e prejudica o aquecimento." },
            { type: "steps", items: [
              { title: "Prepare a solução", text: "Use descalcificante próprio para máquinas de espresso, na diluição indicada na embalagem, no reservatório." },
              { title: "Siga o ciclo do manual", text: "A Bambino tem um modo de descalcificação próprio. Faça exatamente a sequência descrita no manual do seu modelo." },
              { title: "Enxágue bem", text: "Depois do ciclo, lave o reservatório e passe pelo menos um tanque cheio de água limpa." }
            ] },
            { type: "callout", tone: "warning", title: "Evite vinagre",
              text: "Vinagre deixa cheiro e pode atacar vedações. Descalcificantes próprios usam ácidos mais adequados, como cítrico ou lático." },
            { type: "p", text: "A água decide a frequência. Água filtrada de baixa dureza estica o intervalo; água muito mineralizada encurta." }
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
          subtitle: "O que procurar na compra",
          icon: "wrench",
          blocks: [
            { type: "p", text: "O moedor é o maior salto de qualidade depois da máquina. Com ele, você usa café em grão fresco e passa para os cestos de parede simples." },
            { type: "h", text: "Mós, nunca lâminas" },
            { type: "p", text: "Moedor de mós esmaga o grão entre duas peças com distância ajustável, e o pó sai de tamanho parecido. O de lâminas só pica, irregular demais para espresso." },
            { type: "compare", items: [
              { label: "Manual de mós", text: "Primeira escolha: mais qualidade pelo mesmo dinheiro, silencioso e sem problema de voltagem. Pede uns 40–90 s de manivela por dose." },
              { label: "Elétrico para espresso", text: "Prático no dia a dia. Os de entrada costumam ter mó cônica e ajuste em passos pequenos. Confira a voltagem." }
            ] },
            { type: "h", text: "O que conferir antes de comprar" },
            { type: "list", items: [
              "Que o fabricante diga que ele mói para espresso, não só para coado.",
              "Ajuste fino, com muitos passos pequenos ou contínuo. No espresso, um passo grande pula o ponto certo.",
              "Pouca retenção: pouco pó preso dentro do moedor entre uma dose e outra.",
              "Se for elétrico, voltagem compatível com a sua tomada no Brasil."
            ] },
            { type: "callout", tone: "tip", title: "Quando tiver moedor",
              text: "Um funil dosador de 54 mm evita sujeira. Uma agulha fina para mexer o pó (técnica WDT) desfaz grumos antes de compactar e reduz canalização." },
            { type: "p", text: "Ao trocar de cesto, mantenha dose e proporção e ajuste a moagem até chegar perto de 25–30 s. A partir daí, a moagem vira sua principal ferramenta." }
          ],
          related: ["comecar/moagem", "preparar/diagnostico"]
        }
      ]
    }
  ]
};

/* ============================== BEBIDAS ============================== */

C.bebidas = {
  intro: "Cada bebida com proporção, volume e xícara. As doses usam os cestos pressurizados da Bambino: 9 g no simples, 17 g no duplo. Nas bebidas com leite ou água, a proporção é espresso : leite (ou água), em peso.",
  groups: [
    {
      title: "Só espresso",
      items: [
        { id: "ristretto", name: "Ristretto", aka: "Espresso curto",
          short: "Curto, denso e doce, menos amargo",
          ratio: "1:1 a 1:1,5", espresso: "17 g → 17–25 g", volume: "20–30 ml", cup: "xícara de espresso, 60–90 ml",
          layers: [ { kind: "espresso", pct: 70 }, { kind: "crema", pct: 30 } ], fill: 35,
          steps: [
            "Prepare como um espresso normal, com 17 g no cesto duplo.",
            "Com a xícara na balança, pare a extração entre 17 e 25 g.",
            "Sem balança: pare quando a xícara tiver um pouco mais da metade do volume de um doppio."
          ],
          tip: "Como a extração para cedo, sobra pouco amargor. É um bom caminho para cafés de torra mais escura.",
          related: ["bebidas/espresso", "preparar/ratio"] },
        { id: "espresso", name: "Espresso", aka: "Café expresso",
          short: "A base de tudo: 1:2 em peso",
          ratio: "1:2", espresso: "9 g → 18 g (cesto simples)", volume: "25–30 ml", cup: "xícara de espresso, 60–90 ml",
          layers: [ { kind: "espresso", pct: 75 }, { kind: "crema", pct: 25 } ], fill: 45,
          steps: [
            "Aqueça a xícara e o porta-filtro passando água pelo grupo.",
            "Coloque 9 g no cesto simples pressurizado, nivele e compacte de leve.",
            "Aperte o botão de uma xícara e pare perto de 18 g na balança."
          ],
          tip: "O cesto simples é mais difícil de acertar. Se a bebida sair rala, use o duplo e faça um doppio.",
          related: ["comecar/dose-proporcao-tempo", "bebidas/doppio"] },
        { id: "doppio", name: "Doppio", aka: "Espresso duplo",
          short: "Dose dupla de pó, o dobro de bebida",
          ratio: "1:2", espresso: "17 g → 34 g (cesto duplo)", volume: "40–50 ml", cup: "xícara de espresso, 90 ml",
          layers: [ { kind: "espresso", pct: 75 }, { kind: "crema", pct: 25 } ], fill: 55,
          steps: [
            "Coloque 17 g no cesto duplo pressurizado.",
            "Use o botão de duas xícaras ou pare manualmente perto de 34 g.",
            "Para dividir em duas xícaras, use o bico duplo do porta-filtro."
          ],
          tip: "É o ponto de partida mais fácil na Bambino e a base das bebidas com leite.",
          related: ["bebidas/espresso", "preparar/timer"] },
        { id: "lungo", name: "Lungo", aka: "Espresso longo",
          short: "Mais água pelo mesmo pó, mais leve",
          ratio: "1:2,5 a 1:3", espresso: "17 g → 42–51 g", volume: "50–65 ml", cup: "xícara de 90–120 ml",
          layers: [ { kind: "espresso", pct: 82 }, { kind: "crema", pct: 18 } ], fill: 60,
          steps: [
            "Prepare como o doppio, com 17 g no cesto duplo.",
            "Deixe correr até 42–51 g na balança.",
            "Prove: se amargar no fim, pare mais cedo da próxima vez."
          ],
          tip: "Lungo não é americano. Toda a água passa pelo pó, então o fim da extração traz mais amargor e adstringência.",
          related: ["bebidas/americano", "preparar/ratio"] },
        { id: "americano", name: "Americano",
          short: "Espresso alongado com água quente",
          ratio: "1:3 a 1:4 (café:água)", espresso: "1 doppio (17 g → 34 g)", volume: "140–180 ml", cup: "xícara de 200–240 ml",
          layers: [ { kind: "americano", pct: 92 }, { kind: "crema", pct: 8 } ], fill: 75,
          steps: [
            "Tire um doppio na xícara.",
            "Complete com 100–140 ml de água quente, por volta de 85–90 °C, de chaleira.",
            "Mexa e prove. Ajuste a água ao seu gosto."
          ],
          tip: "A Bambino não tem saída de água quente. Use chaleira e deixe a água descansar meio minuto depois de ferver.",
          related: ["bebidas/long-black", "bebidas/lungo"] },
        { id: "long-black", name: "Long black",
          short: "Água primeiro, espresso por cima",
          ratio: "1:2 a 1:3 (café:água)", espresso: "1 doppio (17 g → 34 g)", volume: "120–150 ml", cup: "xícara de 150–180 ml",
          layers: [ { kind: "water", pct: 65 }, { kind: "espresso", pct: 25 }, { kind: "crema", pct: 10 } ], fill: 75,
          steps: [
            "Coloque 80–110 ml de água quente na xícara, por volta de 85–90 °C.",
            "Tire o doppio diretamente sobre a água.",
            "Não mexa antes de sentir o aroma: a crema fica inteira por cima."
          ],
          tip: "Comum na Austrália e na Nova Zelândia. Costuma ser menor e mais intenso que o americano.",
          related: ["bebidas/americano"] }
      ]
    },
    {
      title: "Com leite",
      items: [
        { id: "macchiato", name: "Macchiato", aka: "Espresso macchiato",
          short: "Espresso manchado com espuma",
          ratio: "Espresso + 1–2 colheres de espuma", espresso: "1 espresso (9 g → 18 g) ou doppio", volume: "40–60 ml", cup: "xícara de espresso, 90 ml",
          layers: [ { kind: "espresso", pct: 60 }, { kind: "crema", pct: 10 }, { kind: "foam", pct: 30 } ], fill: 60,
          steps: [
            "Tire o espresso na xícara.",
            "Vaporize um pouco de leite, com bastante espuma.",
            "Coloque uma ou duas colheres de espuma no centro."
          ],
          tip: "Macchiato quer dizer “manchado” em italiano. Em muitas redes de cafeteria o nome virou outra bebida, grande e doce.",
          related: ["preparar/leite", "bebidas/cortado"] },
        { id: "cortado", name: "Cortado",
          short: "Espresso e leite quase em partes iguais",
          ratio: "1:1 a 1:2 (café:leite)", espresso: "1 doppio (17 g → 34 g)", volume: "90–120 ml", cup: "copo de vidro de 120–150 ml",
          layers: [ { kind: "espresso", pct: 40 }, { kind: "milk", pct: 50 }, { kind: "foam", pct: 10 } ], fill: 85,
          steps: [
            "Tire o doppio no copo.",
            "Vaporize 60–80 ml de leite com pouquíssima aeração.",
            "Despeje devagar, deixando só uma camada fina de espuma."
          ],
          tip: "Tem origem espanhola: o leite “corta” a intensidade do café sem esconder o gosto dele.",
          related: ["bebidas/flat-white", "preparar/leite"] },
        { id: "flat-white", name: "Flat white",
          short: "Doppio com microespuma fina",
          ratio: "1:3 a 1:4 (café:leite)", espresso: "1 doppio ou 2 ristrettos", volume: "150–180 ml", cup: "xícara de 150–180 ml",
          layers: [ { kind: "espresso", pct: 25 }, { kind: "milk", pct: 65 }, { kind: "foam", pct: 10 } ], fill: 92,
          steps: [
            "Tire o doppio na xícara.",
            "Vaporize uns 120 ml de leite aerando pouco: cresce só 10%.",
            "Despeje de perto, para a espuma fina se misturar com o café."
          ],
          tip: "Menor e mais intenso que o latte, com espuma de menos de 1 cm. O café aparece mais.",
          related: ["bebidas/latte", "preparar/leite"] },
        { id: "cappuccino", name: "Cappuccino", short: "Espresso, leite e espuma generosa", ratio: "1:3 a 1:4 (café:leite)", espresso: "1 doppio (17 g → 34 g)", volume: "150–180 ml", cup: "xícara de 150–180 ml",
          band: { tone: "leite", num: "1:3 a 1:4", unit: "café pra leite", line: "Pede mais espuma que os outros, e é aí que mora o treino." },
          layers: [ { kind: "espresso", pct: 22 }, { kind: "milk", pct: 45 }, { kind: "foam", pct: 33 } ], fill: 95,
          steps: [
            "Aqueça a xícara com água quente, jogue fora e tire o doppio nela.",
            "Ponha 120 ml de leite gelado numa jarra com folga. Solte um pouco de vapor fora do leite pra limpar o bico.",
            "Deixe a ponta logo abaixo da superfície, chiando, até o leite crescer uns 30–40%.",
            "Afunde um pouco o bico e gire o leite até 55–65 °C. Limpe o bico na hora.",
            "Despeje firme no centro. A espuma sobe e deve ficar com 1–2 cm." ],
          tip: "Pode esquecer a regra dos “três terços”. Na xícara de verdade o espresso ocupa uns 20–25% e a espuma, perto de um terço.",
          related: ["bebidas/latte", "preparar/leite"] },
        { id: "latte", name: "Latte", aka: "Caffè latte",
          short: "Muito leite, pouca espuma, suave",
          ratio: "1:5 a 1:7 (café:leite)", espresso: "1 doppio (17 g → 34 g)", volume: "240–300 ml", cup: "xícara ou copo de 300 ml",
          layers: [ { kind: "espresso", pct: 15 }, { kind: "milk", pct: 75 }, { kind: "foam", pct: 10 } ], fill: 90,
          steps: [
            "Tire o doppio na xícara.",
            "Vaporize 180–240 ml de leite aerando pouco: cresce uns 20%.",
            "Despeje de perto e termine com cerca de 1 cm de espuma."
          ],
          tip: "É a bebida mais tolerante. Se o espresso ainda estiver irregular, o leite ajuda a equilibrar.",
          related: ["bebidas/cappuccino", "preparar/leite"] },
        { id: "mocha", name: "Mocha", aka: "Café mocha",
          short: "Latte com chocolate",
          ratio: "1:4 a 1:6 (café:leite) + chocolate", espresso: "1 doppio (17 g → 34 g)", volume: "240–300 ml", cup: "xícara ou copo de 300 ml",
          layers: [ { kind: "chocolate", pct: 10 }, { kind: "espresso", pct: 15 }, { kind: "milk", pct: 65 }, { kind: "foam", pct: 10 } ], fill: 90,
          steps: [
            "Coloque 15–20 g de chocolate em pó (50% cacau ou mais) ou calda de chocolate na xícara.",
            "Tire o doppio por cima e misture até dissolver.",
            "Complete com 160–200 ml de leite vaporizado e pouca espuma."
          ],
          tip: "Chocolate em pó dissolve melhor no espresso quente do que no leite. Misture antes de colocar o leite.",
          related: ["bebidas/latte"] }
      ]
    },
    {
      title: "Brasileiros",
      items: [
        { id: "cafe-com-leite", name: "Café com leite",
          short: "O clássico de padaria, meio a meio",
          ratio: "Cerca de 1:1 (café:leite)", espresso: "1 doppio + 60 ml de água quente", volume: "180–220 ml", cup: "xícara média ou caneca de 200–250 ml",
          layers: [ { kind: "americano", pct: 45 }, { kind: "milk", pct: 50 }, { kind: "foam", pct: 5 } ], fill: 85,
          steps: [
            "Tire o doppio e complete com uns 60 ml de água quente, como um americano curto.",
            "Aqueça 90–110 ml de leite no vapor, quase sem espuma.",
            "Misture tudo. Açúcar, só se quiser."
          ],
          tip: "Em casa, o tradicional é café coado com leite quente em partes iguais. Esta versão imita esse equilíbrio com espresso.",
          related: ["bebidas/pingado", "bebidas/americano"] },
        { id: "pingado", name: "Pingado",
          short: "No copo americano; muda por região",
          ratio: "Varia por região", espresso: "1 doppio + água quente", volume: "150–190 ml", cup: "copo americano, 190 ml",
          layers: [ { kind: "americano", pct: 70 }, { kind: "milk", pct: 30 } ], fill: 85,
          steps: [
            "Tire o doppio no copo americano e complete com uns 70 ml de água quente.",
            "Adicione 30–40 ml de leite quente, só um “pingo” generoso.",
            "Em São Paulo, inverta: leite quente quase até a boca e café por cima."
          ],
          tip: "Em boa parte do país, pingado é café com um pingo de leite. Na padaria paulistana, costuma ser um copo de leite com café. Os dois estão certos.",
          related: ["bebidas/cafe-com-leite"] }
      ]
    },
    {
      title: "Gelados e sobremesa",
      items: [
        { id: "affogato", name: "Affogato",
          short: "Espresso quente sobre sorvete",
          ratio: "1 doppio para 1–2 bolas", espresso: "1 doppio (17 g → 34 g)", volume: "100–150 ml", cup: "taça ou copo baixo de 150–200 ml",
          layers: [ { kind: "espresso", pct: 100 }, { kind: "icecream", pct: 0, float: true } ], fill: 70,
          steps: [
            "Coloque uma ou duas bolas de sorvete de creme num copo frio.",
            "Tire o doppio numa xícara à parte.",
            "Despeje o espresso sobre o sorvete na hora de comer."
          ],
          tip: "“Affogato” quer dizer afogado em italiano. Sorvete de creme ou de baunilha deixa o café aparecer.",
          related: ["bebidas/doppio"] },
        { id: "iced-latte", name: "Iced latte", aka: "Latte gelado",
          short: "Leite gelado, gelo e espresso por cima",
          ratio: "1:4 a 1:6 (café:leite)", espresso: "1 doppio (17 g → 34 g)", volume: "250–300 ml", cup: "copo alto de 350 ml",
          layers: [ { kind: "milk", pct: 82 }, { kind: "espresso", pct: 18 }, { kind: "ice", pct: 0, float: true } ], fill: 80,
          steps: [
            "Encha o copo de gelo.",
            "Coloque 150–200 ml de leite gelado.",
            "Tire o doppio numa xícara e despeje devagar por cima, para formar camadas."
          ],
          tip: "Tirar o espresso direto no gelo funciona, mas derrete o gelo e dilui mais. Na xícara à parte você controla melhor.",
          related: ["bebidas/latte"] }
      ]
    }
  ]
};

/* ============================== PREPARAR ============================== */

C.preparar = {
  ratio: {
    presets: [
      { id: "ristretto", name: "Ristretto", ratio: 1.5, note: "1:1 a 1:1,5. Curto, denso e doce, com pouco amargor." },
      { id: "normal", name: "Normal", ratio: 2, note: "1:2. O ponto de partida para quase todo café." },
      { id: "lungo", name: "Lungo", ratio: 3, note: "1:2,5 a 1:3. Mais leve; pode amargar no fim." }
    ],
    defaultDose: 17,
    doseMin: 7,
    doseMax: 20,
    note: "Cesto simples: 8–10 g. Cesto duplo: 16–18 g. Pese a bebida numa balança de 0,1 g: os botões da máquina medem volume, e a crema faz 1 ml pesar menos que 1 g."
  },

  timer: {
    targetMin: 25,
    targetMax: 30,
    tips: [
      "Comece a contar quando apertar o botão, não na primeira gota. A Bambino faz uma pré-infusão suave nos primeiros segundos.",
      "Pare pela balança, não pelo relógio. O tempo é a pista; o peso é a meta.",
      "Com cesto pressurizado, a válvula segura o fluxo e o tempo diz pouco. Se o gosto estiver bom em 20 ou 35 s, está bom.",
      "A faixa de 25–30 s vale de verdade com moedor e cesto simples: aí o tempo mostra se a moagem está certa.",
      "Para parar antes do volume programado, aperte o mesmo botão de novo.",
      "Anote dose, peso final e tempo. Mude uma variável por vez."
    ]
  },

  leite: {
    id: "leite",
    title: "Vaporizar leite",
    subtitle: "Microespuma no bico manual",
    icon: "milk",
    blocks: [
      { type: "p", text: "Vaporizar tem duas fases: primeiro você injeta ar, depois gira o leite para quebrar as bolhas e aquecer por igual. O alvo é microespuma, lisa e brilhante." },
      { type: "h", text: "Antes de começar" },
      { type: "list", items: [
        "Leite gelado, direto da geladeira: quanto mais frio, mais tempo para texturizar.",
        "Jarra de inox (pitcher) cheia só até a base do bico, cerca de um terço.",
        "Tire o espresso antes. Depois do vapor, a máquina leva um tempo para voltar à temperatura do café."
      ] },
      { type: "table", head: ["Bebida", "Leite frio", "Quanto cresce"],
        rows: [
          ["Flat white", "120 ml", "Uns 10%"],
          ["Latte", "180–240 ml", "Uns 20%"],
          ["Cappuccino", "120 ml", "Uns 30–40%"]
        ],
        caption: "No cappuccino a espuma ocupa mais espaço: use uma jarra com folga." },
      { type: "h", text: "Passo a passo" },
      { type: "steps", items: [
        { title: "Purgue", text: "Com o bico virado para a bandeja ou um pano, solte vapor por 1–2 s para tirar a água condensada." },
        { title: "Posicione", text: "Coloque a ponta do bico 1 cm abaixo da superfície, um pouco fora do centro, e ligue o vapor." },
        { title: "Aere", text: "Abaixe a jarra devagar até ouvir um chiado curto, como papel rasgando. O volume começa a subir." },
        { title: "Pare de aerar", text: "Quando a jarra estiver morna como a mão, uns 37 °C, afunde um pouco o bico. Daqui em diante, sem chiado." },
        { title: "Gire", text: "Incline a jarra para o leite rodar como um redemoinho. Isso quebra as bolhas grandes." },
        { title: "Desligue no ponto", text: "Quando ficar difícil manter a mão na jarra, perto de 60 °C, conte mais 2–3 s e desligue." },
        { title: "Acabamento", text: "Bata a jarra na bancada uma vez, gire até brilhar e despeje logo." }
      ] },
      { type: "range", label: "Temperatura do leite", min: 20, max: 80, unit: "°C", low: 55, high: 65,
        markers: [ { value: 37, label: "Para de aerar" }, { value: 60, label: "Mão não aguenta" }, { value: 70, label: "Começa a cozinhar" } ] },
      { type: "p", text: "Entre 55 e 65 °C o leite fica mais doce e a espuma, estável. Acima de uns 70 °C a doçura cai, aparece gosto de leite cozido e a espuma murcha." },
      { type: "h", text: "Que leite usar" },
      { type: "table", head: ["Leite", "Como se comporta"],
        rows: [
          ["Integral", "O mais fácil, cremoso"],
          ["Desnatado", "Espuma alta, seca"],
          ["Sem lactose", "Quase igual, mais doce"],
          ["Aveia (barista)", "A vegetal mais tolerante"],
          ["Soja", "Boa espuma; pode talhar"],
          ["Amêndoa ou coco", "Espuma fraca e rala"]
        ],
        caption: "O integral de caixinha (UHT) funciona bem. Vegetais aparecem no rótulo como “bebida vegetal”; prefira as versões barista e vaporize até 55–60 °C." },
      { type: "callout", tone: "warning", title: "Limpe o bico na hora",
        text: "Leite seca rápido no metal quente e entope os furos. Passe um pano úmido logo depois e purgue de novo. Segure o bico só pela parte isolada: ele fica muito quente." }
    ],
    related: ["bebidas/cappuccino", "bebidas/latte", "bebidas/flat-white"]
  },

  diagnosticoBlocks: [
    { type: "p", text: "Quase todo problema de sabor cai em dois eixos: extração de menos ou demais, e bebida fraca ou forte. Ache seu ponto e corrija na direção oposta." },
    { type: "compass", top: "Forte", bottom: "Fraco", left: "Extração de menos (azedo)", right: "Extração demais (amargo)", center: "Equilibrado" },
    { type: "callout", tone: "info", title: "Sem moedor, outras ferramentas",
      text: "Com café já moído você não ajusta a moagem. Suas ferramentas são dose, rendimento, frescor, torra, aquecimento e pedir outra moagem na torrefação." }
  ],

  diagnostico: [
    { id: "azedo", sintoma: "Azedo",
      sinais: ["Ácido agressivo, como limão verde", "Fundo salgado", "Termina rápido na boca"],
      causas: ["Extração de menos: a água não dissolveu o suficiente", "Máquina, porta-filtro ou xícara frios", "Torra muito clara para cesto pressurizado", "Pouco pó no cesto"],
      ajustes: [
        "Aqueça tudo: passe água pelo grupo com o porta-filtro encaixado e pela xícara.",
        "Deixe correr mais: suba a proporção de 1:2 para 1:2,5.",
        "Confira a dose: 16–18 g no cesto duplo.",
        "Troque por torra média ou peça na torrefação uma moagem mais fina."
      ] },
    { id: "amargo", sintoma: "Amargo",
      sinais: ["Amargor que fica na língua", "Boca seca, áspera"],
      causas: ["Extração demais: saiu o que não devia", "Torra muito escura", "Óleo velho no cesto ou no grupo"],
      ajustes: [
        "Pare antes: baixe a proporção para 1:1,5 a 1:1,8.",
        "Limpe cesto, porta-filtro e ducha. Óleo rançoso amarga qualquer café.",
        "Troque o extraforte por torra média.",
        "Se o pó for muito fino, peça um pouco mais grosso na próxima compra.",
        "Se a máquina acabou de vaporizar leite, espere um pouco antes do próximo espresso."
      ] },
    { id: "rapido", sintoma: "Rápido demais",
      sinais: ["Sai em jato em menos de 15 s", "Cor clara logo no começo", "Bebida rala"],
      causas: ["Cesto de parede simples com café já moído", "Pouco pó no cesto", "Moagem de coado, grossa para espresso"],
      ajustes: [
        "Use o cesto pressurizado: com pó comprado pronto, é ele que segura o fluxo.",
        "Aumente a dose até perto da borda: 17–18 g no duplo.",
        "Compre moído “para espresso” ou peça moagem mais fina."
      ] },
    { id: "lento", sintoma: "Lento ou só pingando",
      sinais: ["Poucas gotas por muito tempo", "Passa de 40 s sem chegar ao peso"],
      causas: ["Furinho do cesto pressurizado entupido", "Moagem fina demais para o cesto", "Pó demais ou compactado com força"],
      ajustes: [
        "Desentupa o furo do cesto pressurizado com um alfinete fino.",
        "Compacte bem de leve. No pressurizado, nivelar já basta.",
        "Tire 1 g de pó.",
        "Na próxima compra, peça moagem um pouco mais grossa, perto de cafeteira italiana."
      ] },
    { id: "aguado", sintoma: "Aguado, sem corpo",
      sinais: ["Parece chá escuro", "Some quando entra o leite"],
      causas: ["Rendimento alto demais para a dose", "Café velho, aberto há semanas"],
      ajustes: [
        "Pese a bebida e pare em 1:2 ou menos. O botão de duas xícaras pode passar do ponto.",
        "Use 17–18 g no cesto duplo.",
        "Compre pacotes menores e use em até 1–2 semanas depois de aberto."
      ] },
    { id: "sem-crema", sintoma: "Sem crema",
      sinais: ["Superfície escura e lisa, com bolhas grandes que somem"],
      causas: ["Café velho, que já perdeu o gás", "Cesto de parede simples com pó pronto"],
      ajustes: [
        "Use o cesto pressurizado e confira a data de torra do pacote.",
        "Lembre: crema fala de gás, não de sabor. Se o gosto estiver bom, está tudo certo."
      ] }
  ]
};

/* ============================== ENTENDER ============================== */

var conceitos = [
  {
    id: "torra",
    title: "O que é a torra",
    subtitle: "Do grão verde ao grão marrom",
    icon: "flame",
    blocks: [
      { type: "p", text: "O café verde é uma semente dura, com uns 10–12% de umidade e cheiro de grama. Não dá para fazer bebida boa com ele. A torra cria quase todo o sabor que você conhece." },
      { type: "roastbar" },
      { type: "h", text: "O que acontece no torrador" },
      { type: "timeline", items: [
        { label: "Secagem", text: "Até uns 150 °C a água evapora. O grão vai de verde a amarelo e cheira a pão." },
        { label: "Maillard", text: "Açúcares e aminoácidos reagem e formam centenas de aromas e a cor marrom, como na casca do pão." },
        { label: "Caramelização", text: "Acima de uns 170 °C os açúcares começam a caramelizar: mais doçura e notas de caramelo, menos açúcar livre." },
        { label: "Primeiro crack", text: "Por volta de 195–205 °C o vapor e o gás rompem a semente com um estalo, como pipoca. Torras claras param pouco depois." },
        { label: "Segundo crack", text: "Por volta de 220–230 °C a estrutura do grão se quebra de novo. Óleo sobe à superfície. Território da torra escura." }
      ] },
      { type: "p", text: "As temperaturas são do grão e variam com o equipamento. Uma torra típica de café especial dura uns 9–14 minutos." },
      { type: "h", text: "O que o grão perde e ganha" },
      { type: "spec", items: [
        { label: "Peso", value: "Perde uns 12–20%: a maior parte é água, o resto vira gás e fumaça" },
        { label: "Volume", value: "Incha, e a densidade cai" },
        { label: "Cor", value: "De verde a marrom, até quase preto" },
        { label: "Gás", value: "Acumula CO₂, que sai nas semanas seguintes" }
      ] },
      { type: "h", text: "Como a torra muda o sabor" },
      { type: "table", head: ["", "Torra clara", "Torra escura"],
        rows: [
          ["Acidez", "Alta", "Baixa"],
          ["Amargor", "Baixo", "Alto"],
          ["Notas da origem", "Aparecem", "Somem"],
          ["Corpo", "Leve", "Encorpado"]
        ] },
      { type: "p", text: "A doçura sobe até a torra média e depois cai, porque os açúcares viram amargor e carbono. O corpo cresce até a média-escura." },
      { type: "callout", tone: "info", title: "E a cafeína?",
        text: "A cafeína aguenta bem a torra. Por peso, clara e escura ficam praticamente iguais. Por colher, a escura rende um pouco menos, porque o grão é mais leve." }
    ],
    espresso: "Torra mais escura dissolve mais fácil e tende a amargar; a mais clara resiste e tende a azedar.\nPara cesto pressurizado e temperatura fixa, a torra média é o caminho mais fácil.",
    related: ["entender/niveis-torra", "entender/frescor"]
  },
  {
    id: "niveis-torra",
    title: "Níveis de torra no espresso",
    subtitle: "Clara, média, média-escura, escura",
    icon: "flame",
    blocks: [
      { type: "p", text: "Cada nível de torra pede um espresso diferente. O motivo é a solubilidade: quanto mais escura a torra, mais porosa a semente e mais fácil a água dissolver o café." },
      { type: "roastbar" },
      { type: "h", text: "Clara" },
      { type: "spec", items: [
        { label: "Sabor", value: "Ácida, frutada, floral, corpo leve" },
        { label: "Solubilidade", value: "Baixa: difícil de extrair" },
        { label: "Água", value: "Mais quente, aprox. 93–96 °C" },
        { label: "Proporção", value: "Mais longa, 1:2,2 a 1:2,5" },
        { label: "Com leite", value: "Fica ácida e some" }
      ] },
      { type: "h", text: "Média" },
      { type: "spec", items: [
        { label: "Sabor", value: "Doçura, caramelo, fruta madura" },
        { label: "Solubilidade", value: "Média" },
        { label: "Água", value: "Aprox. 90–93 °C" },
        { label: "Proporção", value: "1:2" },
        { label: "Com leite", value: "Boa, equilibrada" }
      ] },
      { type: "h", text: "Média-escura" },
      { type: "spec", items: [
        { label: "Sabor", value: "Chocolate, nozes, corpo alto" },
        { label: "Solubilidade", value: "Alta" },
        { label: "Água", value: "Aprox. 88–91 °C" },
        { label: "Proporção", value: "1:1,8 a 1:2" },
        { label: "Com leite", value: "A melhor: o café atravessa o leite" }
      ] },
      { type: "h", text: "Escura" },
      { type: "spec", items: [
        { label: "Sabor", value: "Amargo, torrado, defumado, oleoso" },
        { label: "Solubilidade", value: "Muito alta: amarga fácil" },
        { label: "Água", value: "Mais fria, aprox. 86–90 °C" },
        { label: "Proporção", value: "Mais curta, 1:1,5 a 1:2" },
        { label: "Com leite", value: "Funciona, mas cobre as notas" }
      ] },
      { type: "callout", tone: "info", title: "Na Bambino você não escolhe a temperatura",
        text: "A temperatura é fixa. As faixas acima são referência; o que você ajusta é proporção, dose e aquecimento, como explicado abaixo." },
      { type: "h", text: "O que fazer em vez disso" },
      { type: "compare", items: [
        { label: "Torra clara", text: "Aqueça muito bem grupo, porta-filtro e xícara. Use proporção mais longa. No cesto pressurizado, prefira não começar por ela." },
        { label: "Torra escura", text: "Encurte a proporção para 1:1,5 a 1:1,8. Pare cedo: o fim da extração é onde mora o amargor." }
      ] }
    ],
    espresso: "Comece por torra média ou média-escura: combina com a temperatura fixa da Bambino e com o cesto pressurizado.\nPara bebidas com leite, a média-escura é a mais segura.",
    related: ["entender/temperatura", "entender/torra", "preparar/ratio"]
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
    subtitle: "Calor acelera a extração",
    icon: "thermometer",
    blocks: [
      { type: "p", text: "Água mais quente dissolve mais rápido. Isso vale para os bons compostos e para os amargos. A temperatura é um acelerador da extração." },
      { type: "range", label: "Água do espresso por torra (aprox.)", min: 80, max: 100, unit: "°C", low: 86, high: 96,
        markers: [ { value: 88, label: "Escura" }, { value: 91.5, label: "Média" }, { value: 94.5, label: "Clara" } ] },
      { type: "table", head: ["Torra", "Temperatura aprox."],
        rows: [
          ["Clara", "93–96 °C"],
          ["Média", "90–93 °C"],
          ["Escura", "86–90 °C"]
        ],
        caption: "Faixas de referência. A indústria de café especial usa 90–96 °C como faixa geral." },
      { type: "h", text: "Por que a torra muda a temperatura" },
      { type: "p", text: "Torra clara é densa e pouco solúvel: precisa de mais calor para extrair doçura. Torra escura é porosa e solta amargor fácil: calor demais exagera isso." },
      { type: "h", text: "Como a Bambino controla a temperatura" },
      { type: "p", text: "A Bambino aquece a água na hora num bloco térmico e usa controle PID, que mantém a temperatura estável. Ela é fixa: não há ajuste no painel." },
      { type: "callout", tone: "info", title: "Na Bambino a temperatura é fixa",
        text: "Mexa no que está ao seu alcance: aquecimento dos acessórios, proporção e escolha da torra." },
      { type: "steps", items: [
        { title: "Purgue o grupo", text: "Antes de colocar o pó, passe 2–3 s de água pelo grupo. Isso estabiliza a temperatura." },
        { title: "Aqueça o porta-filtro", text: "Um porta-filtro frio rouba vários graus. Deixe-o encaixado na máquina enquanto ela liga e passe água por ele." },
        { title: "Aqueça a xícara", text: "Encha com água quente da chaleira ou passe água da máquina e descarte." },
        { title: "Compense na proporção", text: "Torra clara: um pouco mais longa. Torra escura: mais curta." },
        { title: "Café antes do leite", text: "Logo depois do vapor, a máquina está mais quente que o normal. Tire o espresso primeiro." }
      ] }
    ],
    espresso: "Como a temperatura da Bambino é fixa, aquecer bem porta-filtro e xícara faz diferença real.\nEscolher torra média ou média-escura evita brigar com uma temperatura que você não controla.",
    related: ["entender/niveis-torra", "entender/agua"]
  },
  {
    id: "processos",
    title: "Processos pós-colheita",
    subtitle: "Como a fruta vira grão",
    icon: "leaf",
    blocks: [
      { type: "p", text: "Café é a semente de uma fruta, a cereja. Entre a colheita e o grão seco, o produtor decide quanto da fruta fica grudado na semente durante a secagem." },
      { type: "cherry" },
      { type: "p", text: "De fora para dentro: casca, polpa, mucilagem (a camada pegajosa e doce), pergaminho, película prateada e o grão. Normalmente são duas sementes por fruta." },
      { type: "h", text: "Lavado" },
      { type: "p", text: "A casca e a polpa são retiradas. A mucilagem fermenta em tanques por umas 12–48 horas e é lavada; o grão seca no pergaminho até uns 11% de umidade." },
      { type: "h", text: "Natural" },
      { type: "p", text: "A cereja inteira seca ao sol, em terreiro ou mesa suspensa, por umas 2–4 semanas. É o processo tradicional do Brasil." },
      { type: "h", text: "Cereja descascado (CD) e honey" },
      { type: "p", text: "Só a casca é retirada; a mucilagem fica e seca junto. No Brasil, o nome é cereja descascado. Na América Central, honey, graduado pela mucilagem que fica." },
      { type: "h", text: "Desmucilado ou semi-lavado" },
      { type: "p", text: "Casca e mucilagem são retiradas por atrito, numa máquina, sem tanque de fermentação. No Brasil, também se diz semi-lavado." },
      { type: "h", text: "Wet-hulled (giling basah)" },
      { type: "p", text: "Típico de Sumatra, na Indonésia. O pergaminho é retirado com o grão ainda bem úmido, e a secagem termina sem essa proteção." },
      { type: "callout", tone: "info", title: "Semi-lavado tem dois sentidos",
        text: "Em inglês, “semi-washed” às vezes descreve o wet-hulled indonésio. No Brasil, semi-lavado é o desmucilado. São processos diferentes." },
      { type: "h", text: "Anaeróbico e fermentações" },
      { type: "p", text: "Cerejas ou mucilagem fermentam em tanques fechados, sem oxigênio, por tempo controlado. Alguns produtores adicionam leveduras selecionadas." },
      { type: "h", text: "O que cada um faz na xícara" },
      { type: "table", head: ["Processo", "Perfil típico"],
        rows: [
          ["Lavado", "Limpo, acidez viva"],
          ["Desmucilado", "Limpo, pouco mais corpo"],
          ["Cereja descascado", "Doce, corpo médio"],
          ["Natural", "Frutado, muito corpo"],
          ["Wet-hulled", "Terroso, corpo pesado"],
          ["Anaeróbico", "Exuberante: vinho, fruta"]
        ],
        caption: "Tendências. Variedade, região e torra também pesam." }
    ],
    espresso: "Natural e cereja descascado dão espressos de mais corpo e doçura, ótimos com leite.\nLavados dão espressos mais limpos e ácidos, melhores puros. Fermentados podem surpreender ou cansar.",
    related: ["entender/regioes-brasil", "entender/sabor"]
  },
  {
    id: "regioes",
    title: "Regiões do mundo",
    subtitle: "Onde o café cresce e como ele é",
    icon: "globe",
    blocks: [
      { type: "p", text: "Café cresce no cinturão entre os trópicos, mais ou menos de 25° N a 25° S. Altitude, clima, variedade e processo dão a cada região um sotaque." },
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
      { type: "callout", tone: "tip", title: "Brasil tem página própria",
        text: "Cerrado, Sul de Minas, Mogiana, Chapada Diamantina, Espírito Santo e o conilon estão em Regiões do Brasil." },
      { type: "h", text: "América do Sul" },
      { type: "region", id: "colombia", name: "Colômbia", country: "Colômbia", altitude: "1.200–2.000 m", process: "Lavado",
        notes: ["Caramelo", "Frutas vermelhas", "Cítrico"],
        espresso: "Versátil: doce e ácido na medida, puro ou com leite." },
      { type: "region", id: "peru", name: "Peru", country: "Peru", altitude: "1.200–2.000 m", process: "Lavado",
        notes: ["Chocolate", "Nozes"],
        espresso: "Macio e fácil, com acidez suave." },
      { type: "h", id: "america-central", text: "América Central" },
      { type: "region", id: "guatemala", name: "Guatemala", country: "Guatemala", altitude: "1.300–2.000 m", process: "Lavado",
        notes: ["Chocolate", "Especiarias", "Maçã"],
        espresso: "Encorpado e achocolatado, com acidez limpa." },
      { type: "region", id: "costa-rica", name: "Costa Rica", country: "Costa Rica", altitude: "1.200–1.900 m", process: "Lavado e honey",
        notes: ["Mel", "Cítrico"],
        espresso: "Brilhante e doce. Os honey ganham corpo." },
      { type: "region", id: "honduras", name: "Honduras", country: "Honduras", altitude: "1.000–1.700 m", process: "Lavado",
        notes: ["Caramelo", "Frutas de caroço"],
        espresso: "Suave e doce, bom para o dia a dia." },
      { type: "h", id: "africa", text: "África e Arábia" },
      { type: "region", id: "etiopia", name: "Etiópia", country: "Etiópia", altitude: "1.500–2.200 m", process: "Lavado e natural",
        notes: ["Lavado: jasmim, bergamota", "Natural: mirtilo, morango"],
        espresso: "Muito aromático e ácido. Peça torra média e use proporção um pouco mais longa." },
      { type: "region", id: "quenia", name: "Quênia", country: "Quênia", altitude: "1.400–2.000 m", process: "Lavado",
        notes: ["Cassis", "Toranja", "Acidez suculenta"],
        espresso: "Explosivo e ácido. Difícil no cesto pressurizado." },
      { type: "region", id: "ruanda-burundi", name: "Ruanda e Burundi", country: "Ruanda e Burundi", altitude: "1.500–2.000 m", process: "Lavado",
        notes: ["Frutas vermelhas", "Chá preto"],
        espresso: "Delicado e frutado, melhor puro." },
      { type: "region", id: "iemen", name: "Iêmen", country: "Iêmen", altitude: "1.500–2.500 m", process: "Natural, seco em terraços",
        notes: ["Frutas secas", "Vinho", "Especiarias", "Chocolate"],
        espresso: "Complexo e raro. Caro para o dia a dia." },
      { type: "h", id: "asia", text: "Ásia" },
      { type: "region", id: "sumatra", name: "Sumatra", country: "Indonésia", altitude: "1.100–1.500 m", process: "Wet-hulled (giling basah)",
        notes: ["Terroso", "Ervas", "Cedro"],
        espresso: "Corpo pesado e pouca acidez. Aparece em blends para dar peso." }
    ],
    espresso: "Para começar no cesto pressurizado, cafés brasileiros de torra média são o caminho mais fácil.\nAfricanos lavados, ácidos e aromáticos, brilham mais quando você tiver moedor.",
    related: ["entender/regioes-brasil", "entender/processos"]
  },
  {
    id: "regioes-brasil",
    title: "Regiões do Brasil",
    subtitle: "Arábica, conilon e onde crescem",
    icon: "map",
    blocks: [
      { type: "p", text: "O Brasil é o maior produtor do mundo, com cerca de um terço do café. Planta arábica em altitude e conilon em áreas baixas e quentes." },
      { type: "region", id: "cerrado-mineiro", name: "Cerrado Mineiro", country: "Brasil (MG)", altitude: "800–1.300 m", process: "Natural e cereja descascado",
        notes: ["Chocolate", "Caramelo", "Nozes"],
        espresso: "Encorpado e doce, fácil de acertar. Ótimo com leite." },
      { type: "region", id: "sul-de-minas", name: "Sul de Minas e Mantiqueira", country: "Brasil (MG)", altitude: "900–1.400 m", process: "Natural e cereja descascado",
        notes: ["Chocolate ao leite", "Frutas amarelas"],
        espresso: "Equilibrado, com um pouco mais de acidez que o Cerrado." },
      { type: "region", id: "mogiana", name: "Mogiana", country: "Brasil (SP e MG)", altitude: "900–1.200 m", process: "Natural",
        notes: ["Chocolate", "Rapadura", "Corpo alto"],
        espresso: "Doce e redondo, clássico de blend para espresso." },
      { type: "region", id: "chapada-diamantina", name: "Chapada Diamantina", country: "Brasil (BA)", altitude: "1.000–1.400 m", process: "Natural, CD e fermentados",
        notes: ["Frutas vermelhas", "Floral", "Mel", "Complexo"],
        espresso: "Mais frutado e vivo. Melhor puro do que com leite." },
      { type: "region", id: "espirito-santo", name: "Espírito Santo", country: "Brasil (ES)", altitude: "Conilon até ~500 m; arábica 700–1.300 m", process: "Conilon natural; arábica natural, CD e lavado",
        notes: ["Conilon: cacau, castanha", "Arábica de montanha: frutas, floral"],
        espresso: "O conilon dá crema e corpo em blends. O arábica das montanhas e do Caparaó ganha concursos." },
      { type: "callout", tone: "info", title: "Rondônia",
        text: "Os Robustas Amazônicos de Rondônia têm indicação geográfica própria e mostram que a canéfora bem processada pode ser café especial." },
      { type: "h", text: "Arábica e robusta" },
      { type: "p", text: "Quase todo café vem de duas espécies: Coffea arabica e Coffea canephora. A canéfora tem as variedades robusta e conilon, nome mais usado no Brasil." },
      { type: "table", head: ["", "Arábica", "Robusta/conilon"],
        rows: [
          ["Cafeína", "~1,2–1,5%", "~2,2–2,7%"],
          ["Altitude", "Média a alta", "Baixa"],
          ["Sabor", "Ácido, aromático", "Corpo, cacau, amargor"],
          ["Crema", "Média", "Farta"]
        ],
        caption: "Valores típicos. Variam com variedade e cultivo." },
      { type: "p", text: "Conilon de baixa qualidade deu má fama à espécie. Bem cultivado e processado, ele rende espressos densos e achocolatados." }
    ],
    espresso: "Um brasileiro natural ou cereja descascado de torra média é a escolha mais segura para o cesto pressurizado: doce, encorpado e pouco ácido.\nUm toque de conilon no blend reforça corpo e crema.",
    related: ["entender/regioes", "entender/processos"]
  },
  {
    id: "frescor",
    title: "Frescor e descanso",
    subtitle: "Gás, data de torra e como guardar",
    icon: "clock",
    blocks: [
      { type: "p", text: "A torra enche o grão de CO₂. Nos dias seguintes, esse gás vai saindo. Isso explica por que café recém-torrado e café velho dão espressos ruins." },
      { type: "h", text: "Para quem compra pó (seu caso agora)" },
      { type: "spec", items: [
        { label: "Olhe", value: "A data de torra, não a validade" },
        { label: "Compre", value: "Pacotes de 250 g" },
        { label: "Use", value: "Em até 1–2 semanas depois de aberto" },
        { label: "Guarde", value: "Pote vedado e opaco, no armário" }
      ] },
      { type: "p", text: "Moído, o café expõe muito mais superfície ao ar. O aroma vai embora em dias, não em semanas." },
      { type: "h", text: "Para café em grão" },
      { type: "timeline", items: [
        { label: "Dias 0–3", text: "Muito gás. O espresso sai irregular, com bolhas grandes e sabor áspero." },
        { label: "Dias 4–7", text: "Torras escuras já ficam boas." },
        { label: "Dias 7–21", text: "Melhor janela para a maioria das torras médias e claras no espresso." },
        { label: "Semanas 4–6", text: "Ainda bom em embalagem fechada com válvula. Crema diminui." },
        { label: "Depois", text: "Aroma fraco, sabor de papelão. Melhor usar no coado ou no leite." }
      ] },
      { type: "p", text: "Torras claras pedem mais descanso, às vezes 2–3 semanas. Escuras, menos. A válvula do pacote deixa o gás sair sem deixar o ar entrar." },
      { type: "h", text: "Onde guardar" },
      { type: "compare", items: [
        { label: "Armário", text: "Para o consumo da semana. Pote hermético e opaco, longe do fogão e do sol." },
        { label: "Freezer", text: "Bom para estoque longo, em porções bem vedadas. Tire uma porção por vez e deixe chegar à temperatura ambiente antes de abrir." },
        { label: "Geladeira", text: "A pior opção: umidade, condensação e cheiro de comida." }
      ] },
      { type: "callout", tone: "tip", title: "Clima brasileiro",
        text: "Calor e umidade aceleram a perda de frescor. Em cidades quentes, compre ainda menos por vez." }
    ],
    espresso: "Café velho perde gás e aroma: o espresso sai sem crema, ralo e com gosto de papelão.\nPó fresco, usado em até duas semanas, vale mais que qualquer ajuste fino.",
    related: ["comecar/crema", "comecar/sem-moedor"]
  }
];

var pratica = [
  {
    id: "sabor",
    title: "Sabor e notas",
    subtitle: "Como provar e do que falar",
    icon: "nose",
    blocks: [
      { type: "p", text: "Provar café é separar o que a língua sente do que o nariz sente. A língua capta gostos básicos; o nariz, por dentro da boca, capta os aromas que viram “notas”." },
      { type: "h", text: "Os quatro eixos" },
      { type: "spec", items: [
        { label: "Acidez", value: "Vivacidade, como fruta. Boa quando é doce; ruim quando é azeda" },
        { label: "Doçura", value: "Sensação de açúcar, de caramelo, de fruta madura" },
        { label: "Amargor", value: "Normal em pequena dose, como no chocolate amargo" },
        { label: "Corpo", value: "Peso e textura na boca, de chá a xarope" }
      ] },
      { type: "h", text: "Dois exemplos" },
      { type: "p", text: "Os mesmos eixos descrevem cafés bem diferentes. Compare um brasileiro natural de torra média com um queniano lavado de torra clara." },
      { type: "table", head: ["", "Cerrado natural", "Quênia lavado"],
        rows: [
          ["Acidez", "Baixa", "Alta"],
          ["Doçura", "Alta", "Média"],
          ["Amargor", "Médio", "Baixo"],
          ["Corpo", "Denso", "Leve"]
        ],
        caption: "Cerrado natural de torra média e Quênia lavado de torra clara." },
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
        caption: "Uma roda de sabores simplificada. Notas descrevem semelhança, não ingrediente adicionado." },
      { type: "h", text: "Como provar" },
      { type: "steps", items: [
        { title: "Cheire", text: "Antes do primeiro gole, aproxime o nariz da xícara." },
        { title: "Espere um pouco", text: "Muito quente, a língua não percebe nada. Uns minutos depois, a doçura e a acidez aparecem." },
        { title: "Puxe com ar", text: "Sorver com um pouco de ar espalha a bebida e leva aroma ao nariz por dentro." },
        { title: "Preste atenção ao final", text: "Depois de engolir, o gosto fica doce, limpo, amargo ou seco?" },
        { title: "Compare", text: "Dois cafés lado a lado ensinam mais que dez provados em dias diferentes." }
      ] },
      { type: "callout", tone: "info", title: "Azedo não é ácido",
        text: "Acidez boa lembra fruta e vem com doçura. Azedo é áspero, ralo e salgado no fundo, e geralmente indica extração de menos." }
    ],
    espresso: "No espresso tudo fica concentrado: a acidez parece mais forte e o amargor também.\nProvar com atenção é o que diz se o próximo ajuste é parar antes ou deixar correr.",
    related: ["preparar/diagnostico", "entender/processos"]
  },
  {
    id: "mitos",
    title: "Mitos comuns",
    subtitle: "O que se repete e o que é verdade",
    icon: "quiz",
    blocks: [
      { type: "p", text: "Muito do que se diz sobre café veio de propaganda ou de café ruim. Estes são os mais comuns." },
      { type: "myth", myth: "Crema grossa é sinal de café de qualidade.",
        truth: "Crema mostra gás e frescor. Robusta, torra escura e cesto pressurizado aumentam a crema sem melhorar o sabor." },
      { type: "myth", myth: "Torra escura tem mais cafeína.",
        truth: "Por peso, a cafeína é praticamente igual. Medida em colher, a escura tem um pouco menos. A espécie e a dose pesam muito mais." },
      { type: "myth", myth: "Café bom se faz com água fervendo.",
        truth: "A 100 °C a extração exagera o amargor. Espresso usa água por volta de 86–96 °C, conforme a torra." },
      { type: "myth", myth: "Café brasileiro é sempre forte e amargo.",
        truth: "O amargor vem de torra muito escura e grão comum. O Brasil produz cafés doces, frutados e florais." },
      { type: "myth", myth: "Geladeira conserva o café.",
        truth: "A geladeira traz umidade e cheiro de comida. Armário para o dia a dia; freezer só em porções bem vedadas." },
      { type: "myth", myth: "Freezer estraga o café.",
        truth: "Bem vedado e em porções, o freezer conserva bem. O problema é abrir frio: deixe chegar à temperatura ambiente antes." },
      { type: "myth", myth: "Espresso tem mais cafeína que café coado.",
        truth: "Por mililitro, sim. Por xícara, nem sempre: um espresso simples tem uns 60–100 mg e uma caneca de coado pode passar de 100 mg." },
      { type: "myth", myth: "Existe grão de espresso.",
        truth: "Espresso é método. “Para espresso” no pacote indica só uma torra e uma moagem pensadas para ele." },
      { type: "myth", myth: "Arábica é sempre melhor que robusta.",
        truth: "Arábica ruim existe, e conilon bem feito também. O resultado depende de cultivo, colheita e processo." },
      { type: "myth", myth: "Quanto mais pressão, melhor: 15 bar é melhor que 9.",
        truth: "15 bar é o máximo da bomba. O espresso clássico é feito por volta de 9 bar no café." },
      { type: "myth", myth: "Descafeinado não tem cafeína.",
        truth: "Tem pouca. O processo retira 97% ou mais, mas sobram alguns miligramas por xícara." },
      { type: "myth", myth: "Compactar com toda a força faz espresso melhor.",
        truth: "Constância importa mais que força. No cesto pressurizado, basta nivelar e compactar de leve." }
    ],
    espresso: "Quase todos esses mitos levam ao mesmo erro: julgar o espresso pela aparência ou pela força.\nO que decide é o gosto na xícara, ajustado com dose, proporção e café fresco.",
    related: ["comecar/crema", "entender/frescor"]
  },
  {
    id: "glossario",
    title: "Glossário",
    subtitle: "Os termos que você vai ouvir",
    icon: "book",
    blocks: [
      { type: "glossary", items: [
        { id: "acidez", termo: "Acidez", def: "Vivacidade agradável que lembra fruta. Diferente de azedo, que é sinal de extração de menos." },
        { id: "adstringencia", termo: "Adstringência", def: "Sensação de boca seca, como de chá forte ou banana verde. Aparece no fim de extrações longas." },
        { id: "aeracao", termo: "Aeração", def: "Fase em que o bico de vapor injeta ar no leite para criar espuma." },
        { id: "arabica", termo: "Arábica", def: "Coffea arabica, a espécie mais plantada. Mais aromática e ácida, com menos cafeína." },
        { id: "bandeja", termo: "Bandeja", def: "A grade com reservatório sob o grupo, que recolhe água e respingos." },
        { id: "bar", termo: "Bar", def: "Unidade de pressão. 1 bar é a pressão do ar ao nível do mar; o espresso usa cerca de 9." },
        { id: "blend", termo: "Blend", def: "Mistura de cafés de origens diferentes, montada para um perfil de sabor." },
        { id: "borra", termo: "Borra", def: "O pó já usado que sobra no cesto, em forma de pastilha." },
        { id: "cafe-especial", termo: "Café especial", def: "Café avaliado por provadores com pelo menos 80 pontos numa escala de 100, sem defeitos graves." },
        { id: "canalizacao", termo: "Canalização", def: "Quando a água acha um atalho no pó e passa por ali. Parte do café extrai demais e parte de menos." },
        { id: "cereja", termo: "Cereja", def: "O fruto do cafeeiro. Normalmente tem duas sementes, que são os grãos." },
        { id: "cereja-descascado", termo: "Cereja descascado", def: "Processo em que se tira a casca e o grão seca com a mucilagem. Parente do honey." },
        { id: "cesto", termo: "Cesto", def: "Peça de metal com furos que vai no porta-filtro e segura o pó. Na Bambino, tem 54 mm." },
        { id: "cesto-pressurizado", termo: "Cesto pressurizado", def: "Cesto de parede dupla com um único furo de saída, que cria pressão sem depender da moagem." },
        { id: "compactador", termo: "Compactador", def: "Também chamado de tamper. Pressiona o pó no cesto para formar uma pastilha uniforme." },
        { id: "conilon", termo: "Conilon", def: "Variedade de Coffea canephora muito plantada no Brasil, sobretudo no Espírito Santo e em Rondônia." },
        { id: "corpo", termo: "Corpo", def: "Peso e textura da bebida na boca." },
        { id: "crema", termo: "Crema", def: "Espuma dourada do espresso, feita de CO₂, óleos e melanoidinas." },
        { id: "descalcificacao", termo: "Descalcificação", def: "Limpeza com ácido que remove o calcário deixado pela água dentro da máquina." },
        { id: "desmucilado", termo: "Desmucilado", def: "Processo em que a mucilagem é removida por máquina, sem tanque de fermentação. Também chamado de semi-lavado." },
        { id: "docura", termo: "Doçura", def: "Sensação de açúcar que um café bem extraído tem mesmo sem açúcar." },
        { id: "doppio", termo: "Doppio", def: "Espresso duplo: o dobro de pó e o dobro de bebida." },
        { id: "dose", termo: "Dose", def: "Peso do pó no cesto, em gramas." },
        { id: "ducha", termo: "Ducha", def: "A tela de metal do grupo que espalha a água sobre o pó." },
        { id: "espresso", termo: "Espresso", def: "Método de preparo com água quente sob cerca de 9 bar, atravessando café moído fino." },
        { id: "expresso", termo: "Expresso", def: "Grafia mais comum no Brasil para o mesmo café. Este app usa “espresso”, a forma italiana adotada no café especial." },
        { id: "extracao", termo: "Extração", def: "Quanto do café a água dissolveu. De menos fica azedo; demais fica amargo." },
        { id: "finalizacao", termo: "Finalização", def: "O gosto que fica depois de engolir. Também chamada de retrogosto." },
        { id: "grupo", termo: "Grupo", def: "A parte da máquina onde o porta-filtro encaixa e de onde sai a água." },
        { id: "honey", termo: "Honey", def: "Nome centro-americano para secar o grão com mucilagem. Pode ser white, yellow, red ou black, conforme quanto dela fica." },
        { id: "jarra", termo: "Jarra", def: "Também chamada de pitcher. Jarra de inox com bico, usada para vaporizar e despejar o leite." },
        { id: "latte-art", termo: "Latte art", def: "Desenhos feitos ao despejar microespuma sobre o espresso." },
        { id: "lavado", termo: "Lavado", def: "Processo em que a mucilagem fermenta e é lavada antes da secagem. Dá cafés limpos e ácidos." },
        { id: "lungo", termo: "Lungo", def: "Espresso longo, com proporção perto de 1:2,5 a 1:3." },
        { id: "microespuma", termo: "Microespuma", def: "Leite vaporizado com bolhas invisíveis, liso e brilhante." },
        { id: "moedor-de-mos", termo: "Moedor de mós", def: "Moedor que esmaga o grão entre duas peças ajustáveis, gerando pó uniforme." },
        { id: "mucilagem", termo: "Mucilagem", def: "Camada pegajosa e açucarada entre a polpa e o pergaminho." },
        { id: "natural", termo: "Natural", def: "Processo em que a cereja seca inteira. Dá mais corpo e notas frutadas." },
        { id: "pergaminho", termo: "Pergaminho", def: "Película dura que envolve o grão dentro da cereja." },
        { id: "pid", termo: "PID", def: "Tipo de controle eletrônico que mantém a temperatura estável, corrigindo o aquecimento o tempo todo." },
        { id: "porta-filtro", termo: "Porta-filtro", def: "A peça com cabo que segura o cesto e encaixa no grupo." },
        { id: "pre-infusao", termo: "Pré-infusão", def: "Molhar o pó com pouca pressão antes da extração, para ele assentar por igual." },
        { id: "primeiro-crack", termo: "Primeiro crack", def: "Estalo do grão na torra, por volta de 195–205 °C. Marca o início das torras claras." },
        { id: "proporcao", termo: "Proporção", def: "Peso da bebida dividido pelo peso do pó. 1:2 quer dizer o dobro." },
        { id: "purga", termo: "Purga", def: "Soltar água ou vapor por alguns segundos para limpar e estabilizar o grupo ou o bico." },
        { id: "rendimento", termo: "Rendimento", def: "Peso da bebida que sai na xícara, em gramas." },
        { id: "ristretto", termo: "Ristretto", def: "Espresso curto, com proporção de 1:1 a 1:1,5." },
        { id: "robusta", termo: "Robusta", def: "Variedade de Coffea canephora. Mais cafeína, mais corpo e menos acidez que o arábica." },
        { id: "shot", termo: "Shot", def: "Cada espresso tirado. Usado no dia a dia das cafeterias." },
        { id: "tds", termo: "TDS", def: "Sólidos dissolvidos totais. Na água, indica minerais; na bebida, indica concentração." },
        { id: "torra", termo: "Torra", def: "Aquecimento do grão verde que cria cor, aroma e sabor." },
        { id: "torrefacao", termo: "Torrefação", def: "Empresa ou lugar que torra café. Muitas moem na hora, sob encomenda." },
        { id: "vaporizador", termo: "Vaporizador", def: "O bico de vapor da máquina, usado para aquecer e texturizar o leite." },
        { id: "wdt", termo: "WDT", def: "Técnica de mexer o pó com agulhas finas para desfazer grumos. Útil quando tiver moedor." },
        { id: "wet-hulled", termo: "Wet-hulled", def: "Processo indonésio, ou giling basah, em que o pergaminho sai com o grão úmido. Dá corpo pesado e notas terrosas." }
      ] }
    ],
    espresso: "Saber o nome das coisas ajuda a ler embalagens e a perguntar na torrefação.\n“Torra média, natural, moído para cesto pressurizado” já diz quase tudo o que você precisa.",
    related: ["entender/sabor", "comecar/o-que-e-espresso"]
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
