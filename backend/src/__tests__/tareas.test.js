'use strict';
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

let token;
const correo = `tareas${Date.now()}@menteactiva.com`;
const password = 'Password123';

const tareaValida = {
  titulo: 'Tarea de prueba',
  descripcion: 'Descripción test',
  fechaLimite: '2025-12-31T00:00:00.000Z',
  prioridad: 'media',
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await request(app).post('/api/auth/registro')
    .send({ nombre: 'Tarea User', correo, password, semestre: 3 });
  const res = await request(app).post('/api/auth/login')
    .send({ correo, password });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /api/tareas', () => {
  test('sin token retorna 401', async () => {
    const res = await request(app).get('/api/tareas');
    expect(res.statusCode).toBe(401);
  });

  test('con token retorna 200', async () => {
    const res = await request(app)
      .get('/api/tareas')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});

describe('POST /api/tareas', () => {
  test('sin token retorna 401', async () => {
    const res = await request(app).post('/api/tareas').send(tareaValida);
    expect(res.statusCode).toBe(401);
  });

  test('crear tarea exitosamente retorna 201', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', `Bearer ${token}`)
      .send(tareaValida);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('sin título retorna 400', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', `Bearer ${token}`)
      .send({ fechaLimite: '2025-12-31T00:00:00.000Z' });
    expect(res.statusCode).toBe(400);
  });

  test('sin fechaLimite retorna 400', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Sin fecha' });
    expect(res.statusCode).toBe(400);
  });

  test('prioridad inválida retorna 400', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...tareaValida, prioridad: 'urgente' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Tareas CRUD', () => {
  let tareaId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', `Bearer ${token}`)
      .send(tareaValida);
    tareaId = res.body.tarea?._id || res.body.data?._id || res.body._id;
  });

  test('GET /api/tareas/:id retorna la tarea', async () => {
    if (!tareaId) return;
    const res = await request(app)
      .get(`/api/tareas/${tareaId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/tareas/:id con id inexistente retorna 404', async () => {
    const res = await request(app)
      .get('/api/tareas/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect([404, 400]).toContain(res.statusCode);
  });

  test('PUT /api/tareas/:id actualiza la tarea', async () => {
    if (!tareaId) return;
    const res = await request(app)
      .put(`/api/tareas/${tareaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...tareaValida, titulo: 'Título actualizado' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('PATCH /api/tareas/:id/completar marca como completada', async () => {
    if (!tareaId) return;
    const res = await request(app)
      .patch(`/api/tareas/${tareaId}/completar`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('DELETE /api/tareas/:id elimina la tarea', async () => {
    if (!tareaId) return;
    const res = await request(app)
      .delete(`/api/tareas/${tareaId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('DELETE con id inexistente retorna 404', async () => {
    const res = await request(app)
      .delete('/api/tareas/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect([404, 400]).toContain(res.statusCode);
  });
});

describe('Token inválido', () => {
  test('token malformado retorna 401', async () => {
    const res = await request(app)
      .get('/api/tareas')
      .set('Authorization', 'Bearer token_invalido');
    expect(res.statusCode).toBe(401);
  });
});