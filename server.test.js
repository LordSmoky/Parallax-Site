import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './server';

describe('Регистрация пользователя и его вход в систему', () => {
    it('Нужно добавить нового пользователя', async () => {
        const response = await request(app)
            .post('/users/add')
            .send({ email: 'test@mail.ru', password: 'password123' });

        expect(response.statusCode).toBe(201);
        expect(response.text).toBe('User created');
    });

    it('Нужно войти через уже существующего пользователя', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'password123' });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('Нужно попробовать войти используя неверный пороль', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });

        expect(response.statusCode).toBe(401);
        expect(response.text).toBe('Неверный логин или пароль');
    });
});

describe('Order Checkout', () => {
    it('Нужно создать новый заказ для уже существующего пользователя', async () => {
        
        const loginResponse = await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'password123' });

        const token = loginResponse.body.token;


        const addToCartResponse = await request(app)
        .post('/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: 1, quantity: 2 }); 

    expect(addToCartResponse.statusCode).toBe(201);

        const response = await request(app)
            .post('/orders/add') 
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('orderId');
    });

    it('Проверка создания заказа, если корзина пуста', async () => {
        const loginResponse = await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'password123' });

        const token = loginResponse.body.token;

        
        const response = await request(app)
            .post('/orders/add')
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Корзина пуста');
    });
});