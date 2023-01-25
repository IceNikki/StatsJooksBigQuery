import "./App.css";
import Papa from "papaparse";
import React, { Component, useState } from 'react';
import Table1 from "./components/Table";


function Parse() {
  // State to store parsed data
  const [parsedData, setParsedData] = useState([]);

  //State to store table Column name
  const [tableRows, setTableRows] = useState([]);

  //State to store the values
  const [values, setValues] = useState([]);

  const changeHandler = (event) => {
    // Passing file data (event.target.files[0]) to parse using Papa.parse
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rowsArray = [];
        const valuesArray = [];

        // Iterating data to get column name and their values
        results.data.map((d) => {
          rowsArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
        });

        // Parsed Data Response in array format
        setParsedData(results.data);

        // Filtered Column Names
        setTableRows(rowsArray[0]);

        // Filtered Values
        setValues(valuesArray);
      },
    });
    class Table1 extends Component {
    
          render() {
              var heading = [tableRows];

      
              return (
                  <div >
                      <Table heading={heading}  />,
                  </div>
              );
          }
      }
    class Table extends Component {
          render() {
              var heading = this.props.heading;

              return (
                  <table style={{ width: 600 }}>
                      <thead>
                          <tr>
                              {heading.map(head => <th>{head}</th>)}
                          </tr>
                      </thead>

                  </table>
              );
          }
      }
        
      class TableRow extends Component {
          render() {
              var row = this.props.row;
              return (
                  <tr>
                      {row.map(val => <td>{val}</td>)}
                  </tr>
              )
          }
      }
      

            
  
  };

  return (
    <div>
      {/* File Uploader */}
      <input
        type="file"
        name="file"
        onChange={changeHandler}
        accept=".csv"
        style={{ display: "block", margin: "10px auto" }}
      />
      <br />
      <br />
      {/* Table */}
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
      
                        <Table1/>,
                    
    </div>
  );
}

export default Parse;