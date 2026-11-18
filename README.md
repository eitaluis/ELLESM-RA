# Ellesméra — floresta viva

**Versão de produção: V29 — arquitetura viva canônica, navegação otimizada e pontos de inspeção.**

Reconstrução 3D explorável de Ellesméra, em Three.js. A descrição literária é a base da escala da floresta; as formas de arquitetura são interpretações visuais construídas para esta versão.

## Estrutura do projeto

- `index.html`: interface, HUD e carregamento sequencial
- `css/style.css`: apresentação da interface
- `js/00–07`: iluminação, terreno, caminhos, floresta, arquitetura, Menoa, minimapa e jogador
- `js/08-forest-life.js`: aves em voo e folhas levadas pelo vento

## Direção de arte

- **Cânone de Ellesméra:** a cidade é uma floresta habitada, não uma cidade de castelos de pedra. Os edifícios nascem dos pinheiros e das plantas, moldados por canções na língua antiga.
- **Casa de dois andares:** volume hexagonal, pavimento superior menor, seis nervuras estruturais, paredes e cobertura de madeira entrelaçada, janelas coloridas e porta recuada sob arco simbólico.
- **Casa alta:** edifício leve de cinco níveis entre três pinheiros, unidos por ramos curvos que funcionam como contrafortes.
- **Tialdarí:** residência ancestral da família real, concebida aqui como um conjunto de madeira viva e jardins; a forma detalhada é uma interpretação arquitetônica, não uma descrição literal completa.
- **Sala do Trono:** salão de árvores, teto de ramos em colmeia, vinte e quatro assentos e pavilhão branco sobre um trono de raízes nodosas.
- **Pontes:** arcos em planta e elevação, tabuleiro contínuo, guarda-corpos laterais e elementos estruturais abaixo da passagem — nunca atravessando o piso livre.
- **Regra visual:** nenhum edifício genérico, esfera decorativa ou castelo de pedra deve ser usado para preencher um ponto do mapa. Cada local precisa ter uma silhueta identificável e uma função legível.
- **Vida da floresta:** aves pequenas cruzam as regiões altas e folhas soltas derivam em alturas variadas; a animação é discreta para preservar a leitura da arquitetura.
- **Interiores:** mobiliário de madeira, tecidos, louças, camas, mesas e estantes ficam posicionados nos anéis habitáveis, preservando a circulação ao redor dos troncos.

## Fases do projeto

- [x] Floresta procedural, relevo, solo, vegetação densa e navegação básica
- [x] Menoa monumental, raízes e integração ao terreno
- [x] Moradias exploráveis no solo e em três níveis de copa
- [x] Escadas espirais protegidas e rede de pontes arqueadas com circulação livre
- [x] Praça comunitária suspensa no nível superior da floresta
- [x] Moradias hexagonais e cobertura com seis nervuras estruturais
- [x] Sala do Trono refeita como salão de árvores, com pavilhão e trono de raízes
- [x] Tialdarí reconstruída como residência ancestral de cinco níveis, ligada por escadas e passarelas
- [x] Crags reconstruídos como penhasco rochoso com clareira no topo
- [x] Mobiliário interno nas moradias: mesas, bancos, estantes, camas, baús e peças de uso cotidiano
- [x] Áreas coletivas ampliadas: refeição comunal, alvos e armas de treino, cochos, feno e arreios nos estábulos
- [x] Vida silvestre em movimento: aves planando entre as copas e folhas carregadas pelo vento
- [x] Paisagem sonora real de floresta, com gravação de campo em domínio público
- [x] Otimização da malha do terreno, densidade de folhas, Menoa e vegetação rasteira
- [x] Índice espacial de pontes e escadas para cálculos de piso e colisão localizados
- [x] Teleporte direto para a fachada de uma moradia no terceiro nível da copa
- [ ] Revisão visual em navegador e ajuste fino após exploração

## Áudio ambiente

A tecla **O** liga e desliga a gravação de campo [“20090610 0 ambience.ogg”](https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg), registrada por nille em uma pequena mata. O arquivo tem cerca de 2 minutos e 3 segundos e foi dedicado ao domínio público pelo autor. A descrição original menciona vento nas árvores e sons de aves e insetos. A reprodução inicia após o clique de entrada no mundo e repete em loop.

## Controles de exploração

- **WASD:** mover; **Shift:** correr; **Espaço:** pular
- **H:** núcleo da cidade; **J:** base da escada principal; **G:** Menoa
- **K:** teletransportar para a frente de uma moradia no terceiro nível da copa
- **M/N:** percorrer os pontos; **Tab:** minimapa; **O:** áudio ambiente

## Desempenho

A V29 reduz a quantidade de folhas geométricas por árvore sem deixar os ramos principais sem cobertura, diminui as instâncias de vegetação rasteira e simplifica a malha do terreno. O renderer usa escala de pixel limitada a 0,84. Os segmentos de pontes e escadas são indexados espacialmente, evitando percorrer toda a rede a cada quadro.

## Desenvolvimento

Os módulos são carregados em sequência porque compartilham funções e variáveis globais. Three.js 0.160.0 é carregado via CDN. Execute pelo GitHub Pages ou por um servidor HTTP; abrir diretamente com `file://` pode bloquear recursos do navegador.

A validação sintática dos módulos não substitui a inspeção visual no navegador. Cada fase precisa ser explorada em primeira pessoa e ajustada a partir do resultado renderizado. O carregador agora exibe um aviso caso um módulo não possa ser carregado; consulte o console do navegador (F12) para identificar o arquivo.
