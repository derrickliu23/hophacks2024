const express = require('express');
const router = express.Router();
const Patient = require('../models/patient'); // Assuming you have a Mongoose model for patients

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find(); // Fetch patients from MongoDB
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
