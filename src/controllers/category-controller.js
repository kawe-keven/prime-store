window.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('#categoryProducts');
  const category = document.body.dataset.category;
  const catalog = window.PrimeModels?.catalog;
  const commerce = window.PrimeServices?.commerce;
  const searchInput = document.querySelector('#categorySearch');
  if (!grid || !catalog || !commerce) return;

  const renderProducts = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const products = catalog.products.filter(product => category === 'Novidades'
      ? product.tag === 'novo'
      : product.category === category);

    const filteredProducts = query
      ? products.filter(product => `${product.name} ${product.category}`.toLowerCase().includes(query))
      : products;

    grid.innerHTML = filteredProducts.length
      ? filteredProducts.map(product => `
          <article class="product-card category-product-card">
            <div class="product-image">
              <img src="${product.image || ''}" alt="${product.name}" loading="lazy">
              ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
            </div>
            <div class="product-info">
              <div><div class="product-name">${product.name}</div><div class="product-category">${product.category}</div></div>
              <div class="product-price">${commerce.formatCurrency(product.price)}</div>
            </div>
          </article>
        `).join('')
      : `<div class="empty-state">Nenhuma peça encontrada para sua busca.</div>`;
  };

  searchInput?.addEventListener('input', renderProducts);
  renderProducts();
});
