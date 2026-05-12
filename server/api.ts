import { createNextApiBridge } from 'next-api-bridge';

export const api = createNextApiBridge({
  baseUrl: process.env.API_URL || 'http://localhost:5000',
  auth: {
    type: 'bearer',
    tokenCookie: 'access_token',
    header: 'Authorization',
    prefix: 'Bearer',
  },
  cookiePrefix: 'nab_',
});

