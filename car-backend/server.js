// server.js — Entry point only
// Imports app from app.js and starts the HTTP server
// app.js contains all routes and logic

const app  = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server → http://localhost:${PORT}`);
});
