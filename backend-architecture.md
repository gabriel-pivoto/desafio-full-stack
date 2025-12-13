# Arquitetura do backend

## Visão geral

O backend é uma API NestJS organizada segundo princípios de DDD/hexagonal. O ponto de entrada é o módulo HTTP sob `src/infra/http`, enquanto os domínios, regras de negócio e portas estão em `src/domain` e `src/application`.

## Camadas principais

- **Domain (`src/domain/zones/enterprise`)**: entidades imutáveis como `Zone`, enums (`ZoneType`) e erros (`InvalidZoneError`). Essa camada valida regras como nome obrigatório e geometria GeoJSON.
- **Application (`src/domain/zones/application`)**: use cases (List, Search, Create, Get by ID) implementam os fluxos de negócio e dependem da interface `ZoneRepository`.
- **Infraestrutura**
  - **TypeORM (`src/infra/database/typeorm`)**: entidades, repositórios e mapeadores convertem entre o domínio e o banco PostgreSQL (armazena geometria em `jsonb`).
  - **HTTP (`src/infra/http`)**: controllers, DTOs e presenters traduzem requests/responses, aplicam o `ValidationPipe` e expõem Swagger.

## Fluxo de dados (-request/response)

1. `ZonesController` recebe uma requisição e injeta os use cases via Nest.
2. Os use cases conversam com o repositório (`TypeOrmZoneRepository`).
3. `ZoneMapper` mantém a consistência entre as entidades TypeORM e as entidades de domínio.
4. `ZonePresenter` normaliza o retorno para o cliente (incluindo a geometria e timestamps).

## Persistência e banco

- PostgreSQL 15 via Docker; versões locais funcionam com as mesmas credenciais de `.env`.
- `ZoneOrmEntity` define `geometry` como `jsonb`/`simple-json` (para testes) e usa `@CreateDateColumn`.
- Migrations (ex: `CreateZonesTable...`) criam a tabela `zones` com colunas UUID, nome, tipo, geometria e `created_at`.

## Testes

- Nomeados em `src/domain/zones/.../spec.ts`; usam Vitest para validar entidades, use cases e comportamentos de filtragem.
- O `Zone` e seus use cases são testados em memória (`zones.use-cases.spec.ts`) sem acesso ao banco.
