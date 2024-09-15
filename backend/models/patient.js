const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  idNumber: String,
  sexAtBirth: String,
  personalInfo: {
    age: Number,
    ID: String,
    contact: String,
  },
  symptoms: String,
  transcript: [String],
  summary: String,
  isUrgent: Boolean,
});

module.exports = mongoose.model('Patient', patientSchema);
