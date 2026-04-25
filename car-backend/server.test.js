// car-backend/server.test.js
const request = require('supertest');
const express = require('express');
const cors    = require('cors');

// Rebuild app for testing (don't call listen)
const app = express();
app.use(cors());
app.use(express.json());

const cars = [
  { id:1, brand:"Maruti Suzuki", name:"Swift",  price:"6.49 L",  type:"Hatchback", fuel:"Petrol", img:"" },
  { id:2, brand:"Maruti Suzuki", name:"Brezza", price:"10.49 L", type:"SUV",       fuel:"Petrol", img:"" },
  { id:3, brand:"Skoda",         name:"Kushaq", price:"17.99 L", type:"SUV",       fuel:"Petrol", img:"" },
  { id:4, brand:"Skoda",         name:"Slavia", price:"19.99 L", type:"Sedan",     fuel:"Petrol", img:"" },
];
const bookings = [];

app.get('/health',       (req, res) => res.json({ status: 'ok' }));
app.get('/api/cars',     (req, res) => res.json(cars));
app.get('/api/cars/:id', (req, res) => {
  const car = cars.find(c => c.id === +req.params.id);
  car ? res.json(car) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/bookings', (req, res) => {
  const { name, phone, carId } = req.body;
  if (!name || !phone || !carId)
    return res.status(400).json({ error: 'name, phone, carId are required' });
  const booking = { id: Date.now(), name, phone, carId, status: 'Confirmed' };
  bookings.push(booking);
  res.status(201).json(booking);
});

// ── Tests ────────────────────────────────────────────────────

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
