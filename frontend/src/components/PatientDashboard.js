import React from 'react';

const patientsData = {
  "JD001": {
    name: "John Doe",
    personalInfo: { age: 35, gender: "Male", contact: "+1 (555) 123-4567" },
    currentProblem: "Patient reports persistent headaches and dizziness for the past two weeks."
  },
  "JS002": {
    name: "Jane Smith",
    personalInfo: { age: 28, gender: "Female", contact: "+1 (555) 987-6543" },
    currentProblem: "Patient complains of persistent cough and fatigue for the last month."
  },
  "RJ003": {
    name: "Robert Johnson",
    personalInfo: { age: 52, gender: "Male", contact: "+1 (555) 246-8135" },
    currentProblem: "Patient reports increased thirst and frequent urination."
  }
};

const PatientCard = ({ patient }) => (
  <div style={{
    width: '300px',
    margin: '1rem',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    backgroundColor: 'white'
  }}>
    <div style={{
      backgroundColor: '#3498db',
      color: 'white',
      padding: '1rem',
      fontWeight: 'bold',
      fontSize: '1.2rem'
    }}>
      {patient.name}
    </div>
    <div style={{ padding: '1rem' }}>
      <p style={{ marginBottom: '0.5rem' }}><strong>Age:</strong> {patient.personalInfo.age}</p>
      <p style={{ marginBottom: '0.5rem' }}><strong>Gender:</strong> {patient.personalInfo.gender}</p>
      <p style={{ marginBottom: '0.5rem' }}><strong>Contact:</strong> {patient.personalInfo.contact}</p>
      <p style={{ marginTop: '1rem' }}><strong>Current Problem:</strong> {patient.currentProblem}</p>
    </div>
  </div>
);

const PatientDashboard = () => {
  return (
    <div style={{
      backgroundColor: '#ecf0f1',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        backgroundColor: '#3498db',
        color: 'white',
        padding: '1.5rem',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          margin: 0
        }}>
          Patient Dashboard
        </h1>
      </div>
      <div style={{
        padding: '2rem',
        flex: 1
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {Object.entries(patientsData).map(([id, patient]) => (
            <PatientCard key={id} patient={patient} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;