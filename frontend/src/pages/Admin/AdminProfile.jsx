import React, { useState } from "react";
import {
  FaUserShield,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function AdminProfile() {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    }
    if (success) setSuccess("");
  };

  const toggleShow = (field) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const validate = () => {
    const next = {};
    if (!form.currentPassword) next.currentPassword = "Le mot de passe actuel est requis";
    if (!form.newPassword) next.newPassword = "Le nouveau mot de passe est requis";
    else if (form.newPassword.length < 6) next.newPassword = "Au moins 6 caractères";
    else if (form.newPassword === form.currentPassword)
      next.newPassword = "Le nouveau mot de passe doit être différent de l'ancien";
    if (!form.confirmPassword) next.confirmPassword = "Veuillez confirmer le mot de passe";
    else if (form.confirmPassword !== form.newPassword)
      next.confirmPassword = "Les mots de passe ne correspondent pas";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const data = await updateProfile({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      if (data.success) {
        setSuccess("Mot de passe mis à jour avec succès.");
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setErrors({ general: data.error || "Erreur lors de la mise à jour." });
      }
    } catch (err) {
      const msg = err?.response?.data?.error || "Erreur lors de la mise à jour.";
      if (/actuel/i.test(msg)) {
        setErrors({ currentPassword: msg });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "form-control rounded-3 border-0 bg-light ps-5 py-3";

  const renderPasswordField = (name, label, placeholder) => (
    <div className="mb-4">
      <label className="form-label small fw-medium text-secondary mb-2">{label}</label>
      <div className="position-relative">
        <FaLock
          className="position-absolute"
          style={{ left: "16px", top: "14px", color: "#94a3b8", fontSize: "18px" }}
        />
        <input
          type={show[name] ? "text" : "password"}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${inputBase} ${errors[name] ? "is-invalid" : ""}`}
          style={{ backgroundColor: "#f8fafc" }}
          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          onClick={() => toggleShow(name)}
          className="btn position-absolute end-0 top-0 h-100 d-flex align-items-center"
          style={{ border: "none", background: "transparent", paddingRight: "16px" }}
          tabIndex={-1}
        >
          {show[name] ? <FaEyeSlash color="#94a3b8" /> : <FaEye color="#94a3b8" />}
        </button>
      </div>
      {errors[name] && (
        <small className="text-danger mt-2 d-block">{errors[name]}</small>
      )}
    </div>
  );

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7 col-xl-6">
        <div className="card border-0 shadow-sm rounded-4">
          <div
            className="card-header border-0 rounded-top-4 p-4"
            style={{ background: "linear-gradient(145deg, #1e3c72, #2a5298)" }}
          >
            <div className="d-flex align-items-center text-white">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 me-3"
                style={{
                  width: "48px",
                  height: "48px",
                  background: "rgba(255,255,255,0.15)"
                }}
              >
                <FaUserShield size={22} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">Mon profil</h4>
                <small style={{ color: "rgba(255,255,255,0.8)" }}>
                  {user?.email || "Compte administrateur"}
                </small>
              </div>
            </div>
          </div>

          <div className="card-body p-4 p-md-5">
            <h5 className="mb-1 fw-semibold text-dark">Changer le mot de passe</h5>
            <p className="text-muted small mb-4">
              Saisissez votre mot de passe actuel pour pouvoir en définir un nouveau.
            </p>

            {success && (
              <div className="alert alert-success border-0 rounded-3 d-flex align-items-center mb-4">
                <FaCheckCircle className="me-2" />
                <span>{success}</span>
              </div>
            )}

            {errors.general && (
              <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center mb-4">
                <FaExclamationTriangle className="me-2" />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {renderPasswordField("currentPassword", "Mot de passe actuel", "••••••••")}
              {renderPasswordField("newPassword", "Nouveau mot de passe", "Au moins 6 caractères")}
              {renderPasswordField("confirmPassword", "Confirmer le nouveau mot de passe", "••••••••")}

              <button
                type="submit"
                disabled={loading}
                className="btn w-100 py-3 rounded-3 fw-medium text-white"
                style={{
                  background: "linear-gradient(145deg, #4361ee, #3a0ca3)",
                  border: "none"
                }}
              >
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
