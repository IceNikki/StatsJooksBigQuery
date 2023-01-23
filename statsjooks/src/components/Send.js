import { db } from '../config/firebase';
import { collection, query,addDoc, getDocs, getDoc, doc, setDoc, where } from "firebase/firestore";
import { useState } from 'react';

const Send = async () => {
    const [city  , Setname] = useState("");
    const [runs , Setage] = useState("");
    const [route , Setcourse] = useState("");
    const sub = (e) => {
        e.preventDefault();
         
        // Add data to the store
        setDoc(doc(db, "Routes", "LA"), {

            City: city,
            nbrSessions: runs,
            NameRoute: route
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
 
export default Send;