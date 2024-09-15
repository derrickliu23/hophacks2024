// firebase-patient-model.js

const admin = require('firebase-admin');

class Patient {
  constructor(data) {
    this.name = data.name || '';
    this.age = data.age || 0;
    this.idNumber = data.idNumber || '';
    this.sexAtBirth = data.sexAtBirth || '';
    this.personalInfo = {
      age: data.age || 0,
      ID: data.idNumber || '',
      contact: data.personalInfo?.contact || '',
    };
    this.symptoms = data.symptoms || '';
    this.transcript = data.transcript || [];
    this.summary = data.summary || '';
    this.isUrgent = data.isUrgent || false;
  }

  // Method to save patient data to Firestore
  async save() {
    const db = admin.firestore();
    const patientRef = await db.collection('patients').add(this.toFirestore());
    return patientRef;
  }

  // Method to convert patient data to Firestore format
  toFirestore() {
    return {
      name: this.name,
      age: this.age,
      idNumber: this.idNumber,
      sexAtBirth: this.sexAtBirth,
      personalInfo: this.personalInfo,
      symptoms: this.symptoms,
      transcript: this.transcript,
      summary: this.summary,
      isUrgent: this.isUrgent,
    };
  }

  // Static method to create a Patient instance from Firestore data
  static fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return new Patient(data);
  }
}

module.exports = Patient;