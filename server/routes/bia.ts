import { Router, Request, Response } from 'express';
import { biaProcesses, nextSeqId } from '../data/store.js';
import { BIAProcess } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(biaProcesses);
});

router.get('/:id', (req: Request, res: Response) => {
  const proc = biaProcesses.find(p => p.id === req.params.id);
  if (!proc) return res.status(404).json({ error: 'BIA process not found' });
  res.json(proc);
});

router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<BIAProcess>;
  if (!body.name || !body.department || !body.owner || !body.criticality) {
    return res.status(400).json({ error: 'Missing required fields: name, department, owner, criticality' });
  }
  const newProc: BIAProcess = {
    id: nextSeqId(biaProcesses, 'BIA'),
    name: body.name,
    department: body.department,
    owner: body.owner,
    criticality: body.criticality,
    rtoHours: body.rtoHours ?? 0,
    rpoHours: body.rpoHours ?? 0,
    mtpdHours: body.mtpdHours ?? 0,
    currentRTOHours: body.currentRTOHours ?? 0,
    financialImpact: body.financialImpact ?? 'Moderate',
    operationalImpact: body.operationalImpact ?? 'Moderate',
    reputationalImpact: body.reputationalImpact ?? 'Moderate',
    regulatoryImpact: body.regulatoryImpact ?? 'Moderate',
    dependencies: body.dependencies ?? [],
    description: body.description ?? '',
    hourlyLoss: body.hourlyLoss ?? 0,
  };
  biaProcesses.push(newProc);
  res.status(201).json(newProc);
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = biaProcesses.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'BIA process not found' });
  biaProcesses[idx] = { ...biaProcesses[idx], ...req.body, id: biaProcesses[idx].id };
  res.json(biaProcesses[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = biaProcesses.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'BIA process not found' });
  biaProcesses.splice(idx, 1);
  res.status(204).send();
});

export default router;
