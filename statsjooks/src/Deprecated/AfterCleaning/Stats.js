import 'react-toastify/dist/ReactToastify.css';
import { db } from '../config/firebase';
import { getDoc, doc, getDocs, collection } from "firebase/firestore";
import React, { useState, useEffect } from 'react';
import { citysuggester } from '../components/CitySuggester';
import { Link } from 'react-router-dom';
import footstatsImage from '../imgs/footstats.png';
import BossStats from './BossStats';

const routeCache = {};

export default function Table() {

    const [showChoice, setChoice] = useState(false);
    const [showTest, setTable] = useState(false);
    const [errorForm, showError] = useState(false);
    const [errorForm2, showError2] = useState(false);
    const [cityPassword, setCityPassword] = useState("");
    const [cityName, setCityName] = useState("");
    const [selectedMenuOption, setSelectedMenuOption] = useState(null);
    const [queryType, setQueryType] = useState('city'); // 'city' or 'sponsor'

    // New states for sorting
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    async function startTest(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formProps = Object.fromEntries(formData);
        let { city_name, city_password } = formProps;

        const collectionName = queryType === 'city' ? "City" : "Sponsors";
        const docRef = doc(db, collectionName, city_name);
        const docSnap = await getDoc(docRef);
        const docRef2 = doc(db, "Password", city_password);
        const docSnap2 = await getDoc(docRef2);

        if (docSnap.exists() && docSnap2.exists()) {
            setCityName(city_name);
            setCityPassword(city_password);
            showError(false);
            setTable(true);
        } else if (docSnap.exists() && !docSnap2.exists()) {
            showError2(true);
        } else if (!docSnap.exists() && !docSnap2.exists()) {
            showError2(true);
        } else if (!docSnap.exists() && docSnap2.exists()) {
            const suggestedCity = await citysuggester(city_name, collectionName);
            if (suggestedCity !== null) {
                if (window.confirm(`Did you want to say  ${suggestedCity} ?`)) {
                    city_name = suggestedCity;
                    setCityName(city_name);
                    setCityPassword(city_password);
                    setTable(true);
                    showError(false);
                } else {
                    showError(true);
                }
            }
        }
    }

    async function Read(login, year, quarter, yearAnnual) {
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

    const Reader = ({ cname }) => {
        const [dataread, setData] = useState([]);
        const [loading, setLoading] = useState(true);
        const [selectedYear, setSelectedYear] = useState(2023);
        const [selectedYearAnnual, setSelectedYearAnnual] = useState(2023);
        const [selectedQuarter, setSelectedQuarter] = useState('Q2');
        const [progress, setProgress] = useState(0);

        useEffect(() => {
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
                    const response = await Read(cityName, selectedYear, selectedQuarter, selectedYearAnnual, queryType);
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
        }, [selectedYear, selectedQuarter, cityName, selectedYearAnnual, sortColumn, sortDirection]);

        const handleSort = (column) => {
            if (sortColumn === column) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
                setSortColumn(column);
                setSortDirection('asc');
            }
        };

        if (loading) {
            return (
                <div>
                    <div className="progressBar">
                        <div className="progress" style={{ width: `${progress}%` }}>{progress}%</div>
                    </div>
                    <p>Loading...</p>
                </div>
            );
        } else {
            if (showChoice === false) {
                return (
                    <div className="">
                        <button
                            className={`btn btn-primary mt-3 mr-3 gotham-rounded-bold ${selectedMenuOption === "quarterly" ? "active" : ""}`}
                            onClick={() => {
                                setSelectedMenuOption("quarterly");
                                setChoice(true);
                            }}
                            style={{ backgroundColor: "#57C528", border: "none" }}
                        >
                            Quarterly statistics
                        </button>
                        <button
                            className={`btn btn-primary mt-3 ml-7 gotham-rounded-bold ${selectedMenuOption === "annual" ? "active" : ""}`}
                            onClick={() => {
                                setSelectedMenuOption("annual");
                                setChoice(true);
                            }}
                            style={{ marginLeft: "20px", backgroundColor: "#57C528", border: "none" }}
                        >
                            Annual statistics
                        </button>
                    </div>
                );
            } else {
                if (dataread.length === 0) {
                    return (
                        <div>
                            <p>Sorry, this data is unavailable for the time being, please select another option. Please do not hesitate to contact our data specialist at laure.gicquel@mile.eu.com for more information.</p>
                            <button className="btn btn-primary mt-3 mb-3 gotham-rounded-bold" style={{ backgroundColor: "#57C528", border: "none" }} onClick={() => setSelectedMenuOption("annual")}>
                                Annual statistics
                            </button>
                            <div>
                                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                    <option value="2023">2023</option>
                                    <option value="2022">2022</option>
                                </select>
                                <select value={selectedYearAnnual} onChange={(e) => setSelectedYearAnnual(e.target.value)}>
                                    <option value="2023">2023</option>
                                    <option value="2022">2022</option>
                                </select>
                                <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
                                    <option value="Q1">Q1</option>
                                    <option value="Q2">Q2</option>
                                    <option value="Q3">Q3</option>
                                    <option value="Q4">Q4</option>
                                </select>
                            </div>
                        </div>
                    );
                } else {
                    if (selectedMenuOption === "quarterly") {
                        return (
                            <div>
                                <div>
                                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                        <option value="2024">2024</option>
                                        <option value="2023">2023</option>
                                        <option value="2022">2022</option>
                                    </select>
                                    <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
                                        <option value="Q1">Q1</option>
                                        <option value="Q2">Q2</option>
                                        <option value="Q3">Q3</option>
                                        <option value="Q4">Q4</option>
                                    </select>
                                </div>
                                <h4 className="mt-5 mb-5 gotham-rounded-bold" style={{ color: "#57c528", border: "none" }}>
                                    Your statistics for {selectedQuarter} {selectedYear}
                                </h4>
                                <table>
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
                                        <tr>
                                            <td className="table_body" style={{ fontWeight: "bold" }}>Total</td>
                                            <td className="table_body"></td>
                                            <td className="table_body"></td>
                                            <td className="table_body" style={{ fontWeight: "bold" }}>
                                                {dataread.reduce((acc, item) => acc + Math.floor(item.nbrSessions), 0)}
                                            </td>
                                            <td className="table_body" style={{ fontWeight: "bold" }}>
                                                {dataread.reduce((acc, item) => acc + Math.floor((item.nbrSessions * (item.length * 0.75 / 1000)) / 100), 0)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                        <button className="btn btn-primary mt-3 gotham-rounded-bold" style={{ backgroundColor: "#57C528", border: "none" }} onClick={() => setSelectedMenuOption("annual")}>
                                            Annual statistics
                                        </button>
                                        <button className="btn btn-primary mt-3 gotham-rounded-bold" style={{ backgroundColor: "#57C528", border: "none" }} onClick={() => setTable(false)}>
                                            Logout
                                        </button>
                                    </div>
                                    <div className="image-container">
                                        <img src={footstatsImage} style={{ marginTop: '42px' }} alt="Footstats placeholder" />
                                    </div>
                                </div>
                            </div>
                        );
                    } else if (selectedMenuOption === "annual") {
                        return (
                            <div>
                                <h4 className="mt-5 mb-5 gotham-rounded-bold" style={{ color: "#57c528" }}>
                                    Your statistics for {selectedYearAnnual}
                                </h4>
                                <select value={selectedYearAnnual} onChange={(e) => setSelectedYearAnnual(e.target.value)}>
                                    <option value="2023">2023</option>
                                    <option value="2022">2022</option>
                                </select>
                                <table>
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
                                    <tbody>
                                        {dataread.map((item) => (
                                            <tr key={item.id}>
                                                <td className="table_body">{item.id}</td>
                                                <td className="table_body">{item.nameCity}</td>
                                                <td className="table_body">{item.nameRoute}</td>
                                                <td className="table_body">{Math.floor(item.nbrSessionsAnnual)}</td>
                                                <td className="table_body">{Math.floor((item.nbrSessionsAnnual * (item.length * 0.75 / 1000)) / 100)}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className="table_body" style={{ fontWeight: "bold" }}>Total</td>
                                            <td className="table_body"></td>
                                            <td className="table_body"></td>
                                            <td className="table_body" style={{ fontWeight: "bold" }}>
                                                {dataread.reduce((acc, item) => acc + Math.floor(item.nbrSessionsAnnual), 0)}
                                            </td>
                                            <td className="table_body" style={{ fontWeight: "bold" }}>
                                                {dataread.reduce((acc, item) => acc + Math.floor((item.nbrSessionsAnnual * (item.length * 0.75 / 1000)) / 100), 0)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                        <button className="btn btn-primary mt-3 gotham-rounded-bold" style={{ backgroundColor: "#57C528", border: "none" }} onClick={() => setSelectedMenuOption("quarterly")}>
                                            Quarterly statistics
                                        </button>
                                        <button className="btn btn-primary mt-3 gotham-rounded-bold" style={{ backgroundColor: "#57C528", border: "none" }} onClick={() => setTable(false)}>
                                            Logout
                                        </button>
                                    </div>
                                    <div className="image-container">
                                        <img src={footstatsImage} style={{ marginTop: '42px' }} alt="Footstats placeholder" />
                                    </div>
                                </div>
                            </div>
                        );
                    }
                }
            }
        }
    };

    return (
        <div className='fullHeight'>
            {showTest ? (
                <div className=''>
                    <React.StrictMode>
                        <Reader cname={cityName} />
                    </React.StrictMode>
                </div>
            ) : (
                <>
                    <form onSubmit={startTest}>
                        <div className="col mb-3 mt-3 text-center" style={{ margin: "20px" }}>
                            <h2 className='title' style={{ margin: "60px" }}>Login to access the statistics of your JOOKS routes! Every three months, we will upload the statistics of your routes on this platform, so you can access them at any time.</h2>
                        </div>
                        <div className="col  mb-3 mt-3 text-center">
                            <input className="form-control form-control-lg m-auto input-quizz"
                                placeholder="Your city or sponsor brand" type="text" name="city_name" required />
                            <input className="form-control form-control-lg m-auto mt-3 input-quizz"
                                placeholder="Your password" type="text" name="city_password" required />
                            <h5 style={{ margin: "60px" }}>Please specify if you are a sponsor or a city before proceeding.</h5>
                            <select
                                value={queryType}
                                onChange={(e) => setQueryType(e.target.value)}
                                style={{ marginTop: '20px' }}
                            >
                                <option value="city">City</option>
                                <option value="sponsor">Sponsor</option>
                            </select>
                            <p className={(errorForm) ? "msgError" : 'hide-error'}> We are sorry, but the statistics for your city do not seem to be available. Please contact us by email and we will solve this problem as soon as possible.</p>
                            <p className={(errorForm2) ? "msgError" : 'hide-error'}> It seems there is a mistake in your password. Please enter it again or contact us. </p>
                            <button type="submit" className="btn btn-danger mt-0 btn-lg " style={{ backgroundColor: "#57C528", border: "none" }}>Access your statistics</button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
