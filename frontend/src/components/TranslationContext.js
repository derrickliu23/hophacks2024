import React, { createContext, useContext, useState, useEffect } from 'react';

const TranslationContext = createContext();

export const useTranslation = () => useContext(TranslationContext);

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('english');
  const [translations, setTranslations] = useState({});

  const translateText = async (text, targetLang) => {
    if (targetLang === 'english') return text;

    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang === 'hindi' ? 'hi' : 'en'}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      return data[0][0][0];
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const translate = async (text) => {
    if (language === 'english') return text;
    if (translations[text]) return translations[text];
    
    const translatedText = await translateText(text, language);
    setTranslations(prev => ({ ...prev, [text]: translatedText }));
    return translatedText;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const TranslatableText = ({ children }) => {
  const [translatedText, setTranslatedText] = useState(children);
  const { language, translate } = useTranslation();

  useEffect(() => {
    const updateTranslation = async () => {
      const newText = await translate(children);
      setTranslatedText(newText);
    };

    updateTranslation();
  }, [children, language, translate]);

  return <span>{translatedText}</span>;
};