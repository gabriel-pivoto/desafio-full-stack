# Arquitetura do frontend

## Visão geral

O frontend usa React + Vite e segue uma separação clara por responsabilidades: domínio, aplicação, infraestrutura e apresentação/UI. Isso facilita testar a lógica (domínio + hooks) independentemente da UI.

## Camadas principais

- **Domínio (`src/domain/zones`)**: modelos (`models.ts`), validações (`validators.ts`) e utilitários GeoJSON (`geojson.ts`) garantem que geometria e tipagens estejam consistentes.
- **Aplicação (`src/application/zones/useZones.ts`)**: custom hook centraliza o estado da lista de zonas, filtro, carregamento e criação; usa `zonesGateway` para falar com a API.
- **Infraestrutura (`src/infrastructure`)**: `zonesGateway` encapsula requisições Axios (`httpClient.ts`); isso permite trocar o backend sem tocar o restante da aplicação.
- **UI (`src/ui/`)**
  - `AppProviders`/`dependencies` provê `zonesGateway` via React Context.
  - `ZonesPage` orquestra mapa, sidebar e modal com o hook `useZones`.
  - `MapView` renderiza o Leaflet, controla desenho (Point/Polygon/Circle) e traduz camadas para GeoJSON.
  - `Sidebar` e `ZoneFormModal` exibem filtros e formulários com validação.

## Fluxos principais

1. O usuário digita um filtro → `useZones` aplica debounce (350 ms) e chama `zonesGateway.list(name)`.
2. Ao salvar uma zona, `ZoneFormModal` valida geometria e `useZones.create` recarrega a lista, evitando chamadas concorrentes graças ao controle de `creating`.
3. `MapView` sincroniza a geometria selecionada com o hook e renderiza zonas existentes (polígonos e pontos) com cores por `ZoneType`.

## Testes

- Testes de unidades (Vitest) cobrem o hook `useZones` e componentes (`Sidebar.test.tsx`, etc.).
- O mapa e o DOM são tratados com React Testing Library e mocks do gateway, mantendo os testes rápidos.
