import { Amplify } from 'aws-amplify';

const useLocalAuth = import.meta.env.VITE_USE_LOCAL_AUTH === 'true';

const authConfig = useLocalAuth
  ? {
      // Local authentication configuration
      customAuth: true,
      endpoint: import.meta.env.VITE_API_ENDPOINT,
    }
  : {
      // Cognito authentication configuration
      region: import.meta.env.VITE_AWS_REGION,
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      oauth: {
        domain: `${import.meta.env.VITE_USER_POOL_ID}.auth.${import.meta.env.VITE_AWS_REGION}.amazoncognito.com`,
        scope: ['email', 'profile', 'openid'],
        redirectSignIn: 'http://localhost:3001',
        redirectSignOut: 'http://localhost:3001',
        responseType: 'code'
      }
    };

Amplify.configure({
  Auth: authConfig,
  API: {
    endpoints: [
      {
        name: 'api',
        endpoint: import.meta.env.VITE_API_ENDPOINT,
        region: useLocalAuth ? 'local' : import.meta.env.VITE_AWS_REGION,
        custom_header: async () => {
          try {
            if (useLocalAuth) {
              const token = localStorage.getItem('localAuthToken');
              return token ? { Authorization: `Bearer ${token}` } : {};
            }
            const session = await Amplify.Auth.currentSession();
            return {
              Authorization: `Bearer ${session.getIdToken().getJwtToken()}`
            };
          } catch (error) {
            console.error('Error getting session:', error);
            return {};
          }
        }
      }
    ]
  }
}); 