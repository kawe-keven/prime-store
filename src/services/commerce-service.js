window.PrimeServices = window.PrimeServices || {};

window.PrimeServices.commerce = {
  calculateSubtotal(items) {
    return items.reduce((total, item) => total + item.price * item.qty, 0);
  },
  applyCoupon(subtotal, code) {
    if (code.trim().toUpperCase() !== 'PRIME10') return { discount: 0, valid: false };
    return { discount: subtotal * 0.1, valid: true };
  },
  canPurchase(product) {
    return product && product.stock > 0;
  },
  formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
};
