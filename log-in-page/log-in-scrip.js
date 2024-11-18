document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('token', token); // Сохраняем токен в localStorage
            alert('Успешный вход!');
            window.location.href = 'catalog.html'; // Перенаправление на страницу каталога
        } else {
            const errorMessage = await response.text();
            alert(`Ошибка при входе: ${errorMessage}`);
        }
    } catch (error) {
        alert(`Ошибка сети: ${error.message}`);
    }
});