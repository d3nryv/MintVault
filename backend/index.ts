import { App } from './src/app';
const appInstance = new App();
const expressApp = appInstance.getApp();

// Exportación por defecto para TypeScript / ESM (así VS Code no muestra error)
export default expressApp;

// Exportación para CommonJS (Vercel) para evitar problemas de compatibilidad
// @ts-ignore
if (typeof module !== 'undefined' && module.exports) {
  // @ts-ignore
  module.exports = expressApp;
}
