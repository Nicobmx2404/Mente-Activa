const request = require('supertest');
const app = require('../app');  // tu app de Express

describe('Auth endpoints', () => {

  test('POST /api/auth/register – debe retornar 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@menteactiva.com',
        password: 'Password123!'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/login – credenciales incorrectas retorna 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'noexiste@test.com',
        password: 'wrong'
      });
    expect(res.statusCode).toBe(401);
  });

});