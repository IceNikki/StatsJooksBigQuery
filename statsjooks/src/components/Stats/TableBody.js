import React from 'react';

export default function TableBody({ dataread, selectedMenuOption }) {
    console.log('TableBody says the selectedMenuOption is: ' + selectedMenuOption);
    const factor = 2.5;
    return (
        <tbody>
            {dataread.map((item) => (
                <tr key={item.id}>
                    <td className="table_body">{item.id}</td>
                    <td className="table_body">{item.nameCity}</td>
                    <td className="table_body">{item.nameRoute}</td>
                    <td className="table_body">{Math.floor(item.nbrSessions)}</td>
                    <td className="table_body">{Math.floor((item.nbrSessions * (item.length * 0.75 / 1000)) / 100)}</td>
                </tr>
            ))}
        </tbody>
    );
}
