/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const { BigQuery } = require('@google-cloud/bigquery');
const cors = require('cors');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

admin.initializeApp();

const db = admin.firestore();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const bigquery = new BigQuery({
  projectId: 'shining-heat-203',
  keyFilename: 'path/to/GoogleServiceKeyJOOKS.json',
});

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

exports.api = functions.https.onRequest(app);
