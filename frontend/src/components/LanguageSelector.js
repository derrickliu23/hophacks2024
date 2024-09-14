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
    top: '10px',
    left: '10px',
    padding: '10px 15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    zIndex: 1000,
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '50px',
    left: '10px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
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