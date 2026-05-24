import { Router, Request, Response } from 'express';
import { calendarEvents, nextId } from '../data/store.js';
import { CalendarEvent } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(calendarEvents);
});

router.get('/:id', (req: Request, res: Response) => {
  const event = calendarEvents.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

router.post('/', (req: Request, res: Response) => {
  const { title, description, date, startTime, duration, type, assignees } = req.body as Partial<CalendarEvent>;
  if (!title || !description || !date || !startTime || !duration || !type) {
    return res.status(400).json({ error: 'Missing required fields: title, description, date, startTime, duration, type' });
  }
  const newEvent: CalendarEvent = {
    id: nextId('E'),
    title,
    description,
    date,
    startTime,
    duration,
    type,
    assignees: assignees ?? [],
  };
  calendarEvents.push(newEvent);
  res.status(201).json(newEvent);
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = calendarEvents.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Event not found' });
  calendarEvents[idx] = { ...calendarEvents[idx], ...req.body, id: calendarEvents[idx].id };
  res.json(calendarEvents[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = calendarEvents.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Event not found' });
  calendarEvents.splice(idx, 1);
  res.status(204).send();
});

export default router;
