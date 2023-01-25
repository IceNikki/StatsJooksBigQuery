// Import Firestore database
import { db } from '../config/firebase';
import { collection, query, getDocs, getDoc, doc, setDoc, where } from "firebase/firestore";
import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';

 
async function Read() {
    const docRef = doc(db, "City", "Leuven");
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
    console.log(obj2)
    return(obj2);
}
    const Stocks = (obj2) => {

        return (
      
          <>
      
            <div className="stock-container">
      
              {obj2.map((data, key) => {
      
                return (
      
                  <div key={key}>
      
                    {data.nameCity +
      
                      " , " +
      
                      data.nameRoute +
      
                      ", " +
      
                      data.nbrSessions}
      
                  </div>
      
                );
      
              })}
      
            </div>
      
          </>
      
        );
      
      };



export default Stocks;
