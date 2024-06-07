import { useState } from 'react';
import { db } from '../config/firebase';
import { getDoc, doc } from "firebase/firestore";
import { citysuggester } from '../components/CitySuggester';
import Reader from '../components/Reader';

export default function LoginForm() {
  const [cityName, setCityName] = useState("");
  const [cityPassword, setCityPassword] = useState("");
  const [errorForm, setErrorForm] = useState(false);
  const [errorForm2, setErrorForm2] = useState(false);
  const [stateTable, setStateTable] = useState(false);

  async function startTest(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    let { city_name, city_password } = formProps;

    const docRef = doc(db, "City", city_name);
    const docSnap = await getDoc(docRef);
    const docRef2 = doc(db, "Password", city_password);
    const docSnap2 = await getDoc(docRef2);

    if (docSnap.exists() && docSnap2.exists()) {
      setCityName(city_name);
      setCityPassword(city_password);
      setErrorForm(false);
      setStateTable(true);
    } else if (docSnap.exists() && !docSnap2.exists()) {
      setErrorForm2(true);
    } else if (!docSnap.exists() && !docSnap2.exists()) {
      setErrorForm2(true);
    } else if (!docSnap.exists() && docSnap2.exists()) {
      const suggestedCity = await citysuggester(city_name);

      if (suggestedCity !== null) {
        if (window.confirm(`Did you want to say ${suggestedCity}?`)) {
          city_name = suggestedCity;
          setCityName(city_name);
          setCityPassword(city_password);
          setStateTable(true);
          setErrorForm(false);
        } else {
          setErrorForm(true);
        }
      }
    }
  }

  return (
    <>
      <form onSubmit={startTest}>
        <label htmlFor="city_name">City name:</label>
        <input type="text" name="city_name" id="city_name" required />
        <br />
        <label htmlFor="city_password">Password:</label>
        <input type="password" name="city_password" id="city_password" required />
        <br />
        <button type="submit">Start</button>
      </form>
      {errorForm && (
        <p>
          No matching city found. Did you mean something else? Try entering a similar name or check for spelling mistakes.
        </p>
      )}
      {errorForm2 && <p>Incorrect password or city name. Please try again.</p>}
      {stateTable && <Reader cityName={cityName} />}
    </>
  );
}
