import React, { useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const patientsData = {
  "JD001": {
    name: "John Doe",
    personalInfo: { age: 35, gender: "Male", contact: "+1 (555) 123-4567" },
    currentProblem: "Patient reports persistent headaches and dizziness for the past two weeks.",
    isUrgent: true
  },
  "JS002": {
    name: "Jane Smith",
    personalInfo: { age: 28, gender: "Female", contact: "+1 (555) 987-6543" },
    currentProblem: "Patient complains of persistent cough and fatigue for the last month.",
    isUrgent: false
  },
  "RJ003": {
    name: "Robert Johnson",
    personalInfo: { age: 52, gender: "Male", contact: "+1 (555) 246-8135" },
    currentProblem: "Patient reports increased thirst and frequent urination.",
    isUrgent: true
  }
};

const UrgentIndicator = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: isHovered ? 'auto' : '20px',
        height: '20px',
        backgroundColor: '#FFD700', // Yellow color
        borderRadius: isHovered ? '12px' : '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        cursor: 'pointer',
        zIndex: 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <span style={{ padding: '0 10px' }}>URGENT!</span>
      ) : (
        '!'
      )}
    </div>
  );
};

const PatientCard = ({ patient, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      ...styles.card,
      boxShadow: patient.isUrgent 
        ? '0 0 15px rgba(255,0,0,0.5)' // Red shadow for urgent cases
        : styles.card.boxShadow,
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.3s ease',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.boxShadow = patient.isUrgent 
        ? '0 0 20px rgba(255,0,0,0.7)'
        : '0 8px 16px rgba(0, 0, 0, 0.2)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = patient.isUrgent 
        ? '0 0 15px rgba(255,0,0,0.5)'
        : styles.card.boxShadow;
    }}
  >
    {patient.isUrgent && <UrgentIndicator />}
    <div style={{
      ...styles.cardHeader,
      backgroundColor: patient.isUrgent ? '#FF0000' : styles.cardHeader.backgroundColor, // Red background for urgent cases
      color: patient.isUrgent ? 'white' : styles.cardHeader.color, // Ensure text is white on red background
    }}>
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

const PatientDetailedInfo = ({ patient }) => (
  <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', maxWidth: '800px', margin: '2rem auto' }}>
    <h2 style={{ color: '#3498db', marginBottom: '1rem' }}>{patient.name} - Detailed Information</h2>
    <p><strong>Age:</strong> {patient.personalInfo.age}</p>
    <p><strong>Gender:</strong> {patient.personalInfo.gender}</p>
    <p><strong>Contact:</strong> {patient.personalInfo.contact}</p>
    <p><strong>Current Problem:</strong> {patient.currentProblem}</p>
    <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
      <h3 style={{ color: '#3498db', marginBottom: '1rem' }}>Additional Details (Placeholder)</h3>
      <p><strong>Medical History:</strong> Placeholder for detailed medical history</p>
      <p><strong>Medications:</strong> Placeholder for current medications</p>
      <p><strong>Lab Results:</strong> Placeholder for recent lab results</p>
      <p><strong>Treatment Plan:</strong> Placeholder for current treatment plan</p>
    </div>
  </div>
);

const PatientDashboard = () => {
  const { logout } = useAuth0();
  const [selectedPatient, setSelectedPatient] = useState(null);

  const sortedPatients = useMemo(() => {
    return Object.entries(patientsData).sort(([, a], [, b]) => {
      if (a.isUrgent === b.isUrgent) {
        return 0;
      }
      return a.isUrgent ? -1 : 1;
    });
  }, []);

  return (
    <div style={styles.dashboard}>
      <button
        style={styles.logoutButton}
        onClick={() => logout({ returnTo: window.location.origin })}
      >
        Log Out
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>
          {selectedPatient ? `Patient Details: ${selectedPatient.name}` : 'Patient Dashboard'}
        </h1>
      </div>

      <div style={styles.content}>
        {selectedPatient ? (
          <PatientDetailedInfo patient={selectedPatient} />
        ) : (
          sortedPatients.map(([id, patient]) => (
            <PatientCard 
              key={id} 
              patient={patient} 
              onClick={() => setSelectedPatient(patient)}
            />
          ))
        )}
      </div>

      {selectedPatient && (
        <button
          onClick={() => setSelectedPatient(null)}
          style={styles.backButton}
        >
          Back to Dashboard
        </button>
      )}
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
    top: '40px',
    right: '40px',
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
    position: 'relative',
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
  backButton: {
    display: 'block',
    margin: '2rem auto',
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default PatientDashboard;