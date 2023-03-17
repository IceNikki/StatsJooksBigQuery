import React, { useState } from 'react';
import Fuse from 'fuse.js';
import { db } from '../config/firebase';
import { doc, getDoc, getDocs } from 'firebase/firestore';

export default function CitySuggester({ cityInput, setCityInput, onSubmit }) {
  const [suggestions, setSuggestions] = useState([]);

  async function handleInputChange(event) {
    const inputValue = event.target.value;

    // retrieve all city names from database
    const docRef = doc(db, 'City');
    const docSnap = await getDocs(docRef);
    const cities = docSnap.docs.map((doc) => ({ name: doc.id }));

    // configure Fuse.js options
    const fuseOptions = {
      keys: ['name'],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
    };

    // search for possible matches using Fuse.js
    const fuse = new Fuse(cities, fuseOptions);
    const matches = fuse.search(inputValue);

    // extract the city names from the matches
    const matchNames = matches.map((match) => match.item.name);

    setSuggestions(matchNames);
    setCityInput(inputValue);
  }

  function handleSuggestionClick(suggestion) {
    setCityInput(suggestion);
    setSuggestions([]);
    onSubmit(suggestion);
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Enter city name"
        value={cityInput}
        onChange={handleInputChange}
      />
      {suggestions.length > 0 && (
        <div>
          <p>Suggestions:</p>
          <ul>
            {suggestions.map((suggestion) => (
              <li key={suggestion} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
