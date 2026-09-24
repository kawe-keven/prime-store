# Arquitetura MVC

```text
prime store web/
├── index.html                 # composição da experiência pública
├── pages/                     # domínios independentes da navegação
│   ├── novidades.html
│   ├── feminino.html
│   ├── masculino.html
│   └── acessorios.html
├── src/
│   ├── controllers/
│   │   ├── app-controller.js  # controlador principal compatível com file://
│   │   ├── admin-controller.js
│   │   ├── bootstrap-controller.js
│   │   └── store-controller.js
│   ├── models/                # catálogo, pedidos e estados do domínio
│   ├── services/              # persistência local e regras de comércio
│   └── views/
│       ├── main.css           # tokens e estilos responsivos
│       ├── catalog-view.js
│       └── admin-view.js
├── public/                    # assets locais futuros (fotos, SVG, favicon)
└── docs/                      # decisões de arquitetura e operação
```

## Fluxo

`index.html` apresenta a estrutura semântica. Os controllers reagem às ações do cliente e do administrador. Services concentram persistência e regras como cupom, estoque e subtotal. Models representam produtos, pedidos e status.

A versão atual mantém `src/controllers/app-controller.js` como camada de compatibilidade para abrir o projeto diretamente no navegador. Na migração para Next.js, os mesmos limites podem virar `app/`, `components/`, `lib/` e `server actions` sem alterar as regras de negócio.
