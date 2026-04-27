
export function get(key: string, defaultValue?: any): any {
  const value = process.env[key];
  
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  
  // Parse numbers
  if (defaultValue !== undefined && typeof defaultValue === 'number') {
    return value ? Number(value) : defaultValue;
  }
  
  // Parse booleans
  if (defaultValue !== undefined && typeof defaultValue === 'boolean') {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return defaultValue;
  }
  
  return value || defaultValue;
}