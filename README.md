# Ellesméra — projeto modular

Versão de origem preservada: V22. A cena foi dividida em arquivos carregados em sequência para manter o escopo global original e evitar mudanças na lógica durante a modularização.

## Estrutura
- `index.html`: interface e carregador
- `css/style.css`: estilos
- `js/`: código da cena em blocos sequenciais

## Desenvolvimento
Edite o módulo correspondente. A ordem de carregamento em `index.html` é importante: os módulos seguintes usam variáveis e funções declaradas nos anteriores.

A biblioteca Three.js é carregada via CDN (0.160.0). O site deve ser servido por GitHub Pages ou servidor HTTP; abrir o HTML diretamente via `file://` pode bloquear recursos do navegador.
