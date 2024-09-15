import React, { useState } from 'react';

const LanguageSelector = ({ onLanguageChange }) => {
 const [isOpen, setIsOpen] = useState(false);
 const [selectedLanguage, setSelectedLanguage] = useState('English');

 const languages = ['English', 'Hindi'];

 const handleLanguageSelect = (language) => {
   setSelectedLanguage(language);
   onLanguageChange(language.toLowerCase());
   setIsOpen(false);
 };

 const buttonStyle = {
   position: 'absolute',
   top: '60px',
   left: '70px',
   backgroundColor: '#3EB489',
   color: 'white',
   padding: '10px 20px',
   border: '1px solid #35a07a', // Added border
   borderRadius: '8px',
   cursor: 'pointer',
   fontWeight: 'bold',
   zIndex: 3,
   boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Added shadow
 };

 const dropdownStyle = {
   position: 'absolute',
   top: '86px',
   left: '60px',
   backgroundColor: 'white',
   border: '1px solid #ddd',
   borderRadius: '5px',
   boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Updated shadow
   display: isOpen ? 'block' : 'none',
   zIndex: 1000,
 };

 const optionStyle = {
   padding: '10px 15px',
   cursor: 'pointer',
   hover: {
     backgroundColor: '#f0f0f0',
   },
 };

 return (
   <div>
     <button onClick={() => setIsOpen(!isOpen)} style={buttonStyle}>
       {selectedLanguage}
     </button>
     {isOpen && (
       <div style={dropdownStyle}>
         {languages.map((language) => (
           <div
             key={language}
             style={optionStyle}
             onClick={() => handleLanguageSelect(language)}
           >
             {language}
           </div>
         ))}
       </div>
     )}
   </div>
 );
};

export default LanguageSelector;