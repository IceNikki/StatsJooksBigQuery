import React, { useState, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import bcrypt from 'bcryptjs';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ClipLoader } from 'react-spinners';
import { fetchStatsData } from './BigQuery/BigQueryClient'; // Make sure this function calls the correct endpoint
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../imgs/logov.png';

const BossStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transportType, setTransportType] = useState('pmr');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isConnected, giveAccess] = useState(Cookies.get("acsssn") || false);
  const [errorName, showErrorName] = useState(false);
  const [errorPass, showErrorPass] = useState(false);
  const factor = 2.5;

  useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, [isConnected]);
  const exportToCSV = (sortedData) => {
    const csvData = sortedData.map((route) => ({
      ID: route.id,
      City: route.nameCity,
      Route: route.nameRoute,
      Sessions: route.nbrSessions,
      TreesPlanted: route.treesPlanted,
    }));
  
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'routes_statistics.csv');
    link.click();
  };
  


  const exportToPDF = () => {
    const input = document.getElementById('pdfContent');
    
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      // Calculate the logo size while maintaining aspect ratio
      const logoWidth = 50; // Desired width of the logo
      const img = new Image();
      img.src = logo;
      img.onload = () => {
        const aspectRatio = img.height / img.width;
        const logoHeight = logoWidth * aspectRatio; // Calculate height based on aspect ratio
  
        // Add the logo to the PDF, centered horizontally
        pdf.addImage(logo, 'PNG', (pdf.internal.pageSize.getWidth() - logoWidth) / 2, 10, logoWidth, logoHeight);
  
        // Add some space after the logo
        const contentYPosition = logoHeight + 20;
  
        // Add the content from the HTML to the PDF
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, contentYPosition, pdfWidth, pdfHeight);
  
        pdf.save('routes_statistics.pdf');
      };
    });
  };

  
  const fetchData = async () => {
    setLoading(true);
    try {
      const routesCollection = collection(db, "Routes");
      const routesSnapshot = await getDocs(routesCollection);
      const routesData = [];

      for (const doc of routesSnapshot.docs) {
        const route = doc.data();
        if (route.TypeTransportation && Array.isArray(route.TypeTransportation) && route.TypeTransportation.includes(transportType)) {
          routesData.push({
            id: doc.id,
            nameCity: route.nameCity,
            nameRoute: route.nameRoute,
            length: route.Length,
            type: route.TypeTransportation,
          });
        }
      }

      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`; // 1st January of the current year
      const endDate = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format

      const queryParams = {
        startDate: startDate,
        endDate: endDate,
        city: '', // Adjust as necessary
      };

      const bigQueryData = await fetchStatsData(queryParams); // Ensure this function calls the /query-stats endpoint

      const combinedData = routesData.map(route => {
        const sessions = bigQueryData.filter(bqd => bqd.route_id === route.id);
        const nbrSessions = Math.floor((sessions.length || 0) * 2.5);
        const treesPlanted = Math.floor((nbrSessions * (route.length * 0.75 / 1000)) / 100);

        return {
          ...route,
          nbrSessions,
          treesPlanted,
        };
      });

      setData(combinedData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    let { formName, formPassword } = formProps;

    try {
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
    } catch (error) {
      console.error('Error during admin login:', error);
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

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (!sortColumn) return 0;
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      console.log(`Sorting by ${sortColumn}: ${aValue} vs ${bValue}`);

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

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

  return (
    <div className="container mt-5">
      <button className='btn btn-danger btn-sm float-right' onClick={disconnectUser}>Se déconnecter</button>
      
      <div className="text-center mb-4">
        <img src={logo} width="300" height="300" className="d-inline-block align-top" alt="Jooks Logo" />
      </div>

      <div className="d-flex justify-content-between mb-4">
        <button className="btn btn-success" onClick={() => exportToCSV(sortedData)}>Export CSV</button>
        <button className="btn btn-primary" onClick={exportToPDF}>Export PDF</button>
      </div>

      <h4 className="mb-5 gotham-rounded-bold" style={{ color: "#57c528" }}>
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
          <label htmlFor="startDate">Start Date</label>
          <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control" />
        </div>
        <div className="col-md-3 mb-3">
          <label htmlFor="endDate">End Date</label>
          <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control" />
        </div>
        <div className="col-md-3 mb-3">
          <label>&nbsp;</label>
          <button className="btn btn-primary form-control" onClick={fetchData}>Load Stats</button>
        </div>
      </div>
      {loading ? (
        <div className="text-center">
          <ClipLoader />
        </div>
      ) : (
        <div id="pdfContent">
          <table className="table table-striped">
            <thead>
              <tr>
                <th className="table_header" onClick={() => handleSort('id')}>ID</th>
                <th className="table_header" onClick={() => handleSort('nameCity')}>City Name</th>
                <th className="table_header" onClick={() => handleSort('nameRoute')}>Route Name</th>
                <th className="table_header" onClick={() => handleSort('nbrSessions')}>Number of Sessions</th>
                <th className="table_header" onClick={() => handleSort('treesPlanted')}>Number of Trees Planted</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((route) => (
                <tr key={route.id}>
                  <td className="table_body">{route.id}</td>
                  <td className="table_body">{route.nameCity}</td>
                  <td className="table_body">{route.nameRoute}</td>
                  <td className="table_body">{route.nbrSessions}</td>
                  <td className="table_body">{route.treesPlanted}</td>
                </tr>
              ))}
              <tr>
                <td className="table_body font-weight-bold">Total</td>
                <td className="table_body"></td>
                <td className="table_body"></td>
                <td className="table_body font-weight-bold">
                  {sortedData.reduce((acc, route) => acc + route.nbrSessions, 0)}
                </td>
                <td className="table_body font-weight-bold">
                  {sortedData.reduce((acc, route) => acc + route.treesPlanted, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BossStats;
