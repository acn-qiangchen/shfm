import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_APP_REGION,
    userPoolId: import.meta.env.VITE_APP_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_APP_USER_POOL_CLIENT_ID,
    oauth: {
      domain: `${import.meta.env.VITE_APP_USER_POOL_ID}.auth.${import.meta.env.VITE_APP_REGION}.amazoncognito.com`,
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'http://localhost:3001',
      redirectSignOut: 'http://localhost:3001',
      responseType: 'code'
    }
  },
  API: {
    endpoints: [
      {
        name: 'api',
        endpoint: import.meta.env.VITE_APP_API_URL,
        region: import.meta.env.VITE_APP_REGION
      }
    ]
  }
}); 