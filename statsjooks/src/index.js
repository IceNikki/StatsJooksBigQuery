/* ---------------------------------------------- */
/* --------- Fichier de base de notre app-------- */
/* ---------------------------------------------- */

// Imports
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import BossStats from './components/BossStats';
// Imports de nos fichiers des pages pour notre routeur
import Home from './pages/Home';
import Admin from './pages/Admin';
import Navigationbar from './components/Navigationbar'; // Adjusted to use the correct import

// appel du composant de base eg App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Définition d'un router pour gérer différentes pages */}
    <BrowserRouter>
      <div>
        {/* Ajout de la barre de navigation sur chaque page */}
        <Navigationbar />
        {/* Déclaration de nos pages */}
        <Routes>
          {/* Notre page principale est Home pour l'accueil, 
          chemin demandé --> composant à charger  */}
          <Route path="/" element={<Home />} />
          
          {/* Page administrateur */}
          <Route path="admin" element={<Admin />} />
          
          {/* Page des statistiques globales pour le boss */}
          <Route path="boss-stats" element={<BossStats />} /> {/* Updated to use element attribute */}
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);
