import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import { User } from '../../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const useLocalAuth = import.meta.env.VITE_USE_LOCAL_AUTH === 'true';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      if (useLocalAuth) {
        const token = localStorage.getItem('localAuthToken');
        const localUser = localStorage.getItem('localUser');
        if (token && localUser) {
          setUser(JSON.parse(localUser));
        } else {
          setUser(null);
        }
      } else {
        const userData = await Auth.currentAuthenticatedUser();
        setUser({
          id: userData.attributes.sub,
          email: userData.attributes.email,
          name: userData.attributes.email // Use email as name if name is not available
        });
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      if (useLocalAuth) {
        const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/auth/local/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        const data = await response.json();
        const localUser = {
          id: 'local-user',
          email: username,
          name: username,
        };

        localStorage.setItem('localAuthToken', data.token);
        localStorage.setItem('localUser', JSON.stringify(localUser));
        setUser(localUser);
      } else {
        const userData = await Auth.signIn(username, password);
        setUser({
          id: userData.attributes.sub,
          email: userData.attributes.email,
          name: userData.attributes.email
        });
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (useLocalAuth) {
        localStorage.removeItem('localAuthToken');
        localStorage.removeItem('localUser');
        setUser(null);
      } else {
        await Auth.signOut();
        setUser(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 