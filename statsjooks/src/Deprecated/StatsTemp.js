/* ---------------------------------------------------------------------- */
/* -- Composant de lecture et d'affichage des stats pour le client -*/
/* ---------------------------------------------- ------------------------*/

import 'react-toastify/dist/ReactToastify.css';
import { db } from '../config/firebase';
import { getDoc, doc, getDocs, collection } from "firebase/firestore";
import React, {useState} from 'react';
import { citysuggester } from '../components/CitySuggester';
import { Link } from 'react-router-dom';
import footstatsImage from '../imgs/footstats.png';
import BossStats from './BossStats';

const routeCache = {};

export default function Table() {

  

	/* Déclaration d'Hooks permettant de mettre à 
	jour dynamiquement les composants [variable, fonction de maj] */

	// booléen d'affichage du menu de choix 
    const [showChoice, setChoice] = useState(false);
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

  // Add a new state to manage the selection
  const [queryType, setQueryType] = useState('city'); // 'city' or 'sponsor'



	/*Cette fonction lance la session de statistiques, vérifie que la ville existe dans la BDD et le mot de passe (a modifier)*/ 
	async function startTest (e) {

		// Empêche le rafraîchissement de page
		e.preventDefault();

		// récupération des données du formulaire
		const formData = new FormData(e.target);
		const formProps = Object.fromEntries(formData);
		let { city_name, city_password } = formProps

		const collectionName = queryType === 'city' ? "City" : "Sponsors";
		// Check de l'existence de la ville dans notre bdd
		const docRef = doc(db, collectionName, city_name);
		const docSnap = await getDoc(docRef);
		const docRef2 = doc(db, "Password", city_password);
		const docSnap2 = await getDoc(docRef2);
		
    console.log("Current queryType on form submit:", queryType);

		// si la ville existe on procède
		if (docSnap.exists() && docSnap2.exists() ) {
			// globalise les données du formulaire pour plus tard
			setCityName(city_name)
			setCityPassword(city_password)

			// Display the menu buttons
			showError(false);
			setTable(true);
			
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
		const suggestedCity = await citysuggester(city_name, collectionName);

// Si une ville similaire est trouvée, on propose à l'utilisateur de continuer avec cette ville
if (suggestedCity !== null) {
  if (window.confirm(`Did you want to say  ${suggestedCity} ?`)) {
    city_name = suggestedCity;

    setCityName(city_name);
    setCityPassword(city_password);

    setTable(true);
    showError(false);
    
  }
  else {
	// Sinon, on affiche une erreur
	showError(true);
  }
}
}

}

/*Cette fonction lit la database à partir du nom de la ville login et return le tableau*/ 

async function Read(login, year, quarter, yearAnnual) {
  const collectionName = queryType === 'city' ? "City" : "Sponsors";
		// Check de l'existence de la ville dans notre bdd
	const docRef = doc(db, collectionName, login);
  console.log(collectionName)
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
      const data = docSnap.data();
      const { Routes } = data;
      const dataArray = [];

      for (const routeId of Routes) {
          let routeData;

          if (!routeCache[routeId]) {
              // Fetch the route data and all its statistics
              const routeDocRef = doc(db, "Routes", routeId);
              const routeDocSnap = await getDoc(routeDocRef);

              if (routeDocSnap.exists()) {
                  routeData = routeDocSnap.data();
                  const statsCollectionRef = collection(db, "Routes", routeId, "statistics");
                  const statsSnapshot = await getDocs(statsCollectionRef);
                  
                  routeData.statistics = {};
                  statsSnapshot.forEach(doc => {
                      routeData.statistics[doc.id] = doc.data();
                  });

                  // Store the complete route data in the cache
                  routeCache[routeId] = routeData;
              } else {
                  console.log(`No route document for routeId: ${routeId}`);
                  continue;
              }
          } else {
              // Use the cached data
              routeData = routeCache[routeId];
          }

          // Process and add the data to dataArray
          // let length = routeData.Length || 3000; // Default to 0 if Length is not set
          let length = routeData.Length !== undefined && routeData.Length !== null ? 
             (routeData.Length >= 1000 ? routeData.Length : 1000) : 3000;

          let nbrsessions = routeData.statistics[`${quarter}_${year}`]?.nbrSessions || 0;
          // let yearAnnual = 2022
          let nbrsessionsannual = routeData.statistics[`AnnualStats${yearAnnual}`]?.nbrSessionsAnnual || 0;
          

          const quarterStatKey = `${quarter}_${year}`;
          const annualStatKey = `AnnualStats${yearAnnual}`;
          console.log(annualStatKey)

          if (routeData.statistics && routeData.statistics[quarterStatKey]) {
              nbrsessions = routeData.statistics[quarterStatKey].nbrSessions || 0;
          }

          if (routeData.statistics && routeData.statistics[annualStatKey]) {
              nbrsessionsannual = routeData.statistics[annualStatKey].nbrSessionsAnnual || 0;
          }

          // Applying the factor (assuming this is some kind of conversion or calculation)
          const factor = 2.5;
          nbrsessions = Math.floor(nbrsessions * factor);
          nbrsessionsannual = Math.floor(nbrsessionsannual * factor);

          // Pushing the combined data to dataArray
          dataArray.push({
            id: routeId,
            nameCity: routeData.nameCity,
            nameRoute: routeData.nameRoute,
            nbrSessions: nbrsessions,
            nbrSessionsAnnual: nbrsessionsannual,
            length:length
        });
    }

    dataArray.sort((a, b) => a.id.localeCompare(b.id));
    return dataArray;
} else {
    console.log("No such document!");
    return [];
}
}

  
  
  
  /*Reader est un composant qui permet d'afficher le tableau lui-même à partir des données récupérées dans Read*/ 
  const Reader = ({cname}) => {
  /*On déclare un array et un booléen pour stocker les data extraites par Read et gérer l'asynchronisation*/ 
  const [dataread, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  //const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear()); // default to current year
  const [selectedYear, setSelectedYear] = React.useState(2023); // default to current year
  const [selectedYearAnnual, setSelectedYearAnnual] = React.useState(2023);
  const [selectedQuarter, setSelectedQuarter] = React.useState('Q2'); // default to Q1
	// New state for progress bar
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
      const fetchUserData = async () => {
          setLoading(true);
          setProgress(20); // Initial progress

          // Simulate gradual increase in progress
          const interval = setInterval(() => {
              setProgress(oldProgress => {
                  const newProgress = oldProgress + 10;
                  return newProgress > 80 ? 80 : newProgress;
              });
          }, 1000); // Adjust the interval time as needed

          try {
            
            const response = await Read(cityName, selectedYear, selectedQuarter, selectedYearAnnual, queryType);

              setData(response);
          } catch (error) {
              console.error("Error fetching data: ", error);
              // Handle error
          } finally {
              clearInterval(interval);
              setProgress(100); // Complete progress after loading
              setLoading(false);
          }
      };

      fetchUserData();
  }, [selectedYear, selectedQuarter, cityName, selectedYearAnnual]);

  if (loading) {
      return (
          <div>
              <div className="progressBar">
                  <div className="progress" style={{width: `${progress}%`}}>{progress}%</div>
              </div>
              <p>Loading...</p>
          </div>
      );
  }
	  
	  else {
		if (showChoice === false) {
          return (
            <div className="">
        <button
          className={`btn btn-primary mt-3 mr-3 gotham-rounded-bold ${selectedMenuOption === "quarterly" ? "active" : ""}`}
          onClick={() => {
            setSelectedMenuOption("quarterly");
            setChoice(true);
          }}
        style={{ backgroundColor: "#57C528" , border: "none" }}
        >
          Quarterly statistics
        </button>
        <button
          className={`btn btn-primary mt-3 ml-7 gotham-rounded-bold ${selectedMenuOption === "annual" ? "active" : ""}`}
          onClick={() => {
            setSelectedMenuOption("annual");
            setChoice(true);
            
          }}
        style={{ marginLeft: "20px", backgroundColor: "#57C528" , border: "none" }}
        >
          Annual statistics
        </button>
      </div>
      );

		} else {
			if (dataread.length === 0) {
				return (
					<div>
						{/* Insert your scrolling menu code here */}
						<p>Sorry, this data is unavailable for the time being, please select another option. Please do not hesitate to contact our data specialist at laure.gicquel@mile.eu.com for more information.</p>
						<button className="btn btn-primary mt-3 mb-3 gotham-rounded-bold" style={{backgroundColor: "#57C528" , border: "none"}} onClick={() => setSelectedMenuOption("annual")}>
   
    Annual statistics

  </button>   
  <div>
  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
    
    <option value="2023">2023</option>
    <option value="2022">2022</option>
    
    {/* <option value="2024">2024</option> Add more years if needed */}
  </select>

  <select value={selectedYearAnnual} onChange={(e) => setSelectedYearAnnual(e.target.value)}>
    <option value="2023">2023</option>
    <option value="2022">2022</option>
    {/*<option value="2021">2021</option>*/}
    {/* Add more years if needed */}
  </select>

  <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
    <option value="Q1">Q1</option>
    <option value="Q2">Q2</option>
    <option value="Q3">Q3</option>
    <option value="Q4">Q4</option>
  </select>
</div>

					</div>
				);
			} 
			else {
		  if (selectedMenuOption === "quarterly") {
			
			return (
				<div>
  <div>
  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
  <option value="2024">2024</option>
    <option value="2023">2023</option>
    <option value="2022">2022</option>
    {/*<option value="2022">2022</option>
     <option value="2021">2021</option> */}
    {/* Add more years if needed */}
  </select>

  <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
    <option value="Q1">Q1</option>
    <option value="Q2">Q2</option>
    <option value="Q3">Q3</option>
    <option value="Q4">Q4</option> 
  </select>
</div>

<h4 className="mt-5 mb-5 gotham-rounded-bold" style={{ color: "#57c528" , border: "none"}}>
  Your statistics for {selectedQuarter} {selectedYear}
</h4>

  <table>
    <thead>
      <tr>
        <th className="table_header" style={{ width: "10%" }}>
          ID
        </th>
        <th className="table_header" style={{ width: "25%" }}>
          City name
        </th>
        <th className="table_header" style={{ width: "25%" }}>
          Route name
        </th>
        <th className="table_header" style={{ width: "20%" }}>
          Number of sessions
        </th>
        <th className="table_header" style={{ width: "20%" }}>
          Number of trees planted
        </th>
      </tr>
    </thead>
    <tbody>
      {/* Pour chaque item de dataread on lit les values et on les affiche sur une ligne */}
      {dataread.map((item) => (
        <tr>
          <td className="table_body">{item.id}</td>
          <td className="table_body">{item.nameCity}</td>
          <td className="table_body">{item.nameRoute}</td>
          <td className="table_body">{Math.floor(item.nbrSessions)}</td>
          <td className="table_body">
          {Math.floor((item.nbrSessions * (item.length * 0.75 / 1000)) / 100)}
          </td>
        </tr>
      ))}
      {/* Add the row with the total */}
      <tr>
        <td className="table_body" style={{ fontWeight: "bold" }}>Total</td>
        <td className="table_body"></td>
        <td className="table_body"></td>
        <td className="table_body" style={{ fontWeight: "bold" }}>
          {dataread.reduce((acc, item) => acc + Math.floor(item.nbrSessions), 0)}
        </td>
        <td className="table_body" style={{ fontWeight: "bold" }}>
          {dataread.reduce((acc, item) => acc + Math.floor((item.nbrSessions * (item.length * 0.75 / 1000)) / 100), 0)}
        </td>
      </tr>
    </tbody>
  </table>
  <div style={{ marginTop: '20px' }}>
	    {/* add margin to the button */}
		<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
  <button className="btn btn-primary mt-3 gotham-rounded-bold" style={{backgroundColor: "#57C528" , border: "none"}} onClick={() => setSelectedMenuOption("annual")}>
    Annual statistics
  </button>
  
  <button className="btn btn-primary mt-3 gotham-rounded-bold" style={{backgroundColor: "#57C528" , border: "none"}} onClick={() => setTable(false)}>
    Logout
  </button>
</div>

	<div className="image-container">
    <img src={footstatsImage} style= {{ marginTop : '42px' }} alt="Footstats placeholder"/>
  </div>
  </div>
			  </div>
			);
		  } 
		  else if (selectedMenuOption === "annual") { 
			return (
        

			<div><h4 className="mt-5 mb-5 gotham-rounded-bold" style={{ color: "#57c528" }}>
				  Your statistics for {selectedYearAnnual}
				</h4>

        
  <select value={selectedYearAnnual} onChange={(e) => setSelectedYearAnnual(e.target.value)}>
    <option value="2023">2023</option>
    <option value="2022">2022</option>
    {/*<option value="2021">2021</option>*/}
    {/* Add more years if needed */}
  </select>

			<table>
				
			  <thead>
				
				<tr>
				  <th className="table_header" style={{ width: "10%" }}>
					ID
				  </th>
				  <th className="table_header" style={{ width: "25%" }}>
					City name
				  </th>
				  <th className="table_header" style={{ width: "25%" }}>
					Route name
				  </th>
				  <th className="table_header" style={{ width: "20%" }}>
					Number of sessions
				  </th>
				  <th className="table_header" style={{ width: "20%" }}>
					Number of trees planted
				  </th>
				</tr>
			  </thead>
			<tbody>
			{/* Pour chaque item de dataread on lit les values et on les affiche sur une ligne */}
			{dataread.map((item) => (
			  <tr>
				<td className="table_body">{item.id}</td>
				<td className="table_body">{item.nameCity}</td>
				<td className="table_body">{item.nameRoute}</td>
				<td className="table_body">{Math.floor(item.nbrSessionsAnnual)}</td>
				<td className="table_body">
        {Math.floor((item.nbrSessionsAnnual * (item.length * 0.75 / 1000)) / 100)}
				</td>
			  </tr>
			))}
			{/* Add the row with the total */}
			<tr>
        <td className="table_body" style={{ fontWeight: "bold" }}>Total</td>
        <td className="table_body"></td>
        <td className="table_body"></td>
        <td className="table_body" style={{ fontWeight: "bold" }}>
          {dataread.reduce((acc, item) => acc + Math.floor(item.nbrSessionsAnnual), 0)}
        </td>
        <td className="table_body" style={{ fontWeight: "bold" }}>
          {dataread.reduce((acc, item) => acc + Math.floor((item.nbrSessionsAnnual * (item.length * 0.75 / 1000)) / 100), 0)}
        </td>
      </tr>
		  </tbody>
		</table>
		<div style={{ marginTop: '20px' }}>
			{/* add margin to the button */}
			<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
  <button className="btn btn-primary mt-3 gotham-rounded-bold" style={{backgroundColor: "#57C528" , border: "none"}}  onClick={() => setSelectedMenuOption("quarterly")}>
    Quarterly statistics
  </button>
  <button className="btn btn-primary mt-3 gotham-rounded-bold" style={{backgroundColor: "#57C528" , border: "none"}} onClick={() => setTable(false)}>
    Logout
  </button>
</div>
    
	<div className="image-container">
    <img src={footstatsImage} style= {{ marginTop : '42px' }} alt="Footstats placeholder"/>
  </div>
  </div>
		</div>
	  );
	}}
}
}}

	// rendu html
	return (
		<div className='fullHeight'>
			{/* (1ère cond, if) condition de démarrage de la session, showTest doit être == true */}
			{ showTest ? ( 
				<div className=''>
							
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
					{/* Texte d'introduction */}
					<div className="col mb-3 mt-3 text-center" style={{ margin: "20px" }}>
          <h2 className='title' style={{ margin: "60px" }}>Login to access the statistics of your JOOKS routes ! Every three months, we will upload the statistics of your routes on this platform, so you can access them at any time.</h2>        
            {/* <p className="mt-3 mb-4 txt-intro">
              Every three months
            </p>  */}
          </div>
					<div className="col  mb-3 mt-3 text-center">

					<input className="form-control form-control-lg m-auto input-quizz" 
						placeholder="Your city or sponsor brand" type="text" name="city_name" required />

					<input className="form-control form-control-lg m-auto mt-3 input-quizz" 
						placeholder="Your password" type="text" name="city_password" required />
					

          <h5 style={{ margin: "60px" }}>Please specify if you are a sponsor or a city before proceeding.</h5>        

          <select 
  value={queryType} 
  onChange={(e) => setQueryType(e.target.value)}
  style={{ marginTop: '20px' }} // Adjusts the top margin to lower the select box in the UI
>
  <option value="city">City</option>
  <option value="sponsor">Sponsor</option>
</select>







					{/* message d'erreur si la ville n'est pas enregistrée */}
					<p className={(errorForm) ? "msgError" : 'hide-error'}> We are sorry, but the statistics for your city do not seem to be available. Please contact us by email and we will solve this problem as soon as possible.</p>
					{/* message d'erreur si le mot de passe est mauvails*/}
					<p className={(errorForm2) ? "msgError" : 'hide-error'}> It seems there is a mistake in your password. Please enter it again or contact us. </p>
					
					
					{/* bouton d'envoi du formulaire */}
					<button type="submit" className="btn btn-danger mt-0 btn-lg " style={{backgroundColor: "#57C528", border: "none" }}>Access your statistics</button>
					</div>
				</form>	
				</>
			)}
		</div>
	);




}
