const PROD_API = 'https://repairmatch-backend.onrender.com/api';

/** API base URL including `/api`, without a trailing slash. */
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || PROD_API).replace(/\/+$/, '');
