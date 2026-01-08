"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import LoginScreen from "./LoginScreen";
import UserManagementScreen from "./UserManagementScreen";
import { FaUsers } from "react-icons/fa";
import { addSensor } from "./actions";

// Map (Leaflet) – désactivé côté SSR
const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted bg-light">
      Chargement de la carte…
    </div>
  ),
});

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [showPollution, setShowPollution] = useState(true);
  const [showVegetation, setShowVegetation] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState([43.7102, 7.262]); // Nice par défaut
  const [currentViewCenter, setCurrentViewCenter] = useState([43.7102, 7.262]);

  const [isMobile, setIsMobile] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showMobileLayers, setShowMobileLayers] = useState(false);
  const searchTimerRef = useRef(null);

  // ================== SENSORS STATE (pour gérer modify/disable/add) ==================
  const [localSensors, setLocalSensors] = useState([]);
  const [disabledSensorIds, setDisabledSensorIds] = useState([]);

  // ================== MODALE APPAREILS ==================
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [deviceSerial, setDeviceSerial] = useState("");
  const [deviceError, setDeviceError] = useState("");
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [deviceMode, setDeviceMode] = useState("none"); // "none" | "view" | "edit"

  // Edition
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  const [editAqi, setEditAqi] = useState("");

  // Ajout (formulaire de création de capteur)
  const [addNom, setAddNom] = useState("");
  const [addOrigin, setAddOrigin] = useState("");
  const [addApiKey, setAddApiKey] = useState("");
  const [addType, setAddType] = useState("");
  const [addLat, setAddLat] = useState("");
  const [addLng, setAddLng] = useState("");
  const [addActive, setAddActive] = useState(true);

  // Confirm désactivation
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [activateSerial, setActivateSerial] = useState("");

  const deviceSerialNormalized = useMemo(
    () => deviceSerial.trim().toUpperCase(),
    [deviceSerial]
  );

  const findSensorById = (id) => {
    // Les données des capteurs sont maintenant gérées par le composant Map
    return null;
  };

  const isSensorDisabled = useMemo(() => {
    if (!selectedSensor) return false;
    return disabledSensorIds.includes(selectedSensor.id);
  }, [selectedSensor, disabledSensorIds]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const resetDevicesModal = () => {
    setDeviceSerial("");
    setDeviceError("");
    setSelectedSensor(null);
    setDeviceMode("none");
    setEditLat("");
    setEditLng("");
    setEditAqi("");
    // Reset formulaire création
    setAddNom("");
    setAddOrigin("");
    setAddApiKey("");
    setAddType("");
    setAddLat("");
    setAddLng("");
    setAddActive(true);
    setShowDisableConfirm(false);
    setActivateSerial("");
  };

  const loadSensorFromSerial = () => {
    setDeviceError("");
    const s = findSensorById(deviceSerialNormalized);
    if (!s) {
      setSelectedSensor(null);
      setDeviceMode("none");
      setDeviceError("Capteur introuvable. Vérifie le numéro de série.");
      return null;
    }
    setSelectedSensor(s);
    // Pré-remplir l'édition
    setEditLat(String(s.lat));
    setEditLng(String(s.lng));
    setEditAqi(String(s.aqi));
    return s;
  };

  const handleShowSensor = () => {
    const s = loadSensorFromSerial();
    if (!s) return;

    // Si désactivé: on bloque l'affichage
    if (disabledSensorIds.includes(s.id)) {
      setDeviceMode("none");
      setDeviceError("Ce capteur est désactivé. Active-le pour pouvoir l’afficher.");
      return;
    }

    setDeviceMode("view");
    // Centrer la carte sur le capteur
    setMapCenter([parseFloat(s.lat), parseFloat(s.lng)]);
  };

  const handleSaveEdits = () => {
    setDeviceError("");
    const s = loadSensorFromSerial();
    if (!s) return;

    const lat = Number(editLat);
    const lng = Number(editLng);
    const aqi = Number(editAqi);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(aqi)) {
      setDeviceError("Latitude/Longitude/AQI doivent être des nombres valides.");
      return;
    }

    // Note: Les données des capteurs sont maintenant gérées par l'API
    // TODO: Appeler l'API pour modifier le capteur

    // Recentrer pour feedback immédiat
    setMapCenter([lat, lng]);
  };

  const requestDisableSensor = () => {
    setDeviceError("");
    const s = loadSensorFromSerial();
    if (!s) return;
    setShowDisableConfirm(true);
  };

  const confirmDisableSensor = () => {
    if (!selectedSensor) return;

    setDisabledSensorIds((prev) => {
      if (prev.includes(selectedSensor.id)) return prev;
      return [...prev, selectedSensor.id];
    });

    setShowDisableConfirm(false);
  };

  const handleActivateSensor = () => {
    setDeviceError("");
    const id = (activateSerial || "").trim().toUpperCase();
    if (!id) {
      setDeviceError("Choisis un capteur à activer.");
      return;
    }
    if (!disabledSensorIds.includes(id)) {
      setDeviceError("Ce capteur n’est pas dans la liste des désactivés.");
      return;
    }

    setDisabledSensorIds((prev) => prev.filter((x) => x !== id));
    setActivateSerial("");
  };

  // Traitement de l'ajout de capteur (version mise à jour)

  const handleAddSensor = async () => {
    setDeviceError("");

    const nom = addNom.trim();
    const origin = addOrigin.trim();
    const apiKey = addApiKey.trim();
    const type = addType.trim();
    const lat = Number(addLat);
    const lng = Number(addLng);
    const active = addActive;

    // Validation
    if (!nom) {
      setDeviceError("Nom du capteur obligatoire.");
      return;
    }
    if (!origin) {
      setDeviceError("Origin obligatoire.");
      return;
    }
    if (!apiKey) {
      setDeviceError("API Key obligatoire.");
      return;
    }
    if (!type) {
      setDeviceError("Type obligatoire.");
      return;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setDeviceError("Latitude/Longitude doivent être des nombres valides.");
      return;
    }

    // Vérifier si le capteur existe déjà dans les capteurs locaux
    const exists = localSensors.some((s) => (s.id || "").toString().toLowerCase() === nom.toLowerCase());
    if (exists) {
      setDeviceError("Un capteur avec ce nom existe déjà.");
      return;
    }

    // Tenter d'ajouter via l'API Gateway
    const result = await addSensor({
      nom,
      origin,
      apiKey,
      type,
      latitude: lat,
      longitude: lng,
      active,
    });

    let newSensor;
    if (result.success && result.data) {
      // Utiliser les données retournées par l'API
      const apiData = result.data;
      // coordinates = [longitude, latitude]
      const sensorLng = apiData.localisation?.coordinates?.[0] ?? lng;
      const sensorLat = apiData.localisation?.coordinates?.[1] ?? lat;
      newSensor = {
        id: apiData.id?.toString() || nom,
        lat: sensorLat,
        lng: sensorLng,
        aqi: 50, // AQI par défaut pour l'affichage
        label: apiData.nom || nom,
        desc: `Ajouté le ${new Date(apiData.dateInstallation).toLocaleDateString('fr-FR')}`,
      };
    } else {
      // Fallback si l'API échoue
      console.warn('API non disponible, ajout local:', result.error);
      newSensor = { id: nom, lat, lng, aqi: 50, label: nom, desc: "Ajouté manuellement" };
    }

    // Ajouter au state local (pour affichage immédiat)
    setLocalSensors((prev) => [...prev, newSensor]);

    // Au cas où il était désactivé avant
    setDisabledSensorIds((prev) => prev.filter((x) => x !== newSensor.id));

    setMapCenter([newSensor.lat, newSensor.lng]);

    // Reset du formulaire
    setAddNom("");
    setAddOrigin("");
    setAddApiKey("");
    setAddType("");
    setAddLat("");
    setAddLng("");
    setAddActive(true);
  };

  const canUseSerialActions = useMemo(() => {
    const s = findSensorById(deviceSerialNormalized);
    if (!s) return false;
    // Si déjà désactivé, on bloque "Afficher" et "Modifier" (mais pas le reste)
    if (disabledSensorIds.includes(s.id)) return false;
    return true;
  }, [deviceSerialNormalized, disabledSensorIds]);

  return (
    <div className="position-relative w-100 min-vh-100 overflow-hidden bg-light text-dark">
      {/* ================= CARTE PLEIN ÉCRAN ================= */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 z-0"
        style={{
          top: isMobile ? "60px" : "0",
          height: isMobile ? "calc(100vh - 60px)" : "100vh",
        }}
      >
        <Map
          showPollution={showPollution}
          showVegetation={showVegetation}
          center={mapCenter}
          localSensors={localSensors}
          disabledSensorIds={disabledSensorIds}
          onViewChange={({ center }) => {
            if (Array.isArray(center) && center.length === 2) {
              setCurrentViewCenter(center);
            }
          }}
        />
      </div>

      {isSearching && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 z-2">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement.</span>
            </div>
            <p className="mt-2">Recherche en cours.</p>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <header className="position-absolute top-0 start-0 end-0 z-3 px-2 px-md-4 py-2 py-md-3 d-flex align-items-center justify-content-between gap-2 gap-md-4">
        {/* Logo */}
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <div
            className="bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: 32, height: 32 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0c-.69 0-1.37.176-2 .5C5.37.176 4.69 0 4 0 1.79 0 0 1.79 0 4v4c0 3.866 3.582 7.25 8 8 4.418-.75 8-4.134 8-8V4c0-2.21-1.79-4-4-4-.69 0-1.37.176-2 .5C9.37.176 8.69 0 8 0z" />
            </svg>
          </div>
          <span className="fw-bold fs-6 fs-md-5 d-none d-sm-inline">SIMON</span>
        </div>

        {/* Barre de recherche - cachée sur mobile, visible sur desktop */}
        <div className="flex-grow-1 d-none d-md-flex justify-content-center">
          <div
            className="bg-white rounded-4 shadow-sm px-3 py-2 d-flex align-items-center gap-2 position-relative"
            style={{ maxWidth: 420, width: "100%" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="form-control border-0 p-0 shadow-none"
              placeholder="Rechercher un lieu, une adresse…"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);

                setSuggestions([]);
                setShowSuggestions(false);
                setIsLoadingSuggestions(false);

                if (searchTimerRef.current) {
                  clearTimeout(searchTimerRef.current);
                  searchTimerRef.current = null;
                }

                if (value.length > 3) {
                  searchTimerRef.current = setTimeout(async () => {
                    setShowSuggestions(true);
                    setIsLoadingSuggestions(true);
                    try {
                      const res = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                          value
                        )}&limit=5`
                      );
                      const data = await res.json();
                      setSuggestions(data);
                    } catch (error) {
                      console.error("❌ Erreur recherche:", error);
                      setSuggestions([]);
                      setShowSuggestions(false);
                    } finally {
                      setIsLoadingSuggestions(false);
                    }
                  }, 1000);
                } else {
                  setSuggestions([]);
                  setShowSuggestions(false);
                  setIsLoadingSuggestions(false);
                }
              }}
              onBlur={() => {
                if (searchTimerRef.current) {
                  clearTimeout(searchTimerRef.current);
                  searchTimerRef.current = null;
                }
                setShowSuggestions(false);
                setSuggestions([]);
                setIsLoadingSuggestions(false);
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!searchQuery) return;

                  setShowSuggestions(false);
                  setSuggestions([]);
                  setIsLoadingSuggestions(false);

                  if (searchTimerRef.current) {
                    clearTimeout(searchTimerRef.current);
                    searchTimerRef.current = null;
                  }

                  setIsSearching(true);
                  try {
                    const res = await fetch(
                      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        searchQuery
                      )}`
                    );
                    const data = await res.json();
                    if (data && data.length > 0) {
                      setMapCenter([
                        parseFloat(data[0].lat),
                        parseFloat(data[0].lon),
                      ]);
                    }
                  } catch (error) {
                    console.error(error);
                  } finally {
                    setIsSearching(false);
                  }
                } else if (e.key === "Escape") {
                  if (searchTimerRef.current) {
                    clearTimeout(searchTimerRef.current);
                    searchTimerRef.current = null;
                  }
                  setShowSuggestions(false);
                  setSuggestions([]);
                  setIsLoadingSuggestions(false);
                }
              }}
            />
          </div>
        </div>

        {/* Actions */}
        {!isLoggedIn ? (
          <div className="d-flex align-items-center gap-2 gap-md-3 flex-shrink-0">
            {/* Bouton hamburger pour mobile */}
            <Button
              variant="light"
              className="rounded-circle shadow-sm d-md-none"
              style={{ width: 36, height: 36 }}
              onClick={() => setShowMobileLayers(!showMobileLayers)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>
            <Button
              variant="primary"
              className="rounded-4 px-3 py-1 px-md-4 py-md-2 shadow-sm flex-shrink-0 fs-7 fs-md-6"
              onClick={() => setShowLoginModal(true)}
            >
              <span className="d-none d-sm-inline">Connexion Admin</span>
              <span className="d-sm-none">Admin</span>
            </Button>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2 gap-md-3 flex-shrink-0">
            {/* Bouton hamburger pour mobile */}
            <Button
              variant="light"
              className="rounded-circle shadow-sm d-md-none"
              style={{ width: 36, height: 36 }}
              onClick={() => setShowMobileLayers(!showMobileLayers)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>

            <Button
              variant="primary"
              className="rounded-circle shadow-sm"
              onClick={() => setShowUserManagement(true)}
            >
              <FaUsers />
            </Button>

            {/* ======= BOUTON APPAREILS (remplace + Nouveau module) ======= */}
            <Button
              variant="primary"
              className="rounded-4 px-3 py-1 px-md-4 py-md-2 shadow-sm fs-7 fs-md-6"
              onClick={() => {
                setShowDevicesModal(true);
                setDeviceError("");
                // Pré-remplir l’ajout avec la position actuelle de la carte
                setAddLat((prev) => (prev ? prev : String(currentViewCenter[0])));
                setAddLng((prev) => (prev ? prev : String(currentViewCenter[1])));
              }}
            >
              <span className="d-none d-sm-inline">Appareils</span>
              <span className="d-sm-none">App.</span>
            </Button>

            <Button
              variant="light"
              className="rounded-circle shadow-sm"
              style={{ width: 36, height: 36 }}
              onClick={() => setShowLogoutConfirm(true)}
              title="Déconnexion"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </Button>
          </div>
        )}
      </header>

      {/* ================= PANNEAU CALQUES ================= */}
      <aside
        className="position-absolute z-3 d-none d-md-block"
        style={{ top: 96, left: 24, width: 260 }}
      >
        <div className="bg-white rounded-4 shadow-sm p-3">
          <p className="fw-bold small text-muted mb-3">CALQUES ACTIFS</p>

          {/* Pollution */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="fw-semibold">Pollution (NO₂)</div>
              <div className="small text-muted">Capteurs temps réel</div>
            </div>
            <Form.Check
              type="switch"
              checked={showPollution}
              onChange={() => setShowPollution(!showPollution)}
            />
          </div>

          {/* Végétation */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">Zones végétales</div>
              <div className="small text-muted">Arbres & espaces verts</div>
            </div>
            <Form.Check
              type="switch"
              checked={showVegetation}
              onChange={() => setShowVegetation(!showVegetation)}
            />
          </div>
        </div>
      </aside>

      {/* Version mobile - Bottom sheet */}
      {showMobileLayers && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-2 d-md-none"
            onClick={() => setShowMobileLayers(false)}
          />
          <div
            className="position-fixed bottom-0 start-0 w-100 bg-white rounded-top-4 shadow-lg z-3 d-md-none"
            style={{
              maxHeight: "60vh",
              transform: showMobileLayers ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.3s ease-out",
            }}
          >
            <div className="d-flex justify-content-center py-2">
              <div
                className="bg-secondary rounded-pill"
                style={{ width: 40, height: 4, cursor: "pointer" }}
                onClick={() => setShowMobileLayers(false)}
              />
            </div>

            <div className="px-3 pb-4">
              <p className="fw-bold small text-muted mb-3">CALQUES ACTIFS</p>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div className="fw-semibold">Pollution (NO₂)</div>
                  <div className="small text-muted">Capteurs temps réel</div>
                </div>
                <Form.Check
                  type="switch"
                  checked={showPollution}
                  onChange={() => setShowPollution(!showPollution)}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">Zones végétales</div>
                  <div className="small text-muted">Arbres & espaces verts</div>
                </div>
                <Form.Check
                  type="switch"
                  checked={showVegetation}
                  onChange={() => setShowVegetation(!showVegetation)}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= MODALE APPAREILS ================= */}
      <Modal
        show={showDevicesModal}
        onHide={() => {
          setShowDevicesModal(false);
          resetDevicesModal();
        }}
        centered
      >
        <Modal.Body className="p-3 p-md-4">
          <h4 className="fw-bold fs-5 fs-md-4">Appareils</h4>
          <p className="text-muted small mb-3">
          </p>

          {deviceError ? <Alert variant="danger">{deviceError}</Alert> : null}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fs-7 fs-md-6">Numéro de série</Form.Label>
              <Form.Control
                placeholder="SENS-001"
                className="fs-7 fs-md-6"
                value={deviceSerial}
                onChange={(e) => {
                  setDeviceSerial(e.target.value);
                  setDeviceError("");
                  setSelectedSensor(null);
                  setDeviceMode("none");
                }}
              />
            </Form.Group>

            <div className="d-flex flex-column gap-2">
              <Button
                variant="outline-primary"
                disabled={!deviceSerialNormalized || !canUseSerialActions}
                onClick={handleShowSensor}
              >
                Afficher les informations
              </Button>

              <Button
                variant="primary"
                disabled={!deviceSerialNormalized || !canUseSerialActions}
                onClick={() => {
                  const s = loadSensorFromSerial();
                  if (!s) return;
                  if (disabledSensorIds.includes(s.id)) {
                    setDeviceMode("none");
                    setDeviceError("Ce capteur est désactivé. Active-le pour pouvoir le modifier.");
                    return;
                  }
                  setDeviceMode("edit");
                }}
              >
                Modifier les informations
              </Button>

              <Button
                variant="danger"
                disabled={!deviceSerialNormalized || !findSensorById(deviceSerialNormalized)}
                onClick={requestDisableSensor}
              >
                Désactiver le capteur
              </Button>
            </div>

            {/* Affichage infos (lat/lng/aqi) */}
            {selectedSensor ? (
              <div className="mt-4 p-3 border rounded-3 bg-light">
                <div className="fw-semibold mb-2">
                  Capteur: {selectedSensor.id}{" "}
                  {disabledSensorIds.includes(selectedSensor.id) ? (
                    <span className="badge text-bg-secondary ms-2">désactivé</span>
                  ) : null}
                </div>

                {/* Affichage uniquement */}
                {deviceMode === "view" ? (
                  <div className="small">
                    <div><b>Latitude:</b> {selectedSensor.lat}</div>
                    <div><b>Longitude:</b> {selectedSensor.lng}</div>
                    <div><b>AQI:</b> {selectedSensor.aqi}</div>
                  </div>
                ) : null}

                {/* Edition uniquement */}
                {deviceMode === "edit" ? (
                  <>
                    <div className="small mb-2">
                      <div><b>Latitude:</b> {selectedSensor.lat}</div>
                      <div><b>Longitude:</b> {selectedSensor.lng}</div>
                      <div><b>AQI:</b> {selectedSensor.aqi}</div>
                    </div>

                    {disabledSensorIds.includes(selectedSensor.id) ? (
                      <div className="small text-muted">
                        Ce capteur est désactivé : active-le pour pouvoir le modifier.
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="fw-semibold small mb-2">Modifier</div>
                        <div className="row g-2">
                          <div className="col-4">
                            <Form.Control
                              value={editLat}
                              onChange={(e) => setEditLat(e.target.value)}
                              placeholder="Latitude"
                              className="fs-7 fs-md-6"
                            />
                          </div>
                          <div className="col-4">
                            <Form.Control
                              value={editLng}
                              onChange={(e) => setEditLng(e.target.value)}
                              placeholder="Longitude"
                              className="fs-7 fs-md-6"
                            />
                          </div>
                          <div className="col-4">
                            <Form.Control
                              value={editAqi}
                              onChange={(e) => setEditAqi(e.target.value)}
                              placeholder="AQI"
                              className="fs-7 fs-md-6"
                            />
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          <Button variant="success" onClick={handleSaveEdits}>
                            Enregistrer
                          </Button>
                          <Button
                            variant="outline-secondary"
                            onClick={() => loadSensorFromSerial()}
                          >
                            Réinitialiser
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}

                {deviceMode === "none" ? (
                  <div className="small text-muted">Choisis “Afficher” ou “Modifier” pour voir les détails.</div>
                ) : null}
              </div>
            ) : null}

            <hr className="my-4" />

            {/* Ajouter un capteur (comme avant) */}
            <h5 className="fw-bold fs-6">Ajouter un capteur</h5>
            <p className="text-muted small">
              Tous les champs sont obligatoires.
            </p>

            <Form.Group className="mb-3">
              <Form.Label className="fs-7 fs-md-6">Nom (unique)</Form.Label>
              <Form.Control
                placeholder="SENS-001"
                className="fs-7 fs-md-6"
                value={addNom}
                onChange={(e) => setAddNom(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fs-7 fs-md-6">Origin</Form.Label>
              <Form.Control
                placeholder="manual"
                className="fs-7 fs-md-6"
                value={addOrigin}
                onChange={(e) => setAddOrigin(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fs-7 fs-md-6">API Key</Form.Label>
              <Form.Control
                placeholder="my-api-key"
                className="fs-7 fs-md-6"
                value={addApiKey}
                onChange={(e) => setAddApiKey(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fs-7 fs-md-6">Type</Form.Label>
              <Form.Control
                placeholder="pollution"
                className="fs-7 fs-md-6"
                value={addType}
                onChange={(e) => setAddType(e.target.value)}
              />
            </Form.Group>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <Form.Label className="fs-7 fs-md-6">Latitude</Form.Label>
                <Form.Control
                  placeholder="43.7"
                  className="fs-7 fs-md-6"
                  type="number"
                  step="any"
                  value={addLat}
                  onChange={(e) => setAddLat(e.target.value)}
                />
              </div>
              <div className="col-6">
                <Form.Label className="fs-7 fs-md-6">Longitude</Form.Label>
                <Form.Control
                  placeholder="7.26"
                  className="fs-7 fs-md-6"
                  type="number"
                  step="any"
                  value={addLng}
                  onChange={(e) => setAddLng(e.target.value)}
                />
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Actif"
                checked={addActive}
                onChange={(e) => setAddActive(e.target.checked)}
              />
            </Form.Group>

            <div className="d-flex gap-2 flex-column flex-sm-row">
              <Button
                variant="outline-secondary"
                className="flex-fill fs-7 fs-md-6"
                onClick={() => {
                  setShowDevicesModal(false);
                  resetDevicesModal();
                }}
              >
                Fermer
              </Button>
              <Button
                variant="primary"
                className="flex-fill fs-7 fs-md-6"
                onClick={handleAddSensor}
              >
                Ajouter
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ================= CONFIRM DESACTIVATION ================= */}
      <Modal
        show={showDisableConfirm}
        onHide={() => setShowDisableConfirm(false)}
        centered
      >
        <Modal.Body className="p-4 text-center">
          <h4 className="fw-bold mb-3">Désactiver le capteur</h4>
          <p className="text-muted mb-4">
            Êtes-vous sûr de vouloir désactiver{" "}
            <b>{selectedSensor?.id}</b> ?
            <br />
            Il ne sera plus affiché sur la carte.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant="outline-secondary"
              onClick={() => setShowDisableConfirm(false)}
            >
              Annuler
            </Button>
            <Button variant="danger" onClick={confirmDisableSensor}>
              Oui, désactiver
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ================= LOGIN ================= */}
      {showLoginModal && (
        <LoginScreen
          onLogin={handleLogin}
          onCancel={() => setShowLoginModal(false)}
        />
      )}

      {/* ================= LOGOUT CONFIRM ================= */}
      <Modal
        show={showLogoutConfirm}
        onHide={() => setShowLogoutConfirm(false)}
        centered
      >
        <Modal.Body
          className="p-4 p-md-5 text-center d-flex flex-column justify-content-center"
          style={{ minHeight: "300px" }}
        >
          <div className="mb-3 text-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h4 className="fw-bold mb-3 fs-5 fs-md-4">Déconnexion</h4>
          <p className="text-muted mb-4 fs-7 fs-md-6">
            Êtes-vous sûr de vouloir vous déconnecter ?
          </p>

          <div className="d-flex gap-2 justify-content-center flex-column flex-sm-row">
            <Button
              variant="outline-secondary"
              className="px-4 fs-7 fs-md-6"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              className="px-4 fs-7 fs-md-6"
              onClick={() => {
                setIsLoggedIn(false);
                setShowLogoutConfirm(false);
              }}
            >
              Déconnexion
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ================= USER MANAGEMENT ================= */}
      {showUserManagement && (
        <UserManagementScreen onBack={() => setShowUserManagement(false)} />
      )}
    </div>
  );
}
