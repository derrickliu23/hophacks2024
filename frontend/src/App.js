// App.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import PatientDashboard from './components/PatientDashboard';

const App = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <div>
      <header>
        <h1>My Application</h1>
        {isAuthenticated ? (
          <>
            <p>Welcome, {user.name}!</p>
            <button onClick={() => logout({ returnTo: window.location.origin })}>
              Sign Out
            </button>
          </>
        ) : (
          <button onClick={() => loginWithRedirect()}>Sign In</button>
        )}
      </header>
      <main>
        {isAuthenticated ? (
          <PatientDashboard />
        ) : (
          <p>Please sign in to view the dashboard.</p>
        )}
      </main>
    </div>
  );
};

export default App;
