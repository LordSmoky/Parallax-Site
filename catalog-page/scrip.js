let products = [];
let brands = [];

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

// Функция для загрузки брендов из базы данных
async function loadBrands() {
    try {
        const response = await fetch('/brands');
        if (!response.ok) {
            const errorText = await response.text(); // Получить текст ошибки
            throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
        }
        brands = await response.json();
        console.log('Загруженные бренды:', brands);
        populateBrandSelect(); // Заполнить выпадающий список брендов
    } catch (error) {
        console.error('Ошибка при загрузке брендов:', error);
    }
}

// Функция для заполнения выпадающего списка брендов
function populateBrandSelect() {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="all">ALL</option>'; // Сбросить и добавить "Все"

    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.brand; // Используем значение бренда
        option.textContent = brand.brand; // Отображаемое имя
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

// Вызов функции загрузки продуктов и брендов при загрузке страницы
loadProducts();
loadBrands();






function updateAccountLink() {
    const token = localStorage.getItem('token');
    const accountIcon = document.getElementById('account-icon');
    const userInitial = document.getElementById('user-initial');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    if (token) {
        const user = JSON.parse(atob(token.split('.')[1])); // Декодируем токен
        const firstNameLetter = user.email.charAt(0).toUpperCase(); // Первая буква email (или имени)
        userInitial.textContent = firstNameLetter; // Устанавливаем букву в кружок
        
        // Скрыть иконку и показать кружок
        accountIcon.style.display = 'none';
        userInitial.style.display = 'flex'; // Показать кружок
        loginLink.style.display = 'none'; // Скрыть ссылку на вход
        logoutLink.style.display = 'block'; // Показать ссылку на выход

        // Обработчик для выхода
        logoutLink.onclick = function() {
            localStorage.removeItem('token'); // Удалить токен
            updateAccountLink(); // Обновить интерфейс
        };
    } else {
        // Показать иконку и скрыть кружок
        userInitial.style.display = 'none'; // Скрыть кружок
        accountIcon.style.display = 'block'; // Показать иконку
        loginLink.style.display = 'block'; // Показать ссылку на вход
        logoutLink.style.display = 'none'; // Скрыть ссылку на выход
    }
}

// Вызов функции для первоначальной инициализации
updateAccountLink();



// на страницу cart
// window.addEventListener('load', () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         // Если токена нет, перенаправьте на страницу входа
//         window.location.href = 'log-in.html';
//     }
//     // Здесь можно добавить дополнительную логику, например, декодирование токена
// }); 