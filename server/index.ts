import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import risksRouter from './routes/risks.js';
import findingsRouter from './routes/findings.js';
import vendorsRouter from './routes/vendors.js';
import tasksRouter from './routes/tasks.js';
import calendarRouter from './routes/calendar.js';
import nistRouter from './routes/nist.js';
import notificationsRouter from './routes/notifications.js';
import policiesRouter from './routes/policies.js';
import assetsRouter from './routes/assets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// CORS for local dev (Vite on 3000, API on 4000)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// API routes
app.use('/api/risks', risksRouter);
app.use('/api/findings', findingsRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/nist', nistRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/policies', policiesRouter);
app.use('/api/assets', assetsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend build in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

createServer(app).listen(PORT, () => {
  console.log(`Aegis API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET/POST   /api/risks');
  console.log('  GET/PUT/DELETE /api/risks/:id');
  console.log('  GET/POST   /api/findings');
  console.log('  GET/PUT/DELETE /api/findings/:id');
  console.log('  GET/POST   /api/vendors');
  console.log('  GET/PUT/DELETE /api/vendors/:id');
  console.log('  GET/POST   /api/tasks');
  console.log('  GET/PUT/DELETE /api/tasks/:id');
  console.log('  GET/POST   /api/calendar');
  console.log('  GET/PUT/DELETE /api/calendar/:id');
  console.log('  GET        /api/nist');
  console.log('  GET/PUT    /api/nist/:fn');
  console.log('  GET/POST   /api/notifications');
  console.log('  PUT        /api/notifications/:id/read');
  console.log('  DELETE     /api/notifications/:id');
  console.log('  GET        /api/health');
});
