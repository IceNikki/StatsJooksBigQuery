const express = require('express');
const bodyParser = require('body-parser');
const { BigQuery } = require('@google-cloud/bigquery');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert('C:/Users/logic/OneDrive/Documents/GitHub/StatsJooks/StatsJooksBigQuery/statsjooks/config/GoogleServiceKeyJOOKS.json')
});

const db = admin.firestore();

const app = express();
const port = 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'https://newstatsjooks.web.app', 'https://statsjooks.web.app'], // Include localhost
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.use(bodyParser.json());

const bigquery = new BigQuery({
  projectId: 'shining-heat-203',
  keyFilename: 'C:/Users/logic/OneDrive/Documents/GitHub/StatsJooks/StatsJooksBigQuery/statsjooks/config/GoogleServiceKeyJOOKS.json',
});

// BigQuery fetch function
async function fetchBigQueryData(startDate, endDate, routeId = '', routeName = '', cityId = '', cityName = '') {
  const query = `
    WITH
      OpenRouteDetail AS (
        SELECT
          event_timestamp AS id,
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'route_id') AS route_id,
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'route_name') AS route_name,
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'city_id') AS city_id,
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'city_name') AS city_name,
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'user_id') AS user_id,
          (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'datetime') AS date_time
        FROM \`shining-heat-203.analytics_153288982.events_*\`
        WHERE event_name = 'open_route_detail'
        AND _TABLE_SUFFIX BETWEEN @startDate AND @endDate
      )
    SELECT *
    FROM OpenRouteDetail
    WHERE route_id LIKE CONCAT('%', @routeId, '%')
    AND route_name LIKE CONCAT('%', @routeName, '%')
    AND city_id LIKE CONCAT('%', @cityId, '%')
    AND city_name LIKE CONCAT('%', @cityName, '%')
  `;

  const options = {
    query: query,
    params: {
      startDate: startDate.replace(/-/g, ''), // Convert to 'YYYYMMDD' format
      endDate: endDate.replace(/-/g, ''), // Convert to 'YYYYMMDD' format
      routeId,
      routeName,
      cityId,
      cityName,
    },
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    return rows;
  } catch (error) {
    console.error('Error executing BigQuery query:', error);
    return [];
  }
}

// New endpoint for fetching stats data for a specific city
app.post('/query-stats', async (req, res) => {
  const { startDate, endDate, city } = req.body;

  console.log('Received query-stats request:', { startDate, endDate, city });

  try {
    const data = await fetchBigQueryData(startDate, endDate, '', '', '', city);
    res.json(data);
  } catch (error) {
    console.error('Error executing BigQuery query:', error);
    res.status(500).send('Error executing query');
  }
});

// Admin login endpoint
app.post('/admin-login', async (req, res) => {
  const { formName, formPassword } = req.body;

  try {
    const snapshot = await db.collection('administrateurs').where('nom', '==', formName).get();
    if (snapshot.empty) {
      return res.json({ success: false, errorName: true, errorPass: false });
    }

    const adminDoc = snapshot.docs[0];
    const adminData = adminDoc.data();
    const isPasswordValid = bcrypt.compareSync(formPassword, adminData.mdp);

    if (!isPasswordValid) {
      return res.json({ success: false, errorName: false, errorPass: true });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).send('Internal Server Error');
  }
});

// BigQuery data fetch endpoint
app.post('/query', async (req, res) => {
  const { startDate, endDate, routeId, routeName, cityId, cityName } = req.body;

  console.log('Received query request:', { startDate, endDate, routeId, routeName, cityId, cityName });

  try {
    const data = await fetchBigQueryData(startDate, endDate, routeId, routeName, cityId, cityName);
    res.json(data);
  } catch (error) {
    console.error('Error executing BigQuery query:', error);
    res.status(500).send('Error executing query');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
