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
const nbrSessions = []
const nameRoute = []
const nameCity = []

const count1 = nbrSessions.push(obj2.nbrSession)
console.log(obj2)
class TableSessions extends Component {
    render() {
        
        var tblheading = obj2;
        

        return (
            <div>
                <h2>Number of sessions</h2>
                <table className="table" >
                    <thead>
                        <tr>
                            {tblheading.map(head => <th>{head}</th>)}
                        </tr>
                    </thead>
{/*                     <tbody>
                        {tblbody.map(row => <TableRow row={row} />)}
                    </tbody> */}
                </table>
            </div>
        );
    }
}

const TableRow = ({ row }) => {
    return (
        <>
            <tr>
                {row.map(val => <td>{val}</td>)}
            </tr>
        </>
    )
}



 

   }

export default Read;
