const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path'); // Импортируем модуль path
const app = express();
const port = 8080;

// Настройки подключения к базе данных

const config = {
    server: LST,
    database: 'Umberlla_Shop',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    }
};

sql.connect(config)
    .then(() => {
        console.log('Подключение к базе данных успешно');
        // Дальнейшая логика вашего приложения
    })
    .catch(err => {
        console.error('Ошибка подключения к базе данных:', err);
    });

// Middleware
app.use(bodyParser.json());
app.use(express.static('./')); // Указываем директорию для статических файлов

// Обработчик для получения всех продуктов
app.get('/products', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT id, name, brand, price, quantity FROM products');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Обработчик для получения всех пользователей
app.get('/users', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT id, email, password FROM users');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Обработчик для добавления нового пользователя
app.post('/users/add', async (req, res) => {
    const {email, password } = req.body; // Добавляем username

    if (!email || !password) {
        return res.status(400).send('Invalid request body');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await sql.connect(config);
        await sql.query(`INSERT INTO users (email, password) VALUES ('${email}', '${hashedPassword}')`);
        res.status(201).send('User created');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Обработчики для страниц
app.get('/catalog', (req, res) => {
    // res.sendFile(path.join(__dirname, 'catalog.html')); // Правильный путь к файлу
    res.send('Каталог загружен');
    });

app.get('/reg', (req, res) => {
    res.sendFile('reg.html'); // Правильный путь к файлу
});

app.get('/login', (req, res) => {
    res.sendFile('log-in.html'); // Правильный путь к файлу
});

// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});