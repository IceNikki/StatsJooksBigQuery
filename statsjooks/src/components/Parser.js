
/* -------------------------------------------------------------------- */
/* -- Composant permettant de lire le CSV et d'updater la BDD Firebase -*/
/* -------------------------------------------------------------------- */

import Papa from "papaparse";
import React, { useState } from 'react';
import { db } from '../config/firebase';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';


/*Fonction qui permet l'envoi d'un objet en base à partir des données extraites du CSV*/
async function Send(item) {
  const obj = item;
  /*on récupère les différentes valeurs de l'objet et on les stocke dans des constantes*/ 
  const id = obj.ID
  const namecity = obj['CITY NAME']
  const nameroute = obj['ROUTE  NAME']
  const nbrsessions= obj['NB ROUTE VIEWED']
  /*on assigne un type aux constantes*/ 
  const ID = String(id)
  const NAMECITY = String(namecity)
  const NAMEROUTE = String(nameroute)

      // On ajoute les data a Firestore
      await setDoc(doc(db, "Routes", ID), {

          id: ID,
          nameCity: NAMECITY,
          nameRoute: NAMEROUTE,
          nbrSessions: nbrsessions })
      const cityRef = doc(db, "City", NAMECITY);
      const docSnap = await setDoc(cityRef, {Routes : arrayUnion(ID)}, {merge:true}) 
        /*Fonction async donc penser à faire un then pour annoncer les résultats. Renvoie "Data successfully submitted" une fois par ligne écrite*/ 
      .then((docRef) => {
          alert("Data Successfully Submitted");
      })
      .catch((error) => {
          console.error("Error adding document: ", error);
      });
    }

  

function Parse() {
  // Stocke les datas parsées du CSV
  const [parsedData, setParsedData] = useState([]);
 
  const [tableRows, setTableRows] = useState([]);

  const [values, setValues] = useState([]);

  const changeHandler = (event) => {
    // Donne les data à parser (event.target.files[0]) en utilisant Papa.parse
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rowsArray = [];
        const valuesArray = [];

        // Itère dans les datas pour récupérer les keys et leur valeur
        results.data.map((d) => {
          rowsArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
        });

        // Donne les datas parsées sous forme d'array
        setParsedData(results.data);

        // Filtre les noms de colonne
        setTableRows(rowsArray[0]);

        // Filtre les valeurs
        setValues(valuesArray);

        /*Lit l'array parsed Data qui est un array d'objets et envoie l'objet à la fonction Send*/ 
        const myList = parsedData.map((item) => Send(item))      

      },
    });


            
  
  };

  return (
    <div>
      {/* File Uploader */}
      <input
        type="file"
        name="file"
        onChange={changeHandler}
        accept=".csv"
        style={{ display: "block", margin: "10px auto" }}
      />
      <br />
      <br />
      
      {/* Affiche le tableau avec les statistiques qui viennent d'être importées */}
      <table>
        <thead>
          <tr>
            {tableRows.map((rows, index) => {
              return <th key={index}>{rows}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {values.map((value, index) => {
            return (
              <tr key={index}>
                {value.map((val, i) => {
                  return <td key={i}>{val}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      

                    
    </div>
  );
}

export default Parse;