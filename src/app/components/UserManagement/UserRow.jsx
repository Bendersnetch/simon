import React from "react";
import { FaUser, FaEdit, FaTrash } from "react-icons/fa";

export default function UserRow({ user, onEdit, onDelete }) {
  return (
    <div className="border border-slate-200 rounded-3 bg-white bg-opacity-75 p-3 shadow-sm d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
          <div
          className="rounded-3 d-flex align-items-center justify-content-center"
          style={{
            width: "44px",
            height: "44px",
            background: "rgba(239, 68, 68, 0.08)",
          }}
        >
          <FaUser />
        </div>

        <div className="d-flex flex-column">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-bold text-slate-800">{user.prenom} {user.nom}</span>
          </div>

          <span className="text-slate-500 small fw-medium">{user.email}</span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
          <button
          onClick={onEdit}
          className="btn btn-light border rounded-3 fw-bold text-slate-600 d-flex align-items-center gap-2"
          style={{ padding: "10px 12px" }}
          title="Modifier"
        >
          <FaEdit />
          <span className="d-none d-sm-inline">Modifier</span>
        </button>

        <button
          onClick={onDelete}
          className="btn btn-light border rounded-3 fw-bold text-slate-600 d-flex align-items-center gap-2"
          style={{ padding: "10px 12px" }}
          title="Supprimer"
        >
          <FaTrash />
          <span className="d-none d-sm-inline">Supprimer</span>
        </button>
      </div>
    </div>
  );
}
