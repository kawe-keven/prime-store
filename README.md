# Prime Story — Loja Virtual Comercial de Moda Autoral

Loja virtual completa, rápida e pronta para produção comercial, desenvolvida com arquitetura limpa (MVC no Front-end + Serverless Functions no Back-end) e pagamentos 100% integrados via **Stripe** (Cartão de Crédito em até 3x sem juros e Pix).

---

## 💎 O que está incluído no projeto

- **Catálogo Dinâmico & Vitrine Editorial:**
  - Layout refinado com tipografia elegante (*Cormorant Garamond* e *DM Sans*) e paleta orgânica.
  - Listagem com busca em tempo real, filtros por categoria (*Novidades*, *Feminino*, *Masculino*, *Acessórios*) e ordenação por preço.
  - Modal de produto com escolha interativa de tamanhos (P, M, G, GG), cálculo de parcelamento e fotos de alta resolução.
- **Sacola de Compras Inteligente (Carrinho):**
  - Adição, remoção e alteração de quantidade com persistência em `localStorage`.
  - Cálculo de frete inteligente por CEP com prazo estimado e **Frete Grátis automático a partir de R$ 199** (ou retirada grátis em Aracaju).
  - Sistema de cupons comerciais (ex.: `PRIME10` para 10% OFF, `BEMVINDA` para 15% OFF).
- **Checkout Seguro com Stripe (Cartão + Pix):**
  - Sessão do Stripe criada em backend serverless seguro (`create-checkout-session.js`), garantindo que o preço real venha do catálogo oficial no servidor (prevenção contra adulteração de valores).
  - Webhook de verificação criptográfica (`stripe-webhook.js`) para confirmação de pagamentos Pix e Cartão.
  - Páginas de retorno de conversão: `pages/sucesso.html` e `pages/cancelado.html`.
- **Painel Administrativo com Senha:**
  - Acesso protegido por PIN/senha (padrão: `prime2026`).
  - Gestão de pedidos e alteração de status em tempo real (*Aguardando pagamento*, *Pago*, *Em preparação*, *Enviado*, *Entregue*, *Cancelado*).
  - Controle de estoque e registro de auditoria ao vivo.
- **Conformidade Jurídica Integral (Brasil):**
  - Página institucional `pages/politicas.html` com Política de Privacidade (LGPD - Lei nº 13.709/2018) e Política de Trocas e Devoluções com destaque ao **Direito de Arrependimento de 7 dias (Art. 49 do CDC)**.
  - Rodapé em conformidade com o **Decreto do Comércio Eletrônico (Decreto nº 7.962/2013)** contendo CNPJ, Razão Social, endereço físico e canais de SAC.
- **SEO & Performance:**
  - Meta tags Open Graph, Twitter Cards, dados estruturados Schema.org (`ClothingStore`), `sitemap.xml`, `robots.txt` e imagens com `loading="lazy"`.

---

## 📁 Estrutura do Projeto

```text
prime store web/
├── index.html                     # Vitrine principal e experiência da loja
├── sitemap.xml                    # Mapa do site para indexação Google
├── robots.txt                     # Diretivas para motores de busca
├── netlify.toml                   # Configuração de deploy, rotas de API e segurança
├── package.json                   # Dependências do backend (Stripe SDK)
├── .env.example                   # Template de variáveis de ambiente
├── pages/                         # Páginas de categorias e institucionais
│   ├── novidades.html
│   ├── feminino.html
│   ├── masculino.html
│   ├── acessorios.html
│   ├── politicas.html             # LGPD, CDC Art. 49, Fretes e SAC
│   ├── sucesso.html               # Confirmação do Stripe com dados do pedido
│   └── cancelado.html             # Recuperação de carrinho abandonado
├── netlify/
│   └── functions/                 # Backend Serverless Node.js
│       ├── create-checkout-session.js  # Criação da sessão Stripe (Cartão + Pix)
│       ├── stripe-webhook.js           # Verificação criptográfica de eventos
│       └── orders.js                   # Consulta de transações Stripe
├── src/
│   ├── models/                    # Catálogo de produtos e pedidos
│   │   ├── catalog-model.js
│   │   └── order-model.js
│   ├── services/                  # Regras comerciais, CEP e armazenamento
│   │   ├── commerce-service.js
│   │   ├── storage-service.js
│   │   └── instagram-assets.js
│   ├── views/                     # Estilos e visualizadores
│   │   ├── main.css
│   │   ├── catalog-view.js
│   │   └── admin-view.js
│   └── controllers/               # Orquestração de eventos
│       ├── store-controller.js    # Controlador da vitrine, carrinho e checkout
│       ├── admin-controller.js    # Painel administrativo autenticado
│       ├── category-controller.js # Navegação de categorias
│       └── bootstrap-controller.js
└── public/
    └── assets/                    # Fotografias locais do ateliê
```

---

## 🚀 Como Executar Localmente

### Opção 1: Visualização Imediata (Sem instalação)
Como o front-end é construído em HTML/CSS/JavaScript puro, basta abrir o arquivo `index.html` em qualquer navegador web moderno.
- O catálogo, os filtros, o carrinho e a simulação de checkout funcionarão imediatamente com fallback gracioso.

### Opção 2: Com o Backend Serverless (Netlify CLI)
Para testar a criação de sessões reais do Stripe no seu computador:
1. Instale o [Node.js](https://nodejs.org/) (versão 18 ou superior).
2. No terminal da pasta do projeto, instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz copiando de `.env.example` e preencha suas chaves de teste da Stripe.
4. Inicie o servidor com o Netlify Dev:
   ```bash
   npx netlify dev
   ```
   O site estará disponível em `http://localhost:8888` com as funções `/api/*` ativas.

---

## 🌐 Deploy Gratuito no Netlify (Passo a Passo)

A plataforma recomendada para este projeto é a **Netlify**, pois seu plano Starter gratuito:
1. **Permite uso comercial formal** para pequenas empresas e e-commerces.
2. Fornece **100 GB de largura de banda/mês** e **125.000 requisições de serverless functions/mês** (mais do que suficiente para suportar centenas de vendas diárias sem custo).
3. Inclui **certificado SSL automático (HTTPS)** e suporte a **domínio personalizado (.com.br)**.

### Passo 1: Subir o código para o GitHub
1. Crie um repositório no seu GitHub (pode ser público ou privado).
2. Envie os arquivos do projeto para o repositório:
   ```bash
   git init
   git add .
   git commit -m "feat: loja Prime Story com Stripe Checkout e Pix"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/prime-store.git
   git push -u origin main
   ```

### Passo 2: Conectar ao Netlify
1. Crie uma conta gratuita em [netlify.com](https://www.netlify.com/).
2. No painel, clique em **Add new site** > **Import an existing project** > **GitHub**.
3. Selecione o repositório `prime-store`.
4. As configurações de build serão preenchidas automaticamente a partir do arquivo `netlify.toml`:
   - **Publish directory:** `.`
   - **Functions directory:** `netlify/functions`
5. Clique em **Deploy site**.

### Passo 3: Configurar as Variáveis de Ambiente no Netlify
1. No painel do seu site no Netlify, vá em **Site configuration** > **Environment variables**.
2. Clique em **Add a variable** e adicione as seguintes variáveis:
   - `STRIPE_SECRET_KEY`: Sua chave secreta da Stripe (`sk_test_...` ou `sk_live_...`).
   - `STRIPE_PUBLISHABLE_KEY`: Sua chave pública da Stripe (`pk_test_...` ou `pk_live_...`).
   - `STRIPE_WEBHOOK_SECRET`: O segredo de assinatura do webhook (`whsec_...`).
   - `ADMIN_PASSWORD`: A senha desejada para o painel admin (ex.: `prime2026`).
   - `SITE_URL`: A URL do seu site no Netlify (ex.: `https://sua-loja.netlify.app` ou seu domínio próprio).
3. Vá em **Deploys** e clique em **Trigger deploy** > **Deploy site** para recarregar com as novas variáveis.

---

## 💳 Configuração da Stripe (Passo a Passo)

### 1. Obter Chaves de API
1. Acesse o [Dashboard da Stripe](https://dashboard.stripe.com/).
2. Vá em **Desenvolvedores** > **Chaves de API**.
3. Copie a **Chave publicável** e revele a **Chave secreta**.

### 2. Ativar Métodos de Pagamento (Cartão e Pix)
1. No Dashboard da Stripe, vá em **Configurações** > **Métodos de pagamento**.
2. Certifique-se de que **Cartão de Crédito** e **Pix** estão ativos para a moeda BRL (Brasil).

### 3. Configurar o Webhook de Produção
1. Vá em **Desenvolvedores** > **Webhooks**.
2. Clique em **Adicionar endpoint**.
3. No campo **URL do endpoint**, insira:
   ```text
   https://SEU-DOMINIO.netlify.app/api/stripe-webhook
   ```
4. Em **Eventos para escutar**, selecione:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `payment_intent.succeeded`
5. Clique em **Adicionar endpoint**.
6. Após criar, na seção **Segredo de assinatura**, clique em **Revelar** e copie o valor que começa com `whsec_...`.
7. Cole esse valor na variável `STRIPE_WEBHOOK_SECRET` no Netlify.

---

## 📋 Checklist: Migração do Modo Teste para Modo Produção

Quando for iniciar as vendas reais com clientes:

- [ ] **Ativar a conta Stripe Brasil:** Complete os dados da sua empresa (CNPJ ou CPF do titular, conta bancária brasileira para receber os saques e comprovante de endereço).
- [ ] **Alternar para o modo Produção no Stripe:** Desmarque a opção "Modo de teste" no topo do Dashboard da Stripe.
- [ ] **Substituir as Chaves no Netlify:**
  - Substitua `STRIPE_SECRET_KEY` (de `sk_test_...` para `sk_live_...`).
  - Substitua `STRIPE_PUBLISHABLE_KEY` (de `pk_test_...` para `pk_live_...`).
- [ ] **Criar o Webhook em Modo de Produção:**
  - Crie um novo endpoint com a mesma URL de produção (`https://seu-dominio.com.br/api/stripe-webhook`).
  - Copie o novo `whsec_...` gerado no modo de produção e atualize a variável `STRIPE_WEBHOOK_SECRET` no Netlify.
- [ ] **Realizar uma compra teste real de baixo valor:**
  - Faça um pedido real de R$ 1,00 ou no menor produto para validar o recebimento do Pix e a emissão do comprovante.
  - Faça o estorno de teste pelo painel da Stripe para verificar a restituição.
- [ ] **Configurar Domínio Próprio (.com.br):**
  - No Netlify, vá em **Domain management** > **Add a domain**.
  - Digite seu domínio (ex.: `primestory.com.br`).
  - Altere os DNS no Registro.br para os servidores informados pela Netlify (ou configure um registro CNAME).
  - O certificado SSL Let's Encrypt será ativado automaticamente em até poucas horas.

---

## 📌 O que você precisa fazer manualmente (Fora do código)

1. **Conta na Stripe Brasil:** Criar e ativar sua conta com dados bancários para repasse das vendas.
2. **Registro de Domínio (Opcional, mas recomendado):** Registrar seu domínio próprio no [Registro.br](https://registro.br/) (ex.: `primestory.com.br` por R$ 40/ano).
3. **Conta no Netlify:** Conectar seu repositório do GitHub e colar as variáveis de ambiente.
4. **WhatsApp Business:** Conectar o número real de Sergipe (`5579999999999`) nos links de atendimento.
