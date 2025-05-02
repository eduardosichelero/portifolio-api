import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export const getNotesFromNotion = async () => {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const response = await notion.databases.query({ 
      database_id: databaseId 
    });

    return response.results.map(page => {
      // Busca título
      const titleProperty = Object.values(page.properties).find(
        prop => prop.type === 'title'
      );
      const title = titleProperty?.title?.[0]?.plain_text || 'Sem título';

      // Busca tags (multi_select)
      const tagsProperty = Object.values(page.properties).find(
        prop => prop.type === 'multi_select'
      );
      const tags = tagsProperty?.multi_select?.map(tag => tag.name) || [];

      // Busca texto (coluna 'Texto', tipo 'rich_text' ou 'text')
      // Troque 'Texto' pelo nome exato do campo no seu Notion, se necessário
      const textoProperty = page.properties['Texto'];
      let texto = '';
      if (textoProperty && (textoProperty.type === 'rich_text' || textoProperty.type === 'text')) {
        texto = (textoProperty.rich_text || textoProperty.text || [])
          .map(t => t.plain_text)
          .join('');
      }

      // Última edição (campo padrão do Notion)
      const lastEditedTime = page.last_edited_time;

      return {
        id: page.id,
        title,
        tags,
        texto,
        lastEditedTime,
        createdTime: page.created_time,
        url: page.url
      };
    });
  } catch (error) {
    console.error('Erro ao buscar dados do Notion:', error);
    throw error;
  }
};
