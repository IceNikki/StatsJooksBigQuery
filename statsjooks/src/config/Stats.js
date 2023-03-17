/* ---------------------------------------------------------------------- */
/* -- Composant de lecture et d'affichage des stats pour le client -*/
/* ---------------------------------------------- ------------------------*/

import 'react-toastify/dist/ReactToastify.css';
import { db } from '../config/firebase';
import { getDoc, doc } from "firebase/firestore";
import React, {useState} from 'react';
import { citysuggester } from '../components/CitySuggester';

export default function Table() {

    // booléen d'affichage du graphe 
    const [showChart, setChart] = useState(false);

    // booléen d'affichage du tableau
    const [showTest, setTable] = useState(false);

    // message d'erreur
    const [errorForm, showError] = useState(false);

    // mot de passe, global
    const [cityPassword, setCityPassword] = useState("");

    // nom de la ville, global
    const [cityName, setCityName] = useState("");

    async function startTest (e) {

        e.preventDefault();

        const formData = new FormData(e.target);
        const formProps = Object.fromEntries(formData);
        let { city_name, city_password } = formProps;

        // Check de l'existence de la ville dans notre bdd
        const docRef = doc(db, "City", city_name);
        const docSnap = await getDoc(docRef);

        const docRef2 = doc(db, "Password", city_password);
        const docSnap2 = await getDoc(docRef2);

        // Si la ville existe, on procède
        if (docSnap.exists()) {

            setCityName(city_name);
            setCityPassword(city_password);

            // On commence la session
            setTable(true);
            showError(false);
            setChart(true);
        }
        else {

            // Si la ville n'existe pas, on appelle citysuggester pour proposer une ville similaire
            const suggestedCity = await citysuggester(city_name);

// Si une ville similaire est trouvée, on propose à l'utilisateur de continuer avec cette ville
if (suggestedCity !== null) {
  if (window.confirm(`Avez-vous voulu dire ${suggestedCity} ?`)) {
	console.log(suggestedCity)
    city_name = suggestedCity;

    setCityName(city_name);
    setCityPassword(city_password);

    setTable(true);
    showError(false);
    setChart(true);
  }
}
else {
  // Sinon, on affiche une erreur
  showError(true);
}
        }
    }

	/*Cette fonction lit la database à partir du nom de la ville login et return le tableau*/ 

async function Read(login) {

	/*Permet de récupérer les données */ 
	const docRef = doc(db, "City", login);
	const docSnap = await getDoc(docRef);
	/* Définit les array dans lequelles les données vont être stockées*/ 
	const idArray = []
	const dataArray = []
	/*Si les données existent, permet de lister les id des parcours disponibles dans la ville donnée*/ 
	if (docSnap.exists()) {
	  const data = docSnap.data();
	  const [cleanarray] = Object.values(data)
	  for (const value of cleanarray) {
		const id = String(value)
		const count = idArray.push(id)
	  }
  
	} else {
	  // doc.data() will be undefined in this case
	  console.log("No such document!");
	}
	/*pour chaque parcours existant dans la ville et donc listé dans idArray, on récupère les données et on les return dans un format exploitable*/ 
  for (const element of idArray){
	const test = element;
	const docRef2 = doc(db, "Routes", test);
	const docSnap2 = await getDoc(docRef2);
	const data2 = docSnap2.data();
	
	const datajson = JSON.stringify(data2, null, 2)
	const objx = JSON.parse(datajson);
  
	dataArray.push(objx)
  }
  
  return(dataArray)
  };
  
  
  /*Reader est un composant qui permet d'afficher le tableau lui-même à partir des données récupérées dans Read*/ 
  const Reader = ({cname}) => {
  /*On déclare un array et un booléen pour stocker les data extraites par Read et gérer l'asynchronisation*/ 
  const [dataread, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
	
	React.useEffect(() => {
  
	  const fetchUserData = async () => {
		/*On set Loading à true en attendant la réponse de la fonction async*/ 
		setLoading(true);
		const response = await Read(cityName).then((value) => {
		const objx = value
		/*on stocke la data dans dataread et on passe Loading à false pour indiquer que les données sont bien définies*/ 
		setData(value)
		setLoading(false)
	})
	
	  };
	  /*On appelle la fonction précédemment créée*/ 
	  fetchUserData();
	  
	  
	}, []);
  /*Si Loading est true, on doit attendre le retour des données qui sont en train de charger avec await Read()*/ 

	if (loading) return <p>Loading...</p> 

	else {
	/*Sinon on crée le tableau */ 
	return ( <table>
		<thead>
		  <tr>
			<th>ID </th>
			<th>City name </th>
			<th>Route name </th>
			<th>Number of sessions </th>
			{/* <th>Number of trees planted</th> */}
		  </tr>
		</thead>
		<tbody>
		{/*Pour chaque item de dataread on lit les values et on les affiche sur une ligne */ }
		{dataread.map(item => (
		  
			<tr>
			  <td>{ item.id }</td>
			  {console.log(item.nameCity)}
			  <td>{ item.nameCity }</td>
			  <td>{ item.nameRoute}</td>
			  <td>{ item.nbrSessions }</td>
			</tr>
		))}
		</tbody>
	  </table>
);}}
  
	  
    
		

	// rendu html
	return (
		<div className='fullHeight'>
			{/* (1ère cond, if) condition de démarrage de la session, showTest doit être == true */}
			{ showTest ? (
				<div className=''>

				
							<h4 className='mt-4'>Vos statistiques pour le 1er trimestre 2023</h4>
							
							{/* Création de notre tableau de réponses comme 
							données (utiliser un dimensionnement en % pour du responsive) */}
							
							<React.StrictMode>
							<Reader cname={cityName}/>
							</React.StrictMode>				
						</div>
					

			// (1ère cond, else)  si la session n'a pas commencé on reste sur l'affichage de démarrage 
			) : (
				<>
				{/* <img src={} width="35%" height='45%' className='mt-1 mb-5' alt=""/><br/> */}
				<form onSubmit={startTest}>
					<div className="col  mb-3 mt-3 text-center">

					<input className="form-control form-control-lg m-auto input-quizz" 
						placeholder="Votre ville" type="text" name="city_name" required />

					<input className="form-control form-control-lg m-auto mt-3 input-quizz" 
						placeholder="Votre mot de passe" type="text" name="city_password" required />
					

					{/* message d'erreur si la ville n'est pas enregistrée */}
					<p className={(errorForm) ? "msgError" : 'hide-error'}> Nous sommes désolés mais les statistiques de votre ville ne semblent pas accessibles. N'hésitez pas à nous contacter par mail et nous résoudrons ce problème au plus vite.</p>
					
					
					{/* bouton d'envoi du formulaire */}
					<button type="submit" className="btn btn-danger mt-3 btn-lg orange">Accéder à vos statistiques</button>
					</div>
				</form>	
				</>
			)}
		</div>
	);



}

