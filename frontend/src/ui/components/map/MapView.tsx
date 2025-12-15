import { useMemo, useRef } from 'react';
import {
  CircleMarker,
  FeatureGroup,
  MapContainer,
  Polygon,
  TileLayer,
  ZoomControl,
  useMapEvents,
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { GeoJSONGeometry, Zone } from '../../../domain/zones/models';
import { zoneColors } from '../../../domain/zones/colors';
import { circleToPolygon, isPolygon } from '../../../domain/zones/geojson';
import type { LatLngExpression } from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export type DrawMode = 'point' | 'polygon' | 'circle';

type Props = {
  zones: Zone[];
  selectedGeometry: GeoJSONGeometry | null;
  onGeometryChange: (geom: GeoJSONGeometry | null) => void;
  drawMode: DrawMode;
  setDrawMode: (mode: DrawMode) => void;
};

function ClickHandler({
  drawMode,
  onGeometryChange,
}: {
  drawMode: DrawMode;
  onGeometryChange: (geom: GeoJSONGeometry | null) => void;
}) {
  useMapEvents({
    click(e) {
      if (drawMode === 'point') {
        const { lat, lng } = e.latlng;
        onGeometryChange({ type: 'Point', coordinates: [lng, lat] });
      }
    },
  });
  return null;
}

function toLatLngSequence(ring: number[][]): LatLngExpression[] {
  return ring.map(([lng, lat]) => [lat, lng]) as LatLngExpression[];
}

export function MapView({
  zones,
  selectedGeometry,
  onGeometryChange,
  drawMode,
  setDrawMode,
}: Props) {
  const drawnItems = useRef<L.FeatureGroup<any> | null>(null);
  const centerLatLng = useMemo(() => [-23.55052, -46.633308] as [number, number], []);

  const handleCreated = (e: any) => {
    if (drawMode === 'polygon' && e.layerType === 'polygon') {
      const layer = e.layer as L.Polygon;
      const latlngs = layer.getLatLngs()[0] as L.LatLng[];
      const coordinates = latlngs.map((pt) => [pt.lng, pt.lat]);
      const first = coordinates[0];
      const last = coordinates[coordinates.length - 1];
      if (first && (first[0] !== last[0] || first[1] !== last[1])) {
        coordinates.push(first);
      }
      const geometry: GeoJSONGeometry = {
        type: 'Polygon',
        coordinates: [coordinates],
      };
      drawnItems.current?.clearLayers();
      drawnItems.current?.addLayer(layer);
      onGeometryChange(geometry);
    } else if (drawMode === 'circle' && e.layerType === 'circle') {
      const circleLayer = e.layer as L.Circle;
      const geometry = circleToPolygon(circleLayer.getLatLng(), circleLayer.getRadius(), 48);
      const polygonPositions = toLatLngSequence(geometry.coordinates[0]);
      const polygonLayer = L.polygon(polygonPositions);
      drawnItems.current?.clearLayers();
      drawnItems.current?.addLayer(polygonLayer);
      onGeometryChange(geometry);
    }
  };

  const handleEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      if (layer instanceof L.Circle && drawMode === 'circle') {
        onGeometryChange(circleToPolygon(layer.getLatLng(), layer.getRadius(), 48));
      }
      if (layer instanceof L.Polygon && drawMode === 'polygon') {
        const latlngs = (layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
        const coordinates = latlngs.map((pt) => [pt.lng, pt.lat]);
        const first = coordinates[0];
        const last = coordinates[coordinates.length - 1];
        if (first && (first[0] !== last[0] || first[1] !== last[1])) {
          coordinates.push(first);
        }
        onGeometryChange({ type: 'Polygon', coordinates: [coordinates] });
      }
    });
  };

  const handleDeleted = () => {
    drawnItems.current?.clearLayers();
    onGeometryChange(null);
  };

  const renderZoneGeometry = (zone: Zone) => {
    if (zone.geometry.type === 'Point') {
      const [lng, lat] = zone.geometry.coordinates;
      const color = zoneColors[zone.type] || '#0ea5e9';
      return (
        <CircleMarker
          key={zone.id}
          center={[lat, lng]}
          pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
          radius={8}
        />
      );
    }
    if (isPolygon(zone.geometry)) {
      const color = zoneColors[zone.type] || '#0ea5e9';
      const positions = zone.geometry.coordinates.map((ring) => toLatLngSequence(ring));
      return (
        <Polygon
          key={zone.id}
          positions={positions}
          pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 2 }}
        />
      );
    }
    return null;
  };

  const renderSelectedGeometry = () => {
    if (!selectedGeometry) return null;
    if (selectedGeometry.type === 'Point') {
      const [lng, lat] = selectedGeometry.coordinates;
      return (
        <CircleMarker
          center={[lat, lng]}
          pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.8 }}
          radius={8}
        />
      );
    }
    if (isPolygon(selectedGeometry)) {
      const positions = selectedGeometry.coordinates.map((ring) => toLatLngSequence(ring));
      return (
        <Polygon
          positions={positions}
          pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.25, weight: 2 }}
        />
      );
    }
    return null;
  };

  const drawTips: Record<DrawMode, string> = {
    point: 'Clique no mapa para adicionar um ponto',
    polygon: 'Clique no ícone do canto superior direito para começar a desenhar os vértices, duplo clique fecha o polígono',
    circle: 'Clique no ícone do canto superior direito para definir o centro e arraste para o raio',
  };

  const mapModeClass =
    drawMode === 'polygon' ? 'polygons-mode' : drawMode === 'circle' ? 'circles-mode' : '';

  return (
    <div className="map-wrapper">
      <div className="map-toolbar">
        <div className="segmented-control">
          <button
            type="button"
            className={drawMode === 'point' ? 'active' : ''}
            onClick={() => setDrawMode('point')}
          >
            Point
          </button>
          <button
            type="button"
            className={drawMode === 'polygon' ? 'active' : ''}
            onClick={() => setDrawMode('polygon')}
          >
            Polygon
          </button>
          <button
            type="button"
            className={drawMode === 'circle' ? 'active' : ''}
            onClick={() => setDrawMode('circle')}
          >
            Circle
          </button>
        </div>
        <div className="map-tip">{drawTips[drawMode]}</div>
      </div>
      <MapContainer
        center={centerLatLng}
        zoom={12}
        scrollWheelZoom
        className={`map ${mapModeClass}`}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <FeatureGroup ref={drawnItems as any}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onDeleted={handleDeleted}
            onEdited={handleEdited}
            draw={{
              rectangle: false,
              polyline: false,
              circle: drawMode === 'circle',
              circlemarker: false,
              marker: false,
              polygon: drawMode === 'polygon',
            }}
            edit={{
              edit: drawMode === 'polygon' ? {} : false,
              remove: drawMode !== 'point',
            }}
          />
        </FeatureGroup>
        <ClickHandler drawMode={drawMode} onGeometryChange={onGeometryChange} />
        {zones.map((zone) => renderZoneGeometry(zone))}
        {renderSelectedGeometry()}
      </MapContainer>
    </div>
  );
}
