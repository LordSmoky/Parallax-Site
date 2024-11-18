document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    console.log('Form submitted');
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/users/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            alert('Пользователь успешно создан!');
        } else {
            const errorMessage = await response.text(); // Получаем текст ошибки
            alert(`Ошибка при создании пользователя: ${errorMessage}`);
        }
    } catch (error) {
        alert(`Ошибка сети: ${error.message}`);
    }
});

