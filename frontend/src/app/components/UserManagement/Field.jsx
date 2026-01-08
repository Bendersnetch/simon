import React from "react";

export default function Field({ label, icon, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="form-label small fw-bold text-slate-600">{label}</label>
      <div className="position-relative">
        <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-slate-400">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="form-control bg-slate-50 border-slate-200 text-slate-800 py-3 ps-5 rounded-3 fw-medium"
          style={{ boxShadow: "none", fontSize: "1.05rem" }}
        />
      </div>
    </div>
  );
}
