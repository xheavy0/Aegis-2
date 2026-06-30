import { Router, Request, Response } from 'express';
import { evidenceItems, nextSeqId } from '../data/store.js';
import { EvidenceItem } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(evidenceItems);
});

router.get('/:id', (req: Request, res: Response) => {
  const item = evidenceItems.find(e => e.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Evidence not found' });
  res.json(item);
});

router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<EvidenceItem>;
  if (!body.name || !body.type || !body.source || !body.status) {
    return res.status(400).json({ error: 'Missing required fields: name, type, source, status' });
  }
  const today = new Date().toISOString().split('T')[0];
  const newItem: EvidenceItem = {
    id: nextSeqId(evidenceItems, 'EV'),
    name: body.name,
    type: body.type,
    source: body.source,
    integration: body.integration,
    framework: body.framework ?? '',
    controls: body.controls ?? [],
    status: body.status,
    collectedAt: body.collectedAt ?? today,
    expiresAt: body.expiresAt ?? null,
    size: body.size,
    owner: body.owner ?? 'Unassigned',
    gaps: body.gaps ?? [],
    warnings: body.warnings ?? [],
    tags: body.tags ?? [],
    description: body.description ?? '',
  };
  evidenceItems.push(newItem);
  res.status(201).json(newItem);
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = evidenceItems.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Evidence not found' });
  evidenceItems[idx] = { ...evidenceItems[idx], ...req.body, id: evidenceItems[idx].id };
  res.json(evidenceItems[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = evidenceItems.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Evidence not found' });
  evidenceItems.splice(idx, 1);
  res.status(204).send();
});

export default router;
