import React from 'react';

export default function LoginScreen({ onLogin, onCancel }) {
    return (
        <div className="login-screen-container position-fixed top-0 start-0 w-100 h-100 bg-white" style={{ zIndex: 2000 }}>

            {/* ========================================= */}
            {/* MOBILE VERSION (< 992px)                  */}
            {/* ========================================= */}
            <div className="d-lg-none w-100 h-100 position-relative bg-slate-50 overflow-hidden font-sans d-flex flex-column">

                {/* FOND DÉCORATIF */}
                <div className="position-absolute w-100 h-100 start-0 top-0 overflow-hidden pe-none z-0">
                    <div className="position-absolute rounded-circle mix-blend-multiply" style={{ top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'rgba(239, 68, 68, 0.1)', filter: 'blur(80px)' }}></div>
                    <svg className="position-absolute w-100 h-100 opacity-50" xmlns="http://www.w3.org/2000/svg">
                        <path d="M-50 200 L450 300" stroke="#cbd5e1" strokeWidth="20" fill="none" />
                        <path d="M100 -50 L150 900" stroke="#cbd5e1" strokeWidth="15" fill="none" />
                    </svg>
                </div>

                {/* LOGO & TITRE */}
                <div className="position-relative z-1 d-flex flex-column align-items-center justify-content-center flex-grow-1" style={{ maxHeight: '60%' }}>
                    <div className="bg-white bg-opacity-75 border border-slate-200 rounded-4 d-flex align-items-center justify-content-center mb-4 shadow-lg text-slate-700" style={{ width: '96px', height: '96px', backdropFilter: 'blur(12px)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <path d="M12 8v4"></path>
                            <path d="M12 16h.01"></path>
                        </svg>
                    </div>
                    <h1 className="h2 fw-bold text-slate-800 m-0">SIMON</h1>
                    <p className="text-slate-500 small fw-medium mt-1">Maintenance & Capteurs</p>
                </div>

                {/* FORMULAIRE BOTTOM SHEET */}
                <div className="position-relative z-2 w-100 bg-white bg-opacity-95 rounded-top-4 border-top border-slate-200 p-4 d-flex flex-column shadow-lg" style={{ backdropFilter: 'blur(20px)' }}>
                    <div className="w-100 d-flex justify-content-center mb-4">
                        <div className="bg-slate-200 rounded-pill" style={{ width: '48px', height: '6px' }}></div>
                    </div>

                    <h2 className="h5 fw-bold mb-4 text-slate-800">
                        Connexion Requise
                    </h2>

                    <div className="d-flex flex-column gap-3 mb-4">
                        <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <input type="text" placeholder="Identifiant" defaultValue="Admin_01" className="form-control bg-slate-50 border-slate-200 text-slate-800 py-3 ps-5 rounded-3 fw-medium" style={{ boxShadow: 'none' }} />
                        </div>

                        <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </div>
                            <input type="password" placeholder="Mot de passe" defaultValue="•••••••••" className="form-control bg-slate-50 border-slate-200 text-slate-800 py-3 ps-5 rounded-3 fw-medium" style={{ boxShadow: 'none' }} />
                        </div>
                    </div>



                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <button className="btn btn-link text-slate-400 text-decoration-none p-0 small fw-medium" onClick={onCancel}>Annuler</button>
                        {/* <button className="btn btn-link text-slate-400 text-decoration-none p-0 small fw-medium">Mot de passe oublié ?</button> */}
                    </div>

                    <button onClick={onLogin} className="btn btn-danger w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm" style={{ background: 'linear-gradient(to right, #ef4444, #f43f5e)', border: 'none' }}>
                        <span>Connexion</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>


            {/* ========================================= */}
            {/* DESKTOP VERSION (>= 992px)                */}
            {/* ========================================= */}
            <div className="d-none d-lg-flex w-100 h-100 font-sans">

                {/* PARTIE GAUCHE */}
                <div className="flex-grow-1 position-relative overflow-hidden d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                    {/* Fond décoratif */}
                    <div className="position-absolute w-100 h-100 start-0 top-0 pe-none z-0 overflow-hidden">
                        <div className="position-absolute rounded-circle mix-blend-multiply" style={{ top: '-200px', left: '-200px', width: '800px', height: '800px', background: 'rgba(239, 68, 68, 0.1)', filter: 'blur(120px)' }}></div>
                        <div className="position-absolute rounded-circle mix-blend-multiply" style={{ bottom: '-100px', right: '-100px', width: '600px', height: '600px', background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(100px)' }}></div>
                        <svg className="position-absolute w-100 h-100 opacity-40" xmlns="http://www.w3.org/2000/svg">
                            <path d="M-100 300 L1000 500" stroke="#cbd5e1" strokeWidth="40" fill="none" />
                            <path d="M200 -100 L300 1200" stroke="#cbd5e1" strokeWidth="30" fill="none" />
                            <path d="M0 800 L960 700" stroke="#cbd5e1" strokeWidth="25" fill="none" />
                        </svg>
                    </div>

                    <div className="position-relative z-1 d-flex flex-column align-items-center">
                        <div className="bg-white bg-opacity-75 border border-slate-200 rounded-5 d-flex align-items-center justify-content-center mb-5 shadow-lg text-slate-700" style={{ width: '160px', height: '160px', backdropFilter: 'blur(12px)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                <path d="M12 8v4"></path>
                                <path d="M12 16h.01"></path>
                            </svg>
                        </div>
                        <h1 className="display-4 fw-bold text-slate-800 mb-2">SIMON</h1>
                        <p className="h4 text-slate-500 fw-medium">Système Intelligent de Mesure et d’Optimisation de la Nature</p>

                        {/* Features */}

                    </div>
                </div>

                {/* PARTIE DROITE */}
                <div className="bg-white d-flex flex-column justify-content-center px-5 shadow-lg position-relative" style={{ width: '600px', zIndex: 10 }}>
                    <div className="w-100 mx-auto" style={{ maxWidth: '400px' }}>
                        <h2 className="display-6 fw-bold mb-3 text-slate-800">Connexion Admin</h2>
                        <p className="text-slate-500 mb-5">Accédez à l'interface de gestion des capteurs</p>

                        <div className="d-flex flex-column gap-4 mb-5">
                            <div>
                                <label className="form-label small fw-bold text-slate-600">Identifiant</label>
                                <div className="position-relative">
                                    <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <input type="text" placeholder="Entrez votre identifiant" defaultValue="Admin_01" className="form-control bg-slate-50 border-slate-200 text-slate-800 py-3 ps-5 rounded-3 fw-medium" style={{ fontSize: '1.1rem' }} />
                                </div>
                            </div>
                            <div>
                                <label className="form-label small fw-bold text-slate-600">Mot de passe</label>
                                <div className="position-relative">
                                    <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </div>
                                    <input type="password" placeholder="Entrez votre mot de passe" defaultValue="•••••••••" className="form-control bg-slate-50 border-slate-200 text-slate-800 py-3 ps-5 rounded-3 fw-medium" style={{ fontSize: '1.1rem' }} />
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <label className="d-flex align-items-center gap-2 cursor-pointer small text-slate-600">
                                <input type="checkbox" className="form-check-input mt-0 border-slate-300" style={{ boxShadow: 'none' }} />
                                <span>Se souvenir de moi</span>
                            </label>
                            {/* <button className="btn btn-link text-danger text-decoration-none p-0 small fw-bold">Mot de passe oublié ?</button> */}
                        </div>



                        <div className="d-flex gap-3 mb-5">
                            <button onClick={onCancel} className="btn btn-light border w-50 py-3 rounded-3 fw-bold text-slate-600">Annuler</button>
                            <button onClick={onLogin} className="btn btn-danger w-100 py-3 rounded-3 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-3" style={{ background: 'linear-gradient(to right, #ef4444, #f43f5e)', border: 'none', fontSize: '1.1rem' }}>
                                <span>Se connecter</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </div>

                        <p className="text-center text-slate-400 small mt-auto">
                            © 2025 SIMON - Maintenance & Capteurs
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .text-slate-800 { color: #1e293b; }
                .text-slate-700 { color: #334155; }
                .text-slate-600 { color: #475569; }
                .text-slate-500 { color: #64748b; }
                .text-slate-400 { color: #94a3b8; }
                .bg-slate-50 { background-color: #f8fafc; }
                .bg-slate-200 { background-color: #e2e8f0; }
                .border-slate-200 { border-color: #e2e8f0 !important; }
                .border-slate-300 { border-color: #cbd5e1 !important; }
                
                .mix-blend-multiply { mix-blend-mode: multiply; }
            `}</style>
        </div>
    );
}
