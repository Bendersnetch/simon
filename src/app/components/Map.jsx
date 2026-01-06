"use client";

import {
  MapContainer,
  TileLayer,  ZoomControl,
  useMap,
  useMapEvents,
  GeoJSON,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";

const getAqiWeight = (aqi) => {
  // Même découpage que les pastilles (pour que la zone heatmap ait la même couleur)
  if (aqi <= 25) return 0.12;
  if (aqi <= 50) return 0.27;
  if (aqi <= 75) return 0.45;
  if (aqi <= 100) return 0.62;
  if (aqi <= 150) return 0.78;
  if (aqi <= 200) return 0.90;
  return 1.0;
};

const getAqiColor = (aqi) => {
  if (aqi <= 25) return "#22c55e";
  if (aqi <= 50) return "#84cc16";
  if (aqi <= 75) return "#facc15";
  if (aqi <= 100) return "#fb923c";
  if (aqi <= 150) return "#ef4444";
  if (aqi <= 200) return "#a855f7";
  return "#7f1d1d";
};

const AQI_LEGEND = [
  { label: "0–25", color: "#22c55e" },
  { label: "26–50", color: "#84cc16" },
  { label: "51–75", color: "#facc15" },
  { label: "76–100", color: "#fb923c" },
  { label: "101–150", color: "#ef4444" },
  { label: "151–200", color: "#a855f7" },
  { label: "200+", color: "#7f1d1d" },
];

// ================= DATA (exportée pour l'UI "Appareils") =================
export const SENSORS_DATA = [
  { id: "SENS-001", lat: 43.707619, lng: 7.273178, aqi: 174, label: "Capteur 01", desc: "Mesure temps réel" },
  { id: "SENS-002", lat: 43.708283, lng: 7.268245, aqi: 168, label: "Capteur 02", desc: "Mesure temps réel" },
  { id: "SENS-003", lat: 43.716494, lng: 7.295333, aqi: 72, label: "Capteur 03", desc: "Mesure temps réel" },
  { id: "SENS-004", lat: 43.70017, lng: 7.228614, aqi: 97, label: "Capteur 04", desc: "Mesure temps réel" },
  { id: "SENS-005", lat: 43.719672, lng: 7.223979, aqi: 77, label: "Capteur 05", desc: "Mesure temps réel" },
  { id: "SENS-006", lat: 43.733238, lng: 7.282123, aqi: 56, label: "Capteur 06", desc: "Mesure temps réel" },
  { id: "SENS-007", lat: 43.711419, lng: 7.225657, aqi: 63, label: "Capteur 07", desc: "Mesure temps réel" },
  { id: "SENS-008", lat: 43.697097, lng: 7.222858, aqi: 65, label: "Capteur 08", desc: "Mesure temps réel" },
  { id: "SENS-009", lat: 43.707027, lng: 7.300031, aqi: 91, label: "Capteur 09", desc: "Mesure temps réel" },
  { id: "SENS-010", lat: 43.717015, lng: 7.267478, aqi: 136, label: "Capteur 10", desc: "Mesure temps réel" },
  { id: "SENS-011", lat: 43.707866, lng: 7.246425, aqi: 152, label: "Capteur 11", desc: "Mesure temps réel" },
  { id: "SENS-012", lat: 43.734785, lng: 7.29982, aqi: 40, label: "Capteur 12", desc: "Mesure temps réel" },
  { id: "SENS-013", lat: 43.700764, lng: 7.241818, aqi: 110, label: "Capteur 13", desc: "Mesure temps réel" },
  { id: "SENS-014", lat: 43.70502, lng: 7.300425, aqi: 85, label: "Capteur 14", desc: "Mesure temps réel" },
  { id: "SENS-015", lat: 43.732902, lng: 7.300494, aqi: 12, label: "Capteur 15", desc: "Mesure temps réel" },
  { id: "SENS-016", lat: 43.695486, lng: 7.306476, aqi: 65, label: "Capteur 16", desc: "Mesure temps réel" },
  { id: "SENS-017", lat: 43.734018, lng: 7.257755, aqi: 37, label: "Capteur 17", desc: "Mesure temps réel" },
  { id: "SENS-018", lat: 43.716473, lng: 7.293959, aqi: 82, label: "Capteur 18", desc: "Mesure temps réel" },
  { id: "SENS-019", lat: 43.733204, lng: 7.292014, aqi: 25, label: "Capteur 19", desc: "Mesure temps réel" },
  { id: "SENS-020", lat: 43.697319, lng: 7.229599, aqi: 66, label: "Capteur 20", desc: "Mesure temps réel" },
  { id: "SENS-021", lat: 43.724851, lng: 7.236879, aqi: 71, label: "Capteur 21", desc: "Mesure temps réel" },
  { id: "SENS-022", lat: 43.707371, lng: 7.238115, aqi: 120, label: "Capteur 22", desc: "Mesure temps réel" },
  { id: "SENS-023", lat: 43.695643, lng: 7.245631, aqi: 136, label: "Capteur 23", desc: "Mesure temps réel" },
  { id: "SENS-024", lat: 43.725171, lng: 7.248894, aqi: 100, label: "Capteur 24", desc: "Mesure temps réel" },
  { id: "SENS-025", lat: 43.695536, lng: 7.257456, aqi: 150, label: "Capteur 25", desc: "Mesure temps réel" },
  { id: "SENS-026", lat: 43.717092, lng: 7.229532, aqi: 95, label: "Capteur 26", desc: "Mesure temps réel" },
  { id: "SENS-027", lat: 43.695662, lng: 7.244536, aqi: 126, label: "Capteur 27", desc: "Mesure temps réel" },
  { id: "SENS-028", lat: 43.701448, lng: 7.248151, aqi: 118, label: "Capteur 28", desc: "Mesure temps réel" },
  { id: "SENS-029", lat: 43.697151, lng: 7.277122, aqi: 130, label: "Capteur 29", desc: "Mesure temps réel" },
  { id: "SENS-030", lat: 43.70766, lng: 7.311118, aqi: 60, label: "Capteur 30", desc: "Mesure temps réel" },
  { id: "SENS-031", lat: 43.713729, lng: 7.30232, aqi: 65, label: "Capteur 31", desc: "Mesure temps réel" },
  { id: "SENS-032", lat: 43.72589, lng: 7.243702, aqi: 63, label: "Capteur 32", desc: "Mesure temps réel" },
  { id: "SENS-033", lat: 43.721971, lng: 7.309338, aqi: 33, label: "Capteur 33", desc: "Mesure temps réel" },
  { id: "SENS-034", lat: 43.732507, lng: 7.303808, aqi: 36, label: "Capteur 34", desc: "Mesure temps réel" },
  { id: "SENS-035", lat: 43.706073, lng: 7.229865, aqi: 72, label: "Capteur 35", desc: "Mesure temps réel" },
  { id: "SENS-036", lat: 43.733134, lng: 7.242649, aqi: 55, label: "Capteur 36", desc: "Mesure temps réel" },
  { id: "SENS-037", lat: 43.697849, lng: 7.298253, aqi: 94, label: "Capteur 37", desc: "Mesure temps réel" },
  { id: "SENS-038", lat: 43.699672, lng: 7.236666, aqi: 113, label: "Capteur 38", desc: "Mesure temps réel" },
  { id: "SENS-039", lat: 43.712968, lng: 7.300978, aqi: 86, label: "Capteur 39", desc: "Mesure temps réel" },
  { id: "SENS-040", lat: 43.699011, lng: 7.307149, aqi: 57, label: "Capteur 40", desc: "Mesure temps réel" },
  { id: "SENS-041", lat: 43.707285, lng: 7.225743, aqi: 66, label: "Capteur 41", desc: "Mesure temps réel" },
  { id: "SENS-042", lat: 43.703439, lng: 7.274356, aqi: 142, label: "Capteur 42", desc: "Mesure temps réel" },
  { id: "SENS-043", lat: 43.703107, lng: 7.304639, aqi: 97, label: "Capteur 43", desc: "Mesure temps réel" },
  { id: "SENS-044", lat: 43.717847, lng: 7.285666, aqi: 108, label: "Capteur 44", desc: "Mesure temps réel" },
  { id: "SENS-045", lat: 43.720049, lng: 7.311463, aqi: 25, label: "Capteur 45", desc: "Mesure temps réel" }
];

// ================= RE-CENTER MAP =================
function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);

  return null;
}

// ================= POLLUTION HEATMAP =================
function SensorGradientLayer({ points }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Canvas overlay dédié (évite la normalisation/cumul d'une heatmap)
    const CanvasLayer = L.Layer.extend({
      onAdd: function () {
        this._canvas = L.DomUtil.create("canvas", "aqi-gradient-canvas");
        this._canvas.style.position = "absolute";
        this._canvas.style.top = "0";
        this._canvas.style.left = "0";
        this._canvas.style.pointerEvents = "none";
        this._ctx = this._canvas.getContext("2d");

        // Pane au-dessus des tuiles mais sous les tooltips/popups
        const pane = map.getPane("overlayPane");
        pane.appendChild(this._canvas);

        this._reset();
        map.on("moveend zoomend resize", this._reset, this);
      },

      onRemove: function () {
        map.off("moveend zoomend resize", this._reset, this);
        if (this._canvas && this._canvas.parentNode) {
          this._canvas.parentNode.removeChild(this._canvas);
        }
        this._canvas = null;
        this._ctx = null;
      },

      _reset: function () {
        const size = map.getSize();
        const topLeft = map.containerPointToLayerPoint([0, 0]);

        // Positionner le canvas
        L.DomUtil.setPosition(this._canvas, topLeft);
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        this._redraw();
      },

      _redraw: function () {
        if (!this._ctx) return;
        const ctx = this._ctx;
        const size = map.getSize();
        ctx.clearRect(0, 0, size.x, size.y);

        // Rayon en pixels (stable visuellement)
        const R = 120;

        // Dessiner chaque capteur comme un cercle en dégradé radial
        (points || []).forEach((p) => {
          const pt = map.latLngToContainerPoint([p.lat, p.lng]);
          const color = getAqiColor(p.aqi);

          const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, R);
          // centre plus intense, bord transparent
          grad.addColorStop(0.0, color + "CC");   // ~80% alpha
          grad.addColorStop(0.65, color + "55");  // ~33% alpha
          grad.addColorStop(1.0, color + "00");   // transparent

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, R, 0, Math.PI * 2);
          ctx.fill();
        });

        // Un peu de lissage global
        ctx.globalCompositeOperation = "source-over";
      },
    });

    const layer = new CanvasLayer();
    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  // Redraw when points change
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !layer._redraw) return;
    layer._redraw();
  }, [points]);

  return null;
}


function SensorPointsLayer({ points }) {
  return (
    <>
      {(points || []).map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: getAqiColor(p.aqi),
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={1}>
            {p.label ? `${p.label} · AQI ${p.aqi}` : `${p.id} · AQI ${p.aqi}`}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}

// ================= VEGETATION (ESPACES VERTS) =================
const VEGETATION_ZONES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Parc urbain" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [7.255, 43.72],
            [7.26, 43.72],
            [7.26, 43.725],
            [7.255, 43.725],
            [7.255, 43.72],
          ],
        ],
      },
    },
  ],
};



const POINTS_ZOOM_THRESHOLD = 17;

function ViewReporter({ onViewChange }) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const c = map.getCenter();
      onViewChange?.({ center: [c.lat, c.lng], zoom: map.getZoom() });
    },
    zoomend: (e) => {
      const map = e.target;
      const c = map.getCenter();
      onViewChange?.({ center: [c.lat, c.lng], zoom: map.getZoom() });
    },
  });

  useEffect(() => {
    // première valeur
    // (map dispo via useMapEvents ci-dessus au premier rendu)
  }, []);
  return null;
}

function ZoomWatcher({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });
  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);
  return null;
}

function LegendControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const control = L.control({ position: "bottomright" });
    control.onAdd = () => {
      const div = L.DomUtil.create("div", "aqi-legend");
      div.style.background = "rgba(255,255,255,0.9)";
      div.style.borderRadius = "10px";
      div.style.padding = "10px 12px";
      div.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
      div.style.fontSize = "12px";
      div.style.lineHeight = "1.2";
      div.style.color = "#111827";

      const title = L.DomUtil.create("div", "", div);
      title.textContent = "AQI";
      title.style.fontWeight = "700";
      title.style.marginBottom = "8px";

      const row = L.DomUtil.create("div", "", div);
      row.style.display = "flex";
      row.style.gap = "8px";
      row.style.alignItems = "center";

      // Barre dégradée
      const bar = L.DomUtil.create("div", "", row);
      bar.style.width = "140px";
      bar.style.height = "10px";
      bar.style.borderRadius = "999px";
      bar.style.background =
        "linear-gradient(90deg, #22c55e 0%, #84cc16 18%, #facc15 36%, #fb923c 54%, #ef4444 72%, #a855f7 86%, #7f1d1d 100%)";
      bar.style.boxShadow = "inset 0 0 0 1px rgba(0,0,0,0.06)";

      // Labels
      const labels = L.DomUtil.create("div", "", div);
      labels.style.display = "flex";
      labels.style.justifyContent = "space-between";
      labels.style.marginTop = "6px";
      labels.style.color = "#374151";
      labels.style.gap = "8px";

      const l1 = L.DomUtil.create("span", "", labels);
      l1.textContent = "0";
      const l2 = L.DomUtil.create("span", "", labels);
      l2.textContent = "50";
      const l3 = L.DomUtil.create("span", "", labels);
      l3.textContent = "100";
      const l4 = L.DomUtil.create("span", "", labels);
      l4.textContent = "150";
      const l5 = L.DomUtil.create("span", "", labels);
      l5.textContent = "200+";

      // Empêche la carte de zoomer quand on scrolle sur la légende
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);

      return div;
    };

    control.addTo(map);
    return () => control.remove();
  }, [map]);

  return null;
}


// ================= MAIN MAP =================
export default function Map({
  center,
  showPollution,
  showVegetation,
  sensors = SENSORS_DATA,
  disabledSensorIds = [],
  onViewChange,
}) {
  const activeSensors = (sensors || []).filter(
    (s) => !disabledSensorIds.includes(s.id)
  );

  const [zoom, setZoom] = useState(13);
  const showPoints = showPollution && zoom >= POINTS_ZOOM_THRESHOLD;
  const showHeat = showPollution && zoom < POINTS_ZOOM_THRESHOLD;

  return (
    <MapContainer
      preferCanvas={true}
      zoomAnimation={false}
      fadeAnimation={false}
      markerZoomAnimation={false}
      inertia={false}
      center={center || [43.695, 7.265]}
      zoom={13}
      className="w-100 h-100"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
      />

      <ZoomControl position="bottomright" />

      <ZoomWatcher onZoomChange={setZoom} />
      <ViewReporter onViewChange={onViewChange} />
      <LegendControl />

      {/* Recentrage via recherche */}
      <RecenterMap center={center} />

      {/* Pollution */}
      {showHeat && (
        <>
          <SensorGradientLayer points={activeSensors} />
        </>
      )}

      {showPoints && <SensorPointsLayer points={activeSensors} />}

      {/* Espaces verts */}
      {showVegetation && (
        <GeoJSON
          data={VEGETATION_ZONES}
          style={{
            color: "#16a34a",
            weight: 2,
            fillOpacity: 0.25,
          }}
        />
      )}
    </MapContainer>
  );
}
