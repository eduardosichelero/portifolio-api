import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notionRoutes from './routes/notionRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

app.use('/api/notion', notionRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
