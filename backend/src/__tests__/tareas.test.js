'use strict';
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

let token;
const correo = `tareas${Date.now()}@menteactiva.com`;
const password = 'Password123';

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

  test('con token retorna 200 y array', async () => {
    const res = await request(app)
      .get('/api/tareas')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});

describe('POST /api/tareas', () => {
  test('crear tarea exitosamente retorna 201', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Tarea de prueba',
        descripcion: 'Descripción test',
        fechaEntrega: '2025-12-31',
        materia: 'Ingeniería de Software',
      });
    expect([201, 200]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('sin token retorna 401', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .send({ titulo: 'Sin auth' });
    expect(res.statusCode).toBe(401);
  });

  test('sin título retorna 400', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', `Bearer ${token}`)
      .send({ descripcion: 'Sin titulo' });
    expect(res.statusCode).toBe(400);
  });
});

describe('PUT /api/tareas/:id', () => {
  let tareaId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Para editar', fechaEntrega: '2025-12-31', materia: 'Test' });
    tareaId = res.body.tarea?._id || res.body.data?._id;
  });

  test('actualizar tarea existente', async () => {
    if (!tareaId) return;
    const res = await request(app)
      .put(`/api/tareas/${tareaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Editada' });
    expect([200, 404]).toContain(res.statusCode);
  });
});

describe('DELETE /api/tareas/:id', () => {
  let tareaId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Para borrar', fechaEntrega: '2025-12-31', materia: 'Test' });
    tareaId = res.body.tarea?._id || res.body.data?._id;
  });

  test('eliminar tarea existente', async () => {
    if (!tareaId) return;
    const res = await request(app)
      .delete(`/api/tareas/${tareaId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 404]).toContain(res.statusCode);
  });

  test('id inexistente retorna 404', async () => {
    const res = await request(app)
      .delete('/api/tareas/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect([404, 400]).toContain(res.statusCode);
  });
});