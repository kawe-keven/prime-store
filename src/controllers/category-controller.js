window.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('#categoryProducts');
  const category = document.body.dataset.category;
  const catalog = window.PrimeModels?.catalog;
  const commerce = window.PrimeServices?.commerce;
  const views = window.PrimeViews?.catalog;
  const searchInput = document.querySelector('#categorySearch');
  
  if (!grid || !catalog || !commerce) return;

  const renderProducts = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const products = catalog.getByCategory(category);
    const favorites = window.PrimeControllers?.store?.favorites || [];

    const filtered = query
      ? products.filter(p => `${p.name} ${p.category} ${p.description || ''}`.toLowerCase().includes(query))
      : products;

    if (views) {
      grid.innerHTML = filtered.length
        ? filtered.map(p => views.productCard(p, commerce.formatCurrency, favorites.includes(p.id))).join('')
        : `<div class="empty-state" style="grid-column: 1 / -1; padding: 40px;">Nenhuma peça encontrada para sua busca nesta categoria.</div>`;
    }
  };

  grid.addEventListener('click', e => {
    const heartBtn = e.target.closest('.product-heart');
    if (heartBtn) {
      e.stopPropagation();
      const id = Number(heartBtn.dataset.id);
      window.PrimeControllers?.store?.toggleFavorite(id);
      return;
    }

    const card = e.target.closest('.product-card');
    if (card) {
      const id = Number(card.dataset.id);
      window.PrimeControllers?.store?.openProductModal(id);
    }
  });

  searchInput?.addEventListener('input', renderProducts);
  renderProducts();
});

