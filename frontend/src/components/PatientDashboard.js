import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

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
  <div style={styles.card}>
    <div style={styles.cardHeader}>
      {patient.name}
    </div>
    <div style={styles.cardContent}>
      <p><strong>Age:</strong> {patient.personalInfo.age}</p>
      <p><strong>Gender:</strong> {patient.personalInfo.gender}</p>
      <p><strong>Contact:</strong> {patient.personalInfo.contact}</p>
      <p><strong>Current Problem:</strong> {patient.currentProblem}</p>
    </div>
  </div>
);

const PatientDashboard = () => {
  const { logout } = useAuth0();

  return (
    <div style={styles.dashboard}>
      <button
        style={styles.logoutButton}
        onClick={() => logout({ returnTo: window.location.origin })}
      >
        Log Out
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>Patient Dashboard</h1>
      </div>

      <div style={styles.content}>
        {Object.entries(patientsData).map(([id, patient]) => (
          <PatientCard key={id} patient={patient} />
        ))}
      </div>
    </div>
  );
};

// Styles
const styles = {
  dashboard: {
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: '#ecf0f1',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoutButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#ff4d4d',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#3498db',
    width: '100%',
    padding: '20px',
    textAlign: 'center',
    color: 'white',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: 0,
  },
  content: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
  },
  card: {
    width: '300px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '16px',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
  cardContent: {
    padding: '16px',
  },
};

export default PatientDashboard;
