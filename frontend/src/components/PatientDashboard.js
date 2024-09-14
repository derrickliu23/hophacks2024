import React, { useState } from 'react';

const patientsData = {
  "JD001": {
    name: "John Doe",
    personalInfo: { age: 35, gender: "Male", contact: "+1 (555) 123-4567" },
    medicalRecords: [
      { date: "2023-05-15", condition: "Flu", treatment: "Antiviral medication" },
      { date: "2022-11-03", condition: "Fractured wrist", treatment: "Cast application" },
    ],
    currentProblem: "Patient reports persistent headaches and dizziness for the past two weeks.",
    potentialDiagnoses: ["Migraine", "Tension headache", "Vestibular disorder"]
  },
  "JS002": {
    name: "Jane Smith",
    personalInfo: { age: 28, gender: "Female", contact: "+1 (555) 987-6543" },
    medicalRecords: [
      { date: "2024-01-10", condition: "Bronchitis", treatment: "Antibiotics and inhaler" },
      { date: "2023-08-22", condition: "Sprained ankle", treatment: "RICE therapy" },
    ],
    currentProblem: "Patient complains of persistent cough and fatigue for the last month.",
    potentialDiagnoses: ["Chronic bronchitis", "Asthma", "Post-viral syndrome"]
  },
  "RJ003": {
    name: "Robert Johnson",
    personalInfo: { age: 52, gender: "Male", contact: "+1 (555) 246-8135" },
    medicalRecords: [
      { date: "2023-12-05", condition: "Hypertension", treatment: "ACE inhibitors" },
      { date: "2022-03-18", condition: "Type 2 Diabetes", treatment: "Metformin and lifestyle changes" },
    ],
    currentProblem: "Patient reports increased thirst and frequent urination.",
    potentialDiagnoses: ["Uncontrolled diabetes", "Urinary tract infection", "Medication side effect"]
  }
};

const PatientDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState("JD001");
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("personal-info");

  const patientData = patientsData[selectedPatient];

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const iconStyle = { marginRight: '8px' };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#e0f7fa' }}>
      {isMenuOpen && (
        <div style={{ width: '250px', backgroundColor: '#1976d2', padding: '16px', color: 'white' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Patients</h2>
          {Object.entries(patientsData).map(([id, patient]) => (
            <button
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '12px',
                marginBottom: '12px',
                backgroundColor: selectedPatient === id ? '#90caf9' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onClick={() => setSelectedPatient(id)}
            >
              {patient.name}
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#bbdefb' }}>
        <div style={{ padding: '16px', position: 'relative' }}>
          <button
            onClick={toggleMenu}
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              padding: '10px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* SVG icon for the menu */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20V8H4V6ZM4 11H20V13H4V11ZM4 16H20V18H4V16Z" fill="white"/>
            </svg>
          </button>
          <div style={{ marginLeft: '50px' }}> {/* Margin to avoid overlap with the toggle button */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{patientData.name}</h2>
              
              {/* Flexbox Container for the Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                <button
                  onClick={() => setActiveTab("personal-info")}
                  style={{
                    marginRight: '12px',
                    padding: '8px 16px',
                    backgroundColor: activeTab === "personal-info" ? '#1976d2' : '#e3f2fd',
                    color: activeTab === "personal-info" ? 'white' : '#0d47a1',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <i className="fas fa-user" style={iconStyle}></i>
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab("medical-records")}
                  style={{
                    marginRight: '12px',
                    padding: '8px 16px',
                    backgroundColor: activeTab === "medical-records" ? '#1976d2' : '#e3f2fd',
                    color: activeTab === "medical-records" ? 'white' : '#0d47a1',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <i className="fas fa-file-medical" style={iconStyle}></i>
                  Medical Records
                </button>
                <button
                  onClick={() => setActiveTab("current-problem")}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: activeTab === "current-problem" ? '#1976d2' : '#e3f2fd',
                    color: activeTab === "current-problem" ? 'white' : '#0d47a1',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <i className="fas fa-stethoscope" style={iconStyle}></i>
                  Current Problem
                </button>
              </div>
              {activeTab === "personal-info" && (
                <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                  <p>Age: {patientData.personalInfo.age}</p>
                  <p>Gender: {patientData.personalInfo.gender}</p>
                  <p>Contact: {patientData.personalInfo.contact}</p>
                </div>
              )}
              {activeTab === "medical-records" && (
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                  {patientData.medicalRecords.map((record, index) => (
                    <div key={index} style={{ marginBottom: '16px' }}>
                      <p>Date: {record.date}</p>
                      <p>Condition: {record.condition}</p>
                      <p>Treatment: {record.treatment}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "current-problem" && (
                <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                  <p>{patientData.currentProblem}</p>
                  <p><strong>Potential Diagnoses:</strong></p>
                  <ul>
                    {patientData.potentialDiagnoses.map((diagnosis, index) => (
                      <li key={index}>{diagnosis}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
