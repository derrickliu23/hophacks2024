import React, { createContext, useState, useContext, useEffect } from 'react';

const TranslationContext = createContext();

export const useTranslation = () => useContext(TranslationContext);

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  const translateText = async (text, targetLang) => {
    if (targetLang === 'en') return text;
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      return data[0][0][0];
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const translate = async (text) => {
    if (language === 'en') return text;
    if (translations[text]) return translations[text];
    
    const translatedText = await translateText(text, language);
    setTranslations(prev => ({ ...prev, [text]: translatedText }));
    return translatedText;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setTranslations({});
  };

  return (
    <TranslationContext.Provider value={{ language, changeLanguage, translate }}>
      {children}
    </TranslationContext.Provider>
  );
};