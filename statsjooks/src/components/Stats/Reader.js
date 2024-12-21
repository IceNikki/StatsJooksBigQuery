import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { getDoc, doc } from "firebase/firestore";
import LoadingSpinner from './LoadingSpinner';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import footstatsImage from '../../imgs/footstats.png';
import { fetchStatsData } from '../BigQuery/BigQueryClient';
import './Stats.css';

const routeCache = {};

async function Read(cityOrSponsorName, startDate, endDate, fetchStatsData, queryType, sortColumn, sortDirection) {
  // Create a cache key to optimize data fetching
  const cacheKey = `${cityOrSponsorName}-${startDate}-${endDate}-${queryType}-${sortColumn}-${sortDirection}`;
  if (routeCache[cacheKey]) {
    console.log('Using cached data');
    return routeCache[cacheKey];
  }

  // Determine if we're dealing with a city or a sponsor
  const collectionName = queryType === 'city' ? "City" : "Sponsors";
  const docRef = doc(db, collectionName, cityOrSponsorName);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();  // Firestore document data
    const { Routes } = data;  // For sponsors, we get multiple route IDs
    const dataArray = [];

    let statsData;

    // For sponsors, fetch data based on route IDs
    if (queryType === 'sponsor') {
      // Send the route IDs to the backend for processing
      statsData = await fetchStatsData({
        startDate,
        endDate,
        routeIds: Routes  // Pass array of route IDs
      });
    } else if (queryType === 'city') {
      // For cities, just send the city name
      statsData = await fetchStatsData({
        startDate,
        endDate,
        routeIds: Routes
      });
    }

    // Now process the statsData for both sponsors and cities
    for (const routeId of Routes) {
      const routeStats = statsData.filter(stat => stat.route_id === routeId);  // Match by route_id
      if (routeStats.length > 0) {
        let length = 3000;  // Default route length if not provided
        let nbrSessions = routeStats.length;  // Count the number of sessions
        const factor = 2.5;
        nbrSessions = Math.floor(nbrSessions * factor);  // Apply session factor

        // Push the processed data into the array
        dataArray.push({
          id: routeId,
          nameCity: routeStats[0].city_name || data.nameCity,  // Use the city name from stats or Firestore
          nameRoute: routeStats[0].route_name || 'Unknown Route',  // Use route name from stats or default
          nbrSessions: nbrSessions,
          length: length
        });
      }
    }

    // Sort the data if a sort column is specified
    if (sortColumn) {
      dataArray.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }

    // Cache the result for future requests
    routeCache[cacheKey] = dataArray;
    return dataArray;
  } else {
    console.log("No such document!");
    return [];
  }
}

export default function Reader({ cityName, setTable, selectedMenuOption, setSelectedMenuOption, showChoice, setChoice, queryType, fetchStatsData }) {
  const [dataread, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedYearAnnual, setSelectedYearAnnual] = useState(2024);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [progress, setProgress] = useState(0);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    console.log("Fetching data with the following parameters:");
    console.log({
      selectedYear,
      selectedQuarter,
      selectedYearAnnual,
      selectedMenuOption
    });
    const fetchUserData = async () => {
      setLoading(true);
      setProgress(20);
      const interval = setInterval(() => {
        setProgress(oldProgress => {
          const newProgress = oldProgress + 10;
          return newProgress > 80 ? 80 : newProgress;
        });
      }, 1000);

      try {
        let startDate, endDate;
        if (selectedMenuOption === 'annual') {
          startDate = `${selectedYearAnnual}-01-01`;
          endDate = `${selectedYearAnnual}-12-31`;
        } else {
          const year = selectedYear;
          switch (selectedQuarter) {
            case 'Q1':
              startDate = `${year}-01-01`;
              endDate = `${year}-03-31`;
              break;
            case 'Q2':
              startDate = `${year}-04-01`;
              endDate = `${year}-06-30`;
              break;
            case 'Q3':
              startDate = `${year}-07-01`;
              endDate = `${year}-09-30`;
              break;
            case 'Q4':
              startDate = `${year}-10-01`;
              endDate = `${year}-12-31`;
              break;
            default:
              startDate = `${year}-01-01`;
              endDate = `${year}-12-31`;
          }
        }

        const response = await Read(cityName, startDate, endDate, fetchStatsData, queryType, sortColumn, sortDirection);
        setData(response);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        clearInterval(interval);
        setProgress(100);
        setLoading(false);
      }
    };
    fetchUserData();
  }, [selectedYear, selectedQuarter, cityName, selectedYearAnnual, queryType, sortColumn, sortDirection, selectedMenuOption]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleYearChange = (e) => {
    if (selectedMenuOption === 'annual') {
      setSelectedYearAnnual(e.target.value);
    } else {
      setSelectedYear(e.target.value);
    }
  };

  return (
    <div>
      <div>
        <select value={selectedMenuOption === 'annual' ? selectedYearAnnual : selectedYear} onChange={handleYearChange}>
          {selectedMenuOption === 'annual' ? (
            <>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </>
          ) : (
            <>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </>
          )}
        </select>
        {selectedMenuOption !== "annual" && (
          <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
        )}
      </div>
      <h4 className="mt-5 mb-5 gotham-rounded-bold" style={{ color: "#57c528", border: "none" }}>
        Your statistics for {selectedMenuOption === "annual" ? `Annual ${selectedYearAnnual}` : `${selectedQuarter} ${selectedYear}`}
      </h4>
      <table>
        <TableHeader handleSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} selectedMenuOption={selectedMenuOption} />
        <TableBody dataread={dataread} selectedMenuOption={selectedMenuOption} />
        <TableFooter dataread={dataread} selectedMenuOption={selectedMenuOption} />
      </table>
      {loading && <LoadingSpinner progress={progress} className="progressBar" />}

      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          {selectedMenuOption === "annual" ? (
            <button className="btn btn-primary mt-3 gotham-rounded-bold" style={{ backgroundColor: "#57C528", border: "none" }} onClick={() => {
              console.log("Quarterly statistics button clicked");
              setSelectedMenuOption("quarterly");
            }}>
              Quarterly statistics
            </button>
          ) : (
            <button className="btn btn-primary mt-3 gotham-rounded-bold" style={{ backgroundColor: "#57C528", border: "none" }} onClick={() => {
              console.log("Annual statistics button clicked");
              setSelectedMenuOption("annual");
            }}>
              Annual statistics
            </button>
          )}
          <button className="btn btn-primary mt-3 gotham-rounded-bold" style={{ backgroundColor: "#57C528", border: "none" }} onClick={() => setTable(false)}>
            Logout
          </button>
        </div>
        <h4 className="mt-5 mb-5 gotham-rounded-bold" style={{ color: "#57c528", border: "none" }}>
          JOOKS App Global Statistics
        </h4>
        <div className="image-container">
          <img src={footstatsImage} style={{ marginTop: '42px' }} alt="Footstats placeholder" />
        </div>
      </div>
    </div>
  );
}
