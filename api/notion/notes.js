import { Client } from '@notionhq/client';
import { kv } from '@vercel/kv';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  try {
    // Verifica cache primeiro
    const cachedNotes = await kv.get('notion-notes');
    
    if (cachedNotes) {
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
      return res.status(200).json(cachedNotes);
    }

    // Busca dados do Notion se não houver cache
    const databaseId = process.env.NOTION_DATABASE_ID;
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });

    const optimizedNotes = response.results.map(page => {
      const titleProperty = Object.values(page.properties).find(
        prop => prop.type === 'title'
      );
      
      return {
        id: page.id,
        title: titleProperty?.title?.[0]?.plain_text || 'Sem título',
        tags: page.properties.Tags?.multi_select?.map(tag => tag.name) || [],
        texto: page.properties.Texto?.rich_text?.[0]?.plain_text || '',
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
        url: page.url
      };
    });

    // Armazena em cache por 10 minutos
    await kv.set('notion-notes', optimizedNotes, { ex: 600 });
    
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
    res.status(200).json(optimizedNotes);
    
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
}
