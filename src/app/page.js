"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button, Modal, Form } from "react-bootstrap";
import LoginScreen from "./LoginScreen";

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

  const [showPollution, setShowPollution] = useState(true);
  const [showVegetation, setShowVegetation] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState([43.6045, 1.4442]); // Toulouse par défaut

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  return (
    <div className="position-relative w-100 min-vh-100 overflow-hidden bg-light text-dark">
      {/* ================= CARTE PLEIN ÉCRAN ================= */}
      <div className="position-absolute top-0 start-0 w-100 h-100 z-0">
        <Map
          showPollution={showPollution}
          showVegetation={showVegetation}
          center={mapCenter}
        />
      </div>

      {/* ================= HEADER ================= */}
      <header className="position-absolute top-0 start-0 end-0 z-3 px-4 py-3 d-flex align-items-center justify-content-between gap-4">
        {/* Logo */}
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <div
            className="bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: 40, height: 40 }}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0c-.69 0-1.37.176-2 .5C5.37.176 4.69 0 4 0 1.79 0 0 1.79 0 4v4c0 3.866 3.582 7.25 8 8 4.418-.75 8-4.134 8-8V4c0-2.21-1.79-4-4-4-.69 0-1.37.176-2 .5C9.37.176 8.69 0 8 0z" />
            </svg>
          </div>
          <span className="fw-bold fs-5">SIMON</span>
        </div>

        {/* Barre de recherche */}
        <div className="flex-grow-1 d-flex justify-content-center">
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
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!searchQuery) return;

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
                }
              }}
            />
          </div>
        </div>

        {/* Actions */}
        {!isLoggedIn ? (
          <Button
            variant="primary"
            className="rounded-4 px-4 py-2 shadow-sm flex-shrink-0"
            onClick={() => setShowLoginModal(true)}
          >
            Connexion Admin
          </Button>
        ) : (
          <div className="d-flex align-items-center gap-3 flex-shrink-0">
            <Button
              variant="primary"
              className="rounded-4 px-4 py-2 shadow-sm"
              onClick={() => setShowAddModal(true)}
            >
              + Nouveau module
            </Button>
            <Button
              variant="light"
              className="rounded-circle shadow-sm"
              style={{ width: 48, height: 48 }}
              onClick={() => setIsLoggedIn(false)}
              title="Déconnexion"
            >
              ⎋
            </Button>
          </div>
        )}
      </header>

      {/* ================= PANNEAU CALQUES ================= */}
      <aside
        className="position-absolute z-3"
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

      {/* ================= MODALE AJOUT MODULE ================= */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Body className="p-4">
          <h4 className="fw-bold">Nouveau module</h4>
          <p className="text-muted small mb-4">
            Ajoutez un module sur la carte de surveillance.
          </p>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>ID capteur</Form.Label>
              <Form.Control placeholder="SENS-202X" />
            </Form.Group>

            <div className="row g-2 mb-4">
              <div className="col">
                <Form.Control placeholder="Latitude" />
              </div>
              <div className="col">
                <Form.Control placeholder="Longitude" />
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                className="flex-fill"
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </Button>
              <Button variant="primary" className="flex-fill">
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
    </div>
  );
}
