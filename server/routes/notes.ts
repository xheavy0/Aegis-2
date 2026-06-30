import { Router, Request, Response } from 'express';
import { notes, noteFolders, setNotesWorkspace } from '../data/store.js';
import { Note, NoteFolder } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ notes, folders: noteFolders });
});

// Replace the whole notes workspace (mirrors the view's localStorage model).
router.put('/', (req: Request, res: Response) => {
  const body = req.body as { notes?: Note[]; folders?: NoteFolder[] };
  if (!Array.isArray(body.notes) || !Array.isArray(body.folders)) {
    return res.status(400).json({ error: 'Request body must contain notes[] and folders[]' });
  }
  res.json(setNotesWorkspace({ notes: body.notes, folders: body.folders }));
});

export default router;
