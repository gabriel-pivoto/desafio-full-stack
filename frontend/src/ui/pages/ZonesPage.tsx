import { useEffect, useState } from 'react';
import { useZones } from '../../application/zones/useZones';
import { GeoJSONGeometry, ZoneType } from '../../domain/zones/models';
import { validateCreateZone } from '../../domain/zones/validators';
import { MapView, DrawMode } from '../components/map/MapView';
import { Sidebar } from '../components/sidebar/Sidebar';
import { ZoneFormModal } from '../components/form/ZoneFormModal';
import { ErrorBanner } from '../components/feedback/ErrorBanner';
import { Toast } from '../components/feedback/Toast';

export function ZonesPage() {
  const { zones, loading, error, filterName, setFilterName, create } = useZones();
  const [selectedGeometry, setSelectedGeometry] = useState<GeoJSONGeometry | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode>('point');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const handleToastClose = () => setToastMessage(null);

  const handleCreate = async (payload: { name: string; type: ZoneType }) => {
    const validation = validateCreateZone({
      name: payload.name,
      type: payload.type,
      geometry: selectedGeometry,
    });

    if (!validation.ok) {
      setSubmitError(validation.message);
      throw new Error(validation.message);
    }

    setSubmitError(null);
    await create(validation.value);
    setSelectedGeometry(null);
    setToastMessage('Zona salva com sucesso');
  };

  useEffect(() => {
    if (!toastMessage) return;
    if (import.meta.env.MODE === 'test') {
      handleToastClose();
    }
  }, [toastMessage, handleToastClose]);

  return (
    <div className="app">
      <Sidebar
        filter={filterName}
        onFilterChange={setFilterName}
        zones={zones}
        onNewZone={() => setModalOpen(true)}
      />
      <div style={{ flex: 1 }}>
        {loading && <div style={{ padding: '0.5rem 1rem' }}>Carregando zonas...</div>}
        {error && <ErrorBanner message={error} />}
        <MapView
          zones={zones}
          selectedGeometry={selectedGeometry}
          onGeometryChange={setSelectedGeometry}
          drawMode={drawMode}
          setDrawMode={setDrawMode}
        />
      </div>
      <ZoneFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        geometry={selectedGeometry}
        errorMessage={submitError}
        drawMode={drawMode}
      />
      {toastMessage && (
      <Toast message={toastMessage} onClose={handleToastClose} />
      )}
    </div>
  );
}
