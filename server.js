import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notionRoutes from './routes/notionRoutes.js';

// Configuração do ambiente
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste simples
app.get('/', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Rotas da API
app.use('/api/notion', notionRoutes);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT} 🚀`);
});
