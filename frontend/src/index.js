import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

const root = createRoot(document.getElementById('root'));

root.render(
<Auth0Provider
    domain="dev-o8axeyog85h8xeej.us.auth0.com"
    clientId="olUFl5B3XEN7nascxLeYjsiD4OeAZE8S"
    authorizationParams={{
      redirect_uri: "http://localhost:3000"
    }}
  >
    <App />
  </Auth0Provider>,
);