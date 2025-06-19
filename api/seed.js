import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  await kv.set('goals', []);
  res.status(201).json({ message: 'Banco limpo com sucesso!' });
}
