import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

// Inicializa o cliente do Notion com o token
const notion = new Client({ 
  auth: process.env.NOTION_TOKEN 
});

// Busca notas da database do Notion
export const getNotesFromNotion = async () => {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const response = await notion.databases.query({ 
      database_id: databaseId 
    });
    
    // Transforma os resultados em um formato mais amigável
    return response.results.map(page => {
      // Ajuste conforme a estrutura da sua database no Notion
      return {
        id: page.id,
        title: page.properties.Name?.title[0]?.plain_text || 'Sem título',
        // Adicione outras propriedades conforme necessário
        createdTime: page.created_time,
        url: page.url
      };
    });
  } catch (error) {
    console.error('Erro ao buscar dados do Notion:', error);
    throw error;
  }
};
