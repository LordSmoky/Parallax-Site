const products = [
    { id: 1, name: 'Ul1201', category: 'fulton' },
    { id: 2, name: 'K1000FN', category: 'fulton' },
    { id: 3, name: 'Футболка', category: 'clothing' },
    { id: 4, name: 'Джинсы', category: 'clothing' },
    { id: 5, name: 'Книга', category: 'books' },
    { id: 6, name: 'Pen09IIs', category: 'fulton' },
];

function displayProducts(filterCategory = 'all', searchTerm = '') {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    const filteredProducts = products.filter(product => {
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    filteredProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `<h2>${product.name}</h2><p>Brend: ${product.category}</p>`;
        productList.appendChild(productDiv);
    });
}

document.getElementById('search').addEventListener('input', (event) => {
    const searchTerm = event.target.value;
    const category = document.getElementById('category').value;
    displayProducts(category, searchTerm);
});

document.getElementById('category').addEventListener('change', (event) => {
    const category = event.target.value;
    const searchTerm = document.getElementById('search').value;
    displayProducts(category, searchTerm);
});

// Изначально отображаем все продукты
displayProducts();
