// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCb9A9r40oYRG8FttkY_w7WXiHfzZb0Mek",
  authDomain: "statsjooks.firebaseapp.com",
  databaseURL: "https://statsjooks-default-rtdb.firebaseio.com",
  projectId: "statsjooks",
  storageBucket: "statsjooks.appspot.com",
  messagingSenderId: "610531012392",
  appId: "1:610531012392:web:44c5c8f83e46e71918aa1d",
  measurementId: "G-PNG5KQ177X"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export { db }