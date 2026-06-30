import { Router, Request, Response } from 'express';
import { controls } from '../data/store.js';
import { Control } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(controls);
});

router.get('/:id', (req: Request, res: Response) => {
  const control = controls.find(c => c.id === req.params.id);
  if (!control) return res.status(404).json({ error: 'Control not found' });
  res.json(control);
});

router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<Control>;
  if (!body.id || !body.function || !body.category || !body.status) {
    return res.status(400).json({ error: 'Missing required fields: id, function, category, status' });
  }
  if (controls.some(c => c.id === body.id)) {
    return res.status(409).json({ error: 'Control id already exists' });
  }
  const newControl: Control = {
    id: body.id,
    function: body.function,
    category: body.category,
    subcategory: body.subcategory ?? '',
    description: body.description ?? '',
    status: body.status,
    maturity: body.maturity ?? 0,
    priority: body.priority ?? 'Medium',
    owner: body.owner ?? 'Unassigned',
    dueDate: body.dueDate ?? null,
    evidence: body.evidence ?? [],
    linkedPolicies: body.linkedPolicies ?? [],
    notes: body.notes ?? '',
  };
  controls.push(newControl);
  res.status(201).json(newControl);
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = controls.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Control not found' });
  controls[idx] = { ...controls[idx], ...req.body, id: controls[idx].id };
  res.json(controls[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = controls.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Control not found' });
  controls.splice(idx, 1);
  res.status(204).send();
});

export default router;
