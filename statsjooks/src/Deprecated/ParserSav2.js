import React, { useState } from 'react';
import Papa from "papaparse";
import { db } from '../config/firebase';
import { doc, writeBatch, arrayUnion } from 'firebase/firestore'; // Import arrayUnion

async function processBatch(batch, quarterId) {
    const batchWrite = writeBatch(db);

    for (const item of batch) {
        prepareBatchOperation(item, quarterId, batchWrite);
    }

    try {
        await batchWrite.commit();
        console.log('Batch commit successful');
    } catch (error) {
        console.error('Batch commit failed', error);
    }
}

function prepareBatchOperation(item, quarterId, batchWrite) {
    const obj = item;
    const ID = String(item['Route id']);
    const NAMECITY = String(item['City Name']);
    const NAMEROUTE = String(item['Route Name']);
    const NBRSESSIONS = Number(item['Open']); // Assuming you want to use the 'Open' field for the number of sessions


    // Move the log statement here, after ID is defined
    console.log(`Preparing batch for ID: ${ID}, Quarter: ${quarterId}`); // Debugging

    const routeRef = doc(db, "Routes", ID);
    const statsRef = doc(db, "Routes", ID, "statistics", quarterId);
    const cityRef = doc(db, "City", NAMECITY);

    batchWrite.set(routeRef, { id: ID, nameCity: NAMECITY, nameRoute: NAMEROUTE }, { merge: true });
    batchWrite.set(statsRef, { nbrSessions: NBRSESSIONS }, { merge: true });
    batchWrite.set(cityRef, { Routes: arrayUnion(ID), nameCity: NAMECITY }, { merge: true });
}


function Parse() {
    const [parsedData, setParsedData] = useState([]);
    const [tableRows, setTableRows] = useState([]); // Define tableRows state
    const [values, setValues] = useState([]); // Define values state
    const [selectedQuarter, setSelectedQuarter] = useState("Q2");
    const [selectedYear, setSelectedYear] = useState("2023");
    const [progress, setProgress] = useState(0); // Progress state

    const changeHandler = async (event) => {
        Papa.parse(event.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: async function (results) {
                const rowsArray = [];
                const valuesArray = [];
    
                results.data.forEach((d) => {
                    rowsArray.push(Object.keys(d));
                    valuesArray.push(Object.values(d));
                });
    
                setTableRows(rowsArray[0]); // Update tableRows state
                setValues(valuesArray); // Update values state
                const quarterId = `${selectedQuarter}_${selectedYear}`;
    
                const batchSize = 500; // Firestore batch size limit
                const totalBatches = Math.ceil(results.data.length / batchSize);
    
                for (let i = 0; i < totalBatches; i++) {
                    const batch = results.data.slice(i * batchSize, (i + 1) * batchSize);
                    await processBatch(batch, quarterId);
                    setProgress(((i + 1) / totalBatches) * 100); // Update progress
                }
            }
        });
    };
    

    return (
        <div>
            <progress value={progress} max="100"></progress> {/* Progress bar */}

            <select onChange={(e) => setSelectedQuarter(e.target.value)}>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
            </select>

            <select onChange={(e) => setSelectedYear(e.target.value)}>
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>

            <input
                type="file"
                name="file"
                onChange={changeHandler}
                accept=".csv"
                style={{ display: "block", margin: "10px auto" }}
            />

            <table>
                <thead>
                    <tr>
                        {tableRows.map((row, index) => (
                            <th key={index}>{row}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {values.map((value, index) => (
                        <tr key={index}>
                            {value.map((val, i) => (
                                <td key={i}>{val}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Parse;
