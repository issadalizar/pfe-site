import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock,
  FaArrowLeft, FaStore, FaUserShield, FaEye, FaEyeSlash
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { login, register, isAuthenticated, isAdmin } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Si déjà connecté, rediriger automatiquement
  if (isAuthenticated) {
    if (isAdmin) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate(redirectTo || "/client/dashboard", { replace: true });
    }
    return null;
  }

  // États pour le formulaire de connexion client
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // États pour le formulaire d'inscription client
  const [registerData, setRegisterData] = useState({
    client_name: "",
    email: "",
    telephone: "",
    adresse: "",
    password: "",
    confirmPassword: ""
  });

  // États pour le formulaire de connexion admin
  const [adminData, setAdminData] = useState({
    email: "",
    password: ""
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleAdminChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
    setError("");
  };

  // Connexion client
  const handleClientLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(loginData.email, loginData.password);
      if (result.success) {
        if (result.user.isAdmin) {
          navigate("/dashboard");
        } else {
          navigate(redirectTo || "/client/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  // Inscription client
  const handleClientRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        client_name: registerData.client_name,
        email: registerData.email,
        password: registerData.password,
        telephone: registerData.telephone,
        adresse: registerData.adresse
      });
      if (result.success) {
        setSuccessMessage("Inscription réussie ! Redirection...");
        setTimeout(() => navigate("/client/dashboard"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  // Connexion admin
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(adminData.email, adminData.password);
      if (result.success) {
        if (result.user.isAdmin) {
          navigate("/dashboard");
        } else {
          setError("Ce compte n'a pas les droits administrateur.");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Header */}
      <header className="py-3 sticky-top" style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.03)',
        borderBottom: '1px solid rgba(67, 97, 238, 0.1)'
      }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div
                className="me-3 d-flex align-items-center justify-content-center"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '26px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: '0 8px 20px rgba(67, 97, 238, 0.3)'
                }}
                onClick={() => navigate("/home")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(5deg) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                }}
              >
                <FaStore />
              </div>
              <div>
                <h1 className="fw-bold mb-0" style={{
                  fontSize: '1.6rem',
                  background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  cursor: 'pointer',
                  letterSpacing: '-0.5px'
                }} onClick={() => navigate("/home")}>
                  UniVer<span style={{ color: '#4361ee', WebkitTextFillColor: '#4361ee' }}>Techno</span>+
                </h1>
              </div>
            </div>
            <button
              className="btn btn-outline-primary rounded-pill px-4"
              onClick={() => navigate("/home")}
            >
              <FaArrowLeft className="me-2" />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card border-0 rounded-4 shadow-lg overflow-hidden">
              {/* Header avec gradient */}
              <div style={{
                height: '8px',
                background: 'linear-gradient(90deg, #4361ee, #f72585, #4cc9f0)'
              }}></div>

              <div className="card-body p-4 p-lg-5">
                {/* Logo */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(145deg, #4361ee15, #3a0ca315)',
                      borderRadius: '30px',
                      color: '#4361ee'
                    }}>
                    {showAdminLogin ? <FaUserShield size={40} /> : <FaUser size={40} />}
                  </div>
                  <h2 className="fw-bold" style={{ color: '#0f172a' }}>
                    {showAdminLogin ? "Espace Administrateur" : (isLoginMode ? "Connexion" : "Créer un compte")}
                  </h2>
                  <p className="text-muted">
                    {showAdminLogin
                      ? "Accès réservé aux administrateurs"
                      : (isLoginMode ? "Connectez-vous à votre compte" : "Rejoignez UniverTechno+")}
                  </p>
                </div>

                {/* Messages d'erreur / succès */}
                {error && (
                  <div className="alert alert-danger py-2 rounded-3 d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="alert alert-success py-2 rounded-3" role="alert">
                    {successMessage}
                  </div>
                )}

                {/* Admin Login Link */}
                {!showAdminLogin && (
                  <div className="text-center mb-4">
                    <button
                      onClick={() => { setShowAdminLogin(true); setError(""); }}
                      className="btn btn-link text-decoration-none p-0"
                      style={{ color: '#f72585' }}
                    >
                      <FaUserShield className="me-2" />
                      Connexion Administrateur
                    </button>
                  </div>
                )}

                {/* Back to Client Login */}
                {showAdminLogin && (
                  <div className="text-center mb-4">
                    <button
                      onClick={() => { setShowAdminLogin(false); setError(""); }}
                      className="btn btn-link text-decoration-none p-0"
                      style={{ color: '#4361ee' }}
                    >
                      <FaArrowLeft className="me-2" />
                      Retour à l'espace client
                    </button>
                  </div>
                )}

                {/* Admin Login Form */}
                {showAdminLogin && (
                  <form onSubmit={handleAdminLogin}>
                    <div className="mb-4">
                      <label className="form-label fw-medium text-secondary">
                        Email administrateur
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0">
                          <FaEnvelope style={{ color: '#4361ee' }} />
                        </span>
                        <input
                          type="email"
                          name="email"
                          className="form-control border-0 bg-light"
                          placeholder="admin@exemple.com"
                          value={adminData.email}
                          onChange={handleAdminChange}
                          required
                          disabled={loading}
                          style={{ padding: '0.75rem' }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-medium text-secondary">
                        Mot de passe
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0">
                          <FaLock style={{ color: '#4361ee' }} />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className="form-control border-0 bg-light"
                          placeholder="••••••••"
                          value={adminData.password}
                          onChange={handleAdminChange}
                          required
                          disabled={loading}
                          style={{ padding: '0.75rem' }}
                        />
                        <button
                          type="button"
                          className="btn btn-light border-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 py-3 rounded-pill mb-3"
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(145deg, #f72585, #b5179e)',
                        border: 'none',
                        color: 'white',
                        fontWeight: '600',
                        opacity: loading ? 0.7 : 1
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Connexion en cours...
                        </>
                      ) : "Connexion Admin"}
                    </button>
                  </form>
                )}

                {/* Client Forms */}
                {!showAdminLogin && (
                  <>
                    {/* Login Form */}
                    {isLoginMode ? (
                      <form onSubmit={handleClientLogin}>
                        <div className="mb-4">
                          <label className="form-label fw-medium text-secondary">
                            Email
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <FaEnvelope style={{ color: '#4361ee' }} />
                            </span>
                            <input
                              type="email"
                              name="email"
                              className="form-control border-0 bg-light"
                              placeholder="votre@email.com"
                              value={loginData.email}
                              onChange={handleLoginChange}
                              required
                              disabled={loading}
                              style={{ padding: '0.75rem' }}
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-medium text-secondary">
                            Mot de passe
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <FaLock style={{ color: '#4361ee' }} />
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              className="form-control border-0 bg-light"
                              placeholder="••••••••"
                              value={loginData.password}
                              onChange={handleLoginChange}
                              required
                              disabled={loading}
                              style={{ padding: '0.75rem' }}
                            />
                            <button
                              type="button"
                              className="btn btn-light border-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn w-100 py-3 rounded-pill mb-3"
                          disabled={loading}
                          style={{
                            background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '600',
                            opacity: loading ? 0.7 : 1
                          }}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Connexion en cours...
                            </>
                          ) : "Se connecter"}
                        </button>

                        <p className="text-center mb-0">
                          <span className="text-muted">Pas encore de compte ? </span>
                          <button
                            type="button"
                            onClick={() => { setIsLoginMode(false); setError(""); }}
                            className="btn btn-link p-0 text-decoration-none"
                            style={{ color: '#4361ee', fontWeight: '600' }}
                          >
                            Créer un compte
                          </button>
                        </p>
                      </form>
                    ) : (
                      /* Register Form */
                      <form onSubmit={handleClientRegister}>
                        <div className="mb-4">
                          <label className="form-label fw-medium text-secondary">
                            Nom complet
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <FaUser style={{ color: '#4361ee' }} />
                            </span>
                            <input
                              type="text"
                              name="client_name"
                              className="form-control border-0 bg-light"
                              placeholder="Jean Dupont"
                              value={registerData.client_name}
                              onChange={handleRegisterChange}
                              required
                              disabled={loading}
                              style={{ padding: '0.75rem' }}
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-medium text-secondary">
                            Email
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <FaEnvelope style={{ color: '#4361ee' }} />
                            </span>
                            <input
                              type="email"
                              name="email"
                              className="form-control border-0 bg-light"
                              placeholder="jean.dupont@email.com"
                              value={registerData.email}
                              onChange={handleRegisterChange}
                              required
                              disabled={loading}
                              style={{ padding: '0.75rem' }}
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-medium text-secondary">
                            Téléphone
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <FaPhone style={{ color: '#4361ee' }} />
                            </span>
                            <input
                              type="tel"
                              name="telephone"
                              className="form-control border-0 bg-light"
                              placeholder="+216 XX XXX XXX"
                              value={registerData.telephone}
                              onChange={handleRegisterChange}
                              disabled={loading}
                              style={{ padding: '0.75rem' }}
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-medium text-secondary">
                            Adresse
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <FaMapMarkerAlt style={{ color: '#4361ee' }} />
                            </span>
                            <input
                              type="text"
                              name="adresse"
                              className="form-control border-0 bg-light"
                              placeholder="123 Rue de l'Innovation, Tunis"
                              value={registerData.adresse}
                              onChange={handleRegisterChange}
                              disabled={loading}
                              style={{ padding: '0.75rem' }}
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-medium text-secondary">
                            Mot de passe
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <FaLock style={{ color: '#4361ee' }} />
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              className="form-control border-0 bg-light"
                              placeholder="••••••••"
                              value={registerData.password}
                              onChange={handleRegisterChange}
                              required
                              disabled={loading}
                              style={{ padding: '0.75rem' }}
                            />
                          </div>
                          <small className="text-muted">Minimum 6 caractères</small>
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-medium text-secondary">
                            Confirmer le mot de passe
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <FaLock style={{ color: '#4361ee' }} />
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              name="confirmPassword"
                              className="form-control border-0 bg-light"
                              placeholder="••••••••"
                              value={registerData.confirmPassword}
                              onChange={handleRegisterChange}
                              required
                              disabled={loading}
                              style={{ padding: '0.75rem' }}
                            />
                            <button
                              type="button"
                              className="btn btn-light border-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn w-100 py-3 rounded-pill mb-3"
                          disabled={loading}
                          style={{
                            background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '600',
                            opacity: loading ? 0.7 : 1
                          }}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Inscription en cours...
                            </>
                          ) : "S'inscrire"}
                        </button>

                        <p className="text-center mb-0">
                          <span className="text-muted">Déjà un compte ? </span>
                          <button
                            type="button"
                            onClick={() => { setIsLoginMode(true); setError(""); }}
                            className="btn btn-link p-0 text-decoration-none"
                            style={{ color: '#4361ee', fontWeight: '600' }}
                          >
                            Se connecter
                          </button>
                        </p>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;