import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, 
  FaUserShield, FaArrowLeft, FaStore, FaEye, FaEyeSlash,
  FaGoogle, FaFacebook, FaLinkedin, FaCheckCircle
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/login.css";

const LoginPage = () => {
  const navigate = useNavigate();
  
  // États pour la gestion des vues
  const [view, setView] = useState('login'); // 'login', 'signup', 'admin'
  
  // États pour les formulaires
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    password: '',
    confirmPassword: ''
  });
  
  const [adminData, setAdminData] = useState({
    email: 'admin@univertechno.tn',
    password: 'admin123'
  });
  
  // États pour la validation
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Gestionnaires de changement
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur du champ modifié
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const handleAdminChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  // Validation des formulaires
  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) newErrors.email = "Email invalide";
    if (!loginData.password) newErrors.password = "Le mot de passe est requis";
    return newErrors;
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!signupData.nom) newErrors.nom = "Le nom est requis";
    if (!signupData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) newErrors.email = "Email invalide";
    if (!signupData.telephone) newErrors.telephone = "Le téléphone est requis";
    else if (!/^[0-9]{8}$/.test(signupData.telephone)) newErrors.telephone = "Téléphone invalide (8 chiffres)";
    if (!signupData.adresse) newErrors.adresse = "L'adresse est requise";
    if (!signupData.password) newErrors.password = "Le mot de passe est requis";
    else if (signupData.password.length < 6) newErrors.password = "Minimum 6 caractères";
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (!acceptTerms) newErrors.terms = "Vous devez accepter les conditions";
    return newErrors;
  };

  const validateAdmin = () => {
    const newErrors = {};
    if (!adminData.email) newErrors.email = "L'email admin est requis";
    if (!adminData.password) newErrors.password = "Le mot de passe est requis";
    return newErrors;
  };

  // Soumission des formulaires
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateLogin();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    // Simulation de connexion
    setTimeout(() => {
      setLoading(false);
      // Redirection vers l'espace client
      navigate("/dashboard/client");
    }, 1500);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateSignup();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    // Simulation d'inscription
    setTimeout(() => {
      setLoading(false);
      setSignupSuccess(true);
      setTimeout(() => {
        setView('login');
        setSignupSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateAdmin();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    // Vérification des identifiants admin
    setTimeout(() => {
      setLoading(false);
      if (adminData.email === 'admin@univertechno.tn' && adminData.password === 'admin123') {
        // Redirection vers le dashboard admin
        navigate("/dashboard/admin");
      } else {
        setErrors({ general: "Identifiants administrateur incorrects" });
      }
    }, 1500);
  };

  // Retour à l'accueil
  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="login-page min-vh-100 d-flex align-items-center justify-content-center py-5">
      {/* Background avec dégradé */}
      <div className="position-fixed w-100 h-100" style={{
        background: 'linear-gradient(145deg, #0b1120 0%, #1a237e 50%, #283593 100%)',
        zIndex: -1
      }}>
        <div className="position-absolute w-100 h-100" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(67, 97, 238, 0.15) 0%, transparent 50%)',
        }}></div>
        <div className="position-absolute w-100 h-100" style={{
          background: 'radial-gradient(circle at 70% 30%, rgba(247, 37, 133, 0.1) 0%, transparent 50%)',
        }}></div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            {/* Logo et retour */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center gap-3 mb-4">
                <div 
                  className="d-flex align-items-center justify-content-center rounded-3 bg-white bg-opacity-10 p-3"
                  style={{ cursor: 'pointer' }}
                  onClick={handleBackToHome}
                >
                  <FaArrowLeft style={{ color: 'white', fontSize: '20px' }} />
                </div>
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                    borderRadius: '18px',
                    color: 'white',
                    fontSize: '30px',
                    boxShadow: '0 10px 30px rgba(67, 97, 238, 0.3)'
                  }}
                >
                  <FaStore />
                </div>
              </div>
              <h2 className="text-white fw-bold mb-2">
                {view === 'login' && 'Bienvenue'}
                {view === 'signup' && 'Créer un compte'}
                {view === 'admin' && 'Espace Administrateur'}
              </h2>
              <p className="text-white-50">
                {view === 'login' && 'Connectez-vous pour accéder à votre espace client'}
                {view === 'signup' && 'Rejoignez la communauté UniverTechno+'}
                {view === 'admin' && 'Accès réservé aux administrateurs'}
              </p>
            </div>

            {/* Message de succès */}
            {signupSuccess && (
              <div className="alert alert-success rounded-4 border-0 mb-4 d-flex align-items-center gap-3 py-3">
                <FaCheckCircle className="flex-shrink-0" size={24} />
                <div>
                  <strong>Inscription réussie !</strong>
                  <p className="mb-0 small">Redirection vers la page de connexion...</p>
                </div>
              </div>
            )}

            {/* Carte de connexion */}
            <div className="card border-0 rounded-4 overflow-hidden" style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.3)'
            }}>
              <div className="card-body p-5">
                
                {/* FORMULAIRE DE CONNEXION CLIENT */}
                {view === 'login' && (
                  <form onSubmit={handleLoginSubmit}>
                    {/* Email */}
                    <div className="mb-4">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Adresse email
                      </label>
                      <div className="position-relative">
                        <FaEnvelope className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type="email"
                          name="email"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${
                            errors.email ? 'is-invalid' : ''
                          }`}
                          placeholder="votre@email.com"
                          value={loginData.email}
                          onChange={handleLoginChange}
                          style={{
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem'
                          }}
                        />
                      </div>
                      {errors.email && (
                        <small className="text-danger mt-2 d-block">{errors.email}</small>
                      )}
                    </div>

                    {/* Mot de passe */}
                    <div className="mb-4">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Mot de passe
                      </label>
                      <div className="position-relative">
                        <FaLock className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${
                            errors.password ? 'is-invalid' : ''
                          }`}
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          style={{
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem'
                          }}
                        />
                        <button
                          type="button"
                          className="btn position-absolute end-0 top-0 h-100 d-flex align-items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ border: 'none', background: 'transparent', paddingRight: '16px' }}
                        >
                          {showPassword ? <FaEyeSlash color="#94a3b8" /> : <FaEye color="#94a3b8" />}
                        </button>
                      </div>
                      {errors.password && (
                        <small className="text-danger mt-2 d-block">{errors.password}</small>
                      )}
                    </div>

                    {/* Options */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="remember">
                          Se souvenir de moi
                        </label>
                      </div>
                      <a href="#" className="text-decoration-none small" style={{ color: '#4361ee' }}>
                        Mot de passe oublié ?
                      </a>
                    </div>

                    {/* Message d'erreur général */}
                    {errors.general && (
                      <div className="alert alert-danger py-2 small mb-4">
                        {errors.general}
                      </div>
                    )}

                    {/* Bouton de connexion */}
                    <button
                      type="submit"
                      className="btn w-100 py-3 rounded-3 fw-medium mb-4"
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                        color: 'white',
                        border: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : null}
                      {loading ? 'Connexion...' : 'Se connecter'}
                    </button>

                    {/* Liens */}
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none mb-2"
                        onClick={() => setView('signup')}
                        style={{ color: '#4361ee' }}
                      >
                        Créer un nouveau compte
                      </button>
                      <br />
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none"
                        onClick={() => setView('admin')}
                        style={{ color: '#64748b' }}
                      >
                        <FaUserShield className="me-2" />
                        Connexion Administrateur
                      </button>
                    </div>
                  </form>
                )}

                {/* FORMULAIRE D'INSCRIPTION */}
                {view === 'signup' && (
                  <form onSubmit={handleSignupSubmit}>
                    {/* Nom complet */}
                    <div className="mb-3">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Nom complet
                      </label>
                      <div className="position-relative">
                        <FaUser className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type="text"
                          name="nom"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${
                            errors.nom ? 'is-invalid' : ''
                          }`}
                          placeholder="Jean Dupont"
                          value={signupData.nom}
                          onChange={handleSignupChange}
                          style={{ backgroundColor: '#f8fafc' }}
                        />
                      </div>
                      {errors.nom && (
                        <small className="text-danger mt-1 d-block">{errors.nom}</small>
                      )}
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Email
                      </label>
                      <div className="position-relative">
                        <FaEnvelope className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type="email"
                          name="email"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${
                            errors.email ? 'is-invalid' : ''
                          }`}
                          placeholder="jean@email.com"
                          value={signupData.email}
                          onChange={handleSignupChange}
                          style={{ backgroundColor: '#f8fafc' }}
                        />
                      </div>
                      {errors.email && (
                        <small className="text-danger mt-1 d-block">{errors.email}</small>
                      )}
                    </div>

                    {/* Téléphone */}
                    <div className="mb-3">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Téléphone
                      </label>
                      <div className="position-relative">
                        <FaPhone className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type="tel"
                          name="telephone"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${
                            errors.telephone ? 'is-invalid' : ''
                          }`}
                          placeholder="71 123 456"
                          value={signupData.telephone}
                          onChange={handleSignupChange}
                          style={{ backgroundColor: '#f8fafc' }}
                        />
                      </div>
                      {errors.telephone && (
                        <small className="text-danger mt-1 d-block">{errors.telephone}</small>
                      )}
                    </div>

                    {/* Adresse */}
                    <div className="mb-3">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Adresse
                      </label>
                      <div className="position-relative">
                        <FaMapMarkerAlt className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type="text"
                          name="adresse"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${
                            errors.adresse ? 'is-invalid' : ''
                          }`}
                          placeholder="123 Rue de l'Innovation, Tunis"
                          value={signupData.adresse}
                          onChange={handleSignupChange}
                          style={{ backgroundColor: '#f8fafc' }}
                        />
                      </div>
                      {errors.adresse && (
                        <small className="text-danger mt-1 d-block">{errors.adresse}</small>
                      )}
                    </div>

                    {/* Mot de passe */}
                    <div className="mb-3">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Mot de passe
                      </label>
                      <div className="position-relative">
                        <FaLock className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          name="password"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${
                            errors.password ? 'is-invalid' : ''
                          }`}
                          placeholder="••••••••"
                          value={signupData.password}
                          onChange={handleSignupChange}
                          style={{ backgroundColor: '#f8fafc' }}
                        />
                        <button
                          type="button"
                          className="btn position-absolute end-0 top-0 h-100 d-flex align-items-center"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          style={{ border: 'none', background: 'transparent', paddingRight: '16px' }}
                        >
                          {showSignupPassword ? <FaEyeSlash color="#94a3b8" /> : <FaEye color="#94a3b8" />}
                        </button>
                      </div>
                      {errors.password && (
                        <small className="text-danger mt-1 d-block">{errors.password}</small>
                      )}
                    </div>

                    {/* Confirmation mot de passe */}
                    <div className="mb-4">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Confirmer le mot de passe
                      </label>
                      <div className="position-relative">
                        <FaLock className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${
                            errors.confirmPassword ? 'is-invalid' : ''
                          }`}
                          placeholder="••••••••"
                          value={signupData.confirmPassword}
                          onChange={handleSignupChange}
                          style={{ backgroundColor: '#f8fafc' }}
                        />
                        <button
                          type="button"
                          className="btn position-absolute end-0 top-0 h-100 d-flex align-items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ border: 'none', background: 'transparent', paddingRight: '16px' }}
                        >
                          {showConfirmPassword ? <FaEyeSlash color="#94a3b8" /> : <FaEye color="#94a3b8" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <small className="text-danger mt-1 d-block">{errors.confirmPassword}</small>
                      )}
                    </div>

                    {/* Conditions d'utilisation */}
                    <div className="mb-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="terms"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="terms">
                          J'accepte les{' '}
                          <a href="#" className="text-decoration-none" style={{ color: '#4361ee' }}>
                            conditions d'utilisation
                          </a>
                        </label>
                      </div>
                      {errors.terms && (
                        <small className="text-danger mt-1 d-block">{errors.terms}</small>
                      )}
                    </div>

                    {/* Bouton d'inscription */}
                    <button
                      type="submit"
                      className="btn w-100 py-3 rounded-3 fw-medium mb-3"
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : null}
                      {loading ? 'Inscription...' : "S'inscrire"}
                    </button>

                    {/* Retour à la connexion */}
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none"
                        onClick={() => setView('login')}
                        style={{ color: '#64748b' }}
                      >
                        <FaArrowLeft className="me-2" />
                        Retour à la connexion
                      </button>
                    </div>
                  </form>
                )}

                {/* FORMULAIRE ADMIN */}
                {view === 'admin' && (
                  <form onSubmit={handleAdminSubmit}>
                    {/* Email Admin */}
                    <div className="mb-4">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Email administrateur
                      </label>
                      <div className="position-relative">
                        <FaUserShield className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type="email"
                          name="email"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${
                            errors.email ? 'is-invalid' : ''
                          }`}
                          placeholder="admin@univertechno.tn"
                          value={adminData.email}
                          onChange={handleAdminChange}
                          style={{ backgroundColor: '#f8fafc' }}
                        />
                      </div>
                      {errors.email && (
                        <small className="text-danger mt-2 d-block">{errors.email}</small>
                      )}
                    </div>

                    {/* Mot de passe Admin */}
                    <div className="mb-4">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Mot de passe administrateur
                      </label>
                      <div className="position-relative">
                        <FaLock className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type={showAdminPassword ? "text" : "password"}
                          name="password"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${
                            errors.password ? 'is-invalid' : ''
                          }`}
                          placeholder="••••••••"
                          value={adminData.password}
                          onChange={handleAdminChange}
                          style={{ backgroundColor: '#f8fafc' }}
                        />
                        <button
                          type="button"
                          className="btn position-absolute end-0 top-0 h-100 d-flex align-items-center"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          style={{ border: 'none', background: 'transparent', paddingRight: '16px' }}
                        >
                          {showAdminPassword ? <FaEyeSlash color="#94a3b8" /> : <FaEye color="#94a3b8" />}
                        </button>
                      </div>
                      {errors.password && (
                        <small className="text-danger mt-2 d-block">{errors.password}</small>
                      )}
                    </div>

                    {/* Message d'information */}
                    <div className="alert alert-info bg-light border-0 rounded-3 small mb-4">
                      <strong>Identifiants par défaut :</strong><br />
                      Email : admin@univertechno.tn<br />
                      Mot de passe : admin123
                    </div>

                    {/* Message d'erreur général */}
                    {errors.general && (
                      <div className="alert alert-danger py-2 small mb-4">
                        {errors.general}
                      </div>
                    )}

                    {/* Bouton de connexion admin */}
                    <button
                      type="submit"
                      className="btn w-100 py-3 rounded-3 fw-medium mb-3"
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(145deg, #f72585, #b5179e)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : null}
                      {loading ? 'Connexion...' : 'Se connecter en tant qu\'Admin'}
                    </button>

                    {/* Retour */}
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none"
                        onClick={() => setView('login')}
                        style={{ color: '#64748b' }}
                      >
                        <FaArrowLeft className="me-2" />
                        Retour à l'espace client
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-white-50">
                © 2024 UniverTechno+ - Tous droits réservés
              </small>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .card {
          animation: fadeIn 0.6s ease;
        }
        
        .btn:not(.btn-link) {
          transition: all 0.3s ease;
        }
        
        .btn:not(.btn-link):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(67, 97, 238, 0.3);
        }
        
        .form-control:focus {
          box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.1);
          background-color: white !important;
        }
        
        .is-invalid {
          border: 2px solid #dc3545 !important;
        }
        
        .is-invalid:focus {
          box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.1);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;