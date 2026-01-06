"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button, Modal, Form } from "react-bootstrap";
import LoginScreen from "./LoginScreen";
import UserManagementScreen from "./UserManagementScreen";
import { FaUsers } from "react-icons/fa";


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

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [showPollution, setShowPollution] = useState(true);
  const [showVegetation, setShowVegetation] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState([43.7102, 7.2620]); // Nice par défaut

  const [isMobile, setIsMobile] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showMobileLayers, setShowMobileLayers] = useState(false);
  const searchTimerRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };







  return (
    <div className="position-relative w-100 min-vh-100 overflow-hidden bg-light text-dark">
      {/* ================= CARTE PLEIN ÉCRAN ================= */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 z-0"
        style={{
          top: isMobile ? '60px' : '0',
          height: isMobile ? 'calc(100vh - 60px)' : '100vh'
        }}
      >
        <Map
          showPollution={showPollution}
          showVegetation={showVegetation}
          center={mapCenter}
        />
      </div>

      {isSearching && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 z-2">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-2">Recherche en cours...</p>
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
            className="bg-white rounded-4 shadow-sm px-3 py-2 d-flex align-items-center gap-2"
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
                console.log('📝 Saisie:', value);
                setSearchQuery(value);

                // Nettoyer l'état précédent immédiatement
                setSuggestions([]);
                setShowSuggestions(false);
                setIsLoadingSuggestions(false);

                // Annuler le timer précédent pour éviter les requêtes multiples
                if (searchTimerRef.current) {
                  clearTimeout(searchTimerRef.current);
                  searchTimerRef.current = null; // Reset pour être sûr
                  console.log('⏹️ Timer annulé, nouvelle saisie détectée');
                }

                // Si plus de 3 caractères, lancer un timer de 2 secondes
                if (value.length > 3) {
                  searchTimerRef.current = setTimeout(async () => {
                    console.log('🔍 Lancement de la recherche pour:', value);
                    setShowSuggestions(true); // Afficher le dropdown immédiatement
                    setIsLoadingSuggestions(true);
                    try {
                      const res = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                          value
                        )}&limit=5`
                      );
                      const data = await res.json();
                      console.log('✅ Recherche terminée, résultats:', data.length);
                      setSuggestions(data);
                      // showSuggestions est déjà true
                    } catch (error) {
                      console.error('❌ Erreur recherche:', error);
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
                // Annuler le timer si on perd le focus
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

                  // Fermer immédiatement le dropdown
                  setShowSuggestions(false);
                  setSuggestions([]);
                  setIsLoadingSuggestions(false);

                  // Annuler le timer de recherche automatique
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
                  // Annuler le timer aussi en cas d'échappement
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

        {/* Barre de recherche mobile - visible seulement sur mobile */}
        <div className="flex-grow-1 d-md-none">
          <div className="bg-white rounded-3 shadow-sm px-2 py-1 d-flex align-items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
              className="form-control border-0 p-0 shadow-none fs-7"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                setSuggestions([]);
                setShowSuggestions(false);
                setIsLoadingSuggestions(false);

                if (searchTimerRef.current) {
                  clearTimeout(searchTimerRef.current);
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
                      console.error('❌ Erreur recherche:', error);
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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <Button
              variant="primary"
              className="rounded-4 px-3 py-1 px-md-4 py-md-2 shadow-sm fs-7 fs-md-6"
              onClick={() => setShowAddModal(true)}
            >
              <span className="d-none d-sm-inline">+ Nouveau module</span>
              <span className="d-sm-none">+</span>
            </Button>

            <Button
              variant="light"
              className="rounded-circle shadow-sm"
              style={{ width: 36, height: 36 }}
              onClick={() => setShowLogoutConfirm(true)}
              title="Déconnexion"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </Button>
          </div>
        )}
      </header>

      {/* ================= PANNEAU CALQUES ================= */}
      {/* Version desktop */}
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
          {/* Overlay pour fermer */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-2 d-md-none"
            onClick={() => setShowMobileLayers(false)}
          />
          {/* Bottom sheet */}
          <div
            className="position-fixed bottom-0 start-0 w-100 bg-white rounded-top-4 shadow-lg z-3 d-md-none"
            style={{
              maxHeight: '60vh',
              transform: showMobileLayers ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.3s ease-out'
            }}
          >
            {/* Poignée pour fermer */}
            <div className="d-flex justify-content-center py-2">
              <div
                className="bg-secondary rounded-pill"
                style={{ width: 40, height: 4, cursor: 'pointer' }}
                onClick={() => setShowMobileLayers(false)}
              />
            </div>

            <div className="px-3 pb-4">
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
          </div>
        </>
      )}

      {/* ================= MODALE AJOUT MODULE ================= */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Body className="p-3 p-md-4">
          <h4 className="fw-bold fs-5 fs-md-4">Nouveau module</h4>
          <p className="text-muted small mb-4">
            Ajoutez un module sur la carte de surveillance.
          </p>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fs-7 fs-md-6">ID capteur</Form.Label>
              <Form.Control placeholder="SENS-202X" className="fs-7 fs-md-6" />
            </Form.Group>

            <div className="row g-2 mb-4">
              <div className="col-6">
                <Form.Control placeholder="Latitude" className="fs-7 fs-md-6" />
              </div>
              <div className="col-6">
                <Form.Control placeholder="Longitude" className="fs-7 fs-md-6" />
              </div>
            </div>

            <div className="d-flex gap-2 flex-column flex-sm-row">
              <Button
                variant="outline-secondary"
                className="flex-fill fs-7 fs-md-6"
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </Button>
              <Button variant="primary" className="flex-fill fs-7 fs-md-6">
                Ajouter
              </Button>
            </div>
          </Form>
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
      <Modal show={showLogoutConfirm} onHide={() => setShowLogoutConfirm(false)} centered>
        <Modal.Body className="p-4 p-md-5 text-center d-flex flex-column justify-content-center" style={{ minHeight: '300px' }}>
          <div className="mb-3 text-warning">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <UserManagementScreen
          onBack={() => setShowUserManagement(false)}
        />
      )}

    </div>
  );
}
