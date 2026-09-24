window.PrimeViews = window.PrimeViews || {};

window.PrimeViews.catalog = {
  productCard(product, formatCurrency) {
    return `<article class="product-card" data-id="${product.id}"><div class="product-image"><div class="product-image-fallback"></div>${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}<button class="product-heart" aria-label="Favoritar ${product.name}">♡</button></div><div class="product-info"><div><div class="product-name">${product.name}</div><div class="product-category">${product.category}</div></div><div class="product-price">${formatCurrency(product.price)}</div></div></article>`;
  },
  render(products, formatCurrency) {
    const grid = document.querySelector('#productGrid');
    if (grid) grid.innerHTML = products.map(product => this.productCard(product, formatCurrency)).join('');
  }
};
