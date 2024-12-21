import React, { useState, useEffect } from 'react';
import { Query } from './QueryData';

const Reader = ({ cityName }) => {
  const [dataread, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChoice, setChoice] = useState(false);
  const [selectedMenuOption, setSelectedMenuOption] = useState("quarterly");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await Query(cityName);
      setData(data);
      setLoading(false);
    };
    fetchData();
  }, [cityName]);

  if (loading) {
    return <p>Loading...</p>;
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
      let title, nbrSessionsFinal;
      if (selectedMenuOption === "quarterly") {
        title = "Your statistics for the 1st quarter of 2023";
        nbrSessionsFinal = dataread.reduce((acc, item) => acc + item.nbrSessions, 0);
      } else {
        title = "Your statistics for the year 2023";
        nbrSessionsFinal = dataread.reduce((acc, item) => acc + item.nbrSessionsAnnual, 0);
      }

      return (
        <div>
          <h4 className="mt-5 mb-5 gotham-rounded-bold" style={{ color: "#57c528", border: "none" }}>
            {title}
          </h4>
          <table>
            <thead>
              <tr>
                <th className="table_header" style={{ width: "10%" }}>
                  ID
                </th>
                <th className="table_header" style={{ width: "25%" }}>
                  City name
                </th>
                <th className="table_header" style={{ width: "25%" }}>
                  Route name
                </th>
                <th className="table_header" style={{ width: "20%" }}>
                  Number of sessions
                </th>
                <th className="table_header" style={{ width: "20%" }}>
                  Number of trees planted
                </th>
              </tr>
            </thead>
            <tbody>
              {dataread.map((item) => (
  <tr key={item.id}>
    <td className="table_body">{item.id}</td>
    <td className="table_body">{item.nameCity}</td>
    <td className="table_body">{item.nameRoute}</td>
    <td className="table_body">{Math.floor(item.nbrSessionsFinal)}</td>
    <td className="table_body">{Math.floor(item.nbrSessionsFinal / 20)}</td>
  </tr>
))}
<tr>
  <td className="table_body" style={{ fontWeight: "bold" }}>Total</td>
  <td className="table_body"></td>
  <td className="table_body"></td>
  <td className="table_body" style={{ fontWeight: "bold" }}>
    {dataread.reduce((acc, item) => {
      const nbrSessionsFinal = selectedMenuOption === "quarterly" ? item.nbrSessions : item.nbrSessionsAnnual;
      return acc + Math.floor(nbrSessionsFinal);
    }, 0)}
  </td>
  <td className="table_body" style={{ fontWeight: "bold" }}>
    {dataread.reduce((acc, item) => {
      const nbrSessionsFinal = selectedMenuOption === "quarterly" ? item.nbrSessions : item.nbrSessionsAnnual;
      return acc + Math.floor(nbrSessionsFinal);
    }, 0)}
  </td>
  <td className="table_body" style={{ fontWeight: "bold" }}>
    {dataread.reduce((acc, item) => {
      const nbrSessionsFinal = selectedMenuOption === "quarterly" ? item.nbrSessions : item.nbrSessionsAnnual;
      return acc + Math.floor(nbrSessionsFinal / 20);
    }, 0)}
  </td>
</tr>
</tbody>
</table>
</div>
);
}
}
};
export default Reader;