/* ---------------------------------------------- */
/* -- Composant de création du quizz et du graphe-*/
/* ---------------------------------------------- */

// Imports pratiques
import React, { useState, useEffect } from 'react';
import {ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis} from "recharts";

// imports des tableaux de données statiques
import  {questions, legends, answerOptions } from '../config/datas_quizz.js';

// imports de la config firebase
import { db } from '../config/firebase';
import { collection, query, getDocs, getDoc, doc, setDoc } from "firebase/firestore";

import Cookies from 'js-cookie'
import Modal from 'react-modal';

import 'react-toastify/dist/ReactToastify.css';
import { exportAsPicture, roundToTwo } from './Utils';
import { ToastContainer, toast } from 'react-toastify';


  const Firestore = () => {
	    const [name  , Setname] = useState("");
	    const [age , Setage] = useState("");
	    const [course , Setcourse] = useState("");
	    const sub = (e) => {
	        e.preventDefault();
	         
	        // Add data to the store
	        db.collection("data").add({
	            Nane: name,
	            Age: age,
	            CourseEnrolled: course
	        })
	        .then((docRef) => {
	            alert("Data Successfully Submitted");
	        })
	        .catch((error) => {
	            console.error("Error adding document: ", error);
	        });
	    }
	 
	    return (
	        <div>
	            <center>
	                <form style={{marginTop:"200px" }}
	                  onSubmit={(event) => {sub(event)}}>
	                    <input type="text" placeholder="your name"
	                      onChange={(e)=>{Setname(e.target.value)}} />
	                      <br/><br/>
	                    <input type="number" placeholder="your age"
	                      onChange={(e)=>{Setage(e.target.value)}}/>
	                      <br/><br/>
	                    <input type="text" placeholder="Course Enrolled"
	                      onChange={(e)=>{Setcourse(e.target.value)}}/>
	                      <br/><br/>
	                    <button type="submit">Submit</button>
	                </form>
	            </center>
	        </div>
	    );
	}
	 
	export default Firestore;