import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Cookies from 'js-cookie';
import bcrypt from 'bcryptjs';
import 'bootstrap/dist/css/bootstrap.min.css'; // Make sure to import Bootstrap

const BossStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transportType, setTransportType] = useState('pmr');
  const [selectedYear, setSelectedYear] = useState(2023);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [selectedMenuOption, setSelectedMenuOption] = useState('quarterly');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isConnected, giveAccess] = useState(Cookies.get("acsssn") || false);
  const [errorName, showErrorName] = useState(false);
  const [errorPass, showErrorPass] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const routesCollection = collection(db, "Routes");
      const routesSnapshot = await getDocs(routesCollection);
      const routesData = [];

      for (const doc of routesSnapshot.docs) {
        const route = doc.data();

        if (route.TypeTransportation && Array.isArray(route.TypeTransportation) && route.TypeTransportation.includes(transportType)) {
          const statsCollectionRef = collection(db, "Routes", doc.id, "statistics");
          const statsSnapshot = await getDocs(statsCollectionRef);

          const statsData = {};
          statsSnapshot.forEach(statDoc => {
            statsData[statDoc.id] = statDoc.data();
          });

          if (route.nameRoute) {
            const factor = 2.5;
            routesData.push({
              id: doc.id,
              nameCity: route.nameCity,
              nameRoute: route.nameRoute,
              stats: statsData,
              length: route.Length,
              factor,
            });
          }
        }
      }

      setData(routesData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isConnected) return;

    fetchData();
  }, [isConnected, transportType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    let { formName, formPassword } = formProps;

    const queryFB = query(collection(db, "administrateurs"), where("nom", "==", formName));
    const queryResults = await getDocs(queryFB);

    if (queryResults.empty) {
      showErrorName(true);
      showErrorPass(false);
    } else {
      let userDBHash = queryResults.docs[0].data().mdp;
      if (!bcrypt.compareSync(formPassword, userDBHash)) {
        showErrorPass(true);
        showErrorName(false);
      } else {
        giveAccess(true);
        showErrorPass(false);
        showErrorName(false);
        Cookies.set('acsssn', queryResults.docs[0].data().nom, { expires: 1, sameSite: 'Strict' });
      }
    }
  };

  const disconnectUser = () => {
    Cookies.remove('acsssn');
    giveAccess(false);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    return data.map(route => {
      const { stats, factor, length } = route;
      const nbrSessions = stats[`${selectedQuarter}_${selectedYear}`]?.nbrSessions || 0;
      const nbrSessionsAnnual = stats[`AnnualStats${selectedYear}`]?.nbrSessionsAnnual || 0;

      return {
        ...route,
        nbrSessions: Math.floor(nbrSessions * factor),
        nbrSessionsAnnual: Math.floor(nbrSessionsAnnual * factor),
        treesPlanted: selectedMenuOption === 'quarterly'
          ? Math.floor((nbrSessions * factor * (length * 0.75 / 1000)) / 100)
          : Math.floor((nbrSessionsAnnual * factor * (length * 0.75 / 1000)) / 100),
      };
    });
  }, [data, selectedQuarter, selectedYear, selectedMenuOption]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (!sortColumn) return 0;
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      console.log(`Sorting by ${sortColumn}: ${aValue} vs ${bValue}`); // Debugging

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  if (!isConnected) {
    return (
      <div className="container mt-5">
        <div className="row text-center">
          <h2 className="text-center mt-3">Connexion administrateur</h2>
          <form onSubmit={handleSubmit} className="text-center mt-5">
            <div className="form-group">
              <div className={errorName ? "alert alert-danger" : 'd-none'}> Cet admin n'existe pas</div>
              <label>Nom</label>
              <input type="text" className="form-control" name="formName" required />
            </div>
            <div className="form-group mt-3">
              <div className={errorPass ? "alert alert-danger" : 'd-none'}> Ce mot de passe est erroné</div>
              <label>Mot de passe</label>
              <input type="password" className="form-control" name="formPassword" required />
            </div>
            <button type="submit" className="btn btn-primary mt-3">Se connecter</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="container mt-5">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <button className='btn btn-danger btn-sm float-right' onClick={disconnectUser}>Se déconnecter</button>
      <h4 className="mt-5 mb-5 gotham-rounded-bold" style={{ color: "#57c528" }}>
        Statistics for {transportType} Type Routes
      </h4>
      <div className="row mb-3">
        <div className="col-md-3 mb-3">
          <label htmlFor="transportType">Transport Type</label>
          <select id="transportType" value={transportType} onChange={(e) => setTransportType(e.target.value)} className="form-control">
            <option value="walk">Walk</option>
            <option value="run">Run</option>
            <option value="pmr">PMR</option>
          </select>
        </div>
        <div className="col-md-3 mb-3">
          <label htmlFor="year">Year</label>
          <select id="year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="form-control">
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
        {selectedMenuOption === 'quarterly' && (
          <div className="col-md-3 mb-3">
            <label htmlFor="quarter">Quarter</label>
            <select id="quarter" value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)} className="form-control">
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>
        )}
        <div className="col-md-3 mb-3">
          <label>Statistics Type</label>
          <div className="btn-group w-100">
            <button className={`btn ${selectedMenuOption === 'quarterly' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedMenuOption('quarterly')}>
              Quarterly
            </button>
            <button className={`btn ${selectedMenuOption === 'annual' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedMenuOption('annual')}>
              Annual
            </button>
          </div>
        </div>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th className="table_header" onClick={() => handleSort('id')}>ID</th>
            <th className="table_header" onClick={() => handleSort('nameCity')}>City Name</th>
            <th className="table_header" onClick={() => handleSort('nameRoute')}>Route Name</th>
            <th className="table_header" onClick={() => handleSort(selectedMenuOption === 'quarterly' ? 'nbrSessions' : 'nbrSessionsAnnual')}>
              Number of Sessions
            </th>
            <th className="table_header" onClick={() => handleSort('treesPlanted')}>Number of Trees Planted</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((route) => (
            <tr key={route.id}>
              <td className="table_body">{route.id}</td>
              <td className="table_body">{route.nameCity}</td>
              <td className="table_body">{route.nameRoute}</td>
              <td className="table_body">
                {selectedMenuOption === 'quarterly'
                  ? route.nbrSessions
                  : route.nbrSessionsAnnual}
              </td>
              <td className="table_body">
                {route.treesPlanted}
              </td>
            </tr>
          ))}
          <tr>
            <td className="table_body font-weight-bold">Total</td>
            <td className="table_body"></td>
            <td className="table_body"></td>
            <td className="table_body font-weight-bold">
              {selectedMenuOption === 'quarterly'
                ? sortedData.reduce((acc, route) => acc + route.nbrSessions, 0)
                : sortedData.reduce((acc, route) => acc + route.nbrSessionsAnnual, 0)}
            </td>
            <td className="table_body font-weight-bold">
              {sortedData.reduce((acc, route) => acc + route.treesPlanted, 0)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BossStats;
