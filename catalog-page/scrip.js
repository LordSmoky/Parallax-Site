const products = [
    { id: 1, name: 'Ul1201', category: 'fulton' },
    { id: 2, name: 'K1000FN', category: 'fulton' },
    { id: 3, name: 'Футболка', category: 'clothing' },
    { id: 4, name: 'Джинсы', category: 'clothing' },
    { id: 5, name: 'Книга', category: 'books' },
    { id: 6, name: 'Pen09IIs', category: 'fulton' },
    { id: 7, name: 'Супер-сковорода', category: 'kitchen' },
    { id: 8, name: 'Невидимая ручка', category: 'office' },
    { id: 9, name: 'Кроссовки для дивана', category: 'footwear' },
    { id: 10, name: 'Умный холодильник', category: 'appliances' },
    { id: 11, name: 'Книга по саморазвитию для ленивых', category: 'books' },
    { id: 12, name: 'Чашка с секретом', category: 'kitchen' },
    { id: 13, name: 'Футболка с надписью "Я не сплю, я отдыхаю"', category: 'clothing' },
    { id: 14, name: 'Супер-удобное кресло', category: 'furniture' },
    { id: 15, name: 'Портативный диван', category: 'furniture' },
    { id: 16, name: 'Книга для чтения в ванной', category: 'books' },
    { id: 17, name: 'Секретный соус', category: 'kitchen' },
    { id: 18, name: 'Носки с антиподъемом', category: 'clothing' },
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
