import { Router, Request, Response } from 'express';
import { risks, nextId } from '../data/store.js';
import { Risk } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(risks);
});

router.get('/:id', (req: Request, res: Response) => {
  const risk = risks.find(r => r.id === req.params.id);
  if (!risk) return res.status(404).json({ error: 'Risk not found' });
  res.json(risk);
});

router.post('/', (req: Request, res: Response) => {
  const { title, impact, likelihood, status, owner } = req.body as Partial<Risk>;
  if (!title || !impact || !likelihood || !status || !owner) {
    return res.status(400).json({ error: 'Missing required fields: title, impact, likelihood, status, owner' });
  }
  const newRisk: Risk = {
    id: nextId('R'),
    title,
    impact,
    likelihood,
    status,
    owner,
    updatedAt: new Date().toISOString().split('T')[0],
  };
  risks.push(newRisk);
  res.status(201).json(newRisk);
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = risks.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Risk not found' });
  risks[idx] = { ...risks[idx], ...req.body, id: risks[idx].id, updatedAt: new Date().toISOString().split('T')[0] };
  res.json(risks[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = risks.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Risk not found' });
  risks.splice(idx, 1);
  res.status(204).send();
});

export default router;
