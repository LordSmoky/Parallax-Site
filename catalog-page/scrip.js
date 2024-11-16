let products = [];

// Функция для загрузки продуктов из базы данных
async function loadProducts() {
    try {
        const response = await fetch('/products');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        products = await response.json();
        displayProducts(); // Отобразить загруженные продукты
    } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
    }
}

// Функция для отображения продуктов
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
        productDiv.innerHTML = `<h2>${product.name}</h2><p>Бренд: ${product.brand}</p><p>Цена: ${product.price}</p>`;
        productList.appendChild(productDiv);
    });
}

// Обработчики событий для поиска и фильтрации
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

// Вызов функции загрузки продуктов при загрузке страницы
loadProducts();