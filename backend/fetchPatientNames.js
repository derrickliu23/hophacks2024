const mongoose = require('mongoose');
const Patient = require('./models/patient');

// Define your MongoDB connection string
const uri = 'mongodb://localhost:27017/medicalApp';

const fetchPatientNames = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Fetch all patients
    const patients = await Patient.find(); // No callback, use async/await
    patients.forEach(patient => {
      console.log(patient.name);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await mongoose.disconnect(); // Ensure disconnection
  }
};

fetchPatientNames();
