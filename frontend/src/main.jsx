import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { BrowserRouter as Router } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <CartProvider>
        <App />
      </CartProvider>
    </Router>
  </StrictMode>,
)
