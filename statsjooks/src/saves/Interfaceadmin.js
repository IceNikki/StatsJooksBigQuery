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


export default function Interfaceadmin() {

  // variables dynamiques (maj l'état du composant)
  const [isFormOn, showFormCompany] = useState(false);
  const [isTableOn, showTableEtp] = useState(false);
  const [errorForm, showError] = useState(false);
  const [entreprisesArray, setEtpArray] = useState([]);
  const [isModalOnCand, showModalCand] = useState(false);
  const [isModalGraphOn, showModalGraph] = useState(false);
  const [dataModalCand, setDataModalCand] = useState([]);
  const [dataModalGraph, setDataModalGraph] = useState([]);

  // calcul la moyenne d'un tableau de candidats
  function calculAverage(array) {

    // cas tableau vide
    if(array.length < 1) return 0

    else {
      // variables d'additions et de moyennes totaux
      let sumGain=0, sumChaise=0, sumElast=0, sumCoord =0,
      sumEnd=0,      sumDetV=0,   sumDetH=0,  sumEqui =0,
      avgGain=0,     avgChaise=0, avgElast=0, avgCoord=0,
      avgEnd=0,      avgDetV=0,   avgDetH=0,  avgEqui=0


      // compte du nombre de candidats ayant passé le test (avec des résultats)
      let nbrCandTested = 0

      // on calcule la somme totales pour chaque questions pour l'ensemble des candidats
      array.forEach(elt => {
        // calcul s'il le tableau de résultats existe
        if (elt.resultats) {
          sumGain   += elt.resultats[0].valeur
          sumChaise += elt.resultats[1].valeur
          sumElast  += elt.resultats[2].valeur
          sumCoord  += elt.resultats[3].valeur
          sumEnd    += elt.resultats[4].valeur
          sumDetV   += elt.resultats[5].valeur
          sumDetH   += elt.resultats[6].valeur
          sumEqui   += elt.resultats[7].valeur
          // on incrémente également le nombre de candidats testés
          nbrCandTested += 1
        }
      })
      // si au moins un candidat a été testé, on calcule la moyenne pour chaque question
      if (nbrCandTested > 0) {
        avgGain   = roundToTwo(sumGain/nbrCandTested)
        avgChaise = roundToTwo(sumChaise/nbrCandTested)
        avgElast  = roundToTwo(sumElast/nbrCandTested)
        avgCoord  = roundToTwo(sumCoord/nbrCandTested)
        avgEnd    = roundToTwo(sumEnd/nbrCandTested)
        avgDetV   = roundToTwo(sumDetV/nbrCandTested)
        avgDetH   = roundToTwo(sumDetH/nbrCandTested)
        avgEqui   = roundToTwo(sumEqui/nbrCandTested)
      }

      // on retourne les moyennes
      return {avgGain, avgChaise, avgElast, avgCoord, avgEnd, avgDetV, avgDetH, avgEqui}
    }
  }

  // fction de construction d'un tableau avec les données des entreprises
  async function listCompanies(){
    // cache l'autre composant potentiellement actif
    showFormCompany(false)
    let entreprises = []

    //requête de toutes les entreprise enregistrées
    const queryFB = query(collection(db, "Company"));
    let datas = await getDocs(queryFB)

    // on parcours les résultats de la requête et on consruit un tableau local avec ces données
    datas.docs.forEach(etp=>{
      let candidatesArray = etp.data().candidats ||  []

      // on récupère les moyennes calculées pour chaque catégorie
      let {avgGain, avgChaise, avgElast, avgCoord, avgEnd, avgDetV, avgDetH, avgEqui} = calculAverage(candidatesArray)
      let averagesArray = [{name: "Gain", value: avgGain}, {name: "Chaise", value: avgChaise},
      {name: "Elasticité", value: avgElast},{name: "Coordination", value: avgCoord},{name: "Endurance", value: avgEnd},
      {name: "Dét verticale", value: avgDetV},{name: "Dét horizontale", value: avgDetH},{name: "Equilibre", value: avgEqui}]
      // on remplit le tableau local des entreprises avec nom, candidats affiliés et moyennes de chaque catégorie
      entreprises.push({
        nom: etp.id, 
        candidats: candidatesArray,
        // moyenne de chaque question
        tabMoyennes: averagesArray,
        timestamp: etp.data().timestamp || 0
      })
    })

    // on maj notre tableau dynamique global avec le tableau local
    setEtpArray(entreprises)
    // on affiche le rendu html de la liste des etps
    showTableEtp(true)
  }

  // active le modal graphe
  function printGraphAverages(averages){
    setDataModalGraph(averages)
    showModalGraph(true)
  }

  // composant créant un graphique pour les moyennes
  const GraphAverages = ({graphData}) => {

    // booléen d'une valeur undefined
    const anyUndefined = graphData.find(element => element.value === undefined) || false;

    //si l'une des moyennes n'est pas définie on ne crée pas de graphe
    if (anyUndefined) 
      return ( <h4 className='text-center mt-3'> Pas assez de données pour créer un graphique</h4>)

    // sinon on le crée avec de bonnes données
    else {
      return (
          <ResponsiveContainer className="ov" width="100%" minWidth={500} height={400} >
            <RadarChart cx="52%" cy="55%" height={30} outerRadius="70%" data={graphData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />

              {/* un profil est créé pour utiliser les données */}
              <Radar name="eiko" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        )
      }
    }

  /* récupère la liste des candidats associés à l'entreprise cliquée, 
  active le modal d'affichage de ces données */
  function listCandidates(entreprise){
    let candidates = (entreprisesArray.find(etp => etp.nom === entreprise)).candidats || [];
    setDataModalCand(candidates)
    showModalCand(true)
  }
  

  // construction des lignes html contenues dans notre tableau d'entreprises
  const TableRow = ({tableData}) => {
    
    // pour chaque élement on crée une ligne dans le tableau
    return React.Children.toArray(
      tableData.map((etp, i) => (
        <tr>
          {/* listener on click on affiche un modal avec les candidats affiliés */}
          <td onClick={() => listCandidates(etp.nom)}>{etp.nom}</td>
          {/* extraction des données version + efficace tabmoyennes[index]
           au lieu de tabmyennes.find (name  === chaise) */}
          <td onClick={() => listCandidates(etp.nom)}>{etp.candidats.length}</td>
          <td onClick={() => printGraphAverages(etp.tabMoyennes)}>{etp.tabMoyennes[0].value}</td>
          <td onClick={() => printGraphAverages(etp.tabMoyennes)}>{etp.tabMoyennes[1].value}</td>
          <td onClick={() => printGraphAverages(etp.tabMoyennes)}>{etp.tabMoyennes[2].value}</td>
          <td onClick={() => printGraphAverages(etp.tabMoyennes)}>{etp.tabMoyennes[3].value}</td>
          <td onClick={() => printGraphAverages(etp.tabMoyennes)}>{etp.tabMoyennes[4].value}</td>
          <td onClick={() => printGraphAverages(etp.tabMoyennes)}>{etp.tabMoyennes[5].value}</td>
          <td onClick={() => printGraphAverages(etp.tabMoyennes)}>{etp.tabMoyennes[6].value}</td>
          <td onClick={() => printGraphAverages(etp.tabMoyennes)}>{etp.tabMoyennes[7].value}</td>
        </tr>
      ))
    )
  }

    // composant ligne des candidats pour le  tableau du modal
    const RowCandidate = ({rowData}) => {
      // pour chaque élement on crée une ligne dans le tableau
      return React.Children.toArray(
        rowData.map((candidate, i) => (
          <tr>
            <td>{candidate.nom}</td>
            <td>{candidate.mail}</td>
          </tr>
        ))
      )
    }

  // fct de traitement du formulaire et d'ajout d'une etp
  async function addACompany(e) {
     // Empêche le rafraîchissement de page
    e.preventDefault();

    // récupération des données du formulaire
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    let { etp_name } = formProps

    // Requête sur l'id de l'entreprise qui est également son nom et donc unique
    const docRef = doc(db, "Company", etp_name);
    const docSnap = await getDoc(docRef);
    
    // si une entreprise existe déjà on affiche une erreur
    if (docSnap.exists()) 
     showError(true)

    // si non on accepte les données
    else {
      // Enregistrement de la nouvelle entreprise dans la bdd
      await setDoc(doc(db, "Company", etp_name), {
        // données d'un document
        // date timestamp en secondes (unix) du test
        timestamp: 		 Math.floor(Date.now() / 1000)	

      // cas donnée enregistrée
      }).then(() => toast.success("Entreprise enregistrée!"))
      // cas l'enregistrement a echoué
      .catch(() => toast.error("Echec de l'enregistrement..."))
      // une fois finis on cache le formulaire
      showFormCompany(false)
    }
  }



  // Composant formulaire html d'ajout d'une entreprise
  function FormAddCompany(props) {
    const showForm = props.enableComponent;
 
    if (showForm) {
      return(
        <div className='row'>
          <form onSubmit={addACompany}>
            <div className="col  mb-3 mt-5 text-center">
              {/* message d'erreur si le nom est déjà pris */}
              <p className={(errorForm) ? "msgError" : 'hide-error'}> Ce nom d'entreprise est déjà pris</p>

              <input className="w40 inputbg-blue form-control form-control-lg m-auto colorWrite inputAddEtp" 
                  placeholder="Nom de l'entreprise" type="text" name="etp_name" required />
              
              {/* bouton d'envoi du formulaire */}
              <button type="submit" className="btn btn-primary btn-md w20 mt-3 btnAddEtp">Enregistrer </button>
            </div>
          </form>
      </div>
    )}
  }

  // Composant tableau html des entreprises enregistrées
  function EntreprisesTable(props) {
    const showTable = props.enableComponent;
    if(showTable) {
      return(
        <div className='table-responsive'>
        <table className="table-etp table mt-5">
        <thead className="thead-dark titleTable">
        {/* titre du tableau */}
        <tr className='bg-grey'>
          <th colSpan="2" className='hide-error'>head1</th>
          <th colSpan="8" className='text-center bg-grey'>Moyennes par catégorie</th>
        </tr>
        <tr>
          {/* sous-titres du tableau */}
          <th scope="row">Nom de l'entreprise</th>  
          <th scope="row">Participants affiliés</th>
          <th scope="row">Gainage</th>
          <th scope="row">Chaise</th>
          <th scope="row">Elasticité</th>
          <th scope="row">Coordination</th>
          <th scope="row">Endurance</th>
          <th scope="row">Détente verticale</th>
          <th scope="row">Détente horizontale</th>
          <th scope="row">Equilibre</th>
        </tr>
        </thead>
        <tbody>

          {/* Sous-composant dynamique de remplissage de notre tableau */}
          <TableRow tableData={entreprisesArray} />
        </tbody>
      </table>
      </div>
      )
    }
  }


  // rendu principal html
  return (
    <div className="interAdmin">
      {/* Composant de popup discret */}
      <ToastContainer />
      <h3 className='text-center mt-3 mb-5'>Bonjour {Cookies.get("acsssn")}</h3>

      {/* boutons d'affichages du formulaire et du tableau */}
      <button className={!(isFormOn) ? "btn btn-warning btn-md  space-right" : 'hide-error'}
              onClick={() => {showFormCompany(true); showTableEtp(false); showError(false)}}>Ajouter une entreprise</button>

      {/* chaque bouton désactive l'autre composant actif */}
      <button className={!(isTableOn) ? "btn btn-warning btn-md" : 'hide-error'} 
              onClick={() => listCompanies()}>Lister les entreprises enregistrées</button>

      {/* composant local du formulaire d'ajout */}
      <FormAddCompany enableComponent={isFormOn}/>

      {/* composant local du tableau d'etp */}
      <EntreprisesTable enableComponent={isTableOn}/>

      {/* Modal d'affichage des participants lors du clic sur une entreprise */}
      <Modal isOpen={isModalOnCand} className="Modal"
          appElement={document.getElementById('root') || undefined}
          onRequestClose={() => showModalCand(false)}>

          <div className='mt-2'>
            {/* bouyon de fermeture du modal */}
          <button type="button" className="btn-close setClose" 
          onClick={() => showModalCand(false)} aria-label="Close"></button>
      
            <h4 className=' text-center'>Liste des candidats </h4>
            <table className="table mt-3">
              <thead className="thead-dark titleTable">
                <tr>
                  <th scope="col">Nom du candidat</th>
                </tr>
              </thead>
              <tbody>
                {/* Sous-composant dynamique de remplissage de notre tableau */}
                  <RowCandidate rowData={dataModalCand}/>
              </tbody>
            </table>
          </div>
        </Modal>

        {/* modal d'affichage du graphe des moyennes d'une entreprise */}
        <Modal isOpen={isModalGraphOn} className="Modal" id="modalGraph"
          onRequestClose={() => showModalGraph(false)}
          appElement={document.getElementById('root') || undefined}>

          <div className='mt-1'>
            <button type="button" className="btn-close setClose" 
            onClick={() => showModalGraph(false)} aria-label="Close"></button>
            

            {/* bout on de téléchargement du graphe comme image 09/09/2022 marche sous chrome, pas firefox */}
            <button type="button" className="btn btn-dark" onClick={exportAsPicture} >Enregistrer ce graphique</button>
            <h4 className=' text-center'>Graphe des moyennes </h4>
            <GraphAverages graphData={dataModalGraph}/>
          </div>
        </Modal>
    </div>
  );
}
