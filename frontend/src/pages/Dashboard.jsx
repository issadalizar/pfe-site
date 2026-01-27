import { useState, useEffect } from "react";
import Header from "../components/Header";
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes, 
  FaChartLine,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import { getAllUsers } from "../services/userService";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    inactifs: 0,
    loading: true
  });

  useEffect(() => {
    loadStats();
  }, []);

  const [users, setUsers] = useState([]);

  const loadStats = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
      setStats({
        total: usersData.length,
        actifs: usersData.filter(u => u.actif).length,
        inactifs: usersData.filter(u => !u.actif).length,
        loading: false
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const totalMontant = users.reduce((sum, u) => sum + (u.montant || 0), 0);
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(montant);
  };

  const statCards = [
    {
      title: "Total Clients",
      value: stats.total,
      icon: FaUsers,
      color: "#3498db",
      bgColor: "#e3f2fd",
      change: "+12%",
      trend: "up"
    },
    {
      title: "Clients Actifs",
      value: stats.actifs,
      icon: FaUserCheck,
      color: "#27ae60",
      bgColor: "#e8f5e9",
      change: "+8%",
      trend: "up"
    },
    {
      title: "Clients Inactifs",
      value: stats.inactifs,
      icon: FaUserTimes,
      color: "#e74c3c",
      bgColor: "#ffebee",
      change: "-5%",
      trend: "down"
    },
    {
      title: "Montant Total",
      value: formatMontant(totalMontant),
      icon: FaChartLine,
      color: "#f39c12",
      bgColor: "#fff3e0",
      change: "+15%",
      trend: "up",
      isCurrency: true
    }
  ];

  return (
    <div className="dashboard-container">
      <Header />
      
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Vue d'ensemble de votre système de gestion
            </p>
          </div>
          <button className="btn btn-primary" onClick={loadStats}>
            <FaChartLine className="me-2" />
            Actualiser
          </button>
        </div>

        {/* Statistiques */}
        <div className="stats-grid">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-card">
                <div className="stat-card-header">
                  <div 
                    className="stat-icon-wrapper"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <Icon style={{ color: stat.color }} />
                  </div>
                  <div className={`stat-trend stat-trend-${stat.trend}`}>
                    {stat.trend === "up" ? <FaArrowUp /> : <FaArrowDown />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="stat-card-body">
                  <h3 className="stat-value">
                    {stats.loading ? "..." : stat.value}
                    {stat.suffix && !stat.isCurrency && <span className="stat-suffix">{stat.suffix}</span>}
                  </h3>
                  <p className="stat-title">{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Graphiques et Activité */}
        <div className="dashboard-grid">
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h5 className="card-title">Évolution des Utilisateurs</h5>
              <select className="form-select form-select-sm period-select">
                <option>Cette année</option>
                <option>Ce mois</option>
                <option>Cette semaine</option>
              </select>
            </div>
            <div className="card-body chart-placeholder">
              <div className="chart-content">
                <FaChartLine className="chart-icon" />
                <p className="text-muted">Graphique à implémenter</p>
                <small className="text-muted">
                  Intégrez Chart.js ou Recharts pour afficher les données
                </small>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h5 className="card-title">Actions Rapides</h5>
            </div>
            <div className="card-body">
              <div className="quick-actions">
                <button className="action-btn">
                  <FaUsers />
                  <span>Nouvel Utilisateur</span>
                </button>
                <button className="action-btn">
                  <FaChartLine />
                  <span>Générer Rapport</span>
                </button>
                <button className="action-btn">
                  <FaUserCheck />
                  <span>Vérifier Statuts</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Activité Récente */}
        <div className="dashboard-card">
          <div className="card-header">
            <h5 className="card-title">Activité Récente</h5>
            <button className="btn btn-sm btn-outline-primary">Voir tout</button>
          </div>
          <div className="card-body">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon success">
                  <FaUserCheck />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    <strong>CLI001 - Dupont Jean</strong> a été activé
                  </p>
                  <span className="activity-time">Il y a 2 heures</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon info">
                  <FaUsers />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    <strong>CLI002 - Martin Sophie</strong> a été créé
                  </p>
                  <span className="activity-time">Il y a 5 heures</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon warning">
                  <FaUserTimes />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    <strong>CLI003 - Bernard Pierre</strong> a été désactivé
                  </p>
                  <span className="activity-time">Il y a 1 jour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
