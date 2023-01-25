/* ---------------------------------------------- */
/* -- Composant de création du quizz et du graphe-*/
/* ---------------------------------------------- */



import Cookies from 'js-cookie'
import Modal from 'react-modal';

import 'react-toastify/dist/ReactToastify.css';
import { exportAsPicture, roundToTwo } from './Utils';
import { ToastContainer, toast } from 'react-toastify';

import Table1 from '../components/Table';
import Read from '../components/Read';
import Reader from '../components/TestAsync';
import { db } from '../config/firebase';
import { collection, query, getDocs, getDoc, doc, setDoc, where, Timestamp } from "firebase/firestore";
import React, {useState, Component } from 'react';
import ReactDOM from 'react-dom/client';
import { useTable } from 'react-table'


export default function Table() {


	/* Déclaration d'Hooks permettant de mettre à 
	jour dynamiquement les composants [variable, fonction de maj] */

	// nom du parcours
    const [routeName, setrouteName] = useState(0);
	// booléen d'affichage du graphe des résultats
    const [showChart, setChart] = useState(false);
	// booléen d'affichage du tableau
	const [showTest, setTable] = useState(false);
	// message d'erreur
	const [errorForm, showError] = useState(false);
	// mot de passe, global
	const [cityPassword, setCityPassword] = useState("");
	// nom de la ville, global
	const [cityName, setCityName] = useState("");


	// Vérification puis lancement du test
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
		
		// si la ville existe on procède
		if (docSnap.exists()) {
			// globalise les données du formulaire pour plus tard
			setCityName(city_name)
			setCityPassword(city_password)
			
			//on commence la session
			setTable(true)
			showError(false)
			setChart(true)
			

		}
		
		// si la ville n'existe pas on affiche une erreur
		else showError(true)

	}


	

async function Read(login) {

	const docRef = doc(db, "City", login);
	const docSnap = await getDoc(docRef);
	
	const idArray = []
	const dataArray = []
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
  
  
  const Reader = ({cname}) => {
  
  const [dataread, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
	
	React.useEffect(() => {
  
	  const fetchUserData = async () => {
		setLoading(true);
		const response = await Read(cityName).then((value) => {
		const objx = value
		setData(value)
		setLoading(false)
		  /* const arrayArray = []
		  for (const element of objx){
		  const body = Object.values(element);
		  arrayArray.push(body)
		  }
		return(arrayArray) */
	})
		  /* const datajson1 = JSON.stringify(response, null, 2)
		  const dataread = JSON.parse(datajson1); */
		  
	  };
	
	  fetchUserData();
	  
	  
	}, []);
  
	if (loading) return <p>Loading...</p> 
	else {
	
	const Maps1 = dataread.splice(0,1)
	const data = Maps1[0]
	console.log(data)
	const columns = React.useMemo(

		() => [
   
		  {
   
			Header: 'City Name',
   
			accessor: 'cityName', // accessor is the "key" in the data
   
		  },
   
		  {
   
			Header: 'Route Name',
   
			accessor: 'routeName',
   
		  },
		  {
   
			Header: 'Number of sessions',
   
			accessor: 'nbrSessions',
   
		  },
   
		],
   
		[]
   
	  )
	  

	  const {

		getTableProps,
   
		getTableBodyProps,
   
		headerGroups,
   
		rows,
   
		prepareRow,
   
	  } = useTable({ columns, data })

	if (typeof data !== 'undefined') {
	return ( <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>

	<thead>

	  {headerGroups.map(headerGroup => (

		<tr {...headerGroup.getHeaderGroupProps()}>

		  {headerGroup.headers.map(column => (

			<th

			  {...column.getHeaderProps()}

			  style={{

				borderBottom: 'solid 3px red',

				background: 'aliceblue',

				color: 'black',

				fontWeight: 'bold',

			  }}

			>

			  {column.render('Header')}

			</th>

		  ))}

		</tr>

	  ))}

	</thead>

	<tbody {...getTableBodyProps()}>

	  {rows.map(row => {

		prepareRow(row)

		return (

		  <tr {...row.getRowProps()}>

			{row.cells.map(cell => {

			  return (

				<td

				  {...cell.getCellProps()}

				  style={{

					padding: '10px',

					border: 'solid 1px gray',

					background: 'papayawhip',

				  }}

				>

				  {cell.render('Cell')}

				</td>

			  )

			})}

		  </tr>

		)

	  })}
	</tbody>
  </table>);
  
	  }
    }  };
		

	// rendu html
	return (
		<div className='fullHeight'>
			{/* (1ère cond, if) condition de démarrage du test, showTest doit être == true */}
			{ showTest ? (
				<div className=''>

				
							<h4 className='mt-4'>Vos statistiques </h4>
							
							{/* Création de notre graphique avec notre tableau de réponses comme 
							données (utiliser un dimensionnement en % pour du responsive) */}
							
							<React.StrictMode>


							<Reader cname={cityName}/>
							

							</React.StrictMode>				
						</div>
					

			// (1ère cond, else)  si le test n'a pas commencé on reste sur l'affichage de démarrage du quizz
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

