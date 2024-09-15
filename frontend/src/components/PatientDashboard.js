import React, { useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { TranslatableText } from './TranslationContext';
import { Filter, Archive, RefreshCw, AlertTriangle } from 'lucide-react';

const initialPatientsData = {
  "JD001": {
    name: "John Doe",
    personalInfo: { age: 35, sex: "Male", contact: "+1 (555) 123-4567" },
    currentProblem: "Patient reports persistent headaches and dizziness for the past two weeks.",
    isUrgent: true,
    isArchived: false
  },
  "JS002": {
    name: "Jane Smith",
    personalInfo: { age: 28, sex: "Female", contact: "+1 (555) 987-6543" },
    currentProblem: "Patient complains of persistent cough and fatigue for the last month.",
    isUrgent: false,
    isArchived: false
  },
  "RJ003": {
    name: "Robert Johnson",
    personalInfo: { age: 52, sex: "Male", contact: "+1 (555) 246-8135" },
    currentProblem: "Patient reports increased thirst and frequent urination.",
    isUrgent: true,
    isArchived: false
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

const PatientCard = ({ patient, onClick }) => {
  if (!patient || !patient.personalInfo) {
    return (
      <div style={styles.errorCard}>
        <AlertTriangle size={24} color="red" />
        <p><TranslatableText>Invalid patient data</TranslatableText></p>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        ...styles.card,
        boxShadow: patient.isUrgent && !patient.isArchived
          ? '0 0 15px rgba(255,0,0,0.5)'
          : styles.card.boxShadow,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.3s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = patient.isUrgent && !patient.isArchived
          ? '0 0 20px rgba(255,0,0,0.7)'
          : '0 8px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = patient.isUrgent && !patient.isArchived
          ? '0 0 15px rgba(255,0,0,0.5)'
          : styles.card.boxShadow;
      }}
    >
      {patient.isUrgent && !patient.isArchived && <UrgentIndicator />}
      <div style={{
        ...styles.cardHeader,
        backgroundColor: patient.isUrgent && !patient.isArchived ? '#89CFF0' : styles.cardHeader.backgroundColor,
        color: patient.isUrgent && !patient.isArchived ? 'white' : styles.cardHeader.color,
      }}>
        {patient.name || <TranslatableText>Unknown Name</TranslatableText>}
      </div>
      <div style={styles.cardContent}>
        <p><strong><TranslatableText>Age:</TranslatableText></strong> {patient.personalInfo.age || <TranslatableText>Unknown</TranslatableText>}</p>
        <p><strong><TranslatableText>Sex:</TranslatableText></strong> {patient.personalInfo.sex || <TranslatableText>Unknown</TranslatableText>}</p>
        <p><strong><TranslatableText>Contact:</TranslatableText></strong> {patient.personalInfo.contact || <TranslatableText>Unknown</TranslatableText>}</p>
        <p><strong><TranslatableText>Current Problem:</TranslatableText></strong> {patient.currentProblem || <TranslatableText>No information available</TranslatableText>}</p>
      </div>
    </div>
  );
};

const PatientDetailedInfo = ({ patient, onArchive, onUnarchive }) => {
  const [showButton, setShowButton] = useState(true);

  const handleArchiveClick = () => {
    onArchive();
    setShowButton(false);
  };

  const handleUnarchiveClick = () => {
    onUnarchive();
    setShowButton(false);
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '1000px', margin: '2rem auto', boxSizing: 'border-box', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #e0e0e0', position: 'relative' }}>
      <h2 style={{ color: '#3498db', marginBottom: '1rem' }}>
        {patient.name} - <TranslatableText>Detailed Information</TranslatableText>
      </h2>
      <p><strong><TranslatableText>Age:</TranslatableText></strong> {patient.personalInfo.age}</p>
      <p><strong><TranslatableText>Sex:</TranslatableText></strong> {patient.personalInfo.sex}</p>
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
      {showButton && (
        patient.isArchived ? (
          <button
            onClick={handleUnarchiveClick}
            style={{
              ...styles.archiveButton,
              backgroundColor: '#3498db', // Blue color for unarchive button
              right: '2rem', // Align with the right side of the container
            }}
          >
            <RefreshCw size={16} style={{ marginRight: '5px' }} />
            <TranslatableText>Unarchive Patient</TranslatableText>
          </button>
        ) : (
          <button
            onClick={handleArchiveClick}
            style={{
              ...styles.archiveButton,
              right: '2rem', // Align with the right side of the container
            }}
          >
            <Archive size={16} style={{ marginRight: '5px' }} />
            <TranslatableText>Archive Patient</TranslatableText>
          </button>
        )
      )}
    </div>
  );
};

const SortButton = ({ currentSort, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sortOptions = [
    { value: 'urgent', label: 'URGENT!' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'oldestToYoungest', label: 'Oldest to Youngest' },
    { value: 'youngestToOldest', label: 'Youngest to Oldest' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'archived', label: 'Archived Patients' },
  ];
  return (
    <div style={styles.sortContainer}>
      <button
        style={styles.sortButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Sort options"
      >
        <Filter size={16} />
      </button>
      {isOpen && (
        <div style={styles.sortDropdown}>
          {sortOptions.map((option) => (
            <div
              key={option.value}
              style={{
                ...styles.sortOption,
                fontWeight: currentSort === option.value ? 'bold' : 'normal',
              }}
              onClick={() => {
                onSortChange(option.value);
                setIsOpen(false);
              }}
            >
              <TranslatableText>{option.label}</TranslatableText>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PatientDashboard = () => {
  const { logout } = useAuth0();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sortMethod, setSortMethod] = useState('urgent');
  const [patientsData, setPatientsData] = useState(initialPatientsData);

  console.log('patientsData:', patientsData);

  const sortedPatients = useMemo(() => {
    const patients = Object.entries(patientsData);
   
    const isValidPatient = (patient) => {
      return patient && patient.personalInfo && typeof patient.personalInfo.age === 'number';
    };

    switch (sortMethod) {
      case 'urgent':
        return patients
          .filter(([, p]) => isValidPatient(p) && !p.isArchived)
          .sort(([, a], [, b]) => {
            if (a.isUrgent === b.isUrgent) {
              return a.name.localeCompare(b.name);
            }
            return b.isUrgent ? 1 : -1;
          });
      case 'alphabetical':
        return patients
          .filter(([, p]) => isValidPatient(p) && !p.isArchived)
          .sort(([, a], [, b]) => a.name.localeCompare(b.name));
      case 'oldestToYoungest':
        return patients
          .filter(([, p]) => isValidPatient(p) && !p.isArchived)
          .sort(([, a], [, b]) => b.personalInfo.age - a.personalInfo.age);
      case 'youngestToOldest':
        return patients
          .filter(([, p]) => isValidPatient(p) && !p.isArchived)
          .sort(([, a], [, b]) => a.personalInfo.age - b.personalInfo.age);
      case 'male':
        return patients
          .filter(([, p]) => isValidPatient(p) && !p.isArchived && p.personalInfo.sex === 'Male');
      case 'female':
        return patients
          .filter(([, p]) => isValidPatient(p) && !p.isArchived && p.personalInfo.sex === 'Female');
      case 'archived':
        return patients
          .filter(([, p]) => isValidPatient(p) && p.isArchived);
      default:
        return patients
          .filter(([, p]) => isValidPatient(p) && !p.isArchived);
    }
  }, [sortMethod, patientsData]);

  const handleArchivePatient = (patientId) => {
    setPatientsData(prevData => ({
      ...prevData,
      [patientId]: prevData[patientId] ? {
        ...prevData[patientId],
        isArchived: true,
        isUrgent: false
      } : null
    }));
    setSelectedPatient(prevPatient => prevPatient ? {
      ...prevPatient,
      isArchived: true,
      isUrgent: false
    } : null);
  };

  const handleUnarchivePatient = (patientId) => {
    setPatientsData(prevData => ({
      ...prevData,
      [patientId]: prevData[patientId] ? {
        ...prevData[patientId],
        isArchived: false
      } : null
    }));
    setSelectedPatient(prevPatient => prevPatient ? {
      ...prevPatient,
      isArchived: false
    } : null);
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <h1 style={styles.title}>
            {selectedPatient ? (
              <>
                <TranslatableText>Patient Details:</TranslatableText> {selectedPatient.name}
              </>
            ) : (
              <TranslatableText>
                {sortMethod === 'archived' ? 'Archived Patients' : 'Patient Dashboard'}
              </TranslatableText>
            )}
          </h1>
          <div style={styles.buttonContainer}>
            <button
              style={styles.logoutButton}
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              <TranslatableText>Log Out</TranslatableText>
            </button>
            {!selectedPatient && (
              <SortButton
                currentSort={sortMethod}
                onSortChange={setSortMethod}
              />
            )}
          </div>
        </div>
      </div>

      <div style={{ ...styles.content, marginTop: '40px' }}>
        {selectedPatient ? (
          <PatientDetailedInfo 
            patient={selectedPatient}
            onArchive={() => {
              const patientId = Object.keys(patientsData).find(key => patientsData[key] === selectedPatient);
              if (patientId) handleArchivePatient(patientId);
            }}
            onUnarchive={() => {
              const patientId = Object.keys(patientsData).find(key => patientsData[key] === selectedPatient);
              if (patientId) handleUnarchivePatient(patientId);
            }}
          />
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

// Styles
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
    backgroundColor: '#89CFF0',
    width: '100%',
    padding: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxSizing: 'border-box',
    borderBottomLeftRadius: '15px',
    borderBottomRightRadius: '15px',
    border: '1px solid #7ab8d9', // Added border
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Added shadow
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
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1)', // Updated shadow and added border
    padding: '20px',
    position: 'relative',
    transition: 'transform 0.2s ease, box-shadow 0.3s ease',
    boxSizing: 'border-box',
  },
  cardHeader: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    backgroundColor: '#89CFF0',
    color: 'white',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #7ab8d9', // Added border
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Added shadow
  },
  cardContent: {
    marginTop: '10px',
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    right: '-15px',
  },
  logoutButton: {
    backgroundColor: '#3EB489',
    color: 'white',
    padding: '10px 20px',
    border: '1px solid #35a07a',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginRight: '15px', // Increased from '10px' to '15px' to add more space between logout and sort buttons
  },
  backButton: {
    backgroundColor: '#3EB489',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '20px',
  },
  archiveButton: {
    position: 'absolute',
    top: '2rem', // Changed from '160px' to '2rem' to match the container's padding
    backgroundColor: '#ff6b6b',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    zIndex: 10,
  },
  sortContainer: {
    position: 'relative',
  },
  sortButton: {
    backgroundColor: '#3EB489',
    color: 'white',
    width: '32px',
    height: '32px',
    border: '1px solid #35a07a',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Added shadow
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  sortDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1000,
    minWidth: '120px',
  },
  sortOption: {
    padding: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#f0f0f0',
    },
  },
  errorCard: {
    backgroundColor: '#ffebee',
    border: '1px solid #ffcdd2',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    width: '250px',
    margin: '10px',
  },
};

export default PatientDashboard;