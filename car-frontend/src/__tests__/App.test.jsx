// src/__tests__/App.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../App';

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([
        { id:1, brand:"Maruti Suzuki", name:"Swift",  price:"6.49 L",  type:"Hatchback", fuel:"Petrol", badge:"Best Seller", img:"" },
        { id:2, brand:"Skoda",         name:"Kushaq", price:"17.99 L", type:"SUV",       fuel:"Petrol", badge:"Popular",     img:"" },
      ])
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('App', () => {
  it('renders navbar logo', async () => {
    render(<App />);
    expect(screen.getByText(/ELITE/i)).toBeInTheDocument();
  });

  it('renders hero heading', async () => {
    render(<App />);
    expect(screen.getByText(/DREAM/i)).toBeInTheDocument();
  });

  it('loads and displays cars from API', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Swift')).toBeInTheDocument();
    });
    expect(screen.getByText('Kushaq')).toBeInTheDocument();
  });

  it('uses demo data when fetch fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Swift')).toBeInTheDocument();
    });
  });
});

describe('Booking Modal', () => {
  it('opens modal when Book Test Drive is clicked', async () => {
    render(<App />);
    const btn = screen.getAllByText(/Book Test Drive/i)[0];
    await userEvent.click(btn);
    expect(screen.getByText(/Book a Test Drive/i)).toBeInTheDocument();
  });

  it('closes modal on Cancel click', async () => {
    render(<App />);
    const btn = screen.getAllByText(/Book Test Drive/i)[0];
    await userEvent.click(btn);
    await userEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByText(/Book a Test Drive/i)).not.toBeInTheDocument();
    });
  });
});
