import { Router, Request, Response } from 'express';
import { policies, nextPolicyId } from '../data/store.js';
import { Policy } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(policies);
});

router.get('/:id', (req: Request, res: Response) => {
  const policy = policies.find(p => p.id === req.params.id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });
  res.json(policy);
});

router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<Policy>;
  if (!body.title || !body.owner || !body.status || !body.category) {
    return res.status(400).json({ error: 'Missing required fields: title, owner, status, category' });
  }
  const today = new Date().toISOString().split('T')[0];
  const newPolicy: Policy = {
    id: nextPolicyId(),
    title: body.title,
    version: body.version ?? 'v1.0',
    owner: body.owner,
    status: body.status,
    category: body.category,
    nextReview: body.nextReview ?? today,
    lastUpdated: body.lastUpdated ?? today,
    description: body.description ?? '',
    frameworks: body.frameworks ?? [],
    versions: body.versions ?? [],
    attestations: body.attestations ?? [],
    exceptions: body.exceptions ?? 0,
  };
  policies.push(newPolicy);
  res.status(201).json(newPolicy);
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = policies.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Policy not found' });
  policies[idx] = { ...policies[idx], ...req.body, id: policies[idx].id };
  res.json(policies[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = policies.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Policy not found' });
  policies.splice(idx, 1);
  res.status(204).send();
});

export default router;
