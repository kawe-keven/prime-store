window.PrimeControllers = window.PrimeControllers || {};

window.PrimeControllers.admin = {
  isAuthenticated: false,
  orders: [],
  editingProductId: null,

  init() {
    this.storage = window.PrimeServices?.storage || {
      read: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
      write: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
    };
    this.catalog = window.PrimeModels?.catalog;
    this.commerce = window.PrimeServices?.commerce;

    // Verificar se já há sessão ativa salva
    this.isAuthenticated = sessionStorage.getItem('prime-admin-auth') === 'true';

    // Pedidos persistidos com sede em Laranjeiras/SE
    const defaultOrders = [
      { id: 'PS-2048', customer: 'Maria Silva (Laranjeiras/SE)', items: 2, status: 'Em preparação', total: 389, payment: 'Cartão de Crédito', date: 'Hoje às 14:10' },
      { id: 'PS-2047', customer: 'Lucas Andrade (Nossa Sra do Socorro/SE)', items: 1, status: 'Pago', total: 219, payment: 'Pix', date: 'Hoje às 12:45' },
      { id: 'PS-2046', customer: 'Ana Paula (Aracaju/SE)', items: 3, status: 'Enviado', total: 527, payment: 'Cartão de Crédito', date: 'Ontem às 18:20' }
    ];
    this.orders = this.storage.read('prime-orders', defaultOrders);

    this.createLoginModal();
    this.createProductEditModal();
    this.bindEvents();
  },

  bindEvents() {
    const toggle = document.querySelector('#adminToggle');
    const panel = document.querySelector('#adminPanel');
    const close = document.querySelector('#closeAdmin');

    if (toggle) {
      toggle.addEventListener('click', () => {
        if (!this.isAuthenticated) {
          this.openLoginModal();
        } else {
          this.openPanel();
        }
      });
    }

    if (close && panel) {
      close.addEventListener('click', () => panel.classList.remove('open'));
    }

    // Navegação de abas no painel
    document.querySelectorAll('.admin-tab').forEach((tab, index) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.switchTab(index);
      });
    });
  },

  createLoginModal() {
    if (document.querySelector('#adminLoginModal')) return;

    const modal = document.createElement('div');
    modal.id = 'adminLoginModal';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Autenticação de Administrador');

    modal.innerHTML = `
      <button class="close-button" id="closeAdminLoginBtn" aria-label="Fechar">×</button>
      <div style="max-width: 420px; margin: 0 auto; text-align: left;">
        <p class="eyebrow" style="color: var(--clay);">Área Restrita</p>
        <h2 style="font: 500 36px var(--serif); margin: 0 0 10px;">Login de <i>Administrador</i></h2>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 25px;">
          Acesso exclusivo para gestão do catálogo, estoque e pedidos da Boutique Prime Story (Laranjeiras/SE).
        </p>

        <form id="adminLoginForm">
          <div style="margin-bottom: 16px;">
            <label style="display:block; font-size: 11px; text-transform:uppercase; letter-spacing:.1em; margin-bottom: 6px;">E-mail do Administrador</label>
            <input type="email" id="adminEmailInput" value="admin@primestory.com.br" required style="width:100%; border:1px solid var(--line); padding: 12px; font-size: 13px; background:#fff;">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display:block; font-size: 11px; text-transform:uppercase; letter-spacing:.1em; margin-bottom: 6px;">Senha de Acesso</label>
            <input type="password" id="adminPasswordInput" placeholder="Digite sua senha" required style="width:100%; border:1px solid var(--line); padding: 12px; font-size: 13px; background:#fff;">
            <small style="display:block; margin-top: 5px; color: var(--muted); font-size: 11px;">Padrão inicial: <code>prime2026</code></small>
          </div>
          <div id="adminLoginError" style="color: var(--clay); font-size: 12px; margin-bottom: 15px; display: none;"></div>
          <button type="submit" class="button button-dark full" style="justify-content: center; width:100%;">
            Entrar no Painel <span>→</span>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#closeAdminLoginBtn').addEventListener('click', () => {
      modal.classList.remove('open');
      document.querySelector('#overlay')?.classList.remove('open');
    });

    modal.querySelector('#adminLoginForm').addEventListener('submit', e => {
      e.preventDefault();
      const email = modal.querySelector('#adminEmailInput').value.trim();
      const pass = modal.querySelector('#adminPasswordInput').value.trim();
      const errBox = modal.querySelector('#adminLoginError');

      // Validação das credenciais do administrador
      if ((email === 'admin@primestory.com.br' || email === 'admin') && (pass === 'prime2026' || pass === 'admin')) {
        this.isAuthenticated = true;
        sessionStorage.setItem('prime-admin-auth', 'true');
        modal.classList.remove('open');
        this.openPanel();
      } else {
        errBox.textContent = 'E-mail ou senha de administrador inválidos.';
        errBox.style.display = 'block';
      }
    });
  },

  createProductEditModal() {
    if (document.querySelector('#adminProductModal')) return;

    const modal = document.createElement('div');
    modal.id = 'adminProductModal';
    modal.className = 'modal';
    modal.style.maxWidth = '680px';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <button class="close-button" id="closeProductEditBtn">×</button>
      <div style="padding: 10px 0;">
        <p class="eyebrow" id="editModalEyebrow">Gerenciador de Catálogo</p>
        <h2 style="font: 500 32px var(--serif); margin: 0 0 20px;" id="editModalTitle">Editar Peça</h2>
        
        <form id="adminProductForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="grid-column: 1 / -1;">
            <label style="font-size: 10px; text-transform: uppercase; letter-spacing: .1em;">Nome da Peça</label>
            <input type="text" id="editProdName" required style="width:100%; border:1px solid var(--line); padding:10px; margin-top:4px;">
          </div>

          <div>
            <label style="font-size: 10px; text-transform: uppercase; letter-spacing: .1em;">Preço (R$)</label>
            <input type="number" step="0.01" min="1" id="editProdPrice" required style="width:100%; border:1px solid var(--line); padding:10px; margin-top:4px;">
          </div>

          <div>
            <label style="font-size: 10px; text-transform: uppercase; letter-spacing: .1em;">Estoque Disponível</label>
            <input type="number" min="0" id="editProdStock" required style="width:100%; border:1px solid var(--line); padding:10px; margin-top:4px;">
          </div>

          <div>
            <label style="font-size: 10px; text-transform: uppercase; letter-spacing: .1em;">Categoria</label>
            <select id="editProdCategory" style="width:100%; border:1px solid var(--line); padding:10px; margin-top:4px; background:#fff;">
              <option value="Feminino">Feminino</option>
              <option value="Masculino">Masculino</option>
              <option value="Acessórios">Acessórios</option>
            </select>
          </div>

          <div>
            <label style="font-size: 10px; text-transform: uppercase; letter-spacing: .1em;">Destaque / Tag</label>
            <input type="text" id="editProdTag" placeholder="Ex: novo, mais vendido" style="width:100%; border:1px solid var(--line); padding:10px; margin-top:4px;">
          </div>

          <div style="grid-column: 1 / -1;">
            <label style="font-size: 10px; text-transform: uppercase; letter-spacing: .1em;">URL da Imagem da Peça</label>
            <input type="url" id="editProdImage" required placeholder="https://..." style="width:100%; border:1px solid var(--line); padding:10px; margin-top:4px;">
            <div style="display:flex; align-items:center; gap: 10px; margin-top: 8px;">
              <img id="imagePreview" src="" alt="Prévia" style="width: 50px; height: 60px; object-fit: cover; border: 1px solid var(--line); background:#f0f0f0;">
              <small style="color:var(--muted); font-size:11px;">Cole o link direto da imagem (WebP, JPG, PNG). A prévia acima é atualizada em tempo real.</small>
            </div>
          </div>

          <div style="grid-column: 1 / -1;">
            <label style="font-size: 10px; text-transform: uppercase; letter-spacing: .1em;">Descrição Editorial</label>
            <textarea id="editProdDesc" rows="3" style="width:100%; border:1px solid var(--line); padding:10px; margin-top:4px; font-family:inherit; font-size:12px;"></textarea>
          </div>

          <div style="grid-column: 1 / -1; display:flex; justify-content:flex-end; gap: 10px; margin-top: 15px;">
            <button type="button" class="text-button" id="cancelEditProdBtn">Cancelar</button>
            <button type="submit" class="button button-dark" style="min-width: 140px;">Salvar Peça <span>✓</span></button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#closeProductEditBtn').addEventListener('click', () => modal.classList.remove('open'));
    modal.querySelector('#cancelEditProdBtn').addEventListener('click', () => modal.classList.remove('open'));

    // Atualização em tempo real do preview da imagem
    const imgInput = modal.querySelector('#editProdImage');
    const preview = modal.querySelector('#imagePreview');
    imgInput.addEventListener('input', () => {
      preview.src = imgInput.value.trim();
    });

    // Salvar produto
    modal.querySelector('#adminProductForm').addEventListener('submit', e => {
      e.preventDefault();
      this.saveProductFromModal();
    });
  },

  openLoginModal() {
    const modal = document.querySelector('#adminLoginModal');
    const overlay = document.querySelector('#overlay');
    if (modal && overlay) {
      modal.classList.add('open');
      overlay.classList.add('open');
    }
  },

  openPanel() {
    const panel = document.querySelector('#adminPanel');
    if (!panel) return;

    // Inserir botão de Sair / Logout no header se ainda não tiver
    const headerTitle = panel.querySelector('.admin-header div');
    if (headerTitle && !headerTitle.querySelector('.admin-logout-btn')) {
      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'text-button admin-logout-btn';
      logoutBtn.style.color = 'var(--clay)';
      logoutBtn.style.marginLeft = '12px';
      logoutBtn.style.fontSize = '10px';
      logoutBtn.textContent = '· Sair (Logout)';
      logoutBtn.addEventListener('click', () => this.logout());
      headerTitle.querySelector('p')?.appendChild(logoutBtn);
    }

    this.renderStats();
    this.renderProductsManagement();
    panel.classList.add('open');
  },

  logout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem('prime-admin-auth');
    document.querySelector('#adminPanel')?.classList.remove('open');
    alert('Sessão administrativa encerrada.');
  },

  switchTab(index) {
    if (index === 0) {
      this.renderStats();
      this.renderOrders();
    } else if (index === 1) {
      this.renderProductsManagement();
    } else if (index === 2) {
      this.renderOrders();
    }
  },

  renderStats() {
    const format = this.commerce ? this.commerce.formatCurrency : v => `R$ ${v.toFixed(2)}`;
    const totalSales = this.orders.reduce((sum, o) => sum + (o.status !== 'Cancelado' ? o.total : 0), 0);
    const pendingCount = this.orders.filter(o => o.status === 'Aguardando pagamento' || o.status === 'Em preparação').length;

    const statsContainer = document.querySelector('.stats');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div>
          <span>Vendas Registradas</span>
          <strong>${format(totalSales)}</strong>
          <small>${this.orders.length} pedidos no total</small>
        </div>
        <div>
          <span>Pedidos em Operação</span>
          <strong>${String(pendingCount).padStart(2, '0')}</strong>
          <small>Requerem despacho ou separação</small>
        </div>
        <div>
          <span>Boutique Prime</span>
          <strong>Laranjeiras/SE</strong>
          <small>Centro Histórico</small>
        </div>
      `;
    }
  },

  renderProductsManagement() {
    const listContainer = document.querySelector('.admin-list');
    if (!listContainer || !this.catalog) return;

    const products = this.catalog.getAll();
    const format = this.commerce ? this.commerce.formatCurrency : v => `R$ ${v.toFixed(2)}`;

    listContainer.innerHTML = `
      <div class="list-title" style="margin-bottom: 20px;">
        <div>
          <h3 style="margin: 0;">Gestão Completa de Produtos</h3>
          <small style="color: var(--muted);">${products.length} peças cadastradas · Sede Laranjeiras/SE</small>
        </div>
        <div style="display:flex; gap: 10px;">
          <button class="button button-dark" id="btnAdminNewProd" style="padding: 10px 16px; font-size: 10px;">
            + Nova Peça
          </button>
          <button class="text-button" id="btnAdminResetProds" style="color: var(--muted); font-size: 10px;">
            ↺ Restaurar Padrão
          </button>
        </div>
      </div>

      <div class="admin-products-table" style="overflow-x:auto;">
        ${products.map(p => `
          <div class="order-row" style="grid-template-columns: 55px 1.4fr 110px 80px 140px; gap: 14px; align-items:center; padding: 14px 0;">
            <img src="${p.image}" alt="${p.name}" style="width: 50px; height: 62px; object-fit: cover; border-radius: 2px;">
            <div>
              <strong style="font-size: 13px;">${p.name}</strong> 
              <span style="font-size: 11px; color: var(--muted);">(${p.category}${p.tag ? ` · ${p.tag}` : ''})</span>
              <small style="display:block; color: var(--muted); margin-top: 2px;">SKU: ${p.sku || 'PS-' + p.id}</small>
            </div>
            <div>
              <strong style="font-size: 13px; color: var(--ink);">${format(p.price)}</strong>
              <small style="display:block; color: var(--muted); font-size: 10px;">Preço de venda</small>
            </div>
            <div>
              <span class="status ${p.stock > 0 ? 'paid' : 'preparing'}" style="font-size: 11px;">
                ${p.stock} un.
              </span>
            </div>
            <div style="display:flex; gap: 8px; justify-content: flex-end;">
              <button class="button button-light btn-edit-prod" data-id="${p.id}" style="padding: 6px 12px; min-width: auto; font-size: 10px;">
                ✏️ Editar
              </button>
              <button class="text-button btn-del-prod" data-id="${p.id}" style="color: var(--clay); font-size: 11px;">
                Excluir
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Botão Nova Peça
    listContainer.querySelector('#btnAdminNewProd')?.addEventListener('click', () => {
      this.openProductModalForCreate();
    });

    // Botão Restaurar Padrão
    listContainer.querySelector('#btnAdminResetProds')?.addEventListener('click', () => {
      if (confirm('Deseja restaurar o catálogo padrão de fábrica? As alterações feitas serão descartadas.')) {
        this.catalog.resetDefaults();
        this.renderProductsManagement();
        window.PrimeControllers?.store?.renderCatalog();
        this.logAudit('Catálogo de produtos restaurado para a versão padrão.');
      }
    });

    // Botões de Editar Peça
    listContainer.querySelectorAll('.btn-edit-prod').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        this.openProductModalForEdit(id);
      });
    });

    // Botões de Excluir Peça
    listContainer.querySelectorAll('.btn-del-prod').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const prod = this.catalog.getById(id);
        if (prod && confirm(`Tem certeza que deseja remover "${prod.name}" da loja?`)) {
          this.catalog.deleteProduct(id);
          this.renderProductsManagement();
          window.PrimeControllers?.store?.renderCatalog();
          this.logAudit(`Peça "${prod.name}" excluída do catálogo.`);
        }
      });
    });
  },

  openProductModalForEdit(productId) {
    const prod = this.catalog.getById(productId);
    if (!prod) return;

    this.editingProductId = productId;
    const modal = document.querySelector('#adminProductModal');
    if (!modal) return;

    modal.querySelector('#editModalEyebrow').textContent = `Editando Peça · ID #${prod.id}`;
    modal.querySelector('#editModalTitle').innerHTML = `Editar <i>${prod.name}</i>`;
    modal.querySelector('#editProdName').value = prod.name;
    modal.querySelector('#editProdPrice').value = prod.price;
    modal.querySelector('#editProdStock').value = prod.stock;
    modal.querySelector('#editProdCategory').value = prod.category;
    modal.querySelector('#editProdTag').value = prod.tag || '';
    modal.querySelector('#editProdImage').value = prod.image;
    modal.querySelector('#imagePreview').src = prod.image;
    modal.querySelector('#editProdDesc').value = prod.description || '';

    modal.classList.add('open');
  },

  openProductModalForCreate() {
    this.editingProductId = null;
    const modal = document.querySelector('#adminProductModal');
    if (!modal) return;

    modal.querySelector('#editModalEyebrow').textContent = 'Novo Cadastro';
    modal.querySelector('#editModalTitle').innerHTML = 'Cadastrar <i>Nova Peça</i>';
    modal.querySelector('#editProdName').value = '';
    modal.querySelector('#editProdPrice').value = '199';
    modal.querySelector('#editProdStock').value = '8';
    modal.querySelector('#editProdCategory').value = 'Feminino';
    modal.querySelector('#editProdTag').value = 'novo';
    modal.querySelector('#editProdImage').value = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85';
    modal.querySelector('#imagePreview').src = modal.querySelector('#editProdImage').value;
    modal.querySelector('#editProdDesc').value = 'Peça autoral desenvolvida no ateliê Prime Story em Laranjeiras/SE.';

    modal.classList.add('open');
  },

  saveProductFromModal() {
    const modal = document.querySelector('#adminProductModal');
    if (!modal) return;

    const data = {
      name: modal.querySelector('#editProdName').value.trim(),
      price: Number(modal.querySelector('#editProdPrice').value),
      stock: parseInt(modal.querySelector('#editProdStock').value, 10),
      category: modal.querySelector('#editProdCategory').value,
      tag: modal.querySelector('#editProdTag').value.trim(),
      image: modal.querySelector('#editProdImage').value.trim(),
      description: modal.querySelector('#editProdDesc').value.trim()
    };

    if (this.editingProductId) {
      // Atualização de produto existente
      this.catalog.updateProduct(this.editingProductId, data);
      this.logAudit(`Admin atualizou "${data.name}": Preço R$ ${data.price.toFixed(2)}, Estoque ${data.stock} un.`);
    } else {
      // Criação de novo produto
      this.catalog.addProduct(data);
      this.logAudit(`Nova peça "${data.name}" adicionada ao catálogo por R$ ${data.price.toFixed(2)}.`);
    }

    modal.classList.remove('open');
    this.renderProductsManagement();
    
    // Atualizar imediatamente a vitrine da loja
    window.PrimeControllers?.store?.renderCatalog();
    window.PrimeControllers?.store?.notifyToast(`Catálogo atualizado: ${data.name}`);
  },

  renderOrders() {
    const listContainer = document.querySelector('.admin-list');
    if (!listContainer) return;

    const format = this.commerce ? this.commerce.formatCurrency : v => `R$ ${v.toFixed(2)}`;

    listContainer.innerHTML = `
      <div class="list-title">
        <h3>Pedidos Recentes (Stripe & Balcão)</h3>
        <button class="text-button" id="btnAdminAddOrder">+ Simular Pedido</button>
      </div>
      <div class="admin-orders-table" style="overflow-x:auto;">
        ${this.orders.map(order => `
          <div class="order-row" style="grid-template-columns: 40px 1.5fr 140px 100px 90px; gap: 10px; align-items: center;">
            <span class="order-avatar">${order.customer.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>#${order.id} · ${order.customer}</strong>
              <small>${order.items} iten(s) · ${order.payment} · ${order.date}</small>
            </div>
            <div>
              <select class="admin-status-select" data-id="${order.id}" style="font-size: 11px; padding: 4px 6px;">
                <option value="Aguardando pagamento" ${order.status === 'Aguardando pagamento' ? 'selected' : ''}>Aguardando pgto</option>
                <option value="Pago" ${order.status === 'Pago' ? 'selected' : ''}>Pago (Stripe)</option>
                <option value="Em preparação" ${order.status === 'Em preparação' ? 'selected' : ''}>Em preparação</option>
                <option value="Enviado" ${order.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                <option value="Entregue" ${order.status === 'Entregue' ? 'selected' : ''}>Entregue</option>
                <option value="Cancelado" ${order.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
              </select>
            </div>
            <strong style="text-align: right;">${format(order.total)}</strong>
            <button class="text-button btn-del-order" data-id="${order.id}" style="color: var(--clay); font-size: 11px;">Excluir</button>
          </div>
        `).join('')}
      </div>
    `;

    // Atualizar status
    listContainer.querySelectorAll('.admin-status-select').forEach(sel => {
      sel.addEventListener('change', e => {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        const targetOrder = this.orders.find(o => o.id === id);
        if (targetOrder) {
          targetOrder.status = newStatus;
          this.storage.write('prime-orders', this.orders);
          this.renderStats();
          this.logAudit(`Status do pedido #${id} alterado para "${newStatus}"`);
        }
      });
    });

    // Excluir pedido
    listContainer.querySelectorAll('.btn-del-order').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.target.dataset.id;
        if (confirm(`Deseja remover o pedido #${id}?`)) {
          this.orders = this.orders.filter(o => o.id !== id);
          this.storage.write('prime-orders', this.orders);
          this.renderStats();
          this.renderOrders();
        }
      });
    });

    // Simular novo pedido
    const addOrderBtn = listContainer.querySelector('#btnAdminAddOrder');
    if (addOrderBtn) {
      addOrderBtn.addEventListener('click', () => {
        const newId = `PS-${Math.floor(2050 + Math.random() * 100)}`;
        this.orders.unshift({
          id: newId,
          customer: 'Cliente Laranjeiras (Stripe Pix)',
          items: 1,
          status: 'Pago',
          total: 289,
          payment: 'Pix (Stripe)',
          date: 'Agora'
        });
        this.storage.write('prime-orders', this.orders);
        this.renderStats();
        this.renderOrders();
        this.logAudit(`Novo pedido aprovado #${newId} registrado via Stripe.`);
      });
    }
  },

  logAudit(action) {
    const auditEl = document.querySelector('.audit-log');
    if (!auditEl) return;
    const p = document.createElement('p');
    p.innerHTML = `<b>Admin ·</b> ${action} <time>agora</time>`;
    const title = auditEl.querySelector('.list-title');
    if (title && title.nextSibling) {
      auditEl.insertBefore(p, title.nextSibling);
    } else {
      auditEl.appendChild(p);
    }
  }
};

