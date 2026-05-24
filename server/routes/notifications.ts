import { Router, Request, Response } from 'express';
import { notifications, nextId } from '../data/store.js';
import { AppNotification } from '../../src/types.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { audience } = req.query;
  if (audience && typeof audience === 'string') {
    const filtered = notifications.filter(n =>
      n.audience === 'all' || (Array.isArray(n.audience) && n.audience.includes(audience))
    );
    return res.json(filtered);
  }
  res.json(notifications);
});

router.post('/', (req: Request, res: Response) => {
  const { title, message, type, audience } = req.body as Partial<AppNotification>;
  if (!title || !message || !type || !audience) {
    return res.status(400).json({ error: 'Missing required fields: title, message, type, audience' });
  }
  const newNotif: AppNotification = {
    id: nextId('N'),
    title,
    message,
    type,
    audience,
    createdAt: new Date().toISOString(),
    read: false,
  };
  notifications.push(newNotif);
  res.status(201).json(newNotif);
});

router.put('/:id/read', (req: Request, res: Response) => {
  const idx = notifications.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Notification not found' });
  notifications[idx].read = true;
  res.json(notifications[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = notifications.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Notification not found' });
  notifications.splice(idx, 1);
  res.status(204).send();
});

export default router;
