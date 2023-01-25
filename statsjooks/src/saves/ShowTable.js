import React, { Component, useState } from 'react';
// imports de la config firebase
import { db } from '../config/firebase';
import { collection, query, getDocs, getDoc, doc, setDoc, where } from "firebase/firestore";

import ReactDOM from 'react-dom/client';



class Table1 extends Component {
    
    render() {
        var heading = ["City ", "Route Name ", "Number of sessions "];
        var body = ["cassemoipaslescouilles"]
        return (
            <div >
                <Table heading={heading} />,
            </div>
        );
    }
}
  
class Table extends Component {
    render() {
        var heading = this.props.heading;
        var body = this.props.body;
        return (
            <table style={{ width: 500 }}>
                <thead>
                    <tr>
                        {heading.map(head => <th>{head}</th>)}
                    </tr>
                </thead>
                <tbody>
                   
                </tbody>
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


export default Table1;
