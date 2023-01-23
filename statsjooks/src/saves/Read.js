// Import Firestore database
import { db } from '../config/firebase';
import { collection, query, getDocs, getDoc, doc, setDoc, where } from "firebase/firestore";
import { useState } from 'react';

 
const Read = () => {
  
    const [info , setInfo] = useState([]);
 
    // Start the fetch operation as soon as
    // the page loads
    window.addEventListener('load', () => {
        Fetchdata();
      });
 
    // Fetch the required data using the get() method
    const Fetchdata = ()=>{
        db.collection("Routes").get().then((querySnapshot) => {
            
            // Loop through the data and store
            // it in array to display
            querySnapshot.forEach(element => {
                var data = element.data();
                setInfo(arr => [...arr , data]);
console.log(data)
                 
            });
        })
    }
     
    // Display the result on the page
    return (
        <div>
            <center>
            <h2>Routes</h2>
            </center>
         
        {
            info.map((data) => (
            <Frame city={data.City}
                   nbrRuns={data.nbrSessions}
                   routeName={data.nameRoute}/>
            ))
        }
        </div>
 
    );
}
 
// Define how each display entry will be structured
const Frame = ({city , nbrRuns , routeName}) => {
    console.log(city + " " + nbrRuns + " " + routeName);
    return (
        <center>
            <div className="div">
                 
<p>Number of runs : {nbrRuns}</p>
  
                 
<p>Route Name : {routeName}</p>
 
                 
<p>City : {city}</p>
  
            </div>
        </center>
    );
}
 
export default Read;