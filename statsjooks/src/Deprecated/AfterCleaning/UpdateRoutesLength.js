import React, { useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import { db } from '../config/firebase'; // Adjust this import as necessary
import { doc, setDoc } from 'firebase/firestore';


function UpdateRoutesLength() {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            toast.error('Please select a file before uploading.');
            return;
        }

                // Inside your handleUpload function:
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    for (const row of results.data) {
                        const routeRef = doc(db, "Routes", row.__id__);
                        // Use setDoc with merge option
                        await setDoc(routeRef, { Length: parseInt(row.Length, 10) }, { merge: true });
                    }
                    toast.success('All routes have been successfully updated.');
                } catch (error) {
                    console.error('Error updating documents:', error);
                    toast.error('Failed to update routes. Please try again.');
                }
            }
        });

    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} accept=".csv" />
            <button onClick={handleUpload}>Update Routes Length</button>
        </div>
    );
}

export default UpdateRoutesLength;
