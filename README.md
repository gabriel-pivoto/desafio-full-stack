# Desafio Full Stack – Monitoramento Ambiental

Aplicação composta por uma API NestJS em `backend/` e um cliente React/Vite em `frontend/` para cadastrar e listar zonas urbanas (Point/Polygon) com qualquer banco PostgreSQL local ou via Docker.

## Conteúdo

1. [Requisitos](#requisitos)  
2. [Configuração local (sem Docker)](#configuração-local-sem-docker)  
3. [Execução com Docker](#execução-com-docker)  
4. [Scripts úteis](#scripts-úteis)  
5. [Endpoints disponíveis](#endpoints-disponíveis)  
6. [Estrutura do repositório](#estrutura-do-repositório)  
7. [Avisos e validações](#avisos-e-validações)

## Requisitos

* Node.js 18+ (mesma versão usada nas imagens Docker)
* npm (compatível com o Node instalado)
* PostgreSQL 15+ (local ou via `docker compose`)
* Variáveis de ambiente conforme `.env.example` no root

## Configuração local (sem Docker)

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
4. Inicie o backend (o módulo TypeORM dispara todas as migrations automaticamente):
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
   > A aplicação sobe com prefixo `/api` e cria as tabelas necessárias antes de expor os endpoints.
5. Em outro terminal, inicie o frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```
   O serviço do cliente espera consumir `http://localhost:3000/api` (conforme `VITE_API_URL`).

## Execução com Docker

1. Garanta que o `docker` e o `docker compose` estejam instalados.
2. Rode o stack completo:
   ```bash
   docker compose up --build
   ```
3. Ao subir, o compose expõe:
   * Frontend: `http://localhost:5173`
   * Backend/API: `http://localhost:3000/api` (Swagger em `/api/docs`)
   * Banco PostgreSQL: `localhost:5432` com as mesmas credenciais configuradas em `.env`
4. Para parar e limpar:
   ```bash
   docker compose down
   ```

## Scripts úteis

### Backend (`backend/package.json`)
* `npm start` – inicia o Nest em modo produção (para uso em Docker)
* `npm run start:dev` – modo watch com hot reload
* `npm run migration:run` – executa migrations manualmente
* `npm test` – unit tests via Vitest (`vitest.unit.config.ts`)

### Frontend (`frontend/package.json`)
* `npm start` – alias para `vite` (obriga `npm start` conforme requisito)
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
│
├── backend/          # API NestJS com TypeORM e migrations
├── frontend/         # SPA React + Vite + Leaflet
├── docker-compose.yml# stack local para banco + backend + frontend
└── .env(.example)    # configurações de ambiente (API e VITE_API_URL)
```

## Avisos e validações

* O backend recusa payloads com campos extras graças ao `ValidationPipe` com `forbidNonWhitelisted`.
* Erros de domínio (ex: geometria inválida) resultam em `400` com mensagens claras.
* Os dados persistem em PostgreSQL com o campo `geometry` armazenando JSON, então a leitura é simples no banco.
* As migrations rodam automaticamente ao iniciar a aplicação, evitando erros “relation does not exist”.

