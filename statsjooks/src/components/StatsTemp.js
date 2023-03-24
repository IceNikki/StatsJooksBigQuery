/* ---------------------------------------------------------------------- */
/* -- Composant de lecture et d'affichage des stats pour le client -*/
/* ---------------------------------------------- ------------------------*/

import 'react-toastify/dist/ReactToastify.css';
import { db } from '../config/firebase';
import { getDoc, doc } from "firebase/firestore";
import React, {useState} from 'react';
import { citysuggester } from '../components/CitySuggester';
import { Link } from 'react-router-dom';
export default function Table() {


	/* Déclaration d'Hooks permettant de mettre à 
	jour dynamiquement les composants [variable, fonction de maj] */

	// booléen d'affichage du graphe 
    const [showChart, setChart] = useState(false);
	// booléen d'affichage du tableau
	const [showTest, setTable] = useState(false);
	// message d'erreur
	const [errorForm, showError] = useState(false);
	// message d'erreur
	const [errorForm2, showError2] = useState(false);
	// mot de passe, global
	const [cityPassword, setCityPassword] = useState("");
	// nom de la ville, global
	const [cityName, setCityName] = useState("");
	// User choice of stats
	const [selectedMenuOption, setSelectedMenuOption] = useState(null);



	/*Cette fonction lance la session de statistiques, vérifie que la ville existe dans la BDD et le mot de passe (a modifier)*/ 
	async function startTest (e) {

		// Empêche le rafraîchissement de page
		e.preventDefault();

		// récupération des données du formulaire
		const formData = new FormData(e.target);
		const formProps = Object.fromEntries(formData);
		let { city_name, city_password } = formProps

			 
		// Check de l'existence de la ville dans notre bdd
		const docRef = doc(db, "City", city_name);
		const docSnap = await getDoc(docRef);
		const docRef2 = doc(db, "Password", city_password);
		const docSnap2 = await getDoc(docRef2);
		console.log(docSnap2)
		// si la ville existe on procède
		if (docSnap.exists() && docSnap2.exists() ) {
			// globalise les données du formulaire pour plus tard
			setCityName(city_name)
			setCityPassword(city_password)
			
			//on commence la session
			setSelectedMenuOption("quarterly"); // set the default menu option
			setTable(false); // hide the login form and table

			setTable(true)
			showError(false)
			setChart(true)
		}
		else if (docSnap.exists() && !docSnap2.exists() ) {
			// code for incorrect password
			// Sinon, on affiche une erreur
			showError2(true);
		  }
		  else if (!docSnap.exists() && !docSnap2.exists() ) {
			// code for incorrect password
			// Sinon, on affiche une erreur
			showError2(true);
		  }
		else if (!docSnap.exists() && docSnap2.exists() ){
		// Si la ville n'existe pas, on appelle citysuggester pour proposer une ville similaire
		const suggestedCity = await citysuggester(city_name);

// Si une ville similaire est trouvée, on propose à l'utilisateur de continuer avec cette ville
if (suggestedCity !== null) {
  if (window.confirm(`Did you want to say  ${suggestedCity} ?`)) {
    city_name = suggestedCity;

    setCityName(city_name);
    setCityPassword(city_password);

    setTable(true);
    showError(false);
    setChart(true);
  }
  else {
	// Sinon, on affiche une erreur
	showError(true);
  }
}
}

	}


	/*Cette fonction lit la database à partir du nom de la ville login et return le tableau*/ 

	async function Read(login) {
		console.log(login)
		const docRef = doc(db, "City", login);
		const docSnap = await getDoc(docRef);
		
		if (docSnap.exists()) {
		  const data = docSnap.data();
		  const { Routes } = data;
		  const dataArray = [];
		
		  for (const routeId of Routes) {
			const routeDocRef = doc(db, "Routes", routeId);
			const routeDocSnap = await getDoc(routeDocRef);
		
			if (routeDocSnap.exists()) {
			  const routeData = routeDocSnap.data();
			  let nbrsessions = routeData.nbrSessions;
			  let nbrsessionsannual = routeData.nbrSessionsAnnual;
			  if (isNaN(nbrsessionsannual)) {
				nbrsessionsannual = 0;
			  } else {    
				/*on vérifie que la valeur est bien un entier*/
				nbrsessions = Number(nbrsessions);
				nbrsessionsannual = Number(nbrsessionsannual);
				// On multiplie la valeur par un facteur pour avoir un nombre de sessions plus réaliste
				const factor = 2.5;
				nbrsessions *= factor;
				nbrsessionsannual *= factor;
				nbrsessions = Math.floor(nbrsessions);
				nbrsessionsannual = Math.floor(nbrsessionsannual);
				console.log("Value:", nbrsessions);}
				console.log("Value:", nbrsessionsannual);
			  dataArray.push({
				id: routeData.id,
				nameCity: routeData.nameCity,
				nameRoute: routeData.nameRoute,
				nbrSessions: nbrsessions,
				nbrSessionsAnnual: nbrsessionsannual
			  });
			}
		  }
		
		  return dataArray;
		} else {
		  console.log("No such document!");
		  return [];
		}
	  }
  
  
  /*Reader est un composant qui permet d'afficher le tableau lui-même à partir des données récupérées dans Read*/ 
  const Reader = ({cname, menuOption}) => {
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
		// ...
		if (menuOption === "quarterly") {
		  // render the quarterly table
		  return ( <table>
			<thead>
			  <tr>
			  <th className='table_header' style={{width: '10%'}}>ID</th>
				<th className='table_header'  style={{width: '25%'}}>City name</th>
			<th  className='table_header' style={{width: '25%'}}>Route name</th>
			<th  className='table_header'style={{width: '20%'}}>Number of sessions</th>
			<th className='table_header' style={{width: '20%'}}>Number of trees planted</th>
				{/* <th>Number of trees planted</th> */}
			  </tr>
			  
			</thead>
			<tbody>
			{/*Pour chaque item de dataread on lit les values et on les affiche sur une ligne */ }
			{dataread.map(item => (
			  
				<tr>
				  <td className='table_body'>{ item.id }</td>
				  {console.log(item.nameCity)}
				  <td className='table_body'>{ item.nameCity }</td>
				  <td className='table_body'>{ item.nameRoute}</td>
				  <td className='table_body'>{ Math.floor(item.nbrSessions) }</td>
				  <td className='table_body'>{ Math.floor(item.nbrSessions / 20) }</td>
				</tr>
			))}
			{/* Button to go back to root page */}
			<Link to="/" className="btn btn-primary mt-3" style={{ width: '100px', backgroundColor: '#0C243C' }}>
	  <span className="gotham-rounded-bold">Logout</span>
	</Link>
	
			</tbody>
		  </table>
	);}
	  
		 else if (menuOption === "annual") {
		  // render the annual table
	return ( <table>
		<thead>
		  <tr>
		  <th className='table_header' style={{width: '10%'}}>ID</th>
   		 <th className='table_header'  style={{width: '25%'}}>City name</th>
    	<th  className='table_header' style={{width: '25%'}}>Route name</th>
    	<th  className='table_header'style={{width: '20%'}}>Number of sessions</th>
		<th className='table_header' style={{width: '20%'}}>Number of trees planted</th>
			{/* <th>Number of trees planted</th> */}
		  </tr>
		  
		</thead>
		<tbody>
		{/*Pour chaque item de dataread on lit les values et on les affiche sur une ligne */ }
		{dataread.map(item => (
		  
			<tr>
			  <td className='table_body'>{ item.id }</td>
			  {console.log(item.nameCity)}
			  <td className='table_body'>{ item.nameCity }</td>
			  <td className='table_body'>{ item.nameRoute}</td>
			  <td className='table_body'>{ Math.floor(item.nbrSessionsAnnual) }</td>
			  <td className='table_body'>{ Math.floor(item.nbrSessionsAnnual / 20) }</td>
			</tr>
		))}
		{/* Button to go back to root page */}
		<Link to="/" className="btn btn-primary mt-3" style={{ width: '100px', backgroundColor: '#0C243C' }}>
  <span className="gotham-rounded-bold">Logout</span>
</Link>

		</tbody>
	  </table>
);}}}
  
	  
    
		

	// rendu html
	return (
		<div className='fullHeight'>
			{/* (1ère cond, if) condition de démarrage de la session, showTest doit être == true */}
			{ showTest ? (
				<div className=''>

				
			<h4 className='mt-5 mb-5' style={{color: '#57c528'}}>Your statistics for the 1st quarter of 2023</h4>


							
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
						placeholder="Your city" type="text" name="city_name" required />

					<input className="form-control form-control-lg m-auto mt-3 input-quizz" 
						placeholder="Your password" type="text" name="city_password" required />
					

					{/* message d'erreur si la ville n'est pas enregistrée */}
					<p className={(errorForm) ? "msgError" : 'hide-error'}> We are sorry, but the statistics for your city do not seem to be available. Please contact us by email and we will solve this problem as soon as possible.</p>
					{/* message d'erreur si le mot de passe est mauvails*/}
					<p className={(errorForm2) ? "msgError" : 'hide-error'}> It seems there is a mistake in your password. Please enter it again or contact us. </p>
					
					
					{/* bouton d'envoi du formulaire */}
					<button type="submit" className="btn btn-danger mt-0 btn-lg orange">Access your statistics</button>
					</div>
				</form>	
				</>
			)}
		</div>
	);



}

