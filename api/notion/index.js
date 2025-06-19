import { Client } from '@notionhq/client';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://eduardosichelero.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const cachedNotes = await kv.get('notion-notes');
      if (cachedNotes) {
        res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
        return res.status(200).json(cachedNotes);
      }
      const notion = new Client({ auth: process.env.NOTION_TOKEN });
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
      return res.status(200).json(optimizedNotes);
    } catch (error) {
      console.error('Erro:', error);
      return res.status(500).json({ error: 'Erro ao buscar notas' });
    }
  }

  return res.status(405).json({ message: 'Método não permitido' });
}
