"use client";

import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
  CircleMarker,
  Tooltip,
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

// ================= TEMPERATURE =================
const getTemperatureColor = (temp) => {
  if (temp == null) return "#94a3b8"; // gris si pas de donnée
  if (temp <= 0) return "#3b82f6";    // bleu froid
  if (temp <= 10) return "#60a5fa";   // bleu clair
  if (temp <= 18) return "#22d3ee";   // cyan
  if (temp <= 24) return "#22c55e";   // vert agréable
  if (temp <= 30) return "#facc15";   // jaune chaud
  if (temp <= 35) return "#fb923c";   // orange
  return "#ef4444";                    // rouge très chaud
};

const TEMPERATURE_LEGEND = [
  { label: "≤0°C", color: "#3b82f6" },
  { label: "1-10°C", color: "#60a5fa" },
  { label: "11-18°C", color: "#22d3ee" },
  { label: "19-24°C", color: "#22c55e" },
  { label: "25-30°C", color: "#facc15" },
  { label: "31-35°C", color: "#fb923c" },
  { label: ">35°C", color: "#ef4444" },
];

// ================= HUMIDITY =================
const getHumidityColor = (humidity) => {
  if (humidity == null) return "#94a3b8";
  if (humidity <= 20) return "#fef3c7"; // très sec - beige
  if (humidity <= 40) return "#a5f3fc"; // sec - bleu très clair
  if (humidity <= 60) return "#22d3ee"; // normal - cyan
  if (humidity <= 80) return "#3b82f6"; // humide - bleu
  return "#1e3a8a";                      // très humide - bleu foncé
};

const HUMIDITY_LEGEND = [
  { label: "0-20%", color: "#fef3c7" },
  { label: "21-40%", color: "#a5f3fc" },
  { label: "41-60%", color: "#22d3ee" },
  { label: "61-80%", color: "#3b82f6" },
  { label: "81-100%", color: "#1e3a8a" },
];

// ================= UV INDEX =================
const getUVColor = (uv) => {
  if (uv == null) return "#94a3b8";
  if (uv <= 2) return "#22c55e";   // faible - vert
  if (uv <= 5) return "#facc15";   // modéré - jaune
  if (uv <= 7) return "#fb923c";   // élevé - orange
  if (uv <= 10) return "#ef4444";  // très élevé - rouge
  return "#a855f7";                 // extrême - violet
};

const UV_LEGEND = [
  { label: "1-2 (faible)", color: "#22c55e" },
  { label: "3-5 (modéré)", color: "#facc15" },
  { label: "6-7 (élevé)", color: "#fb923c" },
  { label: "8-10 (très élevé)", color: "#ef4444" },
  { label: "11+ (extrême)", color: "#a855f7" },
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

// ================= MAP REFRESHER (force redraw when data changes) =================
function MapRefresher({ dataCount }) {
  const map = useMap();

  useEffect(() => {
    if (dataCount > 0) {
      console.log("MapRefresher: Data loaded, forcing map refresh");
      // Petit délai pour laisser React finir le rendu
      setTimeout(() => {
        map.invalidateSize();
        // Forcer un léger pan pour déclencher le redraw des layers
        const center = map.getCenter();
        map.panTo([center.lat + 0.0001, center.lng], { animate: false });
        map.panTo([center.lat, center.lng], { animate: false });
      }, 100);
    }
  }, [dataCount, map]);

  return null;
}

// ================= GENERIC DATA GRADIENT LAYER =================
function DataGradientLayer({ points, dataKey, colorFn }) {
  const map = useMap();
  const layerRef = useRef(null);
  const colorFnRef = useRef(colorFn); // Store colorFn in ref to avoid stale closure
  colorFnRef.current = colorFn;

  useEffect(() => {
    if (!map) return;

    const CanvasLayer = L.Layer.extend({
      _points: [],

      onAdd: function () {
        this._canvas = L.DomUtil.create("canvas", "data-gradient-canvas");
        this._canvas.style.position = "absolute";
        this._canvas.style.top = "0";
        this._canvas.style.left = "0";
        this._canvas.style.pointerEvents = "none";
        this._ctx = this._canvas.getContext("2d");

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
        L.DomUtil.setPosition(this._canvas, topLeft);
        this._canvas.width = size.x;
        this._canvas.height = size.y;
        this._redraw();
      },

      setPoints: function (newPoints) {
        this._points = newPoints || [];
        this._redraw();
      },

      _redraw: function () {
        if (!this._ctx) return;
        const ctx = this._ctx;
        const size = map.getSize();
        ctx.clearRect(0, 0, size.x, size.y);

        const R = 120;

        (this._points || []).forEach((p) => {
          const pt = map.latLngToContainerPoint([p.lat, p.lng]);
          const value = p[dataKey];
          const color = colorFnRef.current(value);

          const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, R);
          grad.addColorStop(0.0, color + "CC");
          grad.addColorStop(0.65, color + "55");
          grad.addColorStop(1.0, color + "00");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, R, 0, Math.PI * 2);
          ctx.fill();
        });

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
  }, [map, dataKey]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !layer.setPoints) return;
    layer.setPoints(points);
  }, [points]);

  return null;
}

// ================= GENERIC DATA POINTS LAYER =================
function DataPointsLayer({ points, dataKey, colorFn, formatValue, unit }) {
  return (
    <>
      {(points || []).map((p) => {
        const value = p[dataKey];
        const color = colorFn(value);
        const displayValue = formatValue ? formatValue(value) : value;

        return (
          <CircleMarker
            key={`${p.id}-${dataKey}`}
            center={[p.lat, p.lng]}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: color,
              fillOpacity: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
              <div style={{ minWidth: 120 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontSize: 13 }}>
                  {displayValue != null ? `${displayValue}${unit || ''}` : 'N/A'}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}

// ================= VEGETATION (ESPACES VERTS) =================
// Zones végétales supprimées



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

function LegendControl({ activeLayer }) {
  const map = useMap();
  const controlRef = useRef(null);

  console.log("LegendControl: activeLayer =", activeLayer);

  useEffect(() => {
    if (!map) return;

    // Supprimer l'ancien control s'il existe
    if (controlRef.current) {
      controlRef.current.remove();
    }

    // Ne pas afficher de légende si aucun calque n'est actif
    if (!activeLayer) return;

    // Configuration des légendes par type
    const legendConfigs = {
      pollution: {
        title: "AQI",
        gradient: "linear-gradient(90deg, #22c55e 0%, #84cc16 18%, #facc15 36%, #fb923c 54%, #ef4444 72%, #a855f7 86%, #7f1d1d 100%)",
        labels: ["0", "50", "100", "150", "200+"],
      },
      temperature: {
        title: "Température",
        gradient: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 15%, #22d3ee 30%, #22c55e 45%, #facc15 65%, #fb923c 80%, #ef4444 100%)",
        labels: ["≤0°C", "10°C", "20°C", "30°C", ">35°C"],
      },
      humidity: {
        title: "Humidité",
        gradient: "linear-gradient(90deg, #fef3c7 0%, #a5f3fc 25%, #22d3ee 50%, #3b82f6 75%, #1e3a8a 100%)",
        labels: ["0%", "25%", "50%", "75%", "100%"],
      },
      uv: {
        title: "Indice UV",
        gradient: "linear-gradient(90deg, #22c55e 0%, #facc15 25%, #fb923c 50%, #ef4444 75%, #a855f7 100%)",
        labels: ["1-2", "3-5", "6-7", "8-10", "11+"],
      },
    };

    const config = legendConfigs[activeLayer];
    if (!config) return;

    const control = L.control({ position: "bottomright" });
    control.onAdd = () => {
      const div = L.DomUtil.create("div", "data-legend");
      div.style.background = "rgba(255,255,255,0.95)";
      div.style.borderRadius = "10px";
      div.style.padding = "10px 14px";
      div.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
      div.style.fontSize = "12px";
      div.style.lineHeight = "1.2";
      div.style.color = "#111827";
      div.style.minWidth = "160px";

      const title = L.DomUtil.create("div", "", div);
      title.textContent = config.title;
      title.style.fontWeight = "700";
      title.style.marginBottom = "8px";

      // Barre dégradée
      const bar = L.DomUtil.create("div", "", div);
      bar.style.width = "100%";
      bar.style.height = "10px";
      bar.style.borderRadius = "999px";
      bar.style.background = config.gradient;
      bar.style.boxShadow = "inset 0 0 0 1px rgba(0,0,0,0.06)";

      // Labels
      const labels = L.DomUtil.create("div", "", div);
      labels.style.display = "flex";
      labels.style.justifyContent = "space-between";
      labels.style.marginTop = "6px";
      labels.style.color = "#374151";
      labels.style.fontSize = "11px";

      config.labels.forEach((labelText) => {
        const span = L.DomUtil.create("span", "", labels);
        span.textContent = labelText;
      });

      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);

      return div;
    };

    control.addTo(map);
    controlRef.current = control;

    return () => {
      if (controlRef.current) {
        controlRef.current.remove();
        controlRef.current = null;
      }
    };
  }, [map, activeLayer]);

  return null;
}


// ================= MAIN MAP =================
// Coordonnées approximatives pour les capteurs connus de l'API
const KNOWN_LOCATIONS = {
  "nice-centre": { lat: 43.7009, lng: 7.2684 },
  "nice-prom": { lat: 43.6952, lng: 7.2651 },
  "nice-vieux": { lat: 43.6976, lng: 7.2755 },
  "nice-port": { lat: 43.6998, lng: 7.2839 },
  "nice-cimiez": { lat: 43.7195, lng: 7.2744 },
  "nice-nord": { lat: 43.7292, lng: 7.2520 },
  "nice-arenas": { lat: 43.6680, lng: 7.2154 },
  "nice-saint-isidore": { lat: 43.7078, lng: 7.1957 },
  "nice-mont-boron": { lat: 43.6991, lng: 7.2973 },
  "nice-est": { lat: 43.7126, lng: 7.2913 },
};

// ================= MAIN MAP =================
export default function Map({
  center,
  activeLayer, // 'pollution', 'temperature', 'humidity', 'uv', ou null
  localSensors = [],
  disabledSensorIds = [],
  onViewChange,
}) {
  const [zoom, setZoom] = useState(13);
  const isZoomedIn = zoom >= POINTS_ZOOM_THRESHOLD;

  // Déterminer quel calque est actif
  const showPollution = activeLayer === 'pollution';
  const showTemperature = activeLayer === 'temperature';
  const showHumidity = activeLayer === 'humidity';
  const showUV = activeLayer === 'uv';

  const [sensorsData, setSensorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-mount des layers

  useEffect(() => {
    async function fetchSensorData(retryCount = 0) {
      console.log(`Map: Fetching sensor data (attempt ${retryCount + 1})...`);
      try {
        const result = await getSensorData();

        console.log("Map: Server Action result:", result);

        // Si erreur serveur (500) et qu'on peut encore réessayer (max 5 tentatives, 5s entre chaque)
        if (!result.success && retryCount < 5) {
          console.log(`Map: API error, retrying in 5 seconds... (${retryCount + 1}/5)`);
          setTimeout(() => fetchSensorData(retryCount + 1), 5000);
          return;
        }

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const data = result.data;
          console.log("Map: Received", data.length, "items from API");

          // 1. Dédoublonnage : ne garder que le plus récent par 'origin'
          const latestSensorsObj = {};
          const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          sortedData.forEach((item) => {
            if (item.origin) {
              latestSensorsObj[item.origin] = item;
            }
          });

          // 2. Transformer les données pour l'affichage
          const transformedData = Object.values(latestSensorsObj).map((item, index) => {
            const origin = item.origin || `SENS-${index}`;
            // Récupérer coords depuis KNOWN_LOCATIONS
            const coords = KNOWN_LOCATIONS[origin] || { lat: 0, lng: 0 };

            // Calculer AQI à partir de qair (qualité de l'air)
            let aqi = 50; // valeur par défaut
            if (item.qair && Array.isArray(item.qair) && item.qair.length > 0) {
              aqi = item.qair[0];
              // Si c'est un ratio (0-1), convertir en échelle 0-100
              if (aqi > 0 && aqi < 1) aqi = aqi * 100;
            }

            return {
              id: origin,
              lat: coords.lat,
              lng: coords.lng,
              aqi: Math.round(aqi),
              label: origin,
              desc: item.temperature ? `Temp: ${item.temperature.toFixed(1)}°C` : "Capteur actif",
              temperature: item.temperature,
              humidite: item.humidite,
              uv: item.uv,
            };
          });

          console.log("Map: Transformed sensors:", transformedData);
          setSensorsData(transformedData);
          // Forcer le re-mount des layers après un court délai
          setTimeout(() => setRefreshKey(k => k + 1), 50);
        } else {
          console.warn("Map: No data received from API or error:", result.error);
        }
      } catch (err) {
        console.error("Map: Error fetching sensor data:", err);
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

  // Combiner les données de l'API avec les capteurs locaux
  const allSensors = [...sensorsData, ...localSensors];
  const activeSensors = allSensors.filter((s) =>
    !disabledSensorIds.includes(s.id) &&
    s.lat != null && s.lng != null
  );

  // Indicateur que les données ont été chargées au moins une fois
  const dataLoaded = sensorsData.length > 0;

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
      <LegendControl activeLayer={activeLayer} />

      {/* Recentrage via recherche */}
      <RecenterMap center={center} />

      {/* Force redraw quand les données arrivent */}
      <MapRefresher dataCount={sensorsData.length} />

      {/* =============== POLLUTION =============== */}
      {dataLoaded && showPollution && !isZoomedIn && (
        <DataGradientLayer
          key={`pollution-heat-${refreshKey}`}
          points={activeSensors}
          dataKey="aqi"
          colorFn={getAqiColor}
        />
      )}
      {dataLoaded && showPollution && activeSensors.length > 0 && (
        <DataPointsLayer
          key={`pollution-points-${refreshKey}`}
          points={activeSensors}
          dataKey="aqi"
          colorFn={getAqiColor}
          formatValue={(v) => Math.round(v)}
          unit=" AQI"
        />
      )}

      {/* =============== TEMPERATURE =============== */}
      {dataLoaded && showTemperature && !isZoomedIn && (
        <DataGradientLayer
          key={`temp-heat-${refreshKey}`}
          points={activeSensors}
          dataKey="temperature"
          colorFn={getTemperatureColor}
        />
      )}
      {dataLoaded && showTemperature && activeSensors.length > 0 && (
        <DataPointsLayer
          key={`temp-points-${refreshKey}`}
          points={activeSensors}
          dataKey="temperature"
          colorFn={getTemperatureColor}
          formatValue={(v) => v?.toFixed(1)}
          unit="°C"
        />
      )}

      {/* =============== HUMIDITY =============== */}
      {dataLoaded && showHumidity && !isZoomedIn && (
        <DataGradientLayer
          key={`humidity-heat-${refreshKey}`}
          points={activeSensors}
          dataKey="humidite"
          colorFn={getHumidityColor}
        />
      )}
      {dataLoaded && showHumidity && activeSensors.length > 0 && (
        <DataPointsLayer
          key={`humidity-points-${refreshKey}`}
          points={activeSensors}
          dataKey="humidite"
          colorFn={getHumidityColor}
          formatValue={(v) => v?.toFixed(0)}
          unit="%"
        />
      )}

      {/* =============== UV =============== */}
      {dataLoaded && showUV && !isZoomedIn && (
        <DataGradientLayer
          key={`uv-heat-${refreshKey}`}
          points={activeSensors}
          dataKey="uv"
          colorFn={getUVColor}
        />
      )}
      {dataLoaded && showUV && activeSensors.length > 0 && (
        <DataPointsLayer
          key={`uv-points-${refreshKey}`}
          points={activeSensors}
          dataKey="uv"
          colorFn={getUVColor}
          formatValue={(v) => v?.toFixed(1)}
          unit=""
        />
      )}


    </MapContainer>
  );
}
