import React, { useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import { db } from '../config/firebase'; // Adjust this import as necessary
import { doc, setDoc } from 'firebase/firestore';

function UpdateCategories() {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            toast.error('Please select a file before uploading.');
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    for (const [index, row] of results.data.entries()) {
                        const routeRef = doc(db, "Routes", row.__id__);

                        // Parse the arrays from the string representation
                        const typeTransportationArray = JSON.parse(row.TypeTransportation);
                        const labelCategoryRouteArray = JSON.parse(row.labelCategoryRoute);

                        const newData = {
                            TypeTransportation: typeTransportationArray,
                            labelCategoryRoute: labelCategoryRouteArray,
                        };

                        // Use setDoc with merge option
                        await setDoc(routeRef, newData, { merge: true });

                        // Log progress to the console
                        console.log(`Processed row ${index + 1} of ${results.data.length}`);
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
            <label htmlFor="fileUpload">Upload CSV File:</label>
            <input 
                type="file" 
                id="fileUpload"
                onChange={handleFileChange} 
                accept=".csv" 
            />
            <button onClick={handleUpload}>Update Categories</button>
        </div>
    );
}

export default UpdateCategories;
