import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { getDoc, doc, getDocs, collection } from "firebase/firestore";
import LoadingSpinner from './LoadingSpinner';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import footstatsImage from '../../imgs/footstats.png';  // Make sure the path is correct

const routeCache = {};

async function Read(login, year, quarter, yearAnnual, queryType, sortColumn, sortDirection) {
    const collectionName = queryType === 'city' ? "City" : "Sponsors";
    const docRef = doc(db, collectionName, login);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const { Routes } = data;
        const dataArray = [];

        for (const routeId of Routes) {
            let routeData;
            if (!routeCache[routeId]) {
                const routeDocRef = doc(db, "Routes", routeId);
                const routeDocSnap = await getDoc(routeDocRef);
                if (routeDocSnap.exists()) {
                    routeData = routeDocSnap.data();
                    const statsCollectionRef = collection(db, "Routes", routeId, "statistics");
                    const statsSnapshot = await getDocs(statsCollectionRef);
                    routeData.statistics = {};
                    statsSnapshot.forEach(doc => {
                        routeData.statistics[doc.id] = doc.data();
                    });
                    routeCache[routeId] = routeData;
                } else {
                    console.log(`No route document for routeId: ${routeId}`);
                    continue;
                }
            } else {
                routeData = routeCache[routeId];
            }
            let length = routeData.Length !== undefined && routeData.Length !== null ?
                (routeData.Length >= 1000 ? routeData.Length : 1000) : 3000;
            let nbrsessions = routeData.statistics[`${quarter}_${year}`]?.nbrSessions || 0;
            let nbrsessionsannual = routeData.statistics[`AnnualStats${yearAnnual}`]?.nbrSessionsAnnual || 0;
            const quarterStatKey = `${quarter}_${year}`;
            const annualStatKey = `AnnualStats${yearAnnual}`;
            
            if (routeData.statistics && routeData.statistics[quarterStatKey]) {
                nbrsessions = routeData.statistics[quarterStatKey].nbrSessions || 0;
            }
            if (routeData.statistics && routeData.statistics[annualStatKey]) {
                nbrsessionsannual = routeData.statistics[annualStatKey].nbrSessionsAnnual || 0;
            }
            const factor = 2.5;
            nbrsessions = Math.floor(nbrsessions * factor);
            nbrsessionsannual = Math.floor(nbrsessionsannual * factor);
            dataArray.push({
                id: routeId,
                nameCity: routeData.nameCity,
                nameRoute: routeData.nameRoute,
                nbrSessions: nbrsessions,
                nbrSessionsAnnual: nbrsessionsannual,
                length: length
            });
        }

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

        return dataArray;
    } else {
        console.log("No such document!");
        return [];
    }
}

export default function Reader({ cityName, setTable, selectedMenuOption, setSelectedMenuOption, showChoice, setChoice, queryType }) {  // Add queryType here
    const [dataread, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(2023);
    const [selectedYearAnnual, setSelectedYearAnnual] = useState(2023);
    const [selectedQuarter, setSelectedQuarter] = useState('Q2');
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
                const response = await Read(cityName, selectedYear, selectedQuarter, selectedYearAnnual, queryType, sortColumn, sortDirection);
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
    }, [selectedYear, selectedQuarter, cityName, selectedYearAnnual, queryType, sortColumn, sortDirection, selectedMenuOption]);  // Add selectedMenuOption to dependency array

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
