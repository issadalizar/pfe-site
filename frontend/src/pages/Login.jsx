import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock,
  FaArrowLeft, FaStore, FaUserShield, FaEye, FaEyeSlash
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // États pour le formulaire de connexion client
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // États pour le formulaire d'inscription client
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });

  // États pour le formulaire de connexion admin
  const [adminData, setAdminData] = useState({
    email: "admin@univertechno.tn",
    password: "Admin123!"
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleAdminChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value
    });
  };

  const handleClientLogin = (e) => {
    e.preventDefault();
    // Simulation de connexion client
    console.log("Connexion client:", loginData);
    // Rediriger vers la page d'accueil ou tableau de bord client
    navigate("/");
  };

  const handleClientRegister = (e) => {
    e.preventDefault();
    // Vérifier que les mots de passe correspondent
    if (registerData.password !== registerData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    // Simulation d'inscription
    console.log("Inscription client:", registerData);
    alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
    setIsLogin(true);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    // Vérification simple pour l'admin
    if (adminData.email === "admin@univertechno.tn" && adminData.password === "Admin123!") {
      console.log("Connexion admin réussie");
      navigate("/dashboard");
    } else {
      alert("Email ou mot de passe admin incorrect");
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
                onClick={() => navigate("/")}
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
                }} onClick={() => navigate("/")}>
                  UniVer<span style={{ color: '#4361ee', WebkitTextFillColor: '#4361ee' }}>Techno</span>+
                </h1>
              </div>
            </div>
            <button 
              className="btn btn-outline-primary rounded-pill px-4"
              onClick={() => navigate("/")}
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
                    {showAdminLogin ? "Espace Administrateur" : (isLogin ? "Connexion" : "Créer un compte")}
                  </h2>
                  <p className="text-muted">
                    {showAdminLogin 
                      ? "Accès réservé aux administrateurs" 
                      : (isLogin ? "Connectez-vous à votre compte" : "Rejoignez UniverTechno+")}
                  </p>
                </div>

                {/* Admin Login Link - visible seulement en mode client */}
                {!showAdminLogin && (
                  <div className="text-center mb-4">
                    <button
                      onClick={() => setShowAdminLogin(true)}
                      className="btn btn-link text-decoration-none p-0"
                      style={{ color: '#f72585' }}
                    >
                      <FaUserShield className="me-2" />
                      Connexion Administrateur
                    </button>
                  </div>
                )}

                {/* Back to Client Login - visible seulement en mode admin */}
                {showAdminLogin && (
                  <div className="text-center mb-4">
                    <button
                      onClick={() => setShowAdminLogin(false)}
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
                      <small className="text-muted mt-2 d-block">
                        Identifiants par défaut: admin@univertechno.tn / Admin123!
                      </small>
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 py-3 rounded-pill mb-3"
                      style={{
                        background: 'linear-gradient(145deg, #f72585, #b5179e)',
                        border: 'none',
                        color: 'white',
                        fontWeight: '600'
                      }}
                    >
                      Connexion Admin
                    </button>
                  </form>
                )}

                {/* Client Forms */}
                {!showAdminLogin && (
                  <>
                    {/* Login Form */}
                    {isLogin ? (
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
                          style={{
                            background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '600'
                          }}
                        >
                          Se connecter
                        </button>

                        <p className="text-center mb-0">
                          <span className="text-muted">Pas encore de compte ? </span>
                          <button
                            type="button"
                            onClick={() => setIsLogin(false)}
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
                              name="name"
                              className="form-control border-0 bg-light"
                              placeholder="Jean Dupont"
                              value={registerData.name}
                              onChange={handleRegisterChange}
                              required
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
                              name="phone"
                              className="form-control border-0 bg-light"
                              placeholder="+216 XX XXX XXX"
                              value={registerData.phone}
                              onChange={handleRegisterChange}
                              required
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
                              name="address"
                              className="form-control border-0 bg-light"
                              placeholder="123 Rue de l'Innovation, Tunis"
                              value={registerData.address}
                              onChange={handleRegisterChange}
                              required
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
                              style={{ padding: '0.75rem' }}
                            />
                          </div>
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
                          style={{
                            background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '600'
                          }}
                        >
                          S'inscrire
                        </button>

                        <p className="text-center mb-0">
                          <span className="text-muted">Déjà un compte ? </span>
                          <button
                            type="button"
                            onClick={() => setIsLogin(true)}
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