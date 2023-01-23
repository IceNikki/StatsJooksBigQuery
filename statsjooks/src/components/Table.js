// Import Firestore database
import { db } from '../config/firebase';
import { collection, query, getDocs, getDoc, doc, setDoc, where, Timestamp } from "firebase/firestore";
import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';

async function Read(login) {
    const docRef = doc(db, "City", login);
    const docSnap = await getDoc(docRef);
    
    
    const idArray = []
    const testArray = []
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

    const test = idArray[1];
    const docRef2 = doc(db, "Routes", test);
    const docSnap2 = await getDoc(docRef2);
    const data2 = docSnap2.data();
    const datajson = JSON.stringify(data2, null, 2)
    const obj2 = JSON.parse(datajson);
   
    var nC = obj2.nameCity;
    var nR = obj2.nameRoute;
    var nbS = obj2.nbrSessions;
    var objx = obj2
   
    return {objx};
    
};


   
const Test = async () => { 
  
  await Read("Leuven").then((value) => {

        const objx = value
        const data = objx.objx
        const body = Object.values(data);
        var heading = ["City ", "Route Name ", "Number of sessions "];
        console.log(body)
    return (
                      <div>
                          <center>
                   <h4>{heading}</h4>
                   <h4>{body}</h4>
                          </center>
                      </div>
                  );
                 
    
      }
      
    )};   

    

    

export default Test;
