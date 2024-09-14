import React, { useState } from 'react';
const backgroundColor = '#E0F7FA';

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

 const buttonStyle = (tabName) => ({
   backgroundColor: activeTab === tabName ? '#4caf50' : '#f0f0f0',
   color: activeTab === tabName ? '#fff' : '#000',
   border: 'none',
   padding: '10px 20px',
   marginRight: '10px',
   cursor: 'pointer',
   borderRadius: '5px',
   display: 'flex',
   alignItems: 'center'
 });

 const iconStyle = { marginRight: '8px' };

 return (
   <div style={{ display: 'flex', height: '100vh', backgroundColor: backgroundColor }}>
     {isMenuOpen && (
       <div style={{ width: '250px', backgroundColor: 'white', padding: '16px' }}>
         <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Patients</h2>
         {Object.entries(patientsData).map(([id, patient]) => (
           <button
             key={id}
             style={{
               display: 'flex',
               alignItems: 'center',
               width: '100%',
               padding: '8px',
               marginBottom: '8px',
               backgroundColor: selectedPatient === id ? '#e6f2ff' : 'transparent',
               border: 'none',
               cursor: 'pointer'
             }}
             onClick={() => setSelectedPatient(id)}
           >
             {patient.name}
           </button>
         ))}
       </div>
     )}

     <div style={{ flex: 1, overflow: 'hidden' }}>
       <div style={{ padding: '16px' }}>
         <button onClick={toggleMenu} style={{ marginBottom: '16px' }}>
           Toggle Menu
         </button>
         <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px' }}>
           <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{patientData.name}</h2>
           
           {/* Flexbox Container for the Buttons */}
           <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
             <button
               onClick={() => setActiveTab("personal-info")}
               style={buttonStyle("personal-info")}
             >
               <i className="fas fa-user" style={iconStyle}></i>
               Personal Info
             </button>
             <button
               onClick={() => setActiveTab("medical-records")}
               style={buttonStyle("medical-records")}
             >
               <i className="fas fa-file-medical" style={iconStyle}></i>
               Medical Records
             </button>
             <button
               onClick={() => setActiveTab("current-problem")}
               style={buttonStyle("current-problem")}
             >
               <i className="fas fa-stethoscope" style={iconStyle}></i>
               Current Problem
             </button>
           </div>

           {activeTab === "personal-info" && (
             <div>
               <p>Age: {patientData.personalInfo.age}</p>
               <p>Gender: {patientData.personalInfo.gender}</p>
               <p>Contact: {patientData.personalInfo.contact}</p>
             </div>
           )}
           {activeTab === "medical-records" && (
             <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
             <div>
               <p>{patientData.currentProblem}</p>
               <h4 style={{ marginTop: '16px', fontWeight: 'bold' }}>Potential Diagnoses:</h4>
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
 );
};

export default PatientDashboard;
