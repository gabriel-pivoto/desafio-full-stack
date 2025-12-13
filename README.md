# Desafio Full Stack – Monitoramento Ambiental

Aplicação composta por uma API NestJS em `backend/` e um cliente React/Vite em `frontend/` para cadastrar e listar zonas urbanas (Point/Polygon) com qualquer banco PostgreSQL local ou via Docker.

## Conteúdo

1. [Requisitos](#requisitos)  
2. [Configuração inicial](#configuracao-inicial)  
3. [Execução com Docker](#execucao-com-docker)  
4. [Execução do backend e banco via Docker Dev](#execucao-do-backend-e-banco-via-docker-dev)  
5. [Scripts úteis](#scripts-uteis)  
6. [Endpoints disponíveis](#endpoints-disponiveis)  
7. [Estrutura do repositório](#estrutura-do-repositorio)  
8. [Avisos e validações](#avisos-e-validacoes)

## Requisitos

* Node.js 18+ (mesma versão usada nas imagens Docker)
* npm (compatível com o Node instalado)
* PostgreSQL 15+ (local ou via `docker compose`)
* Variáveis de ambiente conforme `.env.example` no root

## Configuração inicial

1. Clone o projeto e acesse o diretório principal:
   ```bash
   git clone <repo-url>
   cd desafio-full-stack
   ```
2. Copie o arquivo de exemplo de variáveis de ambiente e adapte caso necessário:
   ```bash
   cp .env.example .env
   ```
3. Garanta que um PostgreSQL esteja acessível com as credenciais definidas em `.env`. Caso use um serviço externo, ajuste `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` e `DB_NAME`.

## Execução com Docker

1. Garanta que o `docker` e o `docker compose` estejam instalados.
2. Rode o stack completo (backend + frontend + banco):
   ```bash
   docker compose up --build -d
   ```
3. Ao subir, o compose expõe:
   * Frontend: `http://localhost:5173`
   * Backend/API: `http://localhost:3000/api` (Swagger em `/api/docs`)
   * Banco PostgreSQL: `localhost:5432` com as mesmas credenciais configuradas em `.env`
4. Para parar e limpar:
   ```bash
   docker compose down -v
   ```

## Execução do backend e banco via Docker Dev

1. Utilize o arquivo dedicado `docker.dev.yml` quando quiser subir apenas o backend e o PostgreSQL:
   ```bash
   docker compose -f docker.dev.yml up --build
   ```
2. Essa stack expõe o backend em `http://localhost:3000/api` e deixa o PostgreSQL ouvindo em `localhost:5432`.
3. Rode o frontend separadamente para consumir essa API:
   ```bash
   cd frontend
   npm install
   npm start
   ```
   O cliente Vite usa `VITE_API_URL` (padrão `http://localhost:3000/api`) para se conectar à API Dockerizada.
4. Para parar e limpar essa configuração do backend:
   ```bash
   docker compose -f docker.dev.yml down
   ```




## Scripts úteis

### Backend (`backend/package.json`)

* `npm test` – unit tests via Vitest (`vitest.unit.config.ts`)

### Frontend (`frontend/package.json`)
* `npm start` – iniciar projeto
* `npm run dev` – modo desenvolvimento com live reload
* `npm run build` – gera artefatos de produção
* `npm test` – testes com Vitest

## Endpoints disponíveis

Todos os endpoints estão sob `/api/zones`:

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/zones` | Lista zonas, aceita query `name` (case-insensitive) |
| `POST` | `/api/zones` | Cria uma nova zona (payload com `name`, `type`, `geometry`) |
| `GET` | `/api/zones/:id` | Recupera uma zona específica por ID |

O payload de criação aceita geometria GeoJSON típica (`Point` ou `Polygon`), validações de tipo e dados ocorrem no domínio antes do persistente.

## Estrutura do repositório

```
desafio-full-stack/
├ backend/          # API NestJS com TypeORM e migrations (veja backend-architecture.md)
├ frontend/         # SPA React + Vite + Leaflet (veja frontend-architecture.md)
├ docker-compose.yml# stack local para banco + backend + frontend
└ .env(.example)    # configurações de ambiente (API e VITE_API_URL)
```

## Avisos e validações

* O backend recusa payloads com campos extras graças ao `ValidationPipe` com `forbidNonWhitelisted`.
* Erros de domínio (ex: geometria inválida) resultam em `400` com mensagens claras.
* Os dados persistem em PostgreSQL com o campo `geometry` armazenando JSON, então a leitura é simples no banco.
* As migrations rodam automaticamente ao iniciar a aplicação, evitando erros “relation does not exist”.
