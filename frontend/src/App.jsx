// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import UsersPage from './pages/UsersPage';
import StockAlertsPage from "./pages/StockAlertsPage";
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import PublicCategoryPage from "./pages/PublicCategoryPage";
import AdminMessages from './pages/AdminMessages';
import ContactPage from './pages/ContactPage';
import SectorPage from "./pages/SectorPage";


function App() {
  return (
    <Routes>
      {/* ROUTES PUBLIQUES - SANS SIDEBAR */}
      <Route path="/home" element={<Home />} />
      <Route path="/product/:productName" element={<ProductDetails />} />
      <Route path="/category/:categoryId" element={<PublicCategoryPage />} />
      <Route path="/contact" element={<ContactPage />} />
       <Route path="/sector/:sectorId" element={<SectorPage />} />

      {/* ROUTES ADMIN - AVEC SIDEBAR */}
      <Route
        path="/*"
        element={
          <div className="d-flex vh-100 bg-light">
            <Sidebar />
            <div
              className="flex-grow-1 d-flex flex-column"
              style={{
                marginLeft: "250px",
                width: "calc(100% - 250px)",
                transition: "margin-left 0.3s ease"
              }}
            >
              <Header />
              <main className="flex-grow-1 p-4 overflow-auto">
                <div className="container-fluid">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/category/:categoryId" element={<Products />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/stock-alerts" element={<StockAlertsPage />} />
                    <Route path="/messages" element={<AdminMessages />} />
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
        }
      />
    </Routes>
  );
}

export default App;