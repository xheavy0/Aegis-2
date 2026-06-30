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
import biaRouter from './routes/bia.js';
import controlsRouter from './routes/controls.js';
import evidenceRouter from './routes/evidence.js';
import auditsRouter from './routes/audits.js';
import notesRouter from './routes/notes.js';
import aiRouter from './routes/ai.js';
import authRouter from './routes/auth.js';
import { requireAuth } from './auth.js';
import { findUserById } from './db.js';
import { hydrate, snapshot } from './data/store.js';

// Load persisted collections from SQLite (or seed the DB on first boot)
hydrate();

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
  // Persist all collections to SQLite after a successful mutating request
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        try { snapshot(); } catch (err) { console.error('snapshot failed:', err); }
      }
    });
  }
  next();
});

// Public routes (no authentication required)
app.use('/api/auth', authRouter);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// All remaining /api routes require a valid bearer token
const protect = requireAuth(findUserById);
app.use('/api/risks', protect, risksRouter);
app.use('/api/findings', protect, findingsRouter);
app.use('/api/vendors', protect, vendorsRouter);
app.use('/api/tasks', protect, tasksRouter);
app.use('/api/calendar', protect, calendarRouter);
app.use('/api/nist', protect, nistRouter);
app.use('/api/notifications', protect, notificationsRouter);
app.use('/api/policies', protect, policiesRouter);
app.use('/api/assets', protect, assetsRouter);
app.use('/api/bia', protect, biaRouter);
app.use('/api/controls', protect, controlsRouter);
app.use('/api/evidence', protect, evidenceRouter);
app.use('/api/audits', protect, auditsRouter);
app.use('/api/notes', protect, notesRouter);
app.use('/api/ai', protect, aiRouter);

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
