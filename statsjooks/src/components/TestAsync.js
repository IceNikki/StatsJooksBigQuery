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


const Reader = () => {
const Maps = []
  const [dataread, setData] = React.useState("");
  
  React.useEffect(() => {

    const fetchUserData = async () => {
    
      const response = await Read("Leuven").then((value) => {
        const objx = value
        const arrayArray = []
        Maps.push(value)
        for (const element of objx){
        const body = Object.values(element);
        
        arrayArray.push(body)
        }
       
      return(arrayArray)})
        const datajson1 = JSON.stringify(response, null, 2)
        const dataread = JSON.parse(datajson1);
      
      

      setData(dataread);

    };
    fetchUserData();
    
    console.log(Maps)
    setData(Maps)
    
  }, []);


  

  return (<table>
    <thead>
      <tr>
        <th>ID </th>
        <th>City name </th>
        <th>Route name </th>
        <th>Number of sessions </th>
        {/* <th>Number of trees planted</th> */}
      </tr>
    </thead>
    <tbody>
    {dataread.map(item => (
      
        <tr>
          <td>{ item[0] }</td>
          <td>{ item[1] }</td>
          <td>{ item[2]}</td>
          <td>{ item[3] }</td>
        </tr>
    ))}
    </tbody>
  </table>);


};

export default Reader;