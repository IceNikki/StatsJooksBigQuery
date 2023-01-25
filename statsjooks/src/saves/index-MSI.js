/* ---------------------------------------------- */
/* --------- Fichier de base de notre app-------- */
/* ---------------------------------------------- */

// Imports
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';

// Imports de nos fichiers des pages pour notre routeur
import Home from './pages/Home';
import Admin from './pages/Admin';
import Navbar from './components/Navigationbar';

// appel du composant de base eg App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Définition d'un router pour gérer différentes pages */}
    <BrowserRouter>
      <div>
        {/* Ajout de la barre de navigation sur chaque page */}
        <Navbar/>
        {/* Déclaration de nos pages */}
        <Routes>
          {/* Notre page principale est Home pour l'accueil, 
          chemin demandé --> composant à charger  */}
          <Route path="/" element={<Home />}/>
          
          {/* Page administrateur */}
          <Route path="admin" element={<Admin />} />
        </Routes>
    </div>
  </BrowserRouter>
  </React.StrictMode>
);

