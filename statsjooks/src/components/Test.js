
import { db } from '../config/firebase';
import React, { useState } from 'react';
import { doc, updateDoc } from "firebase/firestore"; 


const Send = async (e) => {
	const [name , Setname] = useState("");
	const [age , Setage] = useState("");
	const [course , Setcourse] = useState("");
	const sub = (e) => {
		e.preventDefault();
    
		// Add data to the store
        // on ajoute le candidat et ses résultats dans la table companies à celle qui lui est affilié

		await updateDoc(doc(db, "Routes"), {
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
					<button type="submit">Submit</button>
				</form>
			</center>
		</div>
	);

    }
}
export default Send;
