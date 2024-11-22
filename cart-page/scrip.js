document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.getElementById('product-list');
    const totalAmountElement = document.getElementById('total-amount');

    const token = localStorage.getItem('token');

    function checkAuth() {
        if (!token) {
            alert('Пожалуйста, войдите в систему для доступа к этой странице.');
            window.location.href = 'log-in.html';
        }
    }
    
    // Проверка аутентификации
    checkAuth();

    await loadCart(); // Загружаем содержимое корзины при загрузке страницы

    document.getElementById('logout-link').addEventListener('click', async () => {
        localStorage.removeItem('token'); // Удаляем токен
        alert('Вы вышли из системы. Пожалуйста, войдите снова.'); 
        totalAmountElement.textContent = '0$'; // Обнуляем общую сумму
        await fetch('/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }}); 
        window.location.href = 'log-in.html'; // Перенаправляем на страницу входа
    });
});

async function loadCart() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('/cart', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        console.error('Ошибка загрузки данных: ' + response.statusText);
        return;
    }

    const cartItems = await response.json();
    const productList = document.getElementById('product-list');
    const totalAmountElement = document.getElementById('total-amount');

    productList.innerHTML = ''; // Очистить список перед добавлением новых элементов

    if (cartItems.length === 0) {
        productList.innerHTML = '<p>Корзина пуста.</p>';
        totalAmountElement.textContent = '$0'; // Обнуляем общую сумму
        return;
    }

    let totalAmount = 0;

    cartItems.forEach(item => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('cart-product');
        productDiv.dataset.id = item.product_id;
        productDiv.dataset.price = item.price;

        productDiv.innerHTML = `
            <h2 class="product-name">${item.name}</h2>
            <div class="product-price">Цена: ${item.price}</div>
            <div class="quantity-controls">
                <button class="quantity-button decrease">-</button>
                <div class="quantity">${item.quantity}</div>
                <button class="quantity-button increase">+</button>
            </div>
        `;
        productList.appendChild(productDiv);
        totalAmount += item.price * item.quantity;

        // Добавляем обработчики событий для изменения количества
        const decreaseButton = productDiv.querySelector('.decrease');
        const increaseButton = productDiv.querySelector('.increase');

        decreaseButton.addEventListener('click', () => {
            updateQuantity(item.product_id, -1);
        });

        increaseButton.addEventListener('click', () => {
            updateQuantity(item.product_id, 1);
        });
    });

    totalAmountElement.textContent = `${totalAmount.toFixed(2)}$`;
}

async function updateQuantity(productId, change) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Пожалуйста, войдите в систему, чтобы изменить количество товаров в корзине.');
        return;
    }

    try {
        const response = await fetch('/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, change })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка при обновлении количества: ${errorText}`);
        }

        // Обновляем корзину после изменения количества
        await loadCart();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

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

// Встраиваем функцию checkout
async function checkout() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Пожалуйста, войдите в систему для оформления заказа.');
        return;
    }

    try {
        const response = await fetch('/checkout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при оформлении заказа.');
        }

        const result = await response.json();
        alert(`Заказ оформлен! ID заказа: ${result.orderId}, новая корзина ID: ${result.newCartId}`);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось оформить заказ. Пожалуйста, попробуйте позже.');
    }
}

// Обработчик события для кнопки оформления заказа
document.getElementById('checkout-button').addEventListener('click', async () => {
    await checkout(); // Вызов функции оформления заказа
});

// Вызов функции для первоначальной инициализации
updateAccountLink();

