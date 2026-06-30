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
  const body = req.body as Partial<Risk>;
  if (!body.title || !body.category || !body.owner || !body.status) {
    return res.status(400).json({ error: 'Missing required fields: title, category, owner, status' });
  }
  const today = new Date().toISOString().split('T')[0];
  const newRisk: Risk = {
    id: nextId('R'),
    title: body.title,
    description: body.description ?? '',
    category: body.category,
    owner: body.owner,
    inherentLikelihood: body.inherentLikelihood ?? 1,
    inherentImpact: body.inherentImpact ?? 1,
    residualLikelihood: body.residualLikelihood ?? 1,
    residualImpact: body.residualImpact ?? 1,
    treatment: body.treatment ?? 'Mitigate',
    treatmentProgress: body.treatmentProgress ?? 0,
    status: body.status,
    dateIdentified: body.dateIdentified ?? today,
    reviewDate: body.reviewDate ?? today,
    financialExposure: body.financialExposure ?? 0,
    riskTrend: body.riskTrend ?? 'Stable',
    treatmentPlan: body.treatmentPlan ?? '',
    linkedControls: body.linkedControls ?? 0,
  };
  risks.push(newRisk);
  res.status(201).json(newRisk);
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = risks.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Risk not found' });
  risks[idx] = { ...risks[idx], ...req.body, id: risks[idx].id };
  res.json(risks[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = risks.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Risk not found' });
  risks.splice(idx, 1);
  res.status(204).send();
});

export default router;
