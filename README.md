# Prime Story

MVP navegável da loja virtual Prime Story, com foco em uma experiência editorial de boutique.

## O que está incluído

- Home responsiva com hero, categorias, editorial e Instagram.
- Catálogo com filtros por categoria e ordenação por preço.
- Modal de produto com tamanhos e adição ao carrinho.
- Carrinho lateral persistente em `localStorage`.
- Checkout demonstrativo em quatro etapas: identificação, entrega, pagamento e revisão.
- Painel administrativo demonstrativo com indicadores e pedidos recentes.
- Dados de exemplo com 8 produtos.

## Como rodar

Como o ambiente atual não tem Node.js/npx disponível, esta versão não exige instalação: abra `index.html` diretamente no navegador.

Para transformar o MVP em produção, a próxima etapa é migrar os arquivos para Next.js App Router e conectar Prisma/PostgreSQL, autenticação, Cloudinary, Mercado Pago e Melhor Envio. As integrações de pagamento e estoque ainda são apenas representadas visualmente nesta fase.

## Estrutura MVC

A organização completa está em `src/`: `models/` representa catálogo e pedidos, `services/` concentra persistência e regras comerciais, `views/` contém renderizadores de interface e `controllers/` conecta os eventos do front e do admin. A decisão está documentada em `docs/architecture.md`.
