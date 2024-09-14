import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import PatientDashboard from './components/PatientDashboard';
import LanguageSelector from './components/LanguageSelector';
import { useTranslation, TranslatableText } from './components/TranslationContext';

const App = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const { setLanguage } = useTranslation(); // You don't need `translate` here

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <div style={styles.container}>
      <LanguageSelector onLanguageChange={handleLanguageChange} />
      {!isAuthenticated ? (
        <div style={styles.loginContainer}>
          <h1 style={styles.title}>
            <TranslatableText>Welcome to My App</TranslatableText>
          </h1>
          <p style={styles.subText}>
            <TranslatableText>Sign in to continue</TranslatableText>
          </p>
          <button style={styles.loginButton} onClick={() => loginWithRedirect()}>
            <TranslatableText>Log In</TranslatableText>
          </button>
        </div>
      ) : (
        <div>
          <PatientDashboard logout={logout} user={user} />
        </div>
      )}
    </div>
  );
};

// Styles remain the same
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#fafafa',
  },
  loginContainer: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    width: '400px',
  },
  title: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '24px',
    marginBottom: '20px',
  },
  subText: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    color: '#777',
    marginBottom: '20px',
  },
  loginButton: {
    background: 'linear-gradient(#bec6f9, #aeb8f8, #9ba7f3, #8492f1)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    padding: '10px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    width: '100%',
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    padding: '10px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    width: '100%',
  },
};

export default App;