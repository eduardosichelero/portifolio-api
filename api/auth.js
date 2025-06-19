import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const USER = process.env.ADMIN_USER;
const PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 8);
const JWT_SECRET = process.env.JWT_SECRET;

const allowedOrigins = [
  'https://eduardosichelero.github.io',
  'http://localhost:5173'
];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { usuario, senha } = req.body;
    if (usuario !== USER) return res.status(401).json({ erro: 'Usuário inválido' });

    const senhaCorreta = await bcrypt.compare(senha, PASSWORD_HASH);
    if (!senhaCorreta) return res.status(401).json({ erro: 'Senha inválida' });

    const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  return res.status(405).json({ message: 'Método não permitido' });
}
