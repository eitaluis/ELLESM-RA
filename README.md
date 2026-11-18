# Ellesméra — floresta viva

**Versão de produção: V28 — interiores habitados e vida silvestre em movimento.**

Reconstrução 3D explorável de Ellesméra, em Three.js. A descrição literária é a base da escala da floresta; as formas de arquitetura são interpretações visuais construídas para esta versão.

## Estrutura do projeto

- `index.html`: interface, HUD e carregamento sequencial
- `css/style.css`: apresentação da interface
- `js/00–07`: iluminação, terreno, caminhos, floresta, arquitetura, Menoa, minimapa e jogador
- `js/08-forest-life.js`: aves em voo e folhas levadas pelo vento

## Direção de arte

- **Base literária:** árvores monumentais, com troncos nus e muito altos sob uma copa densa e entrelaçada. A floresta deve continuar profunda e fechada, mas sem galhos baixos ocupando a circulação.
- **Arquitetura élfica:** construções integradas às árvores, plataformas habitáveis, madeira viva, vãos, luz quente e formas orgânicas.
- **Referência complementar:** a arquitetura Na’vi de *Avatar* inspira fibras trançadas, membranas leves e espaços comunitários suspensos. É uma referência de linguagem, não uma substituição do cânone de Alagaësia.
- **Pontes:** arcos em planta e elevação, tabuleiro contínuo, guarda-corpos laterais e elementos estruturais abaixo da passagem — nunca atravessando o piso livre.
- **Vida da floresta:** aves pequenas cruzam as regiões altas e folhas soltas derivam em alturas variadas; a animação é discreta para preservar a leitura da arquitetura.
- **Interiores:** mobiliário de madeira, tecidos, louças, camas, mesas e estantes ficam posicionados nos anéis habitáveis, preservando a circulação ao redor dos troncos.

## Fases do projeto

- [x] Floresta procedural, relevo, solo, vegetação densa e navegação básica
- [x] Menoa monumental, raízes e integração ao terreno
- [x] Moradias exploráveis no solo e em três níveis de copa
- [x] Escadas espirais protegidas e rede de pontes arqueadas com circulação livre
- [x] Praça comunitária suspensa no nível superior da floresta
- [x] Mobiliário interno nas moradias: mesas, bancos, estantes, camas, baús e peças de uso cotidiano
- [x] Áreas coletivas ampliadas: refeição comunal, alvos e armas de treino, cochos, feno e arreios nos estábulos
- [x] Vida silvestre em movimento: aves planando entre as copas e folhas carregadas pelo vento
- [x] Paisagem sonora real de floresta, com gravação de campo em domínio público
- [ ] Revisão visual em navegador, ajuste fino de densidade, colisões e desempenho

## Áudio ambiente

A tecla **O** liga e desliga a gravação de campo [“20090610 0 ambience.ogg”](https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg), registrada por nille em uma pequena mata. O arquivo tem cerca de 2 minutos e 3 segundos e foi dedicado ao domínio público pelo autor. A descrição original menciona vento nas árvores e sons de aves e insetos. A reprodução inicia após o clique de entrada no mundo e repete em loop.

## Desenvolvimento

Os módulos são carregados em sequência porque compartilham funções e variáveis globais. Three.js 0.160.0 é carregado via CDN. Execute pelo GitHub Pages ou por um servidor HTTP; abrir diretamente com `file://` pode bloquear recursos do navegador.

A validação sintática dos módulos não substitui a inspeção visual no navegador. Cada fase precisa ser explorada em primeira pessoa e ajustada a partir do resultado renderizado. O carregador agora exibe um aviso caso um módulo não possa ser carregado; consulte o console do navegador (F12) para identificar o arquivo.
