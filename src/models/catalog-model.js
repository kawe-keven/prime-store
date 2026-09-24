window.PrimeVisuals = window.PrimeVisuals || {};
window.PrimeVisuals.categoryPalette = {
  Feminino: ['#f4e9df', '#d4a3a3', '#7a4b52'],
  Masculino: ['#dfe5e1', '#7a8b84', '#2d3f3b'],
  'Acessórios': ['#efe4d5', '#ba8f67', '#5f4334'],
  Novidades: ['#f5eddc', '#c6ab82', '#7b5647']
};

window.PrimeVisuals.createProductImage = (title, category, palette = ['#f4e9df', '#d4a3a3', '#7a4b52']) => {
  const safeTitle = (title || category || 'Prime Story')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const [light, accent, dark] = palette;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
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

window.PrimeModels = window.PrimeModels || {};

window.PrimeModels.catalog = {
  categories: ['Todos', 'Feminino', 'Masculino', 'Acessórios'],
  products: [
    { id: 1, name: 'Vestido Aurora', category: 'Feminino', price: 289, stock: 8, tag: 'novo', image: window.PrimeVisuals.createProductImage('Vestido Aurora', 'Feminino', window.PrimeVisuals.categoryPalette.Feminino) },
    { id: 2, name: 'Camisa Theo', category: 'Masculino', price: 219, stock: 12, tag: 'mais vendido', image: window.PrimeVisuals.createProductImage('Camisa Theo', 'Masculino', window.PrimeVisuals.categoryPalette.Masculino) },
    { id: 3, name: 'Bolsa Luna', category: 'Acessórios', price: 179, stock: 5, tag: 'novo', image: window.PrimeVisuals.createProductImage('Bolsa Luna', 'Acessórios', window.PrimeVisuals.categoryPalette['Acessórios']) },
    { id: 4, name: 'Calça Serena', category: 'Feminino', price: 249, stock: 7, tag: '', image: window.PrimeVisuals.createProductImage('Calça Serena', 'Feminino', window.PrimeVisuals.categoryPalette.Feminino) },
    { id: 5, name: 'Blazer Oliva', category: 'Masculino', price: 399, stock: 3, tag: '', image: window.PrimeVisuals.createProductImage('Blazer Oliva', 'Masculino', window.PrimeVisuals.categoryPalette.Masculino) },
    { id: 6, name: 'Sandália Lina', category: 'Acessórios', price: 159, stock: 4, tag: 'últimas peças', image: window.PrimeVisuals.createProductImage('Sandália Lina', 'Acessórios', window.PrimeVisuals.categoryPalette['Acessórios']) },
    { id: 7, name: 'Regata Nola', category: 'Feminino', price: 119, stock: 10, tag: '', image: window.PrimeVisuals.createProductImage('Regata Nola', 'Feminino', window.PrimeVisuals.categoryPalette.Feminino) },
    { id: 8, name: 'Carteira Milo', category: 'Acessórios', price: 89, stock: 6, tag: '', image: window.PrimeVisuals.createProductImage('Carteira Milo', 'Acessórios', window.PrimeVisuals.categoryPalette['Acessórios']) }
  ]
};
