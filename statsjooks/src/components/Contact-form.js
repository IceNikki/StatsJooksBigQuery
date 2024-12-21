/* -------------------------------------------------------------- */
/* Composant, formulaire de contact, utilise l'outil emailjs pour */
/* transmettre des mails (gratuit en dessous de 200 envois /jour) */
/* -------------------------------------------------------------- */


import emailjs from '@emailjs/browser';
import React, { useRef, useState } from 'react';



export default function Contactform() {

  const form = useRef();

  // variable dynamique d'affichage du formulaire
	const [showForm, setForm] = useState(true)

  // fonction d'envoi du mail
  const sendEmail = (e) => {
    // on cache le formulaire une fois le message envoyé
    setForm(false)
    e.preventDefault();

    // envoie le formulaire à l'adresse mail assigné au compte emailjs
    emailjs.sendForm('service_dz0fhnd', 'template_x0ncy4e', form.current, '9Buf88yR49zi4d45n')
      // cas envoi réussis
      .then((result) => {
          console.log(result.text);
      // cas envoi echoué
      }, (error) => {
          console.log(error.text);
      });
  };

  return (
    <div className='row'>
      
      {/* Partie gros titre, à gauche */}
      <div className='col col-lg-4 align-middle'>
        <div className='mt15'>
          <h1 className='ftsize55'>Nous contacter</h1>
          <p className='ftsize25 mt-3'> Des questions ? Besoin d'aide ? N'hésitez pas !</p>
          </div>
      </div>

      {/* Partie formulaire de contact, à droite */}
        <div className='col col-lg-7'>
        {/* Condition d'affichage du formulaire */}
        { showForm ? (
          //Appel de la fonction sendEmail lors de la validation utilisateur
          <form ref={form} onSubmit={sendEmail}>
            <div className="mb-3 colorWrite">
              <input className="form-control form-control-lg inputbg-blue colorWrite" placeholder="Nom de famille" type="text" name="user_name" required />
            </div>
            <div className="mb-3">
              <input className="form-control form-control-lg inputbg-blue colorWrite" type="email" placeholder="Email" name="user_email" required />
            </div>
            <div className="mb-3">
              <textarea className="form-control form-control-lg inputbg-blue colorWrite"  rows="6" placeholder="Message" name="message" required />
            </div>
            <input type="submit" className="btn btn-primary btn-lg" value="Je m'informe" />
          </form>

      /* cas le formulaire a déjà été envoyé, 
      on affiche la confirmation et un bouton pour en renvoyer un*/
      ) : (
        <>
          <div className='fullHeight text-center mb-5'>
            <h4 className='mt-5'>Message envoyé! Merci :D</h4>
            <button className='btn btn-danger mt-5 btn-lg' onClick={() => setForm(true)}>Renvoyez un autre message</button>
          </div>
        </>
      )}
      </div>
    </div>
  );
};
