import { Zone } from '../../../domain/zones/models';

type Props = {
  filter: string;
  onFilterChange: (value: string) => void;
  zones: Zone[];
  onNewZone: () => void;
};

export function Sidebar({ filter, onFilterChange, zones, onNewZone }: Props) {
  return (
    <aside className="sidebar">
      <div className="filter">
        <label htmlFor="filter">Filtro por nome</label>
        <input
          id="filter"
          type="text"
          placeholder="Buscar zona..."
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </div>
      <button className="button" onClick={onNewZone}>
        Nova Zona
      </button>

      <div className="zones-list">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.id}>
                <td>{zone.name}</td>
                <td>
                  <span className={`pill ${zone.type}`}>{zone.type.toLowerCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </aside>
  );
}
