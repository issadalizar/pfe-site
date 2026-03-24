import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaChartLine,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import { getAllUsers } from "../../services/userService";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    inactifs: 0,
    loading: true
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
      setStats({
        total: data.length,
        actifs: data.filter(u => u.actif).length,
        inactifs: data.filter(u => !u.actif).length,
        loading: false
      });
    } catch {
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const totalMontant = users.reduce((s, u) => s + Number(u.montant || 0), 0);

  const formatMontant = (m) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(m);

  const cards = [
    {
      title: "Total Clients",
      value: stats.total,
      icon: <FaUsers />,
      color: "primary",
      trend: "up",
      change: "+12%"
    },
    {
      title: "Clients Actifs",
      value: stats.actifs,
      icon: <FaUserCheck />,
      color: "success",
      trend: "up",
      change: "+8%"
    },
    {
      title: "Clients Inactifs",
      value: stats.inactifs,
      icon: <FaUserTimes />,
      color: "danger",
      trend: "down",
      change: "-5%"
    },
    {
      title: "Montant Total",
      value: formatMontant(totalMontant),
      icon: <FaChartLine />,
      color: "warning",
      trend: "up",
      change: "+15%"
    }
  ];

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-4">
          {/* Header */}
          <div className="d-flex justify-content-between flex-wrap mb-4 gap-3">
            <div>
              <h1 className="fw-bold">Dashboard</h1>
              <p className="text-muted">
                Vue d'ensemble de votre système
              </p>
            </div>
            <button className="btn btn-primary" onClick={loadStats}>
              <FaChartLine className="me-2" />
              Actualiser
            </button>
          </div>

          {/* Stats */}
          <div className="row g-4 mb-4">
            {cards.map((c, i) => (
              <div key={i} className="col-md-6 col-xl-3">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                      <div className={`text-${c.color} fs-3`}>
                        {c.icon}
                      </div>
                      <span
                        className={`badge ${
                          c.trend === "up" ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {c.trend === "up" ? <FaArrowUp /> : <FaArrowDown />}
                        {c.change}
                      </span>
                    </div>
                    <h3 className="fw-bold">
                      {stats.loading ? "…" : c.value}
                    </h3>
                    <p className="text-muted mb-0">{c.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts & Actions */}
          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <div className="card shadow-sm h-100">
                <div className="card-header d-flex justify-content-between">
                  <h5 className="mb-0">Évolution des Utilisateurs</h5>
                  <select className="form-select form-select-sm w-auto">
                    <option>Cette année</option>
                    <option>Ce mois</option>
                    <option>Cette semaine</option>
                  </select>
                </div>
                <div className="card-body text-center text-muted">
                  <FaChartLine size={60} className="mb-3" />
                  <p>Graphique à implémenter</p>
                  <small>Chart.js / Recharts</small>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-header">
                  <h5 className="mb-0">Actions Rapides</h5>
                </div>
                <div className="card-body d-grid gap-2">
                  <button className="btn btn-outline-primary">
                    <FaUsers className="me-2" />
                    Nouvel Utilisateur
                  </button>
                  <button className="btn btn-outline-secondary">
                    <FaChartLine className="me-2" />
                    Générer Rapport
                  </button>
                  <button className="btn btn-outline-success">
                    <FaUserCheck className="me-2" />
                    Vérifier Statuts
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between">
              <h5 className="mb-0">Activité Récente</h5>
              <button className="btn btn-sm btn-outline-primary">
                Voir tout
              </button>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <FaUserCheck className="text-success me-2" />
                  <strong>CLI001</strong> activé – il y a 2h
                </li>
                <li className="list-group-item">
                  <FaUsers className="text-primary me-2" />
                  <strong>CLI002</strong> créé – il y a 5h
                </li>
                <li className="list-group-item">
                  <FaUserTimes className="text-danger me-2" />
                  <strong>CLI003</strong> désactivé – il y a 1 jour
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}