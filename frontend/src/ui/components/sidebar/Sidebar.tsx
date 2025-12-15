import { useState } from 'react';
import { Zone, ZoneType } from '../../../domain/zones/models';
import { zoneColors } from '../../../domain/zones/colors';

type Props = {
  filter: string;
  onFilterChange: (value: string) => void;
  zones: Zone[];
  onNewZone: () => void;
};

const typeIcons: Record<ZoneType, string> = {
  RESIDENTIAL: '🏡',
  COMMERCIAL: '🏢',
  INDUSTRIAL: '🏭',
  MIXED: '🧱',
};

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Sidebar({ filter, onFilterChange, zones, onNewZone }: Props) {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  return (
    <aside className="sidebar">
      <section className="sidebar-section">
        <h3>Filtro</h3>
        <div className="filter">
          <label htmlFor="filter" className="sr-only">
            Filtro por nome
          </label>
          <input
            id="filter"
            type="text"
            placeholder="Buscar zona..."
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
          />
        </div>
      </section>

      <section className="sidebar-section">
        <h3>Ações</h3>
        <button className="button" type="button" onClick={onNewZone}>
          Nova Zona
        </button>
      </section>

      <section className="sidebar-section">
        <h3>Lista de zonas</h3>
        <div className="zones-list">
          <div className="zones-table">
            <div className="zones-header">
              <span>Nome</span>
              <span>Tipo</span>
            </div>
            {zones.map((zone) => (
              <button
                key={zone.id}
                type="button"
                className={`zones-row ${activeZoneId === zone.id ? 'selected' : ''}`}
                onClick={() => setActiveZoneId(zone.id)}
              >
                <span className="zone-name">{zone.name}</span>
                <span
                  className="zone-type"
                  style={{
                    background: withAlpha(zoneColors[zone.type], 0.15),
                    color: zoneColors[zone.type],
                    boxShadow: `inset 0 0 0 1px ${withAlpha(zoneColors[zone.type], 0.4)}`,
                  }}
                  title={zone.type.toLowerCase()}
                >
                  <span>{typeIcons[zone.type]}</span>
                  {zone.type.toLowerCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}
