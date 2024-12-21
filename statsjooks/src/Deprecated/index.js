const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');
const admin = require('firebase-admin');
const fs = require('fs'); // Add this import
const path = require('path'); // Add this import

admin.initializeApp();
const db = admin.firestore();

// Decode base64 service account key
const serviceKeyBase64 = functions.config().google.service_key_base64;
const serviceKeyJson = Buffer.from(serviceKeyBase64, 'base64').toString('utf8');

// Write the service key to a temporary file
const tempFilePath = path.join('/tmp', 'GoogleServiceKeyJOOKS.json');
fs.writeFileSync(tempFilePath, serviceKeyJson);

const bigquery = new BigQuery({
  projectId: 'shining-heat-203',
  keyFilename: tempFilePath, // Path to the temporary file
});

const app = express();

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: ['https://newstatsjooks.web.app', 'https://statsjooks.web.app'], // Add your frontend URLs here
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

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

// Test endpoint to verify BigQuery initialization
app.get('/test-bigquery', async (req, res) => {
  try {
    const [datasets] = await bigquery.getDatasets();
    res.status(200).send(datasets);
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).send('Error fetching datasets');
  }
});

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

exports.api = functions.https.onRequest(app);
