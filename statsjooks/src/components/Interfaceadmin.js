/* ---------------------------------------------- */
/* -- Gros composant pour la page administrateur--*/
/* ---------------------------------------------- */

import Cookies from 'js-cookie'
import { db } from '../config/firebase';
import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { collection, query, getDocs, getDoc, doc, setDoc } from "firebase/firestore";
import Parse from '../components/Parser'

export default function Interfaceadmin() {

  // rendu principal html
  return (
    <div className="interAdmin">
      {/* Composant de popup discret */}
      <ToastContainer />
      <h3 className='text-center mt-3 mb-5'>Bonjour {Cookies.get("acsssn")}</h3>

<React.StrictMode>
  
  
  <Parse/>
  
</React.StrictMode>




    </div>
  );
}
