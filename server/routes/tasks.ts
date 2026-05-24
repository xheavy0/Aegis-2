import { Router, Request, Response } from 'express';
import { tasks, nextId } from '../data/store.js';
import { Task } from '../../src/types.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(tasks);
});

router.get('/:id', (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.post('/', (req: Request, res: Response) => {
  const { title, description, dueDate, status, priority, assignee } = req.body as Partial<Task>;
  if (!title || !description || !dueDate || !status || !priority || !assignee) {
    return res.status(400).json({ error: 'Missing required fields: title, description, dueDate, status, priority, assignee' });
  }
  const newTask: Task = {
    id: nextId('T'),
    title,
    description,
    dueDate,
    status,
    priority,
    assignee,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  tasks[idx] = { ...tasks[idx], ...req.body, id: tasks[idx].id };
  res.json(tasks[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(idx, 1);
  res.status(204).send();
});

export default router;
