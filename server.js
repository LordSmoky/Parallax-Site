const express = require('express');
const { Pool } = require('pg'); // Импортируем Pool из pg
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path'); // Импортируем модуль path
const jwt = require('jsonwebtoken'); // Импортируем jsonwebtoken
const app = express();
const port = 8080;

// Настройки подключения к базе данных
const pool = new Pool({
    user: 'postgres', // Замените на ваше имя пользователя
    host: 'localhost', // Или IP-адрес вашего сервера
    database: 'Umbrella2', // Название вашей базы данных
    password: '123321445', // Замените на ваш пароль
    port: 5432, // Порт по умолчанию для PostgreSQL
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('./')); // Указываем директорию для статических файлов

// Создайте секретный ключ для подписи токенов
const JWT_SECRET = 'LA01ks92JD83hf'; // Замените на свой секретный ключ

// Middleware для проверки JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Обработчик для получения всех продуктов
app.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT product_id, name, brand, price, quantity, image FROM products');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Обработчик для получения всех пользователей
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT user_id, email, password FROM users');
        res.json(result.rows); // Используем result.rows для PostgreSQL
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

// Обработчик для входа администратора
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        const admin = result.rows[0];
        if (admin && await bcrypt.compare(password, admin.password)) {
            const token = jwt.sign({ id: admin.admin_id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
            res.json({ token });
        } else {
            res.status(401).send('Неверный логин или пароль');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Обработчик для выхода пользователя
app.post('/logout', (req, res) => {
    // Просто удаляем токен на клиенте, сервер не хранит состояние сессии
    res.sendStatus(204);
});

app.post('/cart/add', authenticateToken, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            return res.status(400).send('Пользователь не найден.');
        }

        const productCheck = await pool.query('SELECT * FROM products WHERE product_id = $1', [productId]);
        if (productCheck.rows.length === 0) {
            return res.status(400).send('Продукт не найден.');
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).send('Количество должно быть положительным целым числом.');
        }

        const result = await pool.query(
            `INSERT INTO cart (user_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, product_id) DO UPDATE 
             SET quantity = cart.quantity + $3 RETURNING *`,
            [userId, productId, quantity]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).send('Ошибка при добавлении товара в корзину.');
    }
});


// Обработчик для получения корзины пользователя
app.get('/cart', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT p.product_id, p.name, p.price, c.quantity
             FROM cart c 
             JOIN products p ON c.product_id = p.product_id 
             WHERE c.user_id = $1`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.post('/cart/update', authenticateToken, async (req, res) => {
    const { productId, change } = req.body;
    const userId = req.user.id;

    try {
        // Получаем текущее количество товара в корзине
        const result = await pool.query(
            `SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2`,
            [userId, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Товар не найден в корзине.');
        }

        const currentQuantity = result.rows[0].quantity;
        const newQuantity = currentQuantity + change;

        if (newQuantity < 1) {
            // Если количество меньше 1, удаляем товар из корзины
            await pool.query(
                `DELETE FROM cart WHERE user_id = $1 AND product_id = $2`,
                [userId, productId]
            );
        } else {
            // Обновляем количество товара в корзине
            await pool.query(
                `UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3`,
                [newQuantity, userId, productId]
            );
        }

        res.sendStatus(204); // Успешное обновление без содержимого
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// Регистрация пользователя
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

// Обработчик для входа пользователя
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
            res.json({ token });
        } else {
            res.status(401).send('Неверный логин или пароль');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.get('/user-orders', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Получаем userId из токена
    try {
        const result = await pool.query(`
            SELECT o.order_id, 
                   o.date,
                   SUM(oi.quantity * p.price) AS total_price,
                   ARRAY_AGG(json_build_object('product_id', p.product_id, 'name', p.name, 'quantity', oi.quantity)) AS items
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.user_id = $1
            GROUP BY o.order_id
            ORDER BY o.date DESC
        `, [userId]);

;app.post('/orders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Используем id пользователя из токена
        const cartResponse = await pool.query('SELECT * FROM cart WHERE user_id = $1', [userId]);
        const cartItems = cartResponse.rows;

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Корзина пуста' });
        }

        const orderResponse = await pool.query(
            'INSERT INTO orders (user_id, cart_id) VALUES ($1, $2) RETURNING order_id',
            [userId, cartItems[0].cart_id]
        );

        const orderId = orderResponse.rows[0].order_id;
        res.status(201).json({ orderId });
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении заказов:', err);
        res.status(500).send(err.message);
    }
});


app.post('/orders/add', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // Получаем элементы корзины для пользователя
        const cartResponse = await pool.query('SELECT * FROM cart WHERE user_id = $1', [userId]);
        const cartItems = cartResponse.rows;

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Корзина пуста' });
        }

        // Создаем новый заказ и возвращаем его ID
        const orderResponse = await pool.query(
            'INSERT INTO orders (user_id, date) VALUES ($1, NOW()) RETURNING order_id',
            [userId]
        );

        const orderId = orderResponse.rows[0].order_id; // Извлекаем ID заказа

        // Вставляем элементы заказа
        for (const item of cartItems) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
                [orderId, item.product_id, item.quantity]
            );
        }

        // Уменьшение количества товара
        for (const item of cartItems) {
            await pool.query(
                'UPDATE products SET quantity = quantity - $1 WHERE product_id = $2',
                [item.quantity, item.product_id]
            );
        }

        // Очищаем корзину после оформления заказа
        await pool.query('DELETE FROM cart WHERE user_id = $1', [userId]);

        res.status(201).json({ orderId }); // Возвращаем ID заказа
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error.message); // Логируем сообщение об ошибке
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.post('/cart/remove', authenticateToken, async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    try {
        // Удаляем товар из корзины
        const result = await pool.query(
            `DELETE FROM cart WHERE user_id = $1 AND product_id = $2`,
            [userId, productId]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Товар не найден в корзине.');
        }

        res.sendStatus(204); // Успешное удаление без содержимого
    } catch (err) {
        console.error('Ошибка при удалении товара:', err);
        res.status(500).send('Ошибка сервера');
    }
});

app.post('/admin/add', authenticateToken, async (req, res) => {
    const { email, password } = req.body;
    try {
        // Хэшируйте пароль перед сохранением
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO admins (username, password) VALUES ($1, $2)',
            [email, hashedPassword]
        );
        res.status(201).send('Администратор добавлен');
    } catch (err) {
        console.error('Ошибка при добавлении администратора:', err);
        res.status(500).send('Ошибка сервера');
    }
});

app.post('/products/add', authenticateToken, async (req, res) => {
    const { name, brand, price, quantity, image } = req.body;
    try {
        await pool.query(
            'INSERT INTO products (name, brand, price, quantity, image) VALUES ($1, $2, $3, $4, $5)',
            [name, brand, price, quantity, image]
        );
        res.status(201).send('Товар добавлен');
    } catch (err) {
        console.error('Ошибка при добавлении товара:', err);
        res.status(500).send('Ошибка сервера');
    }
});

app.delete('/products/delete/:id', authenticateToken, async (req, res) => {
    const productId = req.params.id;
    try {
        await pool.query('DELETE FROM products WHERE product_id = $1', [productId]);
        res.sendStatus(204);
    } catch (err) {
        console.error('Ошибка при удалении товара:', err);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/products/top', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.product_id, p.name, SUM(oi.quantity) AS total_sold
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            GROUP BY p.product_id
            ORDER BY total_sold DESC
            LIMIT 10
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении топ товаров:', err);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/financials', authenticateToken, async (req, res) => {
    try {
        const salesResult = await pool.query(`
            SELECT SUM(oi.quantity * p.price) AS total_sales
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
        `);

        const purchaseResult = await pool.query(`
            SELECT SUM(quantity * cost_price) AS total_purchases
            FROM purchases
        `);

        res.json({
            total_sales: salesResult.rows[0].total_sales || 0,
            total_purchases: purchaseResult.rows[0].total_purchases || 0
        });
    } catch (err) {
        console.error('Ошибка при получении финансов:', err);
        res.status(500).send('Ошибка сервера');
    }
});

// Обработчики для страниц
app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, 'catalog.html'));
});

app.get('/reg', (req, res) => {
    res.sendFile(path.join(__dirname, 'reg.html')); // Правильный путь к файлу
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'log-in.html')); // Правильный путь к файлу
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
})

app.get('/orders', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(`
            SELECT o.order_id, o.date, SUM(oi.quantity * p.price) AS total_price, 
                   ARRAY_AGG(json_build_object('product_id', p.product_id, 'name', p.name, 'quantity', oi.quantity)) AS items
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.user_id = $1
            GROUP BY o.order_id
            ORDER BY o.date DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

async function autoPurchase() {
    try {
        const products = await pool.query('SELECT product_id, price, quantity FROM products WHERE quantity < 20');
        
        for (const product of products.rows) {
            const purchaseQuantity = 20 - product.quantity;
            const costPrice = product.price * 0.8; // Себестоимость на 20% ниже

            await pool.query(
                'INSERT INTO purchases (product_id, quantity, cost_price) VALUES ($1, $2, $3)',
                [product.product_id, purchaseQuantity, costPrice]
            );

            await pool.query(
                'UPDATE products SET quantity = quantity + $1 WHERE product_id = $2',
                [purchaseQuantity, product.product_id]
            );
        }
    } catch (err) {
        console.error('Ошибка при автозакупке:', err);
    }
}


app.get('/verify-token', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM admins WHERE admin_id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.sendStatus(403); // Доступ запрещен
        }
        res.sendStatus(200); // Успешная проверка
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Запускаем автозакупку периодически, например, раз в день
setInterval(autoPurchase, 10 * 60 * 1000);

// Запускаем сервер
app.listen(port, '0.0.0.0', () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    });
