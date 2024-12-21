import React from 'react';

export default function TableFooter({ dataread }) {
    
    const totalSessions = dataread.reduce((acc, item) => acc + Math.floor(item.nbrSessions), 0);
    
    const totalTrees = dataread.reduce((acc, item) => 
        acc + Math.floor((item.nbrSessions * (item.length * 0.75 / 1000)) / 100), 0);

    return (
        <tfoot>
            <tr>
                <td className="table_body" style={{ fontWeight: "bold" }}>Total</td>
                <td className="table_body"></td>
                <td className="table_body"></td>
                <td className="table_body" style={{ fontWeight: "bold" }}>
                    {totalSessions}
                </td>
                <td className="table_body" style={{ fontWeight: "bold" }}>
                    {totalTrees}
                </td>
            </tr>
        </tfoot>
    );
}
