import express from 'express';
import { kv } from '@vercel/kv';
import cors from 'cors';

const router = express.Router();

router.use(cors({
  origin: [
    'https://eduardosichelero.github.io',
    'http://localhost:5173'
  ],
  methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Endpoints para Goals ---
router.get('/', async (req, res) => {
  const goals = await kv.get('goals');
  res.status(200).json(goals || []);
});

router.post('/', express.json(), async (req, res) => {
  const newGoal = req.body;
  const goals = (await kv.get('goals')) || [];
  goals.push(newGoal);
  await kv.set('goals', goals);
  res.status(201).json(newGoal);
});

router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  const updatedGoal = req.body;
  let goals = (await kv.get('goals')) || [];
  goals = goals.map(g => g.id === id ? updatedGoal : g);
  await kv.set('goals', goals);
  res.status(200).json(updatedGoal);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  let goals = (await kv.get('goals')) || [];
  goals = goals.filter(g => g.id !== id);
  await kv.set('goals', goals);
  res.status(204).end();
});

export default router;
