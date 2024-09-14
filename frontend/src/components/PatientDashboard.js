import React, { useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { TranslatableText } from './TranslationContext'; // Import the TranslatableText component

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
        <span style={{ padding: '0 10px' }}>
          <TranslatableText>URGENT!</TranslatableText> {/* Translatable */}
        </span>
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
      <p><strong><TranslatableText>Age:</TranslatableText></strong> {patient.personalInfo.age}</p>
      <p><strong><TranslatableText>Gender:</TranslatableText></strong> {patient.personalInfo.gender}</p>
      <p><strong><TranslatableText>Contact:</TranslatableText></strong> {patient.personalInfo.contact}</p>
      <p><strong><TranslatableText>Current Problem:</TranslatableText></strong> {patient.currentProblem}</p>
    </div>
  </div>
);

const PatientDetailedInfo = ({ patient }) => (
    <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '1000px', margin: '2rem auto', boxSizing: 'border-box' }}>
      <h2 style={{ color: '#3498db', marginBottom: '1rem' }}>
        {patient.name} - <TranslatableText>Detailed Information</TranslatableText>
      </h2>
      <p><strong><TranslatableText>Age:</TranslatableText></strong> {patient.personalInfo.age}</p>
      <p><strong><TranslatableText>Gender:</TranslatableText></strong> {patient.personalInfo.gender}</p>
      <p><strong><TranslatableText>Contact:</TranslatableText></strong> {patient.personalInfo.contact}</p>
      <p><strong><TranslatableText>Current Problem:</TranslatableText></strong> {patient.currentProblem}</p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px', boxSizing: 'border-box' }}>
        <h3 style={{ color: '#3498db', marginBottom: '1rem' }}>
          <TranslatableText>Additional Details (Placeholder)</TranslatableText>
        </h3>
        <p><strong><TranslatableText>Medical History:</TranslatableText></strong> <TranslatableText>Placeholder for detailed medical history</TranslatableText></p>
        <p><strong><TranslatableText>Medications:</TranslatableText></strong> <TranslatableText>Placeholder for current medications</TranslatableText></p>
        <p><strong><TranslatableText>Lab Results:</TranslatableText></strong> <TranslatableText>Placeholder for recent lab results</TranslatableText></p>
        <p><strong><TranslatableText>Treatment Plan:</TranslatableText></strong> <TranslatableText>Placeholder for current treatment plan</TranslatableText></p>
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
        <div style={styles.header}>
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>
              {selectedPatient ? (
                <TranslatableText>Patient Details:</TranslatableText> + selectedPatient.name
              ) : (
                <TranslatableText>Patient Dashboard</TranslatableText>
              )}
            </h1>
            <button
              style={styles.logoutButton}
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              <TranslatableText>Log Out</TranslatableText>
            </button>
          </div>
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
            <TranslatableText>Back to Dashboard</TranslatableText>
          </button>
        )}
      </div>
    );
  };
  
  //Styles
  const styles = {
    dashboard: {
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#ecf0f1',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '0',
      boxSizing: 'border-box',
    },
    header: {
      backgroundColor: '#3498db',
      width: '100%',
      padding: '20px',
      display: 'flex',
      alignItems: 'center', // Vertically centers items in the header
      justifyContent: 'center', // Centers title horizontally
      position: 'relative', // Establishes positioning context
      boxSizing: 'border-box',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      position: 'relative',
    },
    title: {
      margin: '0',
      fontSize: '2rem',
      color: 'white',
      textAlign: 'center',
      flex: 1,
    },
    logoutButton: {
      position: 'absolute',
      right: '30px', // Distance from the right edge of the viewport
      backgroundColor: '#ff4d4d',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    content: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      width: '100%',
      boxSizing: 'border-box',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      padding: '20px',
      position: 'relative',
      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
      boxSizing: 'border-box',
    },
    cardHeader: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      backgroundColor: '#3498db',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
    },
    cardContent: {
      marginTop: '10px',
    },
    backButton: {
      marginTop: '20px',
      backgroundColor: '#3498db',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
  };
  
  
  
  

export default PatientDashboard;