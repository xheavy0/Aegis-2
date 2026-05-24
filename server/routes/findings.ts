import { Router, Request, Response } from 'express';
import { findings, nextId } from '../data/store.js';
import { Finding } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(findings);
});

router.get('/:id', (req: Request, res: Response) => {
  const finding = findings.find(f => f.id === req.params.id);
  if (!finding) return res.status(404).json({ error: 'Finding not found' });
  res.json(finding);
});

router.post('/', (req: Request, res: Response) => {
  const { description, severity, source, status } = req.body as Partial<Finding>;
  if (!description || !severity || !source || !status) {
    return res.status(400).json({ error: 'Missing required fields: description, severity, source, status' });
  }
  const newFinding: Finding = {
    id: nextId('F'),
    description,
    severity,
    source,
    status,
    dateFound: new Date().toISOString().split('T')[0],
  };
  findings.push(newFinding);
  res.status(201).json(newFinding);
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = findings.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Finding not found' });
  findings[idx] = { ...findings[idx], ...req.body, id: findings[idx].id };
  res.json(findings[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = findings.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Finding not found' });
  findings.splice(idx, 1);
  res.status(204).send();
});

export default router;
