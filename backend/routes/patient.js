const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get a reference to the Firestore database
const db = admin.firestore();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patientsSnapshot = await db.collection('patients').get();
    const patients = [];
    patientsSnapshot.forEach(doc => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new patient
router.post('/', async (req, res) => {
  try {
    const newPatient = req.body;
    const docRef = await db.collection('patients').add(newPatient);
    res.status(201).json({ id: docRef.id, ...newPatient });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific patient
router.get('/:id', async (req, res) => {
  try {
    const patientDoc = await db.collection('patients').doc(req.params.id).get();
    if (!patientDoc.exists) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ id: patientDoc.id, ...patientDoc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a patient
router.put('/:id', async (req, res) => {
  try {
    const updatedPatient = req.body;
    await db.collection('patients').doc(req.params.id).update(updatedPatient);
    res.json({ id: req.params.id, ...updatedPatient });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a patient
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('patients').doc(req.params.id).delete();
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;