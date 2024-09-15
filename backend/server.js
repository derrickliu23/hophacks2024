const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const patientRoutes = require('./routes/patient'); // Import patient routes

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Firebase Admin SDK
// You need to replace 'path/to/your/serviceAccountKey.json' with the actual path to your Firebase service account key
const serviceAccount = require("C:/Users/benja/Downloads/symptomsync-firebase-adminsdk-fugzi-f6bff711a8.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://symptomsync.firebaseio.com" // Replace with your Firebase project URL
});

// Get a reference to the Firestore database
const db = admin.firestore();

// Use the patient routes
app.use('/api/patients', patientRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));