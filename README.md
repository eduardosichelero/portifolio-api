# API de Notas do Notion com Cache Vercel KV e Painel Admin Protegido

Esta API, construída com Express.js, busca notas de um banco de dados específico do Notion, otimiza os dados recebidos e os disponibiliza através de um endpoint GET. Implementa um sistema de cache utilizando Vercel KV para melhorar o desempenho e reduzir a carga na API do Notion, além de contar com configuração CORS dinâmica para acesso de origens específicas. Inclui também um painel administrativo protegido por autenticação JWT segura, com CRUD de metas (goals) e certificados, limitação de tentativas de login, e boas práticas de segurança.

## Funcionalidades

- Busca notas de um banco de dados do Notion.
- Implementa caching de dados com Vercel KV (TTL de 10 minutos, com stale-while-revalidate).
- Formata e otimiza os dados das notas para um consumo mais fácil.
- Configuração CORS dinâmica para permitir acesso apenas de origens confiáveis.
- Ordena as notas pela data de criação (mais recentes primeiro).
- Formatação amigável para o tempo de leitura.
- **Painel Admin protegido por autenticação JWT:**
  - Login seguro com limitação de tentativas por IP.
  - CRUD de metas (goals) e certificados, acessível apenas para usuários autenticados.
  - Sessão persiste apenas enquanto a aba estiver aberta (sessionStorage no front-end).
  - Cookies HttpOnly, Secure, SameSite=Lax para o token JWT.
  - Logout seguro e expiração automática do token.

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

# Autenticação Admin
ADMIN_USER=usuario_admin
ADMIN_PASSWORD=senha_forte
JWT_SECRET=um_segredo_bem_forte
ALLOWED_ORIGINS=https://eduardosichelero.github.io,https://seu-front-end.com
```

**Importante:**
- O token de integração do Notion deve ter permissão de leitura para o banco de dados especificado.
- O `NOTION_DATABASE_ID` é o ID do banco de dados que você deseja consultar.
- Defina `ADMIN_USER`, `ADMIN_PASSWORD` e `JWT_SECRET` com valores fortes e seguros.
- `ALLOWED_ORIGINS` deve conter as origens confiáveis separadas por vírgula.

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
    git clone <url-do-repo>
    cd <nome-da-pasta>
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
- jsonwebtoken
- dotenv

## Endpoints da API

### Notas do Notion

#### `GET /api/notion/notes`

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

### Painel Admin (Metas e Certificados)

#### Autenticação

- `POST /api/login` — Realiza login, retorna cookie HttpOnly com JWT se sucesso.
- `POST /api/auth` — Verifica se o usuário está autenticado (usado para manter sessão no front-end).
- Limite de tentativas de login por IP para evitar brute-force.

#### CRUD Goals

- `GET /api/goals` — Lista todas as metas (requer autenticação).
- `POST /api/goals` — Cria nova meta (requer autenticação).
- `PUT /api/goals/[id]` — Edita meta pelo ID (requer autenticação).
- `DELETE /api/goals/[id]` — Remove meta pelo ID (requer autenticação).

#### CRUD Certificados

- `GET /api/certificates` — Lista todos os certificados (requer autenticação).
- `POST /api/certificates` — Cria novo certificado (requer autenticação).
- `PUT /api/certificates/[id]` — Edita certificado pelo ID (requer autenticação).
- `DELETE /api/certificates/[id]` — Remove certificado pelo ID (requer autenticação).

**Todos os endpoints protegidos exigem o cookie JWT válido.**

### Fluxo de Autenticação e Segurança

- O front-end faz login via `/api/login` e armazena o status da sessão em `sessionStorage`.
- O token JWT é enviado apenas via cookie HttpOnly, Secure, SameSite=Lax (não acessível via JS).
- Todos os fetches autenticados usam `credentials: 'include'`.
- A sessão expira ao fechar a aba ou após logout.
- CORS dinâmico: apenas origens confiáveis podem acessar endpoints protegidos.
- Limitação de tentativas de login por IP.
- Logout apaga o cookie JWT.

## Recomendações de Segurança

- Use variáveis de ambiente seguras e nunca exponha segredos no código.
- Use HTTPS em produção para garantir cookies Secure.
- Altere as credenciais padrão do admin antes de subir para produção.
- Monitore tentativas de login suspeitas.
- Mantenha dependências sempre atualizadas.

## Tratamento de Erros

- **Erros da API do Notion:** Logados no console. A API responde com o status do erro e mensagem JSON.
- **Erros de autenticação:** Responde com status 401 e mensagem JSON.
- **Erros internos/configuração ausente:** Logados no console. Responde com status 500 e mensagem JSON.

---

Este projeto segue boas práticas de segurança para APIs modernas e está pronto para deploy em ambientes como Vercel.
