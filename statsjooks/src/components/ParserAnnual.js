import Papa from "papaparse";
import React, { useState } from 'react';
import { db } from '../config/firebase';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';



function Parse() {
  const [parsedData, setParsedData] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [values, setValues] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2023');
  const years = ['2020', '2021', '2022', '2023'];
  const [progress, setProgress] = useState(0); // Initialize progress state
  
  async function Send(item) {
    
    const ID = String(item['Route id']);
    const NAMECITY = String(item['City Name']);
    const NAMEROUTE = String(item['Route Name']);
    const NBRSESSIONSANNUAL = Number(item['Open']); // Assuming you want to use the 'Open' field for the number of sessions

    const statisticsRef = doc(db, "Routes", ID, "statistics", `AnnualStats${selectedYear}`);

    await setDoc(statisticsRef, {
      year: selectedYear,
      id: ID,
      nameCity: NAMECITY,
      nameRoute: NAMEROUTE,
      nbrSessionsAnnual: NBRSESSIONSANNUAL
    })
    .then(() => {
      console.log("Data Successfully Submitted");
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
  }

  const changeHandler = (event) => {
    Papa.parse(event.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: async function (results) {
            const aggregatedData = {};
            const rowsArray = [];
            const valuesArray = [];

            // Aggregate sessions by Route ID
            results.data.forEach(item => {
                const ID = String(item['Route id']);
                const sessions = Number(item['Open']);
                if (!aggregatedData[ID]) {
                    aggregatedData[ID] = { ...item, 'Open': sessions };
                } else {
                    aggregatedData[ID]['Open'] += sessions;
                }
            });

            const aggregatedArray = Object.values(aggregatedData);
            const totalItems = aggregatedArray.length;

            for (let i = 0; i < totalItems; i++) {
                await Send(aggregatedArray[i]);
                setProgress(((i + 1) / totalItems) * 100); // Update progress
            }

            if(aggregatedArray.length > 0) {
                setTableRows(Object.keys(aggregatedArray[0]));
                setValues(aggregatedArray.map(item => Object.values(item)));
            }
        },
    });
};


return (
  <div>
    {/* Progress Bar */}
    <progress value={progress} max="100"></progress>

      <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {years.map((year) => (
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
                  {tableRows.map((rows, index) => {
                      return <th key={index}>{rows}</th>;
                  })}
              </tr>
          </thead>
          <tbody>
              {values.map((value, index) => {
                  return (
                      <tr key={index}>
                          {value.map((val, i) => {
                              return <td key={i}>{val}</td>;
                          })}
                      </tr>
                  );
              })}
          </tbody>
      </table>
  </div>
);

}

export default Parse;
