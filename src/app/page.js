"use client";

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import LoginScreen from './LoginScreen';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet map to avoid server-side issues
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">Chargement de la carte...</div>
});

export default function SIMONInterface() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Map Layer States
  const [showPollution, setShowPollution] = useState(true);
  const [showVegetation, setShowVegetation] = useState(true);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative' }} className="bg-light overflow-hidden text-dark font-sans">

      {/* ========================================= */}
      {/* FOND DE CARTE - Plein écran              */}
      {/* ========================================= */}
      {/* ========================================= */}
      {/* LEAFLET MAP - Full Screen                 */}
      {/* ========================================= */}
      <div className="position-absolute w-100 h-100 start-0 top-0 z-0">
        <Map />
      </div>







      {/* ========================================= */}
      {/* HEADER                                    */}
      {/* ========================================= */}
      <div className="position-absolute top-0 start-0 end-0 p-4 d-flex align-items-center gap-4 z-2">

        {/* Logo Text Only */}
        <div className="d-flex align-items-center gap-3">
          <span className="h4 fw-bold mb-0 text-dark">SIMON</span>
          {isLoggedIn && (
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">ADMIN</span>
          )}
        </div>

        <div className="flex-grow-1"></div>

        {/* Login / Actions */}
        {!isLoggedIn ? (
          <Button
            variant="primary"
            className="d-flex align-items-center gap-2 rounded-4 px-4 py-2 shadow-sm"
            style={{ height: '56px' }}
            onClick={() => setShowLoginModal(true)}
          >
            <span>Connexion Admin</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
          </Button>
        ) : (
          <>
            <Button
              variant="primary"
              className="d-flex align-items-center gap-2 rounded-4 px-4 py-2 shadow-sm"
              style={{ height: '56px' }}
              onClick={() => setShowAddModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Nouveau module</span>
            </Button>
            <div
              className="rounded-circle bg-white bg-opacity-75 d-flex align-items-center justify-content-center text-danger border border-secondary-subtle shadow-sm cursor-pointer"
              style={{ width: '56px', height: '56px', backdropFilter: 'blur(10px)', cursor: 'pointer' }}
              onClick={handleLogout}
              title="Déconnexion"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
          </>
        )}

      </div>





      {/* ========================================= */}
      {/* ADD MODULE MODAL                          */}
      {/* ========================================= */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Body className="p-4">
          <h4 className="fw-bold mb-2">Nouveau module</h4>
          <p className="text-muted mb-4 small">Ajoutez un module sur la carte de surveillance.</p>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-secondary">ID Capteur</Form.Label>
              <Form.Control type="text" placeholder="ex: SENS-202X" className="rounded-3" />
            </Form.Group>
            <div className="row g-3 mb-4">
              <div className="col">
                <Form.Label className="small fw-bold text-secondary">Latitude</Form.Label>
                <Form.Control type="text" defaultValue="43.6045" className="rounded-3" />
              </div>
              <div className="col">
                <Form.Label className="small fw-bold text-secondary">Longitude</Form.Label>
                <Form.Control type="text" defaultValue="1.4442" className="rounded-3" />
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button variant="outline-secondary" className="flex-grow-1 py-2 rounded-3" onClick={() => setShowAddModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" className="flex-grow-1 py-2 rounded-3" onClick={() => setShowAddModal(false)}>
                Ajouter
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>




      {/* ========================================= */}
      {/* LOGIN SCREEN OVERLAY                       */}
      {/* ========================================= */}
      {showLoginModal && (
        <LoginScreen
          onLogin={handleLogin}
          onCancel={() => setShowLoginModal(false)}
        />
      )}

      <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  );
}
