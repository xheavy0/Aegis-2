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
  const body = req.body as Partial<Vendor>;
  if (!body.name || !body.tier || !body.complianceStatus) {
    return res.status(400).json({ error: 'Missing required fields: name, tier, complianceStatus' });
  }
  const today = new Date().toISOString().split('T')[0];
  const newVendor: Vendor = {
    id: nextId('V'),
    name: body.name,
    category: body.category ?? 'Other',
    tier: body.tier,
    securityScore: body.securityScore ?? 0,
    inherentRisk: body.inherentRisk ?? 'Medium',
    residualRisk: body.residualRisk ?? 'Medium',
    complianceStatus: body.complianceStatus,
    lastAssessment: body.lastAssessment ?? today,
    nextReview: body.nextReview ?? today,
    owner: body.owner ?? 'Unassigned',
    openFindings: body.openFindings ?? 0,
    criticalFindings: body.criticalFindings ?? 0,
    certifications: body.certifications ?? [],
    impactScore: body.impactScore ?? 1,
    likelihoodScore: body.likelihoodScore ?? 1,
    riskTrend: body.riskTrend ?? 'Stable',
    annualSpend: body.annualSpend ?? '$0',
    description: body.description ?? '',
    dataAccess: body.dataAccess ?? [],
    riskCategories: body.riskCategories ?? [],
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
