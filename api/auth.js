import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const USER = process.env.ADMIN_USER;
const PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 8);
const JWT_SECRET = process.env.JWT_SECRET;

const allowedOrigins = [
  'https://eduardosichelero.github.io',
  'http://localhost:5173'
];

const loginAttempts = {};

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Permite cookies cross-origin
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    loginAttempts[ip] = loginAttempts[ip] || { count: 0, last: Date.now() };

    // Limite: 5 tentativas por 10 minutos
    if (loginAttempts[ip].count >= 5 && Date.now() - loginAttempts[ip].last < 10 * 60 * 1000) {
      return res.status(429).json({ erro: 'Muitas tentativas. Tente novamente mais tarde.' });
    }

    const { usuario, senha } = req.body;
    if (usuario !== USER) {
      loginAttempts[ip].count++;
      loginAttempts[ip].last = Date.now();
      return res.status(401).json({ erro: 'Usuário inválido' });
    }

    const senhaCorreta = await bcrypt.compare(senha, PASSWORD_HASH);
    if (!senhaCorreta) {
      loginAttempts[ip].count++;
      loginAttempts[ip].last = Date.now();
      return res.status(401).json({ erro: 'Senha inválida' });
    }

    // Login bem-sucedido: zera tentativas
    loginAttempts[ip] = { count: 0, last: Date.now() };

    const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: '1h' });

    // Define o cookie HttpOnly
    res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax; Secure`);
    return res.json({ sucesso: true });
  }

  return res.status(405).json({ message: 'Método não permitido' });
}
