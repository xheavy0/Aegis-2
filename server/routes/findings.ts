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
  const body = req.body as Partial<Finding>;
  if (!body.title || !body.severity || !body.category || !body.source || !body.status) {
    return res.status(400).json({ error: 'Missing required fields: title, severity, category, source, status' });
  }
  const today = new Date().toISOString().split('T')[0];
  const newFinding: Finding = {
    id: nextId('F'),
    title: body.title,
    description: body.description ?? '',
    severity: body.severity,
    category: body.category,
    source: body.source,
    status: body.status,
    owner: body.owner ?? 'Unassigned',
    dateFound: body.dateFound ?? today,
    dueDate: body.dueDate ?? today,
    slaBreached: body.slaBreached ?? false,
    daysOpen: body.daysOpen ?? 0,
    affectedAsset: body.affectedAsset ?? '',
    evidenceCount: body.evidenceCount ?? 0,
    remediationNotes: body.remediationNotes ?? '',
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
