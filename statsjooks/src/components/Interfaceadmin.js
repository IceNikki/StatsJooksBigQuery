/* ---------------------------------------------- */
/* -- Gros composant pour la page administrateur--*/
/* ---------------------------------------------- */

import Cookies from 'js-cookie'
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Parse from '../components/Parser'
import ParseAnnual from '../components/ParserAnnual'

export default function Interfaceadmin() {

  // rendu principal html
  return (
    <div className="interAdmin">
      {/* Composant de popup discret */}
      <ToastContainer />
      <h4 className='text-center mt-3 mb-5 gotham-rounded-bold' >Bonjour,  {Cookies.get("acsssn")} !</h4>

<React.StrictMode>
  
  {/*Appel des composants qui parsent les CSV et sauvegardent en base*/}
  <h3 className='text-center mt-3 mb-5'>Importer les statistiques trimestrielles </h3>
  <Parse/>

  <h3 className='text-center mt-30 mb-5'>Importer les statistiques annuelles </h3>
  <ParseAnnual/>

  <h3 className='text-center mt-30 mb-5'>Attention : cette action supprimera les données précédemment enregistrées. Ne mélangez pas les données annuelles et trimestrielles !!</h3>
  
</React.StrictMode>




    </div>
  );
}
