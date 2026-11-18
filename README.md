# Ellesméra — floresta viva

**Versão de produção: V30 — arquitetura viva canônica, navegação otimizada e pontos de inspeção.**

Reconstrução 3D explorável de Ellesméra, em Three.js. A descrição literária é a base da escala da floresta; as formas de arquitetura são interpretações visuais construídas para esta versão.

## Estrutura do projeto

- `index.html`: interface, HUD e carregamento sequencial
- `css/style.css`: apresentação da interface
- `js/00–08`: iluminação, terreno, caminhos, floresta, arquitetura, Menoa, minimapa, jogador e vida da floresta
- `js/08-forest-life.js`: aves em voo e folhas levadas pelo vento

## Direção de arte

- **Cânone de Ellesméra:** a cidade é uma floresta habitada, não uma cidade de castelos de pedra. Os edifícios nascem dos pinheiros e das plantas, moldados por canções na língua antiga.
- **Casa de dois andares:** volume hexagonal, pavimento superior menor, seis nervuras estruturais, paredes e cobertura de madeira entrelaçada, janelas coloridas e porta recuada sob arco simbólico.
- **Casa alta:** edifício leve de cinco níveis entre três pinheiros, unidos por ramos curvos que funcionam como contrafortes.
- **Tialdarí Hall:** conjunto ancestral da família de Arya, reinterpretado em madeira viva como sala comum, sala de estar coberta de trepadeiras, quarto, escritório e jardins. O texto nomeia os ambientes, mas não fixa uma fachada externa única.
- **Casa de cinco níveis:** construída em outro setor, entre três pinheiros unidos por contrafortes de ramos curvos; não é identificada como Tialdarí Hall.
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
- [x] Árvore dos Cavaleiros com dois níveis hexagonais, escada e ramos de sustentação
- [x] Caramanchão de salgueiro e corniso em arcos trançados com galhas luminosas
- [x] Forja aberta sob cobertura de ramos vivos, com núcleo de pedra e bigorna
- [x] Sala do Trono refeita como salão de árvores, com pavilhão e trono de raízes
- [x] Tialdarí reconstruída como conjunto ancestral com sala comum, sala de estar, quarto, escritório e jardins
- [x] Casa de cinco níveis separada, sustentada por três pinheiros e contrafortes vivos
- [x] Crags reconstruídos como penhasco rochoso com clareira no topo
- [x] Mobiliário interno nas moradias: mesas, bancos, estantes, camas, baús e peças de uso cotidiano
- [x] Áreas coletivas ampliadas: refeição comunal, alvos e armas de treino, cochos, feno e arreios nos estábulos
- [x] Cabana de Oromis com volume hexagonal de madeira viva, cobertura trançada e interior mobiliado
- [x] Estábulos com três baias, cobertura arqueada contínua, divisórias e corredores de acesso
- [x] Toco branco com casca irregular, fibras, anéis de crescimento e raízes expostas
- [x] Escada da Árvore dos Cavaleiros agrupada em malhas instanciadas para reduzir chamadas de renderização
- [x] Vida silvestre em movimento: aves planando entre as copas e folhas carregadas pelo vento
- [x] Paisagem sonora real de floresta, com gravação de campo em domínio público
- [x] Otimização da malha do terreno, densidade de folhas, Menoa e vegetação rasteira
- [x] Índice espacial de pontes e escadas para cálculos de piso e colisão localizados
- [x] Instanciamento de árvores por setores para descarte de áreas fora da câmera
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

A V30 mantém as otimizações de vegetação e terreno da versão anterior, agrupa os degraus da Árvore dos Cavaleiros em instâncias e melhora a legibilidade arquitetônica da cabana, dos estábulos e do toco branco. O renderer usa escala de pixel limitada a 0,84. As árvores são agrupadas em setores de 620 m para permitir descarte por câmera; os segmentos de pontes e escadas também são indexados espacialmente, evitando percorrer toda a rede a cada quadro.

## Desenvolvimento

Os módulos são carregados em sequência porque compartilham funções e variáveis globais. Three.js 0.160.0 é carregado via CDN. Execute pelo GitHub Pages ou por um servidor HTTP; abrir diretamente com `file://` pode bloquear recursos do navegador.

A validação sintática dos módulos não substitui a inspeção visual no navegador. Cada fase precisa ser explorada em primeira pessoa e ajustada a partir do resultado renderizado. O carregador agora exibe um aviso caso um módulo não possa ser carregado; consulte o console do navegador (F12) para identificar o arquivo.
