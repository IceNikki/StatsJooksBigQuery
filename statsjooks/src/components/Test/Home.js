/* ---------------------------------------------- */
/* --------- Page d'accueil de notre app --------- */
/* ---------------------------------------------- */

// Imports bootstrap, css
import '../css/App.css';


// nos composants
import Contactform from '../components/Contact-form';
import Login from '../components/LoginForm';
import Reader from '../components/Reader';



// fonction de rendu html
export default function Home() {
  return (
    // code html
    <div>

      {/* Coeur de la page */}
      <div className="mt-5 container">
        <div className="row justify-content-md-center">

          

          {/* Appel du composant gérant le test ainsi que la construction du graphique de résultat */}
          <div className="col-11 col-md-11 col-sm-12 col-lg-11 mt-5 mb-2 box-quizz">
          
            <Login /> 
           
          </div>

          {/* Ligne d'images */}
          <div className="col-11 col-lg-11 col-sm-11 col-md-11 mt-5 mb-5">
            {/* <img src={imgF1} className= "space-right" width="390" height="200" alt="" /> */}
          </div>
          
          {/* Appel du composant du formulaire de contact
          <div className="col col-lg-11 mt-5 mb-5">
            <Contactform />
          </div> */}
        </div>
      </div>
    </div>
  );
}
