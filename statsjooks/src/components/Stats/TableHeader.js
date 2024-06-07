import React from 'react';

export default function TableHeader({ handleSort, sortColumn, sortDirection }) {
    return (
        <thead>
            <tr>
                <th className="table_header" style={{ width: "10%" }} onClick={() => handleSort('id')}>
                    ID {sortColumn === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="table_header" style={{ width: "25%" }} onClick={() => handleSort('nameCity')}>
                    City name {sortColumn === 'nameCity' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="table_header" style={{ width: "25%" }} onClick={() => handleSort('nameRoute')}>
                    Route name {sortColumn === 'nameRoute' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="table_header" style={{ width: "20%" }} onClick={() => handleSort('nbrSessions')}>
                    Number of sessions {sortColumn === 'nbrSessions' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="table_header" style={{ width: "20%" }} onClick={() => handleSort('nbrSessionsAnnual')}>
                    Number of trees planted {sortColumn === 'nbrSessionsAnnual' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
            </tr>
        </thead>
    );
}
