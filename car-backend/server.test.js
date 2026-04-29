// server.test.js
// Imports app.js directly — NOT server.js
// This is the key fix: Jest instruments app.js for coverage
// because app.listen() is never called during tests

const request = require('supertest');
const app     = require('./app');   // ← app.js, not server.js

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/cars', () => {
  it('returns all cars', async () => {
    const res = await request(app).get('/api/cars');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(4);
  });

  it('each car has required fields', async () => {
    const res = await request(app).get('/api/cars');
    res.body.forEach(car => {
      expect(car).toHaveProperty('id');
      expect(car).toHaveProperty('brand');
      expect(car).toHaveProperty('name');
      expect(car).toHaveProperty('price');
    });
  });
});

describe('GET /api/cars/:id', () => {
  it('returns car by id', async () => {
    const res = await request(app).get('/api/cars/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.name).toBe('Swift');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/cars/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});

describe('POST /api/bookings', () => {
  it('creates a booking with valid data', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ name: 'Test User', phone: '9999999999', carId: 1 });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('Confirmed');
    expect(res.body.name).toBe('Test User');
    expect(res.body).toHaveProperty('id');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ phone: '9999999999', carId: 1 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('name, phone, carId are required');
  });

  it('returns 400 when phone is missing', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ name: 'Test', carId: 1 });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when carId is missing', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ name: 'Test', phone: '9999999999' });
    expect(res.statusCode).toBe(400);
  });
});
