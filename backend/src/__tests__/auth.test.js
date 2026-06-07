'use strict';
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

// ── Healthcheck ──────────────────────────────────────
describe('Healthcheck', () => {
  test('GET / retorna 200 y ok:true', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /ruta-inexistente retorna 404', async () => {
    const res = await request(app).get('/ruta-inexistente');
    expect(res.statusCode).toBe(404);
  });
});

// ── Registro ─────────────────────────────────────────
describe('POST /api/auth/registro', () => {
  test('registro exitoso retorna 201 y token', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({
        nombre: 'Test User',
        correo: `test${Date.now()}@menteactiva.com`,
        password: 'Password123',
        semestre: 4,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('ok', true);
  });

  test('correo duplicado retorna 400', async () => {
    const correo = `dup${Date.now()}@menteactiva.com`;
    await request(app).post('/api/auth/registro')
      .send({ nombre: 'User A', correo, password: 'Password123', semestre: 1 });
    const res = await request(app).post('/api/auth/registro')
      .send({ nombre: 'User B', correo, password: 'Password123', semestre: 1 });
    expect(res.statusCode).toBe(400);
  });

  test('sin nombre retorna 400 con errores', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({ correo: 'sin@nombre.com', password: 'Password123' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errores');
  });

  test('password sin mayúscula retorna 400', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Test', correo: 'test2@test.com', password: 'sinmayuscula1' });
    expect(res.statusCode).toBe(400);
  });
});

// ── Login ─────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  const correo = `login${Date.now()}@menteactiva.com`;
  const password = 'Password123';

  beforeAll(async () => {
    await request(app).post('/api/auth/registro')
      .send({ nombre: 'Login User', correo, password, semestre: 2 });
  });

  test('login exitoso retorna 200 y token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo, password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('password incorrecta retorna 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo, password: 'Wrongpass1' });
    expect(res.statusCode).toBe(401);
  });

  test('correo no registrado retorna 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'noexiste@test.com', password: 'Password123' });
    expect(res.statusCode).toBe(401);
  });

  test('correo inválido retorna 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'no-es-un-correo', password: 'Password123' });
    expect(res.statusCode).toBe(400);
  });
});

// ── Perfil protegido ──────────────────────────────────
describe('GET /api/auth/perfil', () => {
  let token;
  const correo = `perfil${Date.now()}@menteactiva.com`;

  beforeAll(async () => {
    await request(app).post('/api/auth/registro')
      .send({ nombre: 'Perfil User', correo, password: 'Password123', semestre: 3 });
    const res = await request(app).post('/api/auth/login')
      .send({ correo, password: 'Password123' });
    token = res.body.token;
  });

  test('con token válido retorna 200', async () => {
    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('sin token retorna 401', async () => {
    const res = await request(app).get('/api/auth/perfil');
    expect(res.statusCode).toBe(401);
  });
});

describe('Error handler', () => {
  test('ruta con error interno no expone stack en producción', async () => {
    const res = await request(app).get('/ruta-inexistente');
    expect(res.statusCode).toBe(404);
    expect(res.body).not.toHaveProperty('stack');
  });
});