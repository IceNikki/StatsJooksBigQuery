/* -------------------------------------------------------------------- */
/* -- Composant permettant de lire le CSV et d'updater la BDD Firebase -*/
/* -------------------------------------------------------------------- */
import Papa from "papaparse";
import React, { useState } from 'react';
import { db } from '../config/firebase';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

async function Send(item, quarterId) {
    const obj = item;
    const id = obj.ID;
    const namecity = obj['CITY NAME'];
    const nameroute = obj['ROUTE  NAME'];
    let nbrsessions = obj['NB ROUTE VIEWED'];

    const ID = String(id);
    const NAMECITY = String(namecity);
    const NAMEROUTE = String(nameroute);
    const NBRSESSIONS = Number(nbrsessions);

    try {
        // Updating the route details
        await updateDoc(doc(db, "Routes", ID), {
            id: ID,
            nameCity: NAMECITY,
            nameRoute: NAMEROUTE
        });

        const statsRef = doc(db, "Routes", ID, "statistics", quarterId);
        try {
            await updateDoc(statsRef, { nbrSessions: NBRSESSIONS });
        } catch (error) {
            if (error.code === "not-found") {
                await setDoc(statsRef, { nbrSessions: NBRSESSIONS });
            } else {
                throw error;
            }
        }

        const cityRef = doc(db, "City", NAMECITY);
        await updateDoc(cityRef, { Routes: arrayUnion(ID), nameCity: NAMECITY }, { merge: true });

        alert("Data Successfully Submitted for ID: " + ID);
    } catch (error) {
        console.error("Error updating/adding document: ", error);
    }
}

function Parse() {
    const [parsedData, setParsedData] = useState([]);
    const [tableRows, setTableRows] = useState([]);
    const [values, setValues] = useState([]);
    const [selectedQuarter, setSelectedQuarter] = useState("Q1");
    const [selectedYear, setSelectedYear] = useState("2020");

    const changeHandler = (event) => {
        Papa.parse(event.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const rowsArray = [];
                const valuesArray = [];

                results.data.forEach((d) => {
                    rowsArray.push(Object.keys(d));
                    valuesArray.push(Object.values(d));
                });

                setParsedData(results.data);
                setTableRows(rowsArray[0]);
                setValues(valuesArray);

                const quarterId = `${selectedQuarter}_${selectedYear}`;
                results.data.forEach((item) => Send(item, quarterId));
            }
        });
    };

    return (
        <div>
            <select onChange={(e) => setSelectedQuarter(e.target.value)}>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
            </select>

            <select onChange={(e) => setSelectedYear(e.target.value)}>
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
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
                        {tableRows.map((rows, index) => (
                            <th key={index}>{rows}</th>
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