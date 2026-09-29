window.PrimeViews = window.PrimeViews || {};

window.PrimeViews.catalog = {
  productCard(product, formatCurrency, isFavorite = false) {
    const installments = Math.floor(product.price / 3);
    const sizesBadge = (product.sizes || []).slice(0, 3).join(' · ');

    return `
      <article class="product-card" data-id="${product.id}" role="button" tabindex="0" aria-label="Ver detalhes de ${product.name}">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name} - ${product.category}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml;charset=UTF-8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 500\'><rect width=\'400\' height=\'500\' fill=\'%23d8c4b1\'/><text x=\'50%\' y=\'50%\' fill=\'%23fff\' text-anchor=\'middle\' font-size=\'20\'>Prime Story</text></svg>'">
          ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
          <button class="product-heart ${isFavorite ? 'active' : ''}" data-id="${product.id}" aria-label="${isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}">
            ${isFavorite ? '♥' : '♡'}
          </button>
          <div class="product-overlay-action">
            <span>Ver detalhes</span>
          </div>
        </div>
        <div class="product-info">
          <div>
            <div class="product-name">${product.name}</div>
            <div class="product-category">${product.category} ${sizesBadge ? `· Tam: ${sizesBadge}` : ''}</div>
          </div>
          <div class="product-pricing">
            <div class="product-price">${formatCurrency(product.price)}</div>
            <small class="product-installments">3x de ${formatCurrency(installments)}</small>
          </div>
        </div>
      </article>
    `;
  },

  render(products, formatCurrency, favorites = []) {
    const grid = document.querySelector('#productGrid');
    if (!grid) return;

    if (!products || products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 60px 20px;">
          <p style="font-size: 18px; margin-bottom: 8px;">Nenhuma peça encontrada.</p>
          <small style="color: var(--muted);">Tente buscar por outro termo ou selecione outra categoria.</small>
        </div>
      `;
      return;
    }

    grid.innerHTML = products
      .map(product => this.productCard(product, formatCurrency, favorites.includes(product.id)))
      .join('');
  },

  productDetail(product, formatCurrency) {
    const installments = Math.floor(product.price / 3);
    const sizes = product.sizes || ['P', 'M', 'G'];

    return `
      <div class="product-detail">
        <div class="detail-gallery">
          <img class="detail-image" src="${product.image}" alt="${product.name}" />
          ${product.tag ? `<span class="detail-tag">${product.tag}</span>` : ''}
        </div>
        <div class="detail-copy">
          <p class="eyebrow">${product.category} · Código: ${product.sku || 'PS-' + product.id}</p>
          <h2>${product.name}</h2>
          <div class="price-box">
            <div class="price">${formatCurrency(product.price)}</div>
            <span class="detail-installments">ou 3x de ${formatCurrency(installments)} sem juros no cartão</span>
          </div>
          
          <p class="product-desc">${product.description || ''}</p>
          ${product.composition ? `<p class="product-comp"><strong>Composição:</strong> ${product.composition}</p>` : ''}

          <div class="size-selection-area">
            <div class="size-header">
              <span class="size-label">Escolha o tamanho:</span>
              <span class="stock-badge ${product.stock <= 4 ? 'low-stock' : ''}">
                ${product.stock > 0 ? `${product.stock} disponíveis em estoque` : 'Esgotado'}
              </span>
            </div>
            <div class="sizes" role="radiogroup" aria-label="Tamanhos disponíveis">
              ${sizes.map((s, idx) => `
                <button type="button" class="size ${idx === 0 ? 'selected' : ''}" data-size="${s}" role="radio" aria-checked="${idx === 0 ? 'true' : 'false'}">
                  ${s}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="detail-actions">
            <button class="button button-dark full add-to-cart-action" id="addProductModalBtn" ${product.stock <= 0 ? 'disabled' : ''}>
              ${product.stock > 0 ? 'Adicionar à Sacola <span>→</span>' : 'Produto Esgotado'}
            </button>
          </div>

          <div class="product-perks">
            <div><span>⚡</span> Entrega local expressa em Aracaju em até 24h</div>
            <div><span>📦</span> Frete Grátis para todo o Brasil acima de R$ 199</div>
            <div><span>↺</span> Primeira troca grátis em até 7 dias úteis</div>
          </div>

          <a class="whatsapp-link" href="https://wa.me/5579999999999?text=Ol%C3%A1%20Prime%20Story!%20Gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20a%20pe%C3%A7a%20${encodeURIComponent(product.name)}%20(ref%20${product.sku || product.id})" target="_blank" rel="noopener noreferrer">
            💬 Atendimento VIP via WhatsApp ↗
          </a>
        </div>
      </div>
    `;
  }
};
