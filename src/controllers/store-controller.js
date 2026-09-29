window.PrimeControllers = window.PrimeControllers || {};

window.PrimeControllers.store = {
  cart: [],
  favorites: [],
  activeFilter: 'Todos',
  activeSort: 'featured',
  activeSearch: '',
  selectedProduct: null,
  selectedSize: '',
  appliedCoupon: null,
  shippingCep: '',
  shippingResult: null,
  selectedShippingPrice: 0,

  init() {
    this.storage = window.PrimeServices?.storage || {
      read: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
      write: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
    };
    this.commerce = window.PrimeServices?.commerce;
    this.catalog = window.PrimeModels?.catalog;
    this.views = window.PrimeViews?.catalog;

    this.cart = this.storage.read('prime-cart', []);
    this.favorites = this.storage.read('prime-favorites', []);
    this.appliedCoupon = this.storage.read('prime-coupon', null);
    this.shippingCep = this.storage.read('prime-cep', '');

    this.bindGlobalEvents();
    this.renderCatalog();
    this.updateCart();

    if (this.shippingCep && this.commerce) {
      this.calculateShipping(this.shippingCep, false);
    }

    document.documentElement.dataset.storeReady = 'true';
  },

  bindGlobalEvents() {
    // Busca global e na página
    const searchInputs = document.querySelectorAll('#globalSearch, #categorySearch');
    searchInputs.forEach(input => {
      input.addEventListener('input', e => {
        this.activeSearch = e.target.value.trim();
        this.renderCatalog();
      });
    });

    // Filtros de categoria
    document.querySelectorAll('.filter-button').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        this.activeFilter = button.dataset.filter || 'Todos';
        this.renderCatalog();
      });
    });

    // Ordenação
    const sortSelect = document.querySelector('#sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', e => {
        this.activeSort = e.target.value;
        this.renderCatalog();
      });
    }

    // Toggle Carrinho
    const cartToggle = document.querySelector('#cartToggle');
    if (cartToggle) {
      cartToggle.addEventListener('click', () => this.openCart());
    }

    const closeCart = document.querySelector('#closeCart');
    if (closeCart) {
      closeCart.addEventListener('click', () => this.closeLayers());
    }

    // Overlay
    const overlay = document.querySelector('#overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.closeLayers());
    }

    // Botões de fechar modal genéricos
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeLayers());
    });

    // Tecla Escape para fechar qualquer modal
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeLayers();
    });

    // Interações de clique no grid de produtos
    const productGrid = document.querySelector('#productGrid');
    if (productGrid) {
      productGrid.addEventListener('click', e => {
        const heartBtn = e.target.closest('.product-heart');
        if (heartBtn) {
          e.stopPropagation();
          const id = Number(heartBtn.dataset.id);
          this.toggleFavorite(id);
          return;
        }

        const card = e.target.closest('.product-card');
        if (card) {
          const id = Number(card.dataset.id);
          this.openProductModal(id);
        }
      });

      productGrid.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          const card = e.target.closest('.product-card');
          if (card && !e.target.closest('.product-heart')) {
            e.preventDefault();
            this.openProductModal(Number(card.dataset.id));
          }
        }
      });
    }

    // Cupom no carrinho
    const couponBtn = document.querySelector('#couponButton');
    const couponInput = document.querySelector('#couponInput');
    if (couponBtn && couponInput) {
      couponBtn.addEventListener('click', () => this.handleApplyCoupon());
      couponInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleApplyCoupon();
        }
      });
    }

    // Ações de itens no carrinho (adicionar, subtrair, remover)
    const cartItemsContainer = document.querySelector('#cartItems');
    if (cartItemsContainer) {
      cartItemsContainer.addEventListener('click', e => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;
        const id = Number(actionBtn.dataset.id);
        const size = actionBtn.dataset.size || '';
        const action = actionBtn.dataset.action;

        if (action === 'plus') this.changeItemQty(id, size, 1);
        if (action === 'minus') this.changeItemQty(id, size, -1);
        if (action === 'remove') this.removeFromCart(id, size);
      });
    }

    // Botão de checkout para Stripe
    const checkoutBtn = document.querySelector('#checkoutButton');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.startStripeCheckout());
    }

    // Mobile menu toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
      mobileMenu.addEventListener('click', () => {
        const nav = document.querySelector('.main-nav');
        if (nav) nav.classList.toggle('open');
      });
    }
  },

  renderCatalog() {
    if (!this.catalog || !this.views) return;
    let list = this.catalog.getAll();

    // Filtro por categoria
    if (this.activeFilter && this.activeFilter !== 'Todos') {
      if (this.activeFilter === 'Novidades') {
        list = list.filter(p => p.tag === 'novo');
      } else {
        list = list.filter(p => p.category.toLowerCase() === this.activeFilter.toLowerCase());
      }
    }

    // Filtro por termo de busca
    if (this.activeSearch) {
      const q = this.activeSearch.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Ordenação
    if (this.activeSort === 'low') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (this.activeSort === 'high') {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    const formatCurrency = this.commerce ? this.commerce.formatCurrency : v => `R$ ${v.toFixed(2)}`;
    this.views.render(list, formatCurrency, this.favorites);
  },

  toggleFavorite(productId) {
    const isFav = this.favorites.includes(productId);
    if (isFav) {
      this.favorites = this.favorites.filter(id => id !== productId);
    } else {
      this.favorites.push(productId);
    }
    this.storage.write('prime-favorites', this.favorites);

    document.querySelectorAll(`.product-heart[data-id="${productId}"]`).forEach(btn => {
      const active = this.favorites.includes(productId);
      btn.textContent = active ? '♥' : '♡';
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Salvar nos favoritos');
    });
  },

  openProductModal(productId) {
    if (!this.catalog) return;
    const product = this.catalog.getById(productId);
    if (!product) return;

    this.selectedProduct = product;
    this.selectedSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'Único';

    const detailEl = document.querySelector('#productDetail');
    const modalEl = document.querySelector('#productModal');
    const overlay = document.querySelector('#overlay');

    if (!detailEl || !modalEl) return;

    const formatCurrency = this.commerce ? this.commerce.formatCurrency : v => `R$ ${v.toFixed(2)}`;
    detailEl.innerHTML = this.views.productDetail(product, formatCurrency);

    // Seleção de tamanho no modal
    detailEl.querySelectorAll('.size').forEach(btn => {
      btn.addEventListener('click', () => {
        detailEl.querySelectorAll('.size').forEach(s => {
          s.classList.remove('selected');
          s.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
        this.selectedSize = btn.dataset.size;
      });
    });

    // Botão Adicionar à Sacola
    const addBtn = detailEl.querySelector('#addProductModalBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.addToCart(this.selectedProduct, this.selectedSize);
        this.closeLayers();
        this.openCart();
      });
    }

    modalEl.classList.add('open');
    if (overlay) overlay.classList.add('open');
  },

  addToCart(product, size = 'Único') {
    if (!product) return;
    const existingIndex = this.cart.findIndex(i => i.id === product.id && i.size === size);

    if (existingIndex > -1) {
      this.cart[existingIndex].qty += 1;
    } else {
      this.cart.push({
        id: product.id,
        sku: product.sku || `PS-${product.id}`,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        size: size || 'Único',
        qty: 1
      });
    }

    this.storage.write('prime-cart', this.cart);
    this.updateCart();
    this.notifyToast(`Adicionado à sacola: ${product.name} (Tam: ${size})`);
  },

  changeItemQty(id, size, delta) {
    const item = this.cart.find(i => i.id === id && i.size === size);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      this.cart = this.cart.filter(i => !(i.id === id && i.size === size));
    }

    this.storage.write('prime-cart', this.cart);
    this.updateCart();
  },

  removeFromCart(id, size) {
    this.cart = this.cart.filter(i => !(i.id === id && i.size === size));
    this.storage.write('prime-cart', this.cart);
    this.updateCart();
  },

  updateCart() {
    const count = this.cart.reduce((a, i) => a + i.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
    });

    const format = this.commerce ? this.commerce.formatCurrency : v => `R$ ${v.toFixed(2)}`;
    const subtotal = this.cart.reduce((sum, item) => sum + item.qty * item.price, 0);

    // Cupom
    let discount = 0;
    if (this.appliedCoupon && this.commerce) {
      const res = this.commerce.applyCoupon(subtotal, this.appliedCoupon);
      if (res.valid) {
        discount = res.discount;
      } else {
        this.appliedCoupon = null;
        this.storage.write('prime-coupon', null);
      }
    }

    // Frete
    let shippingPrice = 0;
    if (this.shippingResult && this.shippingResult.valid) {
      shippingPrice = (subtotal >= 199 && this.shippingResult.isFreeByValue) ? 0 : this.selectedShippingPrice;
    }

    const total = Math.max(0, subtotal - discount + shippingPrice);

    // Renderizar itens no drawer
    const cartItemsEl = document.querySelector('#cartItems');
    if (cartItemsEl) {
      if (this.cart.length === 0) {
        cartItemsEl.innerHTML = `
          <div class="empty-state">
            <span style="font-size: 32px; display: block; margin-bottom: 12px;">🛍</span>
            <p style="font-weight: 500; font-size: 15px; margin: 0 0 6px;">Sua sacola está vazia.</p>
            <p style="font-size: 12px; color: var(--muted); margin: 0;">Descubra peças autorais feitas para marcar a sua história.</p>
          </div>
        `;
      } else {
        cartItemsEl.innerHTML = this.cart.map(item => `
          <div class="cart-row">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div>
              <h4>${item.name}</h4>
              <p>${item.category} · Tam: <strong>${item.size}</strong> · ${format(item.price)}</p>
              <div class="quantity">
                <button type="button" data-action="minus" data-id="${item.id}" data-size="${item.size}" aria-label="Diminuir quantidade">−</button>
                <span>${item.qty}</span>
                <button type="button" data-action="plus" data-id="${item.id}" data-size="${item.size}" aria-label="Aumentar quantidade">+</button>
              </div>
              <button type="button" class="remove" data-action="remove" data-id="${item.id}" data-size="${item.size}">Remover</button>
            </div>
            <strong>${format(item.price * item.qty)}</strong>
          </div>
        `).join('');
      }
    }

    // Atualizar totais no drawer
    const totalEl = document.querySelector('#cartTotal');
    if (totalEl) {
      totalEl.innerHTML = `
        <span class="subtotal-breakdown">
          ${discount > 0 ? `<small style="color: #43733b; display: block; font-size: 11px;">Desconto: -${format(discount)}</small>` : ''}
          ${shippingPrice > 0 ? `<small style="color: var(--muted); display: block; font-size: 11px;">Frete: +${format(shippingPrice)}</small>` : (this.shippingResult ? `<small style="color: #43733b; display: block; font-size: 11px;">Frete Grátis</small>` : '')}
          <strong>${format(total)}</strong>
        </span>
      `;
    }

    // Renderizar campo de CEP dinâmico no carrinho se ainda não existir
    this.renderShippingCalculatorInDrawer();

    const checkoutBtn = document.querySelector('#checkoutButton');
    if (checkoutBtn) {
      checkoutBtn.disabled = this.cart.length === 0;
      if (this.cart.length === 0) {
        checkoutBtn.innerHTML = 'Sacola vazia';
      } else {
        checkoutBtn.innerHTML = `Pagar com Stripe (Cartão ou Pix) <span>→</span>`;
      }
    }
  },

  renderShippingCalculatorInDrawer() {
    const footer = document.querySelector('.cart-footer');
    if (!footer || footer.querySelector('.shipping-calc-box')) return;

    const shippingBox = document.createElement('div');
    shippingBox.className = 'shipping-calc-box';
    shippingBox.innerHTML = `
      <div class="shipping-input-row">
        <input type="text" id="shippingCepInput" placeholder="Informe seu CEP (ex: 49000-000)" maxlength="9" value="${this.shippingCep || ''}" aria-label="CEP para entrega">
        <button type="button" id="shippingCepBtn">Calcular</button>
      </div>
      <div id="shippingFeedback" class="shipping-feedback"></div>
    `;

    const couponRow = footer.querySelector('.coupon-row');
    if (couponRow) {
      footer.insertBefore(shippingBox, couponRow);
    }

    const cepBtn = shippingBox.querySelector('#shippingCepBtn');
    const cepInput = shippingBox.querySelector('#shippingCepInput');
    if (cepBtn && cepInput) {
      cepBtn.addEventListener('click', () => this.calculateShipping(cepInput.value, true));
      cepInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.calculateShipping(cepInput.value, true);
        }
      });
      cepInput.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
        e.target.value = v;
      });
    }
  },

  calculateShipping(cep, notify = true) {
    if (!this.commerce) return;
    const subtotal = this.cart.reduce((s, i) => s + i.price * i.qty, 0);
    const res = this.commerce.calculateShipping(cep, subtotal);
    const feedback = document.querySelector('#shippingFeedback');

    if (!res.valid) {
      this.shippingResult = null;
      this.selectedShippingPrice = 0;
      if (feedback && notify) {
        feedback.className = 'shipping-feedback error';
        feedback.textContent = 'Informe um CEP válido com 8 dígitos.';
      }
      this.updateCart();
      return;
    }

    this.shippingCep = res.cep;
    this.storage.write('prime-cep', this.shippingCep);
    this.shippingResult = res;

    const opt = res.options[0];
    this.selectedShippingPrice = opt.price;

    if (feedback) {
      const format = this.commerce.formatCurrency;
      feedback.className = 'shipping-feedback success';
      feedback.innerHTML = `
        <strong>${opt.name}</strong>: ${opt.price === 0 ? '<span style="color:#43733b;font-weight:600">Grátis</span>' : format(opt.price)}<br>
        <small style="color:var(--muted)">Prazo estimado: ${opt.deadline}</small>
      `;
    }

    this.updateCart();
  },

  handleApplyCoupon() {
    const input = document.querySelector('#couponInput');
    const feedback = document.querySelector('#couponFeedback');
    if (!input || !feedback || !this.commerce) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      feedback.className = 'coupon-feedback error';
      feedback.textContent = 'Digite um cupom de desconto.';
      return;
    }

    const subtotal = this.cart.reduce((s, i) => s + i.price * i.qty, 0);
    const res = this.commerce.applyCoupon(subtotal, code);

    if (res.valid) {
      this.appliedCoupon = res.code;
      this.storage.write('prime-coupon', this.appliedCoupon);
      feedback.className = 'coupon-feedback success';
      feedback.textContent = `${res.message} (-${this.commerce.formatCurrency(res.discount)})`;
      input.value = '';
    } else {
      feedback.className = 'coupon-feedback error';
      feedback.textContent = res.message || 'Cupom inválido.';
    }

    this.updateCart();
  },

  openCart() {
    const overlay = document.querySelector('#overlay');
    const drawer = document.querySelector('#cartDrawer');
    if (overlay) overlay.classList.add('open');
    if (drawer) drawer.classList.add('open');
  },

  closeLayers() {
    document.querySelectorAll('.modal, .cart-drawer, .admin-panel, .overlay').forEach(el => {
      el.classList.remove('open');
    });
  },

  notifyToast(msg) {
    let toast = document.querySelector('#primeToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'primeToast';
      toast.className = 'prime-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  },

  async startStripeCheckout() {
    if (this.cart.length === 0) return;

    const checkoutBtn = document.querySelector('#checkoutButton');
    const originalText = checkoutBtn ? checkoutBtn.innerHTML : '';
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = `Conectando ao Stripe seguro... <span class="spinner-inline"></span>`;
    }

    try {
      // Endpoint serverless para criar a sessão do Stripe Checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: this.cart.map(i => ({
            id: i.id,
            sku: i.sku,
            name: i.name,
            size: i.size,
            qty: i.qty
          })),
          coupon: this.appliedCoupon,
          shippingCep: this.shippingCep,
          successUrl: window.location.origin + '/pages/sucesso.html?session_id={CHECKOUT_SESSION_ID}',
          cancelUrl: window.location.origin + '/pages/cancelado.html'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('URL de checkout do Stripe não foi retornada pelo servidor.');
      }
    } catch (err) {
      console.warn('Stripe checkout error / fallback:', err);
      // Fallback gracioso caso esteja rodando offline/sem backend serverless conectado
      this.showOfflineCheckoutFallback(err.message);
    } finally {
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = originalText;
      }
    }
  },

  showOfflineCheckoutFallback(errorDetail) {
    const modal = document.querySelector('#checkoutModal');
    const body = document.querySelector('#checkoutBody');
    const overlay = document.querySelector('#overlay');
    if (!modal || !body) {
      alert('Aviso Stripe: Para processar o pagamento com cartão e Pix, as chaves da Stripe devem estar configuradas no ambiente Netlify/Serverless.');
      return;
    }

    const subtotal = this.cart.reduce((s, i) => s + i.price * i.qty, 0);
    const format = this.commerce ? this.commerce.formatCurrency : v => `R$ ${v.toFixed(2)}`;

    body.innerHTML = `
      <div class="checkout-content" style="padding: 20px 0;">
        <div style="background: #fff8eb; border-left: 4px solid #b48a5a; padding: 14px 18px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 6px; font-size: 14px; color: #5a4220;">Modo de Demonstração / Conexão Stripe</h4>
          <p style="margin: 0; font-size: 12px; color: #746e66; line-height: 1.5;">
            O front-end está pronto e conectado ao Stripe Checkout (Cartão de Crédito e Pix em BRL). 
            Em ambiente de desenvolvimento local direto pelo navegador sem o backend de funções rodando, este painel simula a finalização do pedido.
          </p>
          <small style="display:block; margin-top: 6px; font-size: 10px; color: #999;">Detalhe técnico: ${errorDetail}</small>
        </div>

        <h3>Resumo do seu pedido</h3>
        <div class="review-box" style="background:#fff; border:1px solid var(--line); padding: 16px; margin-bottom: 20px;">
          <p style="display:flex; justify-content:space-between; margin: 6px 0;">
            <strong>Sacola (${this.cart.reduce((a, i) => a + i.qty, 0)} itens)</strong>
            <span>${format(subtotal)}</span>
          </p>
          <p style="display:flex; justify-content:space-between; margin: 6px 0;">
            <strong>Entrega estimada (Aracaju/SE)</strong>
            <span>${subtotal >= 199 ? '<span style="color:#43733b">Grátis</span>' : 'R$ 12,00'}</span>
          </p>
          <hr style="border: 0; border-top: 1px solid var(--line); margin: 12px 0;">
          <p style="display:flex; justify-content:space-between; margin: 6px 0; font-size: 16px;">
            <strong>Total Geral</strong>
            <strong>${format(subtotal >= 199 ? subtotal : subtotal + 12)}</strong>
          </p>
        </div>

        <div class="checkout-actions">
          <button type="button" class="text-button" onclick="window.PrimeControllers.store.closeLayers()">Voltar à loja</button>
          <button type="button" class="button button-dark" id="btnSimulateSuccess">
            Simular Conclusão de Pedido <span>✓</span>
          </button>
        </div>
      </div>
    `;

    const simBtn = body.querySelector('#btnSimulateSuccess');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        window.location.href = 'pages/sucesso.html?demo=true';
      });
    }

    this.closeLayers();
    modal.classList.add('open');
    if (overlay) overlay.classList.add('open');
  }
};
