import { kv } from '@vercel/kv';
import { autenticarToken } from './middleware-auth.js';

const allowedOrigins = [
  'https://eduardosichelero.github.io',
  'http://localhost:5173'
];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const goals = await kv.get('goals');
    return res.status(200).json(goals || []);
  }

  // Proteger rotas de escrita
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      await new Promise((resolve, reject) => {
        autenticarToken(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch {
      return; // autenticarToken já envia resposta
    }
  }

  if (req.method === 'POST') {
    const newGoal = req.body;
    const goals = (await kv.get('goals')) || [];
    goals.push(newGoal);
    await kv.set('goals', goals);
    return res.status(201).json(newGoal);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const updatedGoal = req.body;
    let goals = (await kv.get('goals')) || [];
    goals = goals.map(g => g.id === id ? updatedGoal : g);
    await kv.set('goals', goals);
    return res.status(200).json(updatedGoal);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    let goals = (await kv.get('goals')) || [];
    goals = goals.filter(g => g.id !== id);
    await kv.set('goals', goals);
    return res.status(204).end();
  }

  return res.status(405).json({ message: 'Método não permitido' });
}
