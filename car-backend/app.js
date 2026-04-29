// app.js — Express app (no app.listen here)
// This file is imported by server.js (to start) and server.test.js (to test)
// Keeping app.listen out of this file allows Jest to instrument it for coverage

const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ── DATA (replace with real DB queries later) ─────────────────
const cars = [
  { id:1, brand:'Maruti Suzuki', name:'Swift',  price:'6.49 L',  type:'Hatchback', fuel:'Petrol', img:'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80' },
  { id:2, brand:'Maruti Suzuki', name:'Brezza', price:'10.49 L', type:'SUV',       fuel:'Petrol', img:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80' },
  { id:3, brand:'Skoda',         name:'Kushaq', price:'17.99 L', type:'SUV',       fuel:'Petrol', img:'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80' },
  { id:4, brand:'Skoda',         name:'Slavia', price:'19.99 L', type:'Sedan',     fuel:'Petrol', img:'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=600&q=80' },
];

const bookings = [];

// ── ROUTES ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/cars', (req, res) => {
  res.json(cars);
});

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
  console.log('New booking:', booking);
  res.status(201).json(booking);
});

// Export app — server.js calls app.listen(), test file imports this directly
module.exports = app;
