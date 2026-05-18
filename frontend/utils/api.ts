export const getApiUrl = (path: string): string => {
  const host = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  // Standardize leading slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://${host}:3000${cleanPath}`;
};
