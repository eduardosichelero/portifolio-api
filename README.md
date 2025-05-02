# Notion API Backend

API Express para integrar dados do Notion ao portfólio.

## Pré-requisitos
- Node.js instalado
- Token de integração do Notion
- ID do banco de dados do Notion

## Configuração
1. Clone este repositório
2. Instale as dependências: `npm install`
3. Crie um arquivo `.env` baseado no `.env.example` e configure suas variáveis
4. Execute o servidor: `npm run dev`

## Endpoints
- `GET /`: Verifica se a API está funcionando
- `GET /api/notion/notes`: Retorna notas do banco de dados do Notion

## Deploy no Render
1. Crie uma conta no Render
2. Conecte este repositório
3. Configure as variáveis de ambiente
4. Deploy!
