# API de Notas do Notion com Cache Vercel KV

Esta API, construída com Express.js, busca notas de um banco de dados específico do Notion, otimiza os dados recebidos e os disponibiliza através de um endpoint GET. Implementa um sistema de cache utilizando Vercel KV para melhorar o desempenho e reduzir a carga na API do Notion, além de contar com configuração CORS para acesso de origens específicas.

## Funcionalidades

- Busca notas de um banco de dados do Notion.
- Implementa caching de dados com Vercel KV (TTL de 10 minutos, com stale-while-revalidate).
- Formata e otimiza os dados das notas para um consumo mais fácil.
- Configuração CORS para permitir acesso da origem `https://eduardosichelero.github.io`.
- Ordena as notas pela data de criação (mais recentes primeiro).
- Formatação amigável para o tempo de leitura.

## Pré-requisitos

- Node.js (v18.x ou superior recomendado)
- npm ou yarn
- Conta no Notion e um Token de Integração
- (Opcional, mas recomendado) Conta na Vercel para deploy e uso do Vercel KV

## Configuração

**1. Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
NOTION_TOKEN=seu_token_aqui
NOTION_DATABASE_ID=seu_database_id_aqui
KV_URL="your_kv_url_from_vercel"
KV_REST_API_URL="your_kv_rest_api_url_from_vercel"
KV_REST_API_TOKEN="your_kv_rest_api_token_from_vercel"
KV_REST_API_READ_ONLY_TOKEN="your_kv_rest_api_read_only_token_from_vercel"
```

**Importante:** Certifique-se de que o seu token de integração do Notion tem permissão de leitura para o banco de dados especificado. O `NOTION_DATABASE_ID` é o ID do banco de dados que você deseja consultar.

**2. Propriedades Esperadas no Banco de Dados do Notion**

A API espera que seu banco de dados do Notion contenha as seguintes propriedades com exatamente estes nomes e tipos compatíveis:

- `Nome` (Título)
- `Tags` (Multi-seleção)
- `Texto` (Rich Text)
- `Status` (Seleção Única)
- `Tempo de Leitura` (Número)

## Como Começar (Desenvolvimento Local)

1. Clone o repositório:
    ```bash
    git clone 
    cd 
    ```
2. Instale as dependências:
    ```bash
    npm install
    # ou
    yarn install
    ```
3. Configure suas variáveis de ambiente conforme descrito acima.
4. Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    # ou, para simular o ambiente Vercel:
    vercel dev
    ```
A API estará disponível em `http://localhost:3000/api/notion/notes` (a porta pode variar).

## Dependências Principais

- express
- @notionhq/client
- @vercel/kv
- cors

## Endpoint da API

### `GET /api/notion/notes`

Busca e retorna uma lista de notas otimizadas de um banco de dados específico do Notion.

**Fluxo:**
- Verifica o cache no Vercel KV.
- Se houver cache, retorna os dados cacheados com cabeçalho `Cache-Control: public, s-maxage=600, stale-while-revalidate=300`.
- Se não houver cache, consulta a API do Notion, ordena por data de criação (descendente), otimiza os dados e armazena no cache.
- Responde com JSON das notas otimizadas.

**Exemplo de Resposta:**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "title": "Minha Primeira Nota",
    "tags": ["Tecnologia", "JavaScript"],
    "texto": "Conteúdo da minha primeira nota...",
    "createdTime": "2024-05-27T10:00:00.000Z",
    "lastEditedTime": "2024-05-27T10:05:00.000Z",
    "status": "Publicado",
    "readingTime": "3 min de leitura",
    "url": "https://www.notion.so/seunome/Minha-Primeira-Nota-a1b2c3d4e5f678901234567890abcdef"
  }
]
```

## Tratamento de Erros

- **Erros da API do Notion:** Logados no console. A API responde com o status do erro e mensagem JSON.
- **Erros Internos/Configuração Ausente:** Logados no console. Responde com status 500 e mensagem JSON.
