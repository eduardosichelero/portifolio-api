import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://eduardosichelero.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    await kv.set('goals', []);
    return res.status(201).json({ message: 'Banco limpo com sucesso!' });
  }

  return res.status(405).json({ message: 'Método não permitido' });
}
