"use client";

import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
  GeoJSON,
  CircleMarker,
  Tooltip,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet.heat";
import { getSensorData } from "../actions";

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


// ================= FALLBACK DATA =================
const FALLBACK_SENSORS_DATA = [
  { id: "SENS-001", lat: 43.696, lng: 7.265, aqi: 95, label: "Centre", desc: "Trafic saturé" },
  { id: "SENS-002", lat: 43.701, lng: 7.278, aqi: 55, label: "Vieux Nice", desc: "Zone piétonne" },
  { id: "SENS-003", lat: 43.715, lng: 7.268, aqi: 25, label: "Cimiez", desc: "Parc et jardins" },
  { id: "SENS-006", lat: 43.720, lng: 7.25, aqi: 15, label: "Collines", desc: "Zone naturelle" },
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
  sensors = FALLBACK_SENSORS_DATA,
  disabledSensorIds = [],
  onViewChange,
}) {
  const activeSensors = (sensors || []).filter(
    (s) => !disabledSensorIds.includes(s.id)
  );

  const [zoom, setZoom] = useState(13);
  const showPoints = showPollution && zoom >= POINTS_ZOOM_THRESHOLD;
  const showHeat = showPollution && zoom < POINTS_ZOOM_THRESHOLD;
  const [sensorsData, setSensorsData] = useState(FALLBACK_SENSORS_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSensorData() {
      try {
        const result = await getSensorData();
        if (result.success && result.data && result.data.length > 0) {
          // Transformer les données de l'API au format attendu
          const transformedData = result.data.map((item, index) => ({
            id: item.capteur_id || `SENS-${index}`,
            lat: item.latitude || item.lat,
            lng: item.longitude || item.lng,
            aqi: item.aqi || item.pm25 || 50,
            label: item.label || item.capteur_id || `Capteur ${index + 1}`,
            desc: item.description || item.desc || "Capteur actif",
          }));
          setSensorsData(transformedData);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des capteurs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSensorData();

    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

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
          {sensorsData.map((sensor) => (
            <Marker key={sensor.id} position={[sensor.lat, sensor.lng]}>
              <Popup>
                <strong>{sensor.label}</strong>
                <div className="text-muted">{sensor.desc}</div>
                <div className="fw-bold mt-1">AQI {sensor.aqi}</div>
              </Popup>
            </Marker>
          ))}
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
