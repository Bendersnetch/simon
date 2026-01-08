import React, { useState } from "react";
import Field from "./Field";
import { FaLock, FaUser, FaEnvelope, FaArrowRight } from "react-icons/fa";

export default function UserModal({ mode, user, onClose, onCreate, onUpdate }) {
  const isEdit = mode === "edit";

  const [nom, setNom] = useState(user?.nom ?? "");
  const [prenom, setPrenom] = useState(user?.prenom ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function submit() {
    if (!nom.trim()) return alert("Nom requis.");
    if (!prenom.trim()) return alert("Prénom requis.");
    if (!email.trim()) return alert("Email requis.");

    if (!isEdit) {
      if (!password) return alert("Mot de passe requis.");
      if (password !== confirm) return alert("Les mots de passe ne correspondent pas.");
    } else {
      if (password || confirm) {
        if (password !== confirm) return alert("Les mots de passe ne correspondent pas.");
      }
    }

    const draft = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim(),
      ...(password ? { password } : {}),
    };

    if (isEdit) onUpdate(user.id, draft);
    else onCreate(draft);
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 3000 }}>
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ background: "rgba(15, 23, 42, 0.45)" }}
        onClick={onClose}
      />

      <div className="position-relative bg-white border border-slate-200 rounded-4 shadow-lg p-4" style={{ width: "min(560px, 92vw)" }}>
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div>
            <h3 className="h5 fw-bold text-slate-800 mb-1">
              {isEdit ? "Modifier l'utilisateur" : "Créer un utilisateur"}
            </h3>
            <p className="text-slate-500 small mb-0">
              {isEdit ? "Mise à jour des infos (mot de passe optionnel)." : "Renseignez les infos pour créer un compte."}
            </p>
          </div>
        </div>

          <div className="d-flex flex-column gap-3">
            <Field label="Nom" icon={<FaUser />} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Dupont" />
            <Field label="Prénom" icon={<FaUser />} value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="ex: Jean" />
            <Field label="Email" icon={<FaEnvelope />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: agent@mairie.fr" type="email" />

          <Field
            label={isEdit ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
            icon={<FaLock />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? "Laisser vide pour ne pas changer" : "••••••••"}
            type="password"
          />

          <Field
            label={isEdit ? "Confirmer (si modifié)" : "Confirmer le mot de passe"}
            icon={<FaLock />}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            type="password"
          />
        </div>

        <div className="d-flex gap-3 mt-4">
          <button onClick={onClose} className="btn btn-light border w-50 py-3 rounded-3 fw-bold text-slate-600">
            Annuler
          </button>

          <button
            onClick={submit}
            className="btn btn-danger w-100 py-3 rounded-3 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
            style={{ background: "linear-gradient(to right, #ef4444, #f43f5e)", border: "none" }}
          >
            <span>{isEdit ? "Enregistrer" : "Créer"}</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
