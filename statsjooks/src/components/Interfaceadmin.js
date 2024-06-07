import React from 'react';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Parse from '../components/Parser';
import ParseAnnual from '../components/ParserAnnual';
import UpdateSponsors from '../components/UpdateSponsors';
import UpdateRoutes from '../components/UpdateRoutes';

export default function Interfaceadmin() {
  return (
    <div className="container mt-5">
      <ToastContainer />
      <h4 className='text-center mt-3 mb-5 gotham-rounded-bold'>
        Bonjour, {Cookies.get("acsssn")} !
      </h4>
      <React.StrictMode>
        <div className="card mb-4">
          <div className="card-body">
            <h3 className='text-center mb-3'>Importer les statistiques trimestrielles</h3>
            <Parse />
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-body">
            <h3 className='text-center mb-3'>Importer les statistiques annuelles</h3>
            <ParseAnnual />
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-body">
            <h3 className='text-center mb-3'>Update Sponsors</h3>
            <UpdateSponsors />
          </div>
        </div>
        {/* Uncomment these sections if needed */}
        {/* <div className="card mb-4">
          <div className="card-body">
            <h3 className='text-center mb-3'>Mettre à jour la longueur des itinéraires</h3>
            <UpdateRoutesLength />
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-body">
            <h3 className='text-center mb-3'>Update Route Categories</h3>
            <UpdateCategories />
          </div>
        </div> */}
        <div className="card mb-4">
          <div className="card-body">
            <h3 className='text-center mb-3'>Update Routes</h3>
            <UpdateRoutes />
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-body">
            <h3 className='text-center text-danger'>
              Attention : cette action supprimera les données précédemment enregistrées. Ne mélangez pas les données annuelles et trimestrielles !!
            </h3>
          </div>
        </div>
      </React.StrictMode>
    </div>
  );
}
