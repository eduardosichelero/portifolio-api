import express from 'express';
import { Client } from '@notionhq/client';
import { kv } from '@vercel/kv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(cors({
  origin: 'https://eduardosichelero.github.io',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('/api/notion/notes', cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: 'Muitas requisições, tente novamente mais tarde.'
});

app.use(limiter); // Aplica o rate limit globalmente

const notion = new Client({ auth: process.env.NOTION_TOKEN });

app.get('/api/notion/notes', async (req, res) => {
  try {
    const cachedNotes = await kv.get('notion-notes');
    
    if (cachedNotes) {
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
      return res.status(200).json(cachedNotes);
    }

    const databaseId = process.env.NOTION_DATABASE_ID;
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });

  const optimizedNotes = response.results.map(page => {
  const titleProperty = page.properties['Nome'];
  const tagsProperty = page.properties['Tags'];
  const textoProperty = page.properties['Texto'];
  const statusProperty = page.properties['Status'];
  const readingTimeProperty = page.properties['Tempo de Leitura']; 

  return {
    id: page.id,
    title: titleProperty?.title?.[0]?.plain_text || 'Sem título',
    tags: tagsProperty?.multi_select?.map(tag => tag.name) || [],
    texto: textoProperty?.rich_text?.[0]?.plain_text || '',
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    status: statusProperty?.select?.name || 'Sem status',
    readingTime: readingTimeProperty?.rich_text?.[0]?.plain_text || 'Não informado', 
    url: page.url
  };
});



    await kv.set('notion-notes', optimizedNotes, { ex: 600 });
    
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
    res.status(200).json(optimizedNotes);
    
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
});

export default app;

// Removido endpoints de goals e certificates, agora estão em arquivos separados e importados no index.js
