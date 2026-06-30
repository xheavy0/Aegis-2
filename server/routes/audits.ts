import { Router, Request, Response } from 'express';
import { auditPrograms, setAuditPrograms } from '../data/store.js';
import { AuditProgram } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(auditPrograms);
});

// Replace the entire collection (mirrors the client's "persist whole list" model).
router.put('/', (req: Request, res: Response) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Request body must be an array of audit programs' });
  }
  res.json(setAuditPrograms(req.body as AuditProgram[]));
});

export default router;
