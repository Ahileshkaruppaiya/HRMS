import React, { useState } from 'react';
import { HRMSProvider } from './context/HRMSContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './components/auth/LoginPage';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  return (
    <HRMSProvider>
      {isAuthenticated ? (
        <AppLayout onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </HRMSProvider>
  );
};

export default App;
