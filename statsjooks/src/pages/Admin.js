/* ---------------------------------------------- */
/* --------- Page administrateur ---------------- */
/* ---------------------------------------------- */

import Cookies from 'js-cookie'
import { db } from '../config/firebase';
import React, { useState } from "react";
import Interfaceadmin from '../components/Interfaceadmin';
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Admin() {

  // Variables dynamiques
  // variables d'erreur
	const [errorName, showErrorName] = useState(false)
  const [errorPass, showErrorPass] = useState(false)
  /* A chaque chargement de page, tout est rechargé notamment ces variables, celle-ci 
  cherche notre cookie d'authentification, s'il n'existe pas alors cette variable est false */
  const [isConnected, giveAccess] = useState(Cookies.get("acsssn") || false) ;

  
  // supprime le cookie d'authentification et réaffiche le menu de login
  function disconnectUser(){
    Cookies.remove('acsssn')
    giveAccess(false)
  }

  // fonction de traitement du formulaire
  async function handleSubmit (e) {
    // Empêche le rafraîchissement de page
    e.preventDefault();

    // import de la librairie de cryptage
    const bcrypt = require('bcryptjs');
    // console.log(bcrypt.hashSync("test", 10));
    // récupération du nom et du mot de passe entrés dans le formulaire
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    let { formName, formPassword } = formProps

    // Construction de la requête de récupération du mot de pase associé au nom entré
    const queryFB = query(collection(db, "administrateurs"), where("nom", "==", formName));

    // éxecution de la requête
    const queryResults = await getDocs(queryFB);
    
    // cas aucun administrateur avec ce nom n'a été rouvé, donc inexistant
    if (queryResults.empty){
      showErrorName(true)
      showErrorPass(false)
    }
    
    // s'il y en a un, alors on vérifie le mot de passe
    else {
      // récupération du hash du mdp de la bdd associé au nom
      let userDBHash = queryResults.docs[0].data().mdp

      /* le mot de passe entré est comparé au hash du mdp enregistré dans la bdd
      (retourne true ou false), le mdp enregistré n'apparaît jamais en clair */
      if (!bcrypt.compareSync(formPassword, userDBHash)){
        showErrorPass(true)
        showErrorName(false)
      }
      
      // si le mdp correspond, on autorise l'accès au compte administrateur  
      else {
        // on affiche la page admin, affiché tant que le cookie est valide (et si page ouverte > 24h ???)
        giveAccess(true)  
        showErrorPass(false)
        showErrorName(false)
 
        // création du cookie de session valide pendant 24h
        Cookies.set('acsssn', queryResults.docs[0].data().nom, { expires: 1, sameSite: false})
      }
    }
    
  };

  // rendu html
  return (
    <div className="interAdmin">
      {/* notre condition vérifie si un cookie d'authentification 
      est présent, peu importe sa valeur. S'il y en a un alors on affiche la partie admin */}
      { isConnected ? (
        <>
          {/* bouton de déconnexion */}
          <button className='btn btn-danger mt-2 btn-sm float-right' onClick={() => disconnectUser()}>Se déconnecter</button>
          {/* composant d'interface d'administrateur */}
          <Interfaceadmin /> 
        </>
      // s'il n'y a pas de cookie, alors on laisse la partie login
      ) : (
        <>
          <div className="row text-center">
            <h2 className="text-center mt-3">Connexion administrateur</h2>

            {/* Formulaire de connexion admin */}
            <form onSubmit={handleSubmit} className="text-center mt-5 admin-co-div">
              <div className="ms-auto col col-sm-12 col-md-12 col-12 col-lg-12 ">
                {/* message d'erreur si nom pas reconnu */}
                <div className={!!(errorName) ? "msgError" : 'hide-error'}> Cet admin n'existe pas</div>
                <label className="col-2">Nom </label>
                {/* reactjs sanitize le rendu html pour éviter les xss dans nos input */}
                <input type="text" className="col-2" name="formName" required />
              </div>

              <div className="mt-3">
                <div className={!!(errorPass) ? "msgError" : 'hide-error'}> Ce mot de passe est erroné</div>
                <label className="col-2">Mot de passe </label>
                <input type="password" className="col-2" name="formPassword" required />
              </div>

              {/* bouton de soumission de notre formulaire */}
              <button type="submit" className="btn btn-danger mt-3">Se connecter</button>
            </form> 
          </div>     
        </>
      )}
    </div>
    
  );
}
