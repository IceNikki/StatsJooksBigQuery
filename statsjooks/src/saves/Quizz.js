/* ---------------------------------------------- */
/* -- Composant de création du quizz et du graphe-*/
/* ---------------------------------------------- */

// Imports pratiques
import React, { useState } from 'react';
import {ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis} from "recharts";

// imports des tableaux de données statiques
import  {questions, legends, answerOptions } from '../config/datas_quizz.js';

// imports de la config firebase
import { db } from '../config/firebase';
import { arrayUnion, doc, updateDoc, getDoc} from "firebase/firestore";
import defaultGraphe from '../imgs/defaultGraphe.png';



export default function Quizz() {

    /* Déclaration d'Hooks permettant de mettre à 
	jour dynamiquement les composants [variable, fonction de maj] */

	// string de chaque question
    const [currentQuestion, setCurrentQuestion] = useState(0);
	// booléen d'affichage du graphe des résultats
    const [showChart, setChart] = useState(false);
	// booléen d'affichage du test
	const [showTest, setTest] = useState(false);
	// tableaux des réponses au test
	const [results, setResults] = useState([])
	// message d'erreur
	const [errorForm, showError] = useState(false)
	// nom du candidata, global
	const [candidateName, setCandName] = useState("")
	// nom de l'entreprise, global
	const [companyName, setCompName] = useState("")
	// nom de l'entreprise, global
	const [candidateMail, setCandMail] = useState("")


	// Vérification puis lancement du test
	async function startTest (e) {

		// Empêche le rafraîchissement de page
		e.preventDefault();

		// récupération des données du formulaire
		const formData = new FormData(e.target);
		const formProps = Object.fromEntries(formData);
		let { candidate_name, candidate_mail, etp_name } = formProps

			 
		// Check de l'existence de l'entreprise dans notre bdd
		const docRef = doc(db, "Company", etp_name);
		const docSnap = await getDoc(docRef);
		
		// si l'entreprise existe on procède
		if (docSnap.exists()){
			// globalise les données du formulaire pour plus tard
			setCandMail(candidate_mail)
			setCandName(candidate_name)
			setCompName(etp_name)
			//on commence le test
			setTest(true)
			showError(false)
		}
		
		// si elle n'existe pas on affiche une erreur
		else showError(true)
	}

	// fction asynchrone d'ajout des données du graphiques dans la bdd firebase
	async function addDataToDB(data) {

		// on ajoute le candidat et ses résultats dans la table companies à celle qui lui est affilié
		await updateDoc(doc(db, "Company", companyName), {
			candidats: arrayUnion({nom: candidateName,  resultats: data, mail: candidateMail})
		});
	}

	// fonction d'incrémentaion des questions du quizz et récupération de chaque réponse choisie
	function handleAnswer (answerSelected) {

		// incrémentation de l'index de la question
		const nextQuestion = currentQuestion + 1;
		// formatage de la réponse (on associe un nom à la réponse pour le graphe)
		let answerString = { nom: legends[currentQuestion], valeur: parseInt(answerSelected)}

		// on récupère le tableau de réponses
		let temp = results
		// pour ajouter la nouvelle réponse
		temp.push(answerString)
		setResults(temp)

		// changement de question 
		if (nextQuestion < questions.length)
			setCurrentQuestion(nextQuestion);

		// fin du test si on n'a plus de questions, on autorise l'affichage du graphique de résultat
		else {
			setChart(true)
			// on insère les résultats dans la firebase
			addDataToDB(results)
		}
	};

	// rendu html
	return (
		<div className='fullHeight'>
			{/* (1ère cond, if) condition de démarrage du test, showTest doit être == true */}
			{ showTest ? (
				<div className=''>

					{/* Si le test a commencé, on passe une seconde condition:
					(2ème cond, if) est-ce que toutes les questions ont été répondue? Oui, alors on affiche le graphe de résultats */}
					{showChart ? (
						<div className=''>
							<h4 className='mt-4'>Vos résultats</h4>
							
							{/* Création de notre graphique avec notre tableau de réponses comme 
							données (utiliser un dimensionnement en % pour du responsive) */}
							<ResponsiveContainer width="100%" minWidth={546} height={420}>
								<RadarChart  cx="52%" cy="55%" height={30} outerRadius="80%" data={results} >
									<PolarGrid />
									<PolarAngleAxis orientation='outer' dataKey="nom" />
									<PolarRadiusAxis/>
									
									{/* un profil est créé pour utiliser les données */}
									<Radar name="eiko" dataKey="valeur" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
								</RadarChart>
							</ResponsiveContainer>
						</div>
						
					//(2ème cond, else) Il reste des questions? Donc le test n'est pas fini, on continue alors
					) : (
						<>
							{/* container dynamique, les valeurs des composants changent selon la question */}
							<div className='row justify-content-md-center mt-4'>

								{/* Titre */}
								<h2 className='col col-sm-12 col-md-12 col-12 col-lg-12 title-quizz'>{questions[currentQuestion].title}</h2>
								{/* Question */}
								<p className=' col col-sm-12 col-md-12 col-12 col-lg-12 mt-3 quizz-question'>{questions[currentQuestion].text}</p>
								{/* Image */}
								<div className="col col-sm-12 col-md-12 col-12 col-lg-12 ">
								<img src={questions[currentQuestion].img} className="img-quizz"  alt=""/>
								</div>		
								<div className="col col-sm-12 col-md-12 col-12 col-lg-12 ">				
								{/* Réponses possibles à la question  */}
								{answerOptions[currentQuestion].map((answerOption, index) => (
									/* Sur chaque choix, on applique un listener de click, 
									en cliquant sur une réponse on passe à la suite et on enregistre le choix */
									<button className="btnAnswer" key={index} onClick={() => handleAnswer(answerOption.value)}>{answerOption.text}</button>
								))}	
								</div>		
							</div>
						</>
					)}
				</div>

			// (1ère cond, else)  si le test n'a pas commencé on reste sur l'affichage de démarrage du quizz
			) : (
				<>
				<img src={defaultGraphe} width="35%" height='45%' className='mt-1 mb-5' alt=""/><br/>
				<form onSubmit={startTest}>
					<div className="col  mb-3 mt-3 text-center">

					<input className="form-control form-control-lg m-auto input-quizz" 
						placeholder="Votre nom" type="text" name="candidate_name" required />

					<input className="form-control form-control-lg m-auto mt-3 input-quizz" 
						placeholder="Votre email" type="text" name="candidate_mail" required />
					
					<input type="checkbox" class="form-check-input" id="exampleCheck1"/>
    				<label class="form-check-label" for="exampleCheck1">En cochant cette case, j’accepte que la société Jooks collecte mes données de santé afin de me fournir un bilan de santé suite à la réalisation des exercices. Vous pouvez retirer votre consentement à tout moment en nous écrivant aux adresses mentionnées dans notre Politique de confidentialité. </label>	

				
					{/* message d'erreur si l'entreprise n'est pas enregistrée */}
					<p className={(errorForm) ? "msgError" : 'hide-error'}> Cette entreprise n'est pas enregistrée</p>
					<input className="form-control form-control-lg m-auto input-quizz" 
						placeholder="Nom de l'entreprise" type="text" name="etp_name" required />
					
					{/* bouton d'envoi du formulaire */}
					<button type="submit" className="btn btn-danger mt-3 btn-lg orange">Commencer le test</button>
					</div>
				</form>	
				</>
			)}
		</div>
	);
}