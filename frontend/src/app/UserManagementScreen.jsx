import React, { useMemo, useState } from "react";
import UserRow from "./components/UserManagement/UserRow";
import UserModal from "./components/UserManagement/UserModal";
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaUsers } from "react-icons/fa";

export default function UserManagementScreen({
  initialUsers,
  onCreate,
  onUpdate,
  onDelete,
  onBack,
}) {
  const [users, setUsers] = useState(
    initialUsers ?? [
      { id: 1, nom: "Dupont", prenom: "Agent", email: "agent1@mairie.fr", role: "USER" },
      { id: 2, nom: "Martin", prenom: "Admin", email: "admin@simon.fr", role: "ADMIN" },
      { id: 3, nom: "Durand", prenom: "Tech", email: "tech@mairie.fr", role: "USER" },
    ]
  );

  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Admins can only manage users with role === 'USER'
    return users.filter((u) => {
      if (u.role !== "USER") return false;
      return (
        !q ||
        (u.nom && u.nom.toLowerCase().includes(q)) ||
        (u.prenom && u.prenom.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    });
  }, [users, query]);

  const featureChips = [
    // use similar icons but imported from react-icons

    { label: "Création", icon: <FaPlus /> },
    { label: "Mise à jour", icon: <FaEdit /> },
    { label: "Suppression", icon: <FaTrashAlt /> },
  ];

  function openCreate() {
    setSelectedUser(null);
    setModalMode("create");
    setModalOpen(true);
  }

  function openEdit(user) {
    setSelectedUser(user);
    setModalMode("edit");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedUser(null);
  }

  async function handleCreate(draft) {
    if (onCreate) await onCreate(draft);

    const newUser = {
      id: crypto?.randomUUID?.() ?? Date.now(),
      role: "USER",
      ...draft,
    };
    setUsers((prev) => [newUser, ...prev]);
    closeModal();
  }

  async function handleUpdate(id, draft) {
    if (onUpdate) await onUpdate(id, draft);

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...draft } : u))
    );
    closeModal();
  }

  async function handleDelete(id) {
    const user = users.find((u) => u.id === id);
    const ok = window.confirm(`Supprimer l'utilisateur "${user?.prenom ?? ""} ${user?.nom ?? ""}" ?`);
    if (!ok) return;

    if (onDelete) await onDelete(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div
      className="login-screen-container position-fixed top-0 start-0 w-100 h-100 bg-white"
      style={{ zIndex: 2000 }}
    >
      {/* ========================================= */}
      {/* MOBILE VERSION (< 992px)                  */}
      {/* ========================================= */}
      <div className="d-lg-none w-100 h-100 position-relative bg-slate-50 overflow-hidden font-sans d-flex flex-column">
        {/* FOND DÉCORATIF */}
        <div className="position-absolute w-100 h-100 start-0 top-0 overflow-hidden pe-none z-0">
          <div
            className="position-absolute rounded-circle mix-blend-multiply"
            style={{
              top: "-100px",
              left: "-100px",
              width: "400px",
              height: "400px",
              background: "rgba(239, 68, 68, 0.1)",
              filter: "blur(80px)",
            }}
          />
          <svg className="position-absolute w-100 h-100 opacity-50" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50 200 L450 300" stroke="#cbd5e1" strokeWidth="20" fill="none" />
            <path d="M100 -50 L150 900" stroke="#cbd5e1" strokeWidth="15" fill="none" />
          </svg>
        </div>

        {/* LOGO & TITRE */}
        <div
          className="position-relative z-1 d-flex flex-column align-items-center justify-content-center flex-grow-1"
          style={{ maxHeight: "45%" }}
        >
          <div
            className="bg-white bg-opacity-75 border border-slate-200 rounded-4 d-flex align-items-center justify-content-center mb-3 shadow-lg text-slate-700"
            style={{ width: "88px", height: "88px", backdropFilter: "blur(12px)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <h1 className="h2 fw-bold text-slate-800 m-0">SIMON</h1>
          <p className="text-slate-500 small fw-medium mt-1">
            Gestion des utilisateurs municipaux
          </p>
        </div>

        {/* BOTTOM SHEET */}
        <div
          className="position-relative z-2 w-100 bg-white bg-opacity-95 rounded-top-4 border-top border-slate-200 p-4 d-flex flex-column shadow-lg"
          style={{ backdropFilter: "blur(20px)", minHeight: "55%" }}
        >
          <div className="w-100 d-flex justify-content-center mb-3">
            <div className="bg-slate-200 rounded-pill" style={{ width: "48px", height: "6px" }} />
          </div>

          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h5 fw-bold m-0 text-slate-800">Utilisateurs</h2>
            <button
              onClick={openCreate}
              className="btn btn-danger rounded-3 fw-bold d-flex align-items-center gap-2 shadow-sm"
              style={{
                background: "linear-gradient(to right, #ef4444, #f43f5e)",
                border: "none",
                padding: "10px 12px",
              }}
            >
              <FaPlus />
              <span>Créer</span>
            </button>
          </div>

          {/* Filtres */}
          <div className="d-flex flex-column gap-2 mb-3">
            <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-slate-400">
                  <FaSearch />
                </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Rechercher (identifiant ou email)"
                className="form-control bg-slate-50 border-slate-200 text-slate-800 py-3 ps-5 rounded-3 fw-medium"
                style={{ boxShadow: "none" }}
              />
            </div>

            {/* role/status removed */}
          </div>

          {/* Liste */}
          <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: "calc(55vh - 190px)" }}>
            {filteredUsers.length === 0 ? (
              <div className="border border-slate-200 rounded-3 bg-slate-50 p-4 text-center">
                  <div className="d-flex justify-content-center mb-2 text-slate-400">
                    <FaUsers />
                  </div>
                <p className="m-0 fw-bold text-slate-800">Aucun utilisateur trouvé</p>
                <p className="m-0 text-slate-500 small">Modifie les filtres ou crée un nouvel utilisateur.</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  onEdit={() => openEdit(u)}
                  onDelete={() => handleDelete(u.id)}
                />
              ))
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-link text-slate-400 text-decoration-none p-0 small fw-medium"
              onClick={onBack}
            >
              Retour
            </button>
            <span className="text-slate-400 small fw-medium">{filteredUsers.length} utilisateur(s)</span>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* DESKTOP VERSION (>= 992px)                */}
      {/* ========================================= */}
      <div className="d-none d-lg-flex w-100 h-100 font-sans">
        {/* PARTIE GAUCHE */}
        <div
          className="flex-grow-1 position-relative overflow-hidden d-flex align-items-center justify-content-center"
          style={{ background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)" }}
        >
          <div className="position-absolute w-100 h-100 start-0 top-0 pe-none z-0 overflow-hidden">
            <div
              className="position-absolute rounded-circle mix-blend-multiply"
              style={{
                top: "-200px",
                left: "-200px",
                width: "800px",
                height: "800px",
                background: "rgba(239, 68, 68, 0.1)",
                filter: "blur(120px)",
              }}
            />
            <div
              className="position-absolute rounded-circle mix-blend-multiply"
              style={{
                bottom: "-100px",
                right: "-100px",
                width: "600px",
                height: "600px",
                background: "rgba(16, 185, 129, 0.1)",
                filter: "blur(100px)",
              }}
            />
            <svg className="position-absolute w-100 h-100 opacity-40" xmlns="http://www.w3.org/2000/svg">
              <path d="M-100 300 L1000 500" stroke="#cbd5e1" strokeWidth="40" fill="none" />
              <path d="M200 -100 L300 1200" stroke="#cbd5e1" strokeWidth="30" fill="none" />
              <path d="M0 800 L960 700" stroke="#cbd5e1" strokeWidth="25" fill="none" />
            </svg>
          </div>

          <div className="position-relative z-1 d-flex flex-column align-items-center">
            <div
              className="bg-white bg-opacity-75 border border-slate-200 rounded-5 d-flex align-items-center justify-content-center mb-5 shadow-lg text-slate-700"
              style={{ width: "160px", height: "160px", backdropFilter: "blur(12px)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>

            <h1 className="display-4 fw-bold text-slate-800 mb-2">SIMON</h1>
            <p className="h4 text-slate-500 fw-medium">Gestion des utilisateurs municipaux</p>
          </div>
        </div>

        {/* PARTIE DROITE */}
        <div className="bg-white d-flex flex-column px-5 shadow-lg position-relative overflow-auto" style={{ width: "680px", zIndex: 10 }}>
          <div className="w-100 mx-auto py-5" style={{ maxWidth: "520px" }}>
            <div className="d-flex align-items-start justify-content-between mb-2">
              <div>
                <h2 className="display-6 fw-bold mb-2 text-slate-800">Utilisateurs</h2>
                <p className="text-slate-500 mb-0">Créez, modifiez et supprimez les comptes d’accès à SIMON.</p>
              </div>

              <button
                onClick={openCreate}
                className="btn btn-danger py-3 rounded-3 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "linear-gradient(to right, #ef4444, #f43f5e)",
                  border: "none",
                  fontSize: "1.05rem",
                  paddingLeft: "14px",
                  paddingRight: "14px",
                }}
              >
                <FaPlus />
                <span>Créer</span>
              </button>
            </div>

            {/* Filters */}
            <div className="d-flex flex-column gap-3 mt-4 mb-4">
              <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-slate-400">
                  <FaSearch />
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Rechercher par identifiant ou email"
                  className="form-control bg-slate-50 border-slate-200 text-slate-800 py-3 ps-5 rounded-3 fw-medium"
                  style={{ fontSize: "1.1rem" }}
                />
              </div>

              {/* role/status removed */}
            </div>

            {/* List */}
            <div className="d-flex flex-column gap-2">
              {filteredUsers.length === 0 ? (
                <div className="border border-slate-200 rounded-3 bg-slate-50 p-4 text-center">
                  <div className="d-flex justify-content-center mb-2 text-slate-400">
                    <FaUsers />
                  </div>
                  <p className="m-0 fw-bold text-slate-800">Aucun utilisateur trouvé</p>
                  <p className="m-0 text-slate-500 small">Modifie les filtres ou crée un nouvel utilisateur.</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onEdit={() => openEdit(u)}
                    onDelete={() => handleDelete(u.id)}
                  />
                ))
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <button className="btn btn-light border py-3 rounded-3 fw-bold text-slate-600" onClick={onBack}>
                Retour
              </button>
              <span className="text-slate-400 small fw-medium">{filteredUsers.length} utilisateur(s)</span>
            </div>

            <p className="text-center text-slate-400 small mt-5">© 2025 SIMON - Maintenance & Capteurs</p>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <UserModal
          mode={modalMode}
          user={selectedUser}
          onClose={closeModal}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

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
