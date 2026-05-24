import { Router, Request, Response } from 'express';
import { vendors, nextId } from '../data/store.js';
import { Vendor } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(vendors);
});

router.get('/:id', (req: Request, res: Response) => {
  const vendor = vendors.find(v => v.id === req.params.id);
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  res.json(vendor);
});

router.post('/', (req: Request, res: Response) => {
  const { name, criticality, complianceStatus } = req.body as Partial<Vendor>;
  if (!name || !criticality || !complianceStatus) {
    return res.status(400).json({ error: 'Missing required fields: name, criticality, complianceStatus' });
  }
  const newVendor: Vendor = {
    id: nextId('V'),
    name,
    criticality,
    complianceStatus,
    lastAssessment: new Date().toISOString().split('T')[0],
  };
  vendors.push(newVendor);
  res.status(201).json(newVendor);
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = vendors.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Vendor not found' });
  vendors[idx] = { ...vendors[idx], ...req.body, id: vendors[idx].id };
  res.json(vendors[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = vendors.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Vendor not found' });
  vendors.splice(idx, 1);
  res.status(204).send();
});

export default router;
