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
      complete: function (results) {
        const rowsArray = [];
        const valuesArray = [];

        results.data.forEach((d) => {
          rowsArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
          Send(d);
        });

        setParsedData(results.data);
        setTableRows(rowsArray[0]);
        setValues(valuesArray);
      },
    });
};


  return (
    <div>
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
      <br />
      <br />

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
