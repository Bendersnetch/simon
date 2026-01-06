"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
  GeoJSON,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet.heat";

// ================= ICON FIX =================
const iconUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// ================= DATA =================
const SENSORS_DATA = [
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
function PollutionHeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const updateHeatmap = () => {
      // Supprimer l'ancienne couche
      map.eachLayer((layer) => {
        if (layer instanceof L.HeatLayer) {
          map.removeLayer(layer);
        }
      });

      const currentZoom = map.getZoom();
      const centerLat = map.getCenter().lat;

      // Calculer les mètres par pixel au zoom actuel
      const metersPerPixel = 40075016.686 * Math.abs(Math.cos(centerLat * Math.PI / 180)) / Math.pow(2, currentZoom + 8);

      // Rayon souhaité en mètres (500m)
      const desiredRadiusMeters = 500;
      const radiusPixels = desiredRadiusMeters / metersPerPixel;

      const heat = L.heatLayer(
        points.map((p) => [p.lat, p.lng, p.aqi / 100]),
        {
          radius: radiusPixels,
          blur: 25,
          minOpacity: 0.4,
          gradient: {
            0.0: "#22c55e",
            0.4: "#facc15",
            0.6: "#fb923c",
            0.8: "#ea580c",
            1.0: "#b91c1c",
          },
        }
      ).addTo(map);
    };

    updateHeatmap();

    // Mettre à jour quand le zoom change
    map.on('zoomend', updateHeatmap);

    return () => {
      map.off('zoomend', updateHeatmap);
      map.eachLayer((layer) => {
        if (layer instanceof L.HeatLayer) {
          map.removeLayer(layer);
        }
      });
    };
  }, [map, points]);

  return null;
}

// ================= VEGETATION (ESPACES VERTS) =================
// Exemple simple (polygones fake mais réalistes)
// 👉 remplaçable plus tard par une vraie source GeoJSON (OpenData)
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

// ================= MAIN MAP =================
export default function Map({
  center,
  showPollution,
  showVegetation,
}) {
  return (
    <MapContainer
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

      {/* Recentrage via recherche */}
      <RecenterMap center={center} />

      {/* Pollution */}
      {showPollution && (
        <>
          <PollutionHeatmapLayer points={SENSORS_DATA} />
          {SENSORS_DATA.map((sensor) => (
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
