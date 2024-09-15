const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: String,
  personalInfo: {
    age: Number,
    ID: String,
    contact: String,
  },
  currentProblem: String,
  isUrgent: Boolean,
});

module.exports = mongoose.model('Patient', PatientSchema);
