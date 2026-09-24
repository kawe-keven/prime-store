const photoAssets = [
  'public/assets/instagram/post-01.jpg',
  'public/assets/instagram/post-02.jpg',
  'public/assets/instagram/post-03.jpg',
  'public/assets/instagram/post-04.jpg',
  'public/assets/instagram/post-05.jpg',
  'public/assets/instagram/post-06.jpg',
  'public/assets/instagram/post-07.jpg',
  'public/assets/instagram/post-08.jpg',
  'public/assets/instagram/post-09.jpg'
];

window.PrimeInstagramAssets = photoAssets;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-instagram-slot]').forEach((image, index) => {
    if (window.PrimeInstagramAssets[index]) image.src = window.PrimeInstagramAssets[index];
  });
  document.querySelectorAll('#productGrid .product-image img').forEach((image, index) => {
    if (window.PrimeInstagramAssets[index]) image.src = window.PrimeInstagramAssets[index];
  });
});
