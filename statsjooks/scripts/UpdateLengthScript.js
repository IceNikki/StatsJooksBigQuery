const admin = require('firebase-admin');
const fs = require('fs');
const Papa = require('papaparse');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Function to parse CSV and update Firestore
function updateRoutesFromCSV(filePath) {
  const csvFile = fs.readFileSync(filePath, 'utf8');
  Papa.parse(csvFile, {
    header: true,
    complete: async (results) => {
      const batch = db.batch();
      results.data.forEach((row) => {
        const routeRef = db.collection('Routes').doc(row.__id__);
        batch.update(routeRef, { Length: parseInt(row.Length, 10) });
      });
      await batch.commit();
      console.log('Firestore update complete.');
    }
  });
}

// Replace with the actual path to your CSV file
updateRoutesFromCSV("C:/Users/logic/PycharmProjects/Mile/Base Statistiques/RoutesBase.csv");
