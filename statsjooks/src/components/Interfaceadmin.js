/* ---------------------------------------------- */
/* -- Gros composant pour la page administrateur--*/
/* ---------------------------------------------- */

import Cookies from 'js-cookie'
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Parse from '../components/Parser'

export default function Interfaceadmin() {

  // rendu principal html
  return (
    <div className="interAdmin">
      {/* Composant de popup discret */}
      <ToastContainer />
      <h3 className='text-center mt-3 mb-5'>Bonjour {Cookies.get("acsssn")}</h3>

<React.StrictMode>
  
  {/*Appel du composant qui parse le CSV et sauvegarde en base*/}
  <Parse/>
  
</React.StrictMode>




    </div>
  );
}
