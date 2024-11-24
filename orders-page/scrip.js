document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Пожалуйста, войдите в систему для доступа к этой странице.');
        window.location.href = 'log-in.html';
        return;
    }

    await loadOrders();

    async function loadOrders() {
        try {
            const response = await fetch('/user-orders', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке заказов.');
            }

            const orders = await response.json();
            const orderList = document.getElementById('order-list');
            orderList.innerHTML = ''; // Очищаем список заказов

            if (orders.length === 0) {
                orderList.innerHTML = '<p>У вас нет заказов.</p>';
                return;
            }

            // Отображаем заказы
            orders.forEach(order => {
                const orderElement = document.createElement('div');
                orderElement.className = 'order-item';
                orderElement.innerHTML = `
                    <h2>Заказ ID: ${order.order_id}</h2>
                    <p>Дата заказа: ${new Date(order.date).toLocaleString()}</p>
                    <p>Общая сумма: ${order.total_price} BYN</p>
                    <h3>Предметы:</h3>
                    <ul>
                        ${order.items.map(item => `<li>${item.name} (Количество: ${item.quantity})</li>`).join('')}
                    </ul>
                `;
                orderList.appendChild(orderElement);
            });
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить заказы. Пожалуйста, попробуйте позже.');
        }
    }
});
