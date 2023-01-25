import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Send from './components/Test'
import CSV from './components/Parser'
import Parse from './App'

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <Send/> */}
    <Parse/>
    <CSV/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
