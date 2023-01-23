import { db } from '../config/firebase';
import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
 
  
export default function Send() {
   const [name , Setname] = useState("");
   const [age , Setage] = useState("");
   const [course , Setcourse] = useState("");
   const sub = async (e) => {
       e.preventDefault();
      
       // Add data to the store
       // on ajoute le candidat et ses résultats dans la table companies à celle qui lui est affilié
       await setDoc(doc(db, "Routes", 'ui'), {
           Name: name,
           Age: age,
           CourseEnrolled: course})
      
 
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
                   <button >Submit</button>
               </form>
           </center>
       </div>
   );
 
   }