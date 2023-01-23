/* ---------------------------------------------- */
/* -- Gros composant pour la page administrateur--*/
/* ---------------------------------------------- */

import Cookies from 'js-cookie'
import Modal from 'react-modal';
import { db } from '../config/firebase';
import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { exportAsPicture, roundToTwo } from './Utils';
import { ToastContainer, toast } from 'react-toastify';
import { collection, query, getDocs, getDoc, doc, setDoc } from "firebase/firestore";
import {ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis} from "recharts";
import Parse from './Parser'

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
