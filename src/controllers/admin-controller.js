window.PrimeControllers = window.PrimeControllers || {};

window.PrimeControllers.admin = {
  isAuthenticated: false,
  orders: [],
  products: [],

  init() {
    this.storage = window.PrimeServices?.storage || {
      read: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
      write: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
    };
    this.catalog = window.PrimeModels?.catalog;
    this.commerce = window.PrimeServices?.commerce;

    // Pedidos persistidos
    const defaultOrders = [
      { id: 'PS-2048', customer: 'Maria Silva (Aracaju/SE)', items: 2, status: 'Em preparação', total: 389, payment: 'Cartão de Crédito', date: 'Hoje às 14:10' },
      { id: 'PS-2047', customer: 'Lucas Andrade (Nossa Sra do Socorro/SE)', items: 1, status: 'Pago', total: 219, payment: 'Pix', date: 'Hoje às 12:45' },
      { id: 'PS-2046', customer: 'Ana Paula (Salvador/BA)', items: 3, status: 'Enviado', total: 527, payment: 'Cartão de Crédito', date: 'Ontem às 18:20' }
    ];
    this.orders = this.storage.read('prime-orders', defaultOrders);

    this.bindEvents();
  },

  bindEvents() {
    const toggle = document.querySelector('#adminToggle');
    const panel = document.querySelector('#adminPanel');
    const close = document.querySelector('#closeAdmin');

    if (toggle) {
      toggle.addEventListener('click', () => {
        if (!this.isAuthenticated) {
          this.promptLogin();
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

  promptLogin() {
    const entered = window.prompt('Área Restrita Prime Story. Digite a senha administrativa (Padrão: prime2026):');
    if (entered === 'prime2026' || entered === 'admin') {
      this.isAuthenticated = true;
      this.openPanel();
    } else if (entered !== null) {
      alert('Senha incorreta.');
    }
  },

  openPanel() {
    const panel = document.querySelector('#adminPanel');
    if (!panel) return;
    this.renderStats();
    this.renderOrders();
    panel.classList.add('open');
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
          <small>Requerem atenção ou despacho</small>
        </div>
        <div>
          <span>Ticket Médio</span>
          <strong>${format(this.orders.length ? Math.round(totalSales / this.orders.length) : 0)}</strong>
          <small>Boutique Prime Aracaju</small>
        </div>
      `;
    }
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
          customer: 'Cliente Teste (Stripe Pix)',
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

  renderProductsManagement() {
    const listContainer = document.querySelector('.admin-list');
    if (!listContainer || !this.catalog) return;

    const products = this.catalog.getAll();
    const format = this.commerce ? this.commerce.formatCurrency : v => `R$ ${v.toFixed(2)}`;

    listContainer.innerHTML = `
      <div class="list-title">
        <h3>Gestão de Estoque e Catálogo</h3>
        <span style="font-size: 11px; color: var(--muted);">${products.length} SKUs ativos</span>
      </div>
      <div class="admin-products-table" style="overflow-x:auto;">
        ${products.map(p => `
          <div class="order-row" style="grid-template-columns: 50px 1.5fr 100px 120px; gap: 12px; align-items:center;">
            <img src="${p.image}" alt="" style="width: 44px; height: 55px; object-fit: cover; border-radius: 2px;">
            <div>
              <strong>${p.name}</strong> (${p.category})
              <small>SKU: ${p.sku || 'PS-' + p.id} · ${format(p.price)}</small>
            </div>
            <div>
              <label style="font-size: 10px; display: block; color: var(--muted);">Estoque</label>
              <input type="number" min="0" value="${p.stock}" class="admin-stock-input" data-id="${p.id}" style="width: 60px; padding: 4px; border: 1px solid var(--line);">
            </div>
            <div>
              <span class="status ${p.stock > 0 ? 'paid' : 'preparing'}">${p.stock > 0 ? 'Em estoque' : 'Esgotado'}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    listContainer.querySelectorAll('.admin-stock-input').forEach(input => {
      input.addEventListener('change', e => {
        const id = Number(e.target.dataset.id);
        const val = parseInt(e.target.value, 10) || 0;
        const prod = this.catalog.getById(id);
        if (prod) {
          prod.stock = val;
          window.PrimeControllers?.store?.renderCatalog();
          this.logAudit(`Estoque de "${prod.name}" ajustado para ${val} unidades.`);
        }
      });
    });
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
