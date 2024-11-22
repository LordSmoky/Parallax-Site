document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.getElementById('product-list');

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
    const totalPriceElement = document.getElementById('total-price');
    const orderButton = document.getElementById('order-button');

    productList.innerHTML = ''; // Очистить список перед добавлением новых элементов
    let totalPrice = 0;

    if (cartItems.length === 0) {
        productList.innerHTML = '<p>Корзина пуста.</p>';
        totalPriceElement.textContent = 'Общая сумма: 0';
        orderButton.style.display = 'none'; // Скрыть кнопку, если корзина пуста
        return;
    }

    cartItems.forEach(item => {
        if (item.quantity > 0) {
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

            const decreaseButton = productDiv.querySelector('.decrease');
            const increaseButton = productDiv.querySelector('.increase');

            decreaseButton.addEventListener('click', async () => {
                if (item.quantity === 1) {
                    await removeFromCart(item.product_id);
                } else {
                    await updateQuantity(item.product_id, -1);
                }
            });

            increaseButton.addEventListener('click', () => {
                updateQuantity(item.product_id, 1);
            });

            totalPrice += item.price * item.quantity;
        }
    });

    totalPriceElement.textContent = `Общая сумма: ${totalPrice.toFixed(2)}`;
    orderButton.style.display = 'block'; // Показать кнопку, если корзина не пуста

    // Обработчик события для общей кнопки "Заказать"
    orderButton.addEventListener('click', async () => {
            await placeOrder();
      
    });

    orderButton.addEventListener('click', async () => {
        window.location.reload(); 
    });
   
}

async function updateQuantity(productId, change) {
    const token = localStorage.getItem('token');
    if (!token) return;

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

        // Обновление интерфейса после успешного изменения количества
        await loadCart(); // Перезагрузить корзину для обновления интерфейса
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось обновить количество. Пожалуйста, попробуйте позже.');
    }
}

// Функция для удаления товара из корзины
async function removeFromCart(productId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка при удалении товара: ${errorText}`);
        }

        // Обновление интерфейса после успешного удаления
        alert('Товар удален из корзины.');
        await loadCart(); // Перезагрузить корзину для обновления интерфейса
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить товар. Пожалуйста, попробуйте позже.');
    }
}


// Встраиваем функцию checkout
async function checkout(productId, quantity) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Пожалуйста, войдите в систему для оформления заказа.');
        return;
    }

    try {
        const response = await fetch('/orders/add', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: productId, quantity }) // Изменяем на product_id
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка при оформлении заказа: ${errorText}`);
        }

        const result = await response.json();
        alert(`Заказ оформлен! ID заказа: ${result.order_id}`); // Изменяем на order_id
        await loadCart(); // Обновляем корзину после оформления заказа
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось оформить заказ. Пожалуйста, попробуйте позже.');
    }
}

async function placeOrder() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/orders/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка при оформлении заказа: ${errorText}`);
        }

        const data = await response.json();
        alert(`Заказ оформлен! ID заказа: ${data.orderId}`); // Убедитесь, что вы используете правильное имя поля
    } catch (error) {
        console.error('Ошибка:', error);
    }
}


// Вызов функции для первоначальной инициализации
updateAccountLink();
