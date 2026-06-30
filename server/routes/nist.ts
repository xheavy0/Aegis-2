import { Router, Request, Response } from 'express';
import { nistStatus } from '../data/store.js';
import { NISTFunction } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(nistStatus);
});

router.get('/:fn', (req: Request, res: Response) => {
  const fn = req.params.fn.toUpperCase() as NISTFunction;
  const entry = nistStatus.find(n => n.function === fn);
  if (!entry) return res.status(404).json({ error: 'NIST function not found' });
  res.json(entry);
});

router.put('/:fn', (req: Request, res: Response) => {
  const fn = req.params.fn.toUpperCase() as NISTFunction;
  const idx = nistStatus.findIndex(n => n.function === fn);
  if (idx === -1) return res.status(404).json({ error: 'NIST function not found' });
  const { totalControls, implementedControls } = req.body;
  if (totalControls !== undefined) nistStatus[idx].totalControls = totalControls;
  if (implementedControls !== undefined) nistStatus[idx].implementedControls = implementedControls;
  nistStatus[idx].score = nistStatus[idx].totalControls > 0
    ? Math.round((nistStatus[idx].implementedControls / nistStatus[idx].totalControls) * 100)
    : 0;
  res.json(nistStatus[idx]);
});

export default router;
