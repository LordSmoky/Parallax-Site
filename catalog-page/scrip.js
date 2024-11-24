let products = [];
let brands = [];

// Функция для загрузки продуктов из базы данных
async function loadProducts() {
    try {
        const response = await fetch('/products');
        if (!response.ok) throw new Error('Ошибка сети при загрузке продуктов');
        products = await response.json();
        displayProducts(); // Отобразить загруженные продукты
    } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
    }
}

// Функция для загрузки брендов из базы данных
async function loadBrands() {
    try {
        const response = await fetch('/brands');
        if (!response.ok) throw new Error('Ошибка сети при загрузке брендов');
        brands = await response.json();
        populateBrandSelect(); // Заполнить выпадающий список брендов
    } catch (error) {
        console.error('Ошибка при загрузке брендов:', error);
    }
}

// Функция для заполнения выпадающего списка брендов
function populateBrandSelect() {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="all">Все</option>'; // Сбросить и добавить "Все"

    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.brand; // Убедитесь, что это соответствует вашему полю в базе данных
        option.textContent = brand.brand;
        categorySelect.appendChild(option);
    });
}

// Функция для отображения продуктов
function displayProducts(filterCategory = 'all', searchTerm = '') {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    const filteredProducts = products.filter(product => {
        const matchesCategory = filterCategory === 'all' || product.brand === filterCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        productList.innerHTML = '<p>Нет доступных продуктов.</p>';
    } else {
        filteredProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image" />
                <h2>${product.name}</h2>
                <p>Бренд: ${product.brand}</p>
                <p>Цена: <span class="product-price">${product.price}</span> BYN</p>
                <button class="add-to-cart-button">Добавить в корзину</button>
            `;
            
            // Добавляем обработчик события для кнопки "Добавить в корзину"
            productDiv.querySelector('.add-to-cart-button').addEventListener('click', () => {
                addToCart(product, 1);
            });

            productList.appendChild(productDiv);
        });
    }
}

// Функция для добавления товара в корзину
async function addToCart(product, quantity) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Пожалуйста, войдите в систему, чтобы добавить товары в корзину.');
        return;
    }

    const cartItem = {
        productId: product.product_id, // Убедитесь, что это соответствует вашему полю в базе данных
        quantity: quantity
    };

    try {
        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cartItem)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка при добавлении товара в корзину: ${errorText}`);
        }

        alert(`${product.name} добавлен в корзину!`);
    } catch (error) {
        console.error('Ошибка:', error);
    }
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

// Вызов функции загрузки продуктов и брендов при загрузке страницы
loadProducts();
loadBrands();

// Обновление информации о пользователе
function updateAccountLink() {
    const token = localStorage.getItem('token');
    const accountIcon = document.getElementById('account-icon');
    const userInitial = document.getElementById('user-initial');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    if (token) {
        const user = JSON.parse(atob(token.split('.')[1])); // Декодируем токен
        userInitial.textContent = user.email.charAt(0).toUpperCase(); // Первая буква email
        accountIcon.style.display = 'none';
        userInitial.style.display = 'flex'; // Показать кружок
        loginLink.style.display = 'none'; // Скрыть ссылку на вход
        logoutLink.style.display = 'block'; // Показать ссылку на выход

        logoutLink.onclick = () => {
            localStorage.removeItem('token');
            updateAccountLink(); // Обновить интерфейс
        };
    } else {
        userInitial.style.display = 'none'; // Скрыть кружок
        accountIcon.style.display = 'block'; // Показать иконку
        loginLink.style.display = 'block'; // Показать ссылку на вход
        logoutLink.style.display = 'none'; // Скрыть ссылку на выход
    }
}

// Вызов функции для первоначальной инициализации
updateAccountLink();
