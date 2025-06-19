import { kv } from '@vercel/kv';
import { autenticarToken } from '../middleware-auth.js';

const allowedOrigins = [
  'https://eduardosichelero.github.io',
  'http://localhost:5173'
];

export default async function handler(req, res) {
  const { id } = req.query;
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Autenticação obrigatória
  await new Promise((resolve, reject) => autenticarToken(req, res, resolve));

  if (req.method === 'PUT') {
    const updatedGoal = req.body;
    let goals = (await kv.get('goals')) || [];
    goals = goals.map(g => g.id === id ? updatedGoal : g);
    await kv.set('goals', goals);
    return res.status(200).json(updatedGoal);
  }

  if (req.method === 'DELETE') {
    let goals = (await kv.get('goals')) || [];
    goals = goals.filter(g => g.id !== id);
    await kv.set('goals', goals);
    return res.status(204).end();
  }

  return res.status(405).json({ message: 'Método não permitido' });
}
