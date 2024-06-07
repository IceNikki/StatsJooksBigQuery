import React, { useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import { db } from '../config/firebase'; // Adjust this path as needed
import { doc, setDoc } from 'firebase/firestore';
import { ProgressBar } from 'react-bootstrap'; // Ensure you have react-bootstrap installed

function UpdateSponsors() {
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

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const totalSponsors = results.data.length;
                    for (let i = 0; i < totalSponsors; i++) {
                        const row = results.data[i];
                        // Use Name.FR as the document name
                        const sponsorRef = doc(db, "Sponsors", row['Name.FR']);
                        let routes = [];
                        try {
                            // Safely parse the IdRoute JSON
                            routes = row.IdRoute ? JSON.parse(row.IdRoute) : [];
                        } catch (error) {
                            console.error(`Error parsing routes for sponsor ${row['Name.FR']}:`, error);
                            toast.error(`Failed to parse routes for sponsor ${row['Name.FR']}.`);
                            continue; // Skip to the next row on error
                        }

                        const data = {
                            SponsorID: row.__id__, // Store the original ID as SponsorID
                            Routes: routes,
                            Name: row['Name.FR'], // This might be redundant as it's used as the document name
                            NameEN: row['Name.EN']
                        };

                        await setDoc(sponsorRef, data, { merge: true });

                        // Update progress
                        setProgress(((i + 1) / totalSponsors) * 100);

                        // Log to console
                        console.log(`Updated ${i + 1}/${totalSponsors}: ${row['Name.FR']}`);
                    }
                    toast.success('All sponsors have been successfully updated.');
                } catch (error) {
                    console.error('Error updating documents:', error);
                    toast.error('Failed to update sponsors. Please check the console for more information.');
                }
            }
        });
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} accept=".csv" />
            <button onClick={handleUpload}>Update Sponsors</button>
            <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
        </div>
    );
}

export default UpdateSponsors;
