const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ── 1. SERVE REACT FRONTEND ASSETS FIRST ───────────────────
// Moving this here allows your JS and CSS to bypass CORS checks completely!
const distPath = path.resolve(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

// ── 2. CORS MIDDLEWARE (Now only runs for API routes) ──────
const envOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URLS,
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .flatMap((origin) => origin.split(','))
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...envOrigins,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = origin?.replace(/\/+$/, '');
    if (!origin || allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── 3. ROUTES ───────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/plumbers', require('./routes/plumber.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// ── 4. CATCH-ALL ROUTE ─────────────────────────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use(require('./middleware/error.middleware'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
