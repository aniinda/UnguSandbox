import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple authentication check for data engineer portal
    const token = localStorage.getItem('dataEngineerToken');
    if (token === 'data_engineer_test_token') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    localStorage.setItem('dataEngineerToken', 'data_engineer_test_token');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('dataEngineerToken');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
