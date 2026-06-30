import { Router, Request, Response } from 'express';
import { assets, nextSeqId } from '../data/store.js';
import { Asset } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(assets);
});

router.get('/:id', (req: Request, res: Response) => {
  const asset = assets.find(a => a.id === req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset);
});

router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<Asset>;
  if (!body.name || !body.type || !body.env || !body.status) {
    return res.status(400).json({ error: 'Missing required fields: name, type, env, status' });
  }
  const newAsset: Asset = {
    id: nextSeqId(assets, 'A'),
    name: body.name,
    type: body.type,
    env: body.env,
    status: body.status,
    ip: body.ip ?? '',
    os: body.os ?? '',
    owner: body.owner ?? 'Unassigned',
    location: body.location ?? '',
    lastSeen: body.lastSeen ?? 'Live',
    tags: body.tags ?? [],
  };
  assets.push(newAsset);
  res.status(201).json(newAsset);
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = assets.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Asset not found' });
  assets[idx] = { ...assets[idx], ...req.body, id: assets[idx].id };
  res.json(assets[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = assets.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Asset not found' });
  assets.splice(idx, 1);
  res.status(204).send();
});

export default router;
