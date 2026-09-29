const categoryPalette = {
  Feminino: ['#f4e9df', '#d4a3a3', '#7a4b52'],
  Masculino: ['#dfe5e1', '#7a8b84', '#2d3f3b'],
  'Acessórios': ['#efe4d5', '#ba8f67', '#5f4334'],
  Novidades: ['#f5eddc', '#c6ab82', '#7b5647']
};

const createProductImage = (title, category, palette = ['#f4e9df', '#d4a3a3', '#7a4b52']) => {
  const safeTitle = (title || category || 'Prime Story')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const [light, accent, dark] = palette || ['#f4e9df', '#d4a3a3', '#7a4b52'];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${light}" />
          <stop offset="60%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${dark}" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#bg)" />
      <circle cx="640" cy="150" r="120" fill="rgba(255,255,255,0.18)" />
      <path d="M130 820C210 650 320 570 400 570C510 570 610 650 750 820V1000H130V820Z" fill="rgba(255,255,255,0.16)" />
      <rect x="210" y="190" width="380" height="540" rx="46" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.42)" />
      <text x="400" y="445" text-anchor="middle" fill="#fff" font-size="54" font-weight="700" font-family="Arial, sans-serif" letter-spacing="4">${safeTitle}</text>
      <text x="400" y="520" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-size="26" font-family="Arial, sans-serif" letter-spacing="8">${category}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const products = [
  {
    id: 1,
    sku: 'PS-FEM-AURORA',
    name: 'Vestido Aurora',
    category: 'Feminino',
    price: 289,
    stock: 8,
    tag: 'novo',
    sizes: ['P', 'M', 'G'],
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=85',
    description: 'Uma silhueta fluida para acompanhar os dias mais bonitos. Feito em linho misto com toque fresco e caimento que valoriza o movimento natural.',
    composition: '70% Linho, 30% Viscose'
  },
  {
    id: 2,
    sku: 'PS-MAS-THEO',
    name: 'Camisa Theo',
    category: 'Masculino',
    price: 219,
    stock: 12,
    tag: 'mais vendido',
    sizes: ['P', 'M', 'G', 'GG'],
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85',
    description: 'A camisa essencial com proporção contemporânea e toque macio. Botões de madrepérola e corte leve para usar aberta, fechada ou sobreposta.',
    composition: '100% Algodão Egípcio'
  },
  {
    id: 3,
    sku: 'PS-ACE-LUNA',
    name: 'Bolsa Luna',
    category: 'Acessórios',
    price: 179,
    stock: 5,
    tag: 'novo',
    sizes: ['Único'],
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85',
    description: 'Compacta por fora, espaçosa por dentro. Feita em couro vegetal com detalhes dourados em banho nobre e alça regulável.',
    composition: 'Couro vegetal e metais antioxidantes'
  },
  {
    id: 4,
    sku: 'PS-FEM-SERENA',
    name: 'Calça Serena',
    category: 'Feminino',
    price: 249,
    stock: 7,
    tag: 'elegante',
    sizes: ['36', '38', '40', '42'],
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85',
    description: 'Alfaiataria descontraída com cintura alta e caimento reto. O equilíbrio perfeito entre sofisticação e conforto do dia à noite.',
    composition: '95% Poliéster nobre, 5% Elastano'
  },
  {
    id: 5,
    sku: 'PS-MAS-OLIVA',
    name: 'Blazer Oliva',
    category: 'Masculino',
    price: 399,
    stock: 3,
    tag: 'alfaiataria',
    sizes: ['M', 'G', 'GG'],
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85',
    description: 'O blazer que faz a ponte entre o casual e o especial. Estrutura sem forro pesado para o clima tropical com elegância despretensiosa.',
    composition: '60% Linho, 40% Algodão'
  },
  {
    id: 6,
    sku: 'PS-ACE-LINA',
    name: 'Sandália Lina',
    category: 'Acessórios',
    price: 159,
    stock: 4,
    tag: 'últimas peças',
    sizes: ['35', '36', '37', '38', '39'],
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85',
    description: 'Linhas delicadas e palmilha acolchoada para caminhar por novas histórias com leveza e estilo.',
    composition: 'Couro legítimo artesanal'
  },
  {
    id: 7,
    sku: 'PS-FEM-NOLA',
    name: 'Regata Nola',
    category: 'Feminino',
    price: 119,
    stock: 10,
    tag: 'básico nobre',
    sizes: ['P', 'M', 'G'],
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85',
    description: 'Minimalista e versátil, confeccionada em malha canelada de alta densidade que não marca e não desbota.',
    composition: '96% Viscose Vortex, 4% Elastano'
  },
  {
    id: 8,
    sku: 'PS-ACE-MILO',
    name: 'Carteira Milo',
    category: 'Acessórios',
    price: 89,
    stock: 6,
    tag: 'artesanal',
    sizes: ['Único'],
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85',
    description: 'Pequenos detalhes, grande presença. Costura manual reforçada e compartimentos para até 6 cartões e cédulas.',
    composition: 'Couro premium curtido vegetal'
  }
];

const catalogModel = {
  categories: ['Todos', 'Feminino', 'Masculino', 'Acessórios'],
  categoryPalette,
  products,
  getAll() {
    return this.products;
  },
  getById(id) {
    const numId = Number(id);
    return this.products.find(p => p.id === numId) || null;
  },
  getByCategory(category) {
    if (!category || category === 'Todos') return this.products;
    if (category === 'Novidades') return this.products.filter(p => p.tag === 'novo');
    return this.products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
};

if (typeof window !== 'undefined') {
  window.PrimeVisuals = window.PrimeVisuals || {};
  window.PrimeVisuals.categoryPalette = categoryPalette;
  window.PrimeVisuals.createProductImage = createProductImage;

  window.PrimeModels = window.PrimeModels || {};
  window.PrimeModels.catalog = catalogModel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { catalogModel, products, categoryPalette };
}
