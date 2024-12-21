import React from 'react';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
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
            <h3 className='text-center mb-3'>Update Sponsors</h3>
            <UpdateSponsors />
          </div>
        </div>
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
