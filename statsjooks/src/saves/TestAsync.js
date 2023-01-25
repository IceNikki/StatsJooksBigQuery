import { db } from '../config/firebase';
import { collection, query, getDocs, getDoc, doc, setDoc, where, Timestamp } from "firebase/firestore";
import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';



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


const Reader = props => {

  const [dataread, setData] = React.useState("");
  var heading = ["City ", "Route Name ", "Number of sessions "];


  React.useEffect(() => {

    const fetchUserData = async () => {
    
      const response = await Read("Leuven").then((value) => {
        const objx = value
        const arrayArray = []

        for (const element of objx){
        const body = Object.values(element);
        console.log(body)
        arrayArray.push(body)
        }
      return(arrayArray)})
        const datajson1 = JSON.stringify(response, null, 2)
        const dataread = JSON.parse(datajson1);
      
      console.log(dataread)

      setData(dataread);

    };

    fetchUserData();

  }, []);


  return (

    <div>

      <h1>Année 2022</h1>
      
                  <center>
           <h4>{heading}</h4>
           <h4>{dataread}</h4>
                  </center>
              </div>

    

  );


};

export default Reader;