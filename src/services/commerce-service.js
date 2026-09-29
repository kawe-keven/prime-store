const commerceService = {
  coupons: {
    PRIME10: { type: 'percent', value: 10, label: '10% OFF especial' },
    BEMVINDA: { type: 'percent', value: 15, label: '15% OFF primeira compra' },
    FRETEGRATIS: { type: 'shipping', value: 0, label: 'Frete grátis liberado' }
  },

  calculateSubtotal(items = []) {
    return items.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      return total + price * qty;
    }, 0);
  },

  applyCoupon(subtotal, code = '') {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, code: '', discount: 0, message: '' };
    }

    const coupon = this.coupons[cleanCode];
    if (!coupon) {
      return {
        valid: false,
        code: cleanCode,
        discount: 0,
        message: 'Cupom inválido ou expirado.'
      };
    }

    if (coupon.type === 'percent') {
      const discount = Math.round((subtotal * (coupon.value / 100)) * 100) / 100;
      return {
        valid: true,
        code: cleanCode,
        discount,
        label: coupon.label,
        message: `Cupom aplicado: ${coupon.label}!`
      };
    }

    return {
      valid: true,
      code: cleanCode,
      discount: 0,
      isFreeShipping: true,
      label: coupon.label,
      message: `${coupon.label}!`
    };
  },

  calculateShipping(cep = '', subtotal = 0) {
    const cleanCep = (cep || '').replace(/\D/g, '');
    const isFreeByValue = subtotal >= 199;

    if (!cleanCep || cleanCep.length < 8) {
      return {
        valid: false,
        options: [
          { id: 'local-pickup', name: 'Retirada na loja física (Aracaju/SE)', price: 0, deadline: 'Pronto em até 2h' },
          { id: 'local-express', name: 'Entrega local em Aracaju', price: isFreeByValue ? 0 : 12, deadline: 'Até 24h úteis' }
        ],
        selected: isFreeByValue ? { id: 'local-express', price: 0 } : { id: 'local-express', price: 12 },
        message: 'Digite seu CEP para calcular o frete exato.'
      };
    }

    const cepNumber = parseInt(cleanCep, 10);
    const isAracaju = cepNumber >= 49000000 && cepNumber <= 49099999;
    const isSergipe = cepNumber >= 49000000 && cepNumber <= 49999999;

    let options = [];

    if (isAracaju) {
      options = [
        {
          id: 'pickup',
          name: 'Retirada na Boutique Prime (Jardins, Aracaju)',
          price: 0,
          deadline: 'Disponível em até 2h após aprovação'
        },
        {
          id: 'express-aju',
          name: 'Entrega Expressa Aracaju',
          price: isFreeByValue ? 0 : 12,
          deadline: 'Em até 24h úteis'
        }
      ];
    } else if (isSergipe) {
      options = [
        {
          id: 'pac-se',
          name: 'Envio Regional Sergipe',
          price: isFreeByValue ? 0 : 18,
          deadline: '2 a 3 dias úteis'
        },
        {
          id: 'sedex-se',
          name: 'Sedex Sergipe',
          price: 28,
          deadline: '1 a 2 dias úteis'
        }
      ];
    } else {
      options = [
        {
          id: 'pac-nac',
          name: 'PAC Nacional',
          price: isFreeByValue ? 0 : 26,
          deadline: '5 a 8 dias úteis'
        },
        {
          id: 'sedex-nac',
          name: 'SEDEX Expresso',
          price: 44,
          deadline: '2 a 4 dias úteis'
        }
      ];
    }

    return {
      valid: true,
      cep: cleanCep,
      isFreeByValue,
      options,
      selected: options[0]
    };
  },

  canPurchase(product, requestedQty = 1) {
    if (!product) return false;
    const stock = Number(product.stock) || 0;
    return stock >= requestedQty;
  },

  formatCurrency(value) {
    const num = Number(value) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
};

if (typeof window !== 'undefined') {
  window.PrimeServices = window.PrimeServices || {};
  window.PrimeServices.commerce = commerceService;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { commerceService };
}
