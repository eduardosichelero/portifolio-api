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
  } else {
    res.removeHeader && res.removeHeader('Access-Control-Allow-Origin');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const certs = await kv.get('certificates');
    return res.status(200).json(certs || []);
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
    const newCert = req.body;
    const certs = (await kv.get('certificates')) || [];
    certs.push(newCert);
    await kv.set('certificates', certs);
    return res.status(201).json(newCert);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const updatedCert = req.body;
    let certs = (await kv.get('certificates')) || [];
    certs = certs.map(c => c.id === id ? updatedCert : c);
    await kv.set('certificates', certs);
    return res.status(200).json(updatedCert);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    let certs = (await kv.get('certificates')) || [];
    certs = certs.filter(c => c.id !== id);
    await kv.set('certificates', certs);
    return res.status(204).end();
  }

  return res.status(405).json({ message: 'Método não permitido' });
}
