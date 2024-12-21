import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { db } from '../config/firebase'; // Adjust this import as necessary
import { doc, setDoc } from 'firebase/firestore';
import { ProgressBar } from 'react-bootstrap'; // Ensure you have react-bootstrap installed

// Function to recursively remove fields that start and end with double underscores
const cleanData = (data) => {
    if (Array.isArray(data)) {
        return data.map(item => cleanData(item));
    } else if (data !== null && typeof data === 'object') {
        const cleanedData = {};
        for (const key of Object.keys(data)) {
            if (!key.startsWith('__') || !key.endsWith('__')) {
                cleanedData[key] = cleanData(data[key]);
            }
        }
        return cleanedData;
    }
    return data;
};

function UpdateRoutes() {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            toast.error('Please select a file before uploading.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                const routes = Object.keys(jsonData).map(key => ({ id: key, ...jsonData[key] }));

                const totalRoutes = routes.length;
                for (let i = 0; i < totalRoutes; i++) {
                    const route = routes[i];
                    const cleanedRoute = cleanData(route);
                    const routeRef = doc(db, "Routes", route.id);
                    await setDoc(routeRef, cleanedRoute, { merge: true });
                    
                    // Update progress
                    setProgress(((i + 1) / totalRoutes) * 100);

                    // Log to console
                    console.log(`Updated ${i + 1}/${totalRoutes}: ${route.id}`);
                }

                toast.success('All routes have been successfully updated.');
            } catch (error) {
                console.error('Error updating documents:', error);
                toast.error('Failed to update routes. Please try again.');
            }
        };
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            toast.error('Failed to read file. Please try again.');
        };

        reader.readAsText(file);
    };

    return (
        <div>
            <label htmlFor="fileUpload">Upload JSON File:</label>
            <input 
                type="file" 
                id="fileUpload"
                onChange={handleFileChange} 
                accept=".json" 
            />
            <button onClick={handleUpload}>Update Routes</button>
            <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
        </div>
    );
}

export default UpdateRoutes;
