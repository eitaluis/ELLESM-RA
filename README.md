# Ellesméra — floresta viva

**Versão de produção: V27 — pontes em arco e praça da copa.**

Reconstrução 3D explorável de Ellesméra, em Three.js. A descrição literária é a base da escala da floresta; as formas de arquitetura são interpretações visuais construídas para esta versão.

## Estrutura do projeto

- `index.html`: interface, HUD e carregamento sequencial
- `css/style.css`: apresentação da interface
- `js/00–07`: iluminação, terreno, caminhos, floresta, arquitetura, Menoa, minimapa e jogador

## Direção de arte

- **Base literária:** árvores monumentais, com troncos nus e muito altos sob uma copa densa e entrelaçada. A floresta deve continuar profunda e fechada, mas sem galhos baixos ocupando a circulação.
- **Arquitetura élfica:** construções integradas às árvores, plataformas habitáveis, madeira viva, vãos, luz quente e formas orgânicas.
- **Referência complementar:** a arquitetura Na’vi de *Avatar* inspira fibras trançadas, membranas leves e espaços comunitários suspensos. É uma referência de linguagem, não uma substituição do cânone de Alagaësia.
- **Pontes:** arcos em planta e elevação, tabuleiro contínuo, guarda-corpos laterais e elementos estruturais abaixo da passagem — nunca atravessando o piso livre.

## Fases do projeto

- [x] Floresta procedural, relevo, solo, vegetação e navegação básica
- [x] Menoa monumental, raízes e integração ao terreno
- [x] Moradias exploráveis no solo e em três níveis de copa
- [x] Escadas espirais e rede de pontes arqueadas com corredores arborizados de copa alta
- [x] Praça comunitária suspensa no nível superior da floresta
- [ ] Próxima fase — revisar e construir os marcos cívicos e espaços coletivos da cidade
- [ ] Próxima fase — ampliar interiores, mobiliário, iluminação ambiental e sinais de vida
- [ ] Finalização — revisar colisões, navegação, desempenho e acabamento visual

## Desenvolvimento

Os módulos são carregados em sequência porque compartilham funções e variáveis globais. Three.js 0.160.0 é carregado via CDN. Execute pelo GitHub Pages ou por um servidor HTTP; abrir diretamente com `file://` pode bloquear recursos do navegador.

A validação sintática dos módulos não substitui a inspeção visual no navegador. Cada fase precisa ser explorada em primeira pessoa e ajustada a partir do resultado renderizado.
