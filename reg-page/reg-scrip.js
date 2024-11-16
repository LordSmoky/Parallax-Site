document.addEventListener('mousemove', e => {
    Object.assign(document.documentElement, {
        style: `
        --move-x: ${(e.clientX - window.innerWidth / 2) * -.005}deg;
        --move-y: ${(e.clientY - window.innerHeight / 2) * -.01}deg;
        `
    })
})

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

