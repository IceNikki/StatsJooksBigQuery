/* ----------------------------------------------- */
/*  Tableaux de données statiques pour notre quizz */
/* ----------------------------------------------- */

// Import des images des questions 
import imgGainage from '../imgs/fitness1.jpg';
import imgChaise from '../imgs/fitness2.jpeg';
import imgCaisson from '../imgs/fitness3.jpg';
import imgCroix from '../imgs/fitness3.jpg';


// tableau des questions du test, un ojet question = {un titre, la question en string et l'url de son image}
export const questions = [
	{ title: "Gainage standard", text: "Combien de temps tenez-vous en position de gainage ? ", img: imgGainage },
	{ title: "Chaise", text: "Et en position de chaise ? ", img: imgChaise },
	{ title: "Mains aux pieds", text: "En vous penchant vers le sol, debout sur un caisson, jambes tendues, atteignez-vous :", img: imgCaisson},
	{ title: "Coordination", text: "Combien de croix pouvez vous faire en sautant ?", img: imgCroix },
	{ title: "Endurance", text: "En courant ou en marchant vite, en navettes aller-retour, combien de mètres parcourez-vous en 3 minutes ?", img: imgCroix },
	{ title: "Détente verticale", text: "En sautant à pieds joint, le plus haut possible, quelle est la hauteur de votre saut ?", img: imgCroix },
	{ title: "Détente horizontale", text: "Quelle distance atteignez-vous en saut horizontal ?", img: imgCroix },
	{ title: "Equilibre", text: "Tenez-vous quinze secondes en équilibre  ?", img: imgCroix },
];

/* tableau 2D des réponses autorisées, chaque question possède son tableau de réponse
chaque sous-tableau inclus des objets de type réponse avec le titre, la question et le chemin de son image */
export const answerOptions = [ 
	// Question sur le gainage
	[{text: "30 secondes ou moins", value: "1"}, {text: "1 minute ou moins", value: "2"}, {text: "1 minute 30 ou moins", value: "3"}, {text: "2 minutes ou plus", value: "4"}],
	// Q Chaise
	[{text: "45 secondes ou moins", value: "1"}, {text: "1 minute 30 ou moins", value: "2"}, {text: "2 minutes 15 ou moins", value: "3"}, {text: "3 minutes ou plus", value: "4"}],
	// Q mains aux pieds
	[{text: "Le centre de vos tibias ou plus haut", value: "1"}, {text: "Vos chevilles", value: "2"}, {text: "Les pointes de vos pieds", value: "3"}, {text: "Plus bas que vos pieds", value: "4"}],
	// Q Endurance
	[{text: "4 croix", value: "1"}, {text: "6 croix", value: "2"}, {text: "8 croix", value: "3"}, {text: "10 croix", value: "4"}],
	[{text: "200 mètres", value: "1"}, {text: "400 mètres", value: "2"}, {text: "600 mètres", value: "3"}, {text: "800 mètres", value: "4"}],
	// Q Détente verticale
	[{text: "Homme: 21 cm ou moins --- Femme: 11 cm ou moins", value: "1"}, {text: "Homme: entre 31 et 40 cm --- Femme: entre 21 et 30 cm", value: "2"}, 
	 {text: "Homme: entre 51 et 60 cm --- Femme: entre 41 et 50 cm", value: "3"}, {text: "Homme: plus de 70 cm --- Femme: plus de 60cm", value: "4"}],
	// Q Détente horizontale
	[{text: "Homme: 21 cm ou moins --- Femme: 11 cm ou moins", value: "1"}, {text: "Homme: entre 31 et 40 cm --- Femme: entre 21 et 30 cm", value: "2"}, 
	 {text: "Homme: entre 51 et 60 cm --- Femme: entre 41 et 50 cm", value: "3"}, {text: "Homme: plus de 70 cm --- Femme: plus de 60cm", value: "4"}],
	// Q Equilibre
	 [{text: "Au sol sur un pied", value: "1"}, {text: "Sur le Bosu à deux pieds", value: "2"}, {text: "Sur le Bosu à un pied", value: "3"}, {text: "Sur la planche d'équilibre en bois", value: "4"}],
];

// tableau des légendes de chaque question du test pour le graphe
export const legends = [
	"Gainage",
	"Chaise",
	"Elasticité",
	"Coordination",
	"Endurance",
	"Dét verticale",
	"Dét horizontale",
	"Equilibre"
];

