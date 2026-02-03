// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import UsersPage from './pages/UsersPage';
import AdminPage from './pages/AdminPage';
import StockAlertsPage from "./pages/StockAlertsPage";
function App() {
  return (
    <div className="d-flex vh-100 bg-light">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div 
        className="flex-grow-1 d-flex flex-column"
        style={{ 
          marginLeft: "250px", 
          width: "calc(100% - 250px)",
          transition: "margin-left 0.3s ease"
        }}
      >
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-grow-1 p-4 overflow-auto">
          <div className="container-fluid">
            <Routes>
              {/* Redirection par défaut */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Routes principales */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/category/:categoryId" element={<Products />} />

              <Route path="/users" element={<UsersPage />} /> 
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/stock-alerts" element={<StockAlertsPage />} />
          
              
              
              <Route path="/admin" element={
                <div className="card">
                  <div className="card-body text-center py-5">
                    <h3>Administration</h3>
                    <p className="text-muted">Page en cours de développement</p>
                  </div>
                </div>
              } />
              
              {/* Route 404 - Page non trouvée */}
              <Route path="*" element={
                <div className="card">
                  <div className="card-body text-center py-5">
                    <h1 className="text-danger">404</h1>
                    <h3>Page non trouvée</h3>
                    <p className="text-muted">La page que vous recherchez n'existe pas.</p>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </main>
        
        {/* Footer optionnel */}
        <footer className="border-top bg-white py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              &copy; {new Date().getFullYear()} Catalogue Produits - Tous droits réservés
            </small>
            <small className="text-muted">
              Version 1.0.0
            </small>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;