function updateAccountLink() {
    const token = localStorage.getItem('token');
    const accountIcon = document.getElementById('account-icon');
    const userInitial = document.getElementById('user-initial');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const myOrdersLink = document.getElementById('my-orders-link');

    if (token) {
        const user = JSON.parse(atob(token.split('.')[1])); // Декодируем токен
        const firstNameLetter = user.email.charAt(0).toUpperCase(); // Первая буква email (или имени)
        userInitial.textContent = firstNameLetter; // Устанавливаем букву в кружок
        
        // Скрыть иконку и показать кружок
        accountIcon.style.display = 'none';
        userInitial.style.display = 'flex'; // Показать кружок
        loginLink.style.display = 'none'; // Скрыть ссылку на вход
        logoutLink.style.display = 'block'; // Показать ссылку на выход
        myOrdersLink.style.display = 'block';

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
        myOrdersLink.style.display = 'none';
    }
}

// Вызов функции для первоначальной инициализации
updateAccountLink();
