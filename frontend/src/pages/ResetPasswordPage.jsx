import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaStore,
  FaArrowLeft
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { resetPasswordAPI } from "../services/authService";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ newPassword: false, confirmPassword: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name] || errors.general) {
      setErrors({ ...errors, [e.target.name]: null, general: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.newPassword) next.newPassword = "Le nouveau mot de passe est requis";
    else if (form.newPassword.length < 6) next.newPassword = "Au moins 6 caractères";
    if (!form.confirmPassword) next.confirmPassword = "Veuillez confirmer le mot de passe";
    else if (form.confirmPassword !== form.newPassword)
      next.confirmPassword = "Les mots de passe ne correspondent pas";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const data = await resetPasswordAPI(token, form.newPassword);
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setErrors({ general: data.error || "Erreur lors de la réinitialisation." });
      }
    } catch (err) {
      setErrors({
        general: err?.response?.data?.error || "Lien invalide ou expiré."
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (name, label, placeholder) => (
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
          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${errors[name] ? "is-invalid" : ""}`}
          style={{ backgroundColor: "#f8fafc" }}
          autoComplete="new-password"
          disabled={success}
        />
        <button
          type="button"
          onClick={() => setShow({ ...show, [name]: !show[name] })}
          className="btn position-absolute end-0 top-0 h-100 d-flex align-items-center"
          style={{ border: "none", background: "transparent", paddingRight: "16px" }}
          tabIndex={-1}
        >
          {show[name] ? <FaEyeSlash color="#94a3b8" /> : <FaEye color="#94a3b8" />}
        </button>
      </div>
      {errors[name] && <small className="text-danger mt-2 d-block">{errors[name]}</small>}
    </div>
  );

  return (
    <div className="login-page min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div
        className="position-fixed w-100 h-100"
        style={{
          background: "linear-gradient(145deg, #0b1120 0%, #1a237e 50%, #283593 100%)",
          zIndex: -1
        }}
      >
        <div
          className="position-absolute w-100 h-100"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(67, 97, 238, 0.15) 0%, transparent 50%)"
          }}
        />
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center gap-3 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "linear-gradient(145deg, #4361ee, #3a0ca3)",
                    borderRadius: "18px",
                    color: "white",
                    fontSize: "30px",
                    boxShadow: "0 10px 30px rgba(67, 97, 238, 0.3)"
                  }}
                >
                  <FaStore />
                </div>
              </div>
              <h2 className="text-white fw-bold mb-2">Réinitialiser le mot de passe</h2>
              <p className="text-white-50">Choisissez un nouveau mot de passe pour votre compte</p>
            </div>

            <div
              className="card border-0 rounded-4 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.3)"
              }}
            >
              <div className="card-body p-5">
                {!token ? (
                  <div className="text-center">
                    <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center mb-4">
                      <FaExclamationTriangle className="me-2" />
                      <span>Lien invalide : aucun token fourni.</span>
                    </div>
                    <Link to="/login" className="btn btn-link text-decoration-none" style={{ color: "#64748b" }}>
                      <FaArrowLeft className="me-2" />
                      Retour à la connexion
                    </Link>
                  </div>
                ) : success ? (
                  <div className="text-center">
                    <div className="alert alert-success border-0 rounded-3 d-flex align-items-center gap-2 py-3 mb-4">
                      <FaCheckCircle className="flex-shrink-0" size={22} />
                      <div className="text-start">
                        <strong>Mot de passe réinitialisé !</strong>
                        <p className="mb-0 small">Redirection vers la page de connexion...</p>
                      </div>
                    </div>
                    <Link
                      to="/login"
                      className="btn px-4 py-2 rounded-3 fw-medium text-white"
                      style={{ background: "linear-gradient(145deg, #4361ee, #3a0ca3)", border: "none" }}
                    >
                      Aller à la connexion
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    {renderField("newPassword", "Nouveau mot de passe", "Au moins 6 caractères")}
                    {renderField("confirmPassword", "Confirmer le mot de passe", "••••••••")}

                    {errors.general && (
                      <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center mb-4">
                        <FaExclamationTriangle className="me-2" />
                        <span className="small">{errors.general}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn w-100 py-3 rounded-3 fw-medium text-white mb-3"
                      style={{
                        background: "linear-gradient(145deg, #4361ee, #3a0ca3)",
                        border: "none"
                      }}
                    >
                      {loading && <span className="spinner-border spinner-border-sm me-2" />}
                      {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                    </button>

                    <div className="text-center">
                      <Link
                        to="/login"
                        className="btn btn-link text-decoration-none"
                        style={{ color: "#64748b" }}
                      >
                        <FaArrowLeft className="me-2" />
                        Retour à la connexion
                      </Link>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}