import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import PatientDashboard from './components/PatientDashboard'; // Assuming you have this component

const App = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <div style={styles.container}>
      {!isAuthenticated ? (
        <div style={styles.loginContainer}>
          <h1 style={styles.title}>Welcome to </h1>
          <p style={styles.subText}>Sign in to continue</p>
          <button style={styles.loginButton} onClick={() => loginWithRedirect()}>
            Log In
          </button>
        </div>
      ) : (
        <div>
          {/* Render the PatientDashboard when authenticated */}
          <PatientDashboard logout={logout} user={user} />
        </div>
      )}
    </div>
  );
};

// Styles (could also be moved to a CSS file)
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
