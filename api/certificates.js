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

// --- Endpoints para Certificados ---
router.get('/', async (req, res) => {
  const certs = await kv.get('certificates');
  res.status(200).json(certs || []);
});

router.post('/', express.json(), async (req, res) => {
  const newCert = req.body;
  const certs = (await kv.get('certificates')) || [];
  certs.push(newCert);
  await kv.set('certificates', certs);
  res.status(201).json(newCert);
});

router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  const updatedCert = req.body;
  let certs = (await kv.get('certificates')) || [];
  certs = certs.map(c => c.id === id ? updatedCert : c);
  await kv.set('certificates', certs);
  res.status(200).json(updatedCert);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  let certs = (await kv.get('certificates')) || [];
  certs = certs.filter(c => c.id !== id);
  await kv.set('certificates', certs);
  res.status(204).end();
});

export default router;
