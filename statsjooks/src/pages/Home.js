/* ---------------------------------------------- */
/* --------- Page d'accueil de notre app --------- */
/* ---------------------------------------------- */

// Imports bootstrap, css
import '../css/App.css';


// nos composants
import Contactform from '../components/Contact-form';
import Stat from '../components/Stats';
import Send from '../components/Send';

// Images
// import imgF1 from '../imgs/fitness1.jpg';



// fonction de rendu html
export default function Home() {
  return (
    // code html
    <div>

      {/* Coeur de la page */}
      <div className="mt-5 container">
        <div className="row justify-content-md-center">

          {/* Texte d'introduction */}
          <div className="col-11 col-md-11 col-sm-11 col-lg-11">
          <h2 className='title'>Please login to access the statistics of your routes on the Jooks app !</h2>        
            <p className="mt-3 mb-4 txt-intro">
              Every three months, we will upload the statistics of your routes on this platform, so you can access them at any time,
            </p> 
          </div>

          {/* Appel du composant gérant le test ainsi que la construction du graphique de résultat */}
          <div className="col-11 col-md-11 col-sm-12 col-lg-11 mt-5 mb-2 box-quizz">
          
            <Stat /> 
          </div>

          {/* Ligne d'images */}
          <div className="col-11 col-lg-11 col-sm-11 col-md-11 mt-5 mb-5">
            {/* <img src={imgF1} className= "space-right" width="390" height="200" alt="" /> */}
          </div>
          
          {/* Appel du composant du formulaire de contact */}
          <div className="col col-lg-11 mt-5 mb-5">
            <Contactform />
          </div>
        </div>
      </div>
    </div>
  );
}
