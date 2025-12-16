"use client";

import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet.heat';

// Fix for default marker icons not showing in Next.js/Leaflet
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const SENSORS_DATA = [
    // --- Zone Très Polluée (Rouge/Orange) ---
    { id: 'SENS-001', lat: 43.696, lng: 7.265, aqi: 95, label: 'Promenade des Anglais - Centre', desc: 'Trafic saturé' },
    { id: 'SENS-004', lat: 43.669, lng: 7.215, aqi: 98, label: 'Aéroport - Piste Sud', desc: 'Émissions kérosène' },
    { id: 'SENS-005', lat: 43.706, lng: 7.262, aqi: 88, label: 'Gare Thiers', desc: 'Trafic routier et ferroviaire' },
    { id: 'SENS-007', lat: 43.702, lng: 7.255, aqi: 82, label: 'Voie Rapide - Magnan', desc: 'Axe majeur' },
    { id: 'SENS-008', lat: 43.680, lng: 7.200, aqi: 90, label: 'Aéroport - Terminal 2', desc: 'Zone dépose-minute' },
    { id: 'SENS-009', lat: 43.710, lng: 7.272, aqi: 78, label: 'Avenue Jean Médecin', desc: 'Zone commerciale dense' },
    { id: 'SENS-020', lat: 43.725, lng: 7.189, aqi: 85, label: 'Stade Allianz Riviera', desc: 'Jour de match' },

    // --- Zone Modérée (Jaune/Orange) ---
    { id: 'SENS-002', lat: 43.701, lng: 7.278, aqi: 55, label: 'Vieux Nice', desc: 'Zone piétonne protégée' },
    { id: 'SENS-010', lat: 43.705, lng: 7.280, aqi: 62, label: 'Port Lympia', desc: 'Activité maritime' },
    { id: 'SENS-011', lat: 43.698, lng: 7.240, aqi: 50, label: 'Lenval - Fabron', desc: 'Résidentiel dense' },
    { id: 'SENS-012', lat: 43.712, lng: 7.260, aqi: 58, label: 'Libération', desc: 'Marché couvert' },
    { id: 'SENS-013', lat: 43.725, lng: 7.290, aqi: 45, label: 'Observatoire', desc: 'Hauteurs urbaines' },
    { id: 'SENS-014', lat: 43.685, lng: 7.225, aqi: 65, label: 'Arenas', desc: 'Quartier affaires' },

    // --- Zone Propre (Vert) ---
    { id: 'SENS-003', lat: 43.715, lng: 7.268, aqi: 25, label: 'Cimiez', desc: 'Parc et jardins' },
    { id: 'SENS-006', lat: 43.720, lng: 7.250, aqi: 15, label: 'Collines', desc: 'Zone naturelle' },
    { id: 'SENS-015', lat: 43.730, lng: 7.240, aqi: 10, label: 'Saint-Pancrace', desc: 'Quartier résidentiel calme' },
    { id: 'SENS-016', lat: 43.690, lng: 7.310, aqi: 20, label: 'Mont Boron', desc: 'Forêt communale' },
    { id: 'SENS-017', lat: 43.740, lng: 7.200, aqi: 12, label: 'Saint-Isidore', desc: 'Zone périphérique' },
    { id: 'SENS-018', lat: 43.710, lng: 7.295, aqi: 28, label: 'Riquier - Gare', desc: 'Transition urbaine' },
    { id: 'SENS-019', lat: 43.695, lng: 7.300, aqi: 18, label: 'Coco Beach', desc: 'Littoral Est' }
];

function HeatmapLayer({ points }) {
    const map = useMap();

    // Configuration de base
    // On réduit le rayon "core" mais on augmente le flou pour éviter les gros disques rouges plats
    const BASE_ZOOM = 13;
    const BASE_RADIUS = 70; // Plus petit pour éviter les "patates"
    const BASE_BLUR = 120; // Flou très large par rapport au rayon pour un effet fumée

    useEffect(() => {
        if (!map) return;

        let heatLayer;

        const updateHeatmap = () => {
            if (heatLayer) {
                map.removeLayer(heatLayer);
            }

            const currentZoom = map.getZoom();
            const scaleFactor = Math.pow(2, currentZoom - BASE_ZOOM);

            // Adaptation au zoom
            const adjustedRadius = 40 * scaleFactor;
            const adjustedBlur = 60 * scaleFactor;

            const heatData = points.map(p => {
                let intensity = p.aqi / 100;
                return [p.lat, p.lng, intensity];
            });

            heatLayer = L.heatLayer(heatData, {
                radius: adjustedRadius,
                blur: adjustedBlur,
                maxZoom: 13,
                max: 1.0,
                minOpacity: 0.35,
                gradient: {
                    0.0: '#22c55e',
                    0.4: '#facc15',
                    0.6: '#fb923c',
                    0.8: '#ea580c',
                    1.0: '#b91c1c'
                }
            }).addTo(map);
        };

        map.on('zoomend', updateHeatmap);
        updateHeatmap(); // Initial draw

        return () => {
            map.off('zoomend', updateHeatmap);
            if (heatLayer) map.removeLayer(heatLayer);
        };
    }, [map, points]);

    return null;
}

export default function MapBackground() {
    return (
        <MapContainer
            center={[43.6950, 7.2650]}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
            />

            <ZoomControl position="bottomright" />

            <HeatmapLayer points={SENSORS_DATA} />

            {SENSORS_DATA.map((sensor) => (
                <Marker key={sensor.id} position={[sensor.lat, sensor.lng]}>
                    <Popup>
                        <strong className="d-block">{sensor.label}</strong>
                        <span className="text-muted">{sensor.desc}</span>
                        <div className="mt-1 fw-bold">AQI: {sensor.aqi}</div>
                    </Popup>
                </Marker>
            ))}

        </MapContainer>
    );
}
