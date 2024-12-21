import React, { useState } from 'react';
import { db } from '../../config/firebase';
import { getDoc, doc } from "firebase/firestore";
import { citysuggester } from '../CitySuggester';
import Reader from './Reader';
import './Stats.css';
import { fetchStatsData } from '../BigQuery/BigQueryClient';
import LoadingSpinner from './LoadingSpinner';

export default function Stats() {
  const [showChoice, setChoice] = useState(false);
  const [showTest, setTable] = useState(false);
  const [errorForm, showError] = useState(false);
  const [errorForm2, showError2] = useState(false);
  const [cityPassword, setCityPassword] = useState("");
  const [cityName, setCityName] = useState("");
  const [selectedMenuOption, setSelectedMenuOption] = useState('quarterly');
  const [queryType, setQueryType] = useState('city');
  const [loading, setLoading] = useState(false);

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
        if (window.confirm(`Did you want to say ${suggestedCity}?`)) {
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

  return (
    <div className='fullHeight'>
      {showTest ? (
        <Reader
          cityName={cityName}
          setTable={setTable}
          selectedMenuOption={selectedMenuOption}
          setSelectedMenuOption={setSelectedMenuOption}
          showChoice={showChoice}
          setChoice={setChoice}
          queryType={queryType}
          fetchStatsData={fetchStatsData}
        />
      ) : (
        <>
          <form onSubmit={startTest}>
            <div className="col mb-3 mt-3 text-center" style={{ margin: "20px" }}>
              <h2 className='title' style={{ margin: "60px" }}>
                Login to access the statistics of your JOOKS routes! Every three months, we will upload the statistics of your routes on this platform, so you can access them at any time.
              </h2>
            </div>
            <div className="col mb-3 mt-3 text-center">
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
