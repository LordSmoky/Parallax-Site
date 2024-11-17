const express = require('express');
const { Pool } = require('pg'); // Импортируем Pool из pg
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path'); // Импортируем модуль path
const app = express();
const port = 8080;

// Настройки подключения к базе данных
const pool = new Pool({
    user: 'postgres', // Замените на ваше имя пользователя
    host: 'localhost', // Или IP-адрес вашего сервера
    database: 'Umbrella', // Название вашей базы данных
    password: '123321445', // Замените на ваш пароль
    port: 5432, // Порт по умолчанию для PostgreSQL
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('./')); // Указываем директорию для статических файлов

// Обработчик для получения всех продуктов
app.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, brand, price, quantity FROM products');
        res.json(result.rows); // Используем result.rows для PostgreSQL
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Обработчик для получения всех пользователей
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, password FROM users');
        res.json(result.rows); // Используем result.rows для PostgreSQL
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Обработчик для добавления нового пользователя
app.post('/users/add', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Invalid request body');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);
        res.status(201).send('User created');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Обработчик для получения всех уникальных брендов
app.get('/brands', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT brand FROM products');
        res.json(result.rows); // Возвращаем уникальные бренды
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Обработчики для страниц
app.get('/catalog', (req, res) => {
    res.send('Каталог загружен');
});

app.get('/reg', (req, res) => {
    res.sendFile(path.join(__dirname, 'reg.html')); // Правильный путь к файлу
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'log-in.html')); // Правильный путь к файлу
});


// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
