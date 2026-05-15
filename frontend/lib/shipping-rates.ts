export interface ShippingRate {
  country: string;
  flag: string;
  regular: number;
  tracked: number;
  hasCustoms?: boolean;
}

export const SHIPPING_RATES: Record<string, ShippingRate> = {
  ES: { country: "España", flag: "🇪🇸", regular: 1.33, tracked: 8.00 },
  DE: { country: "Alemania", flag: "🇩🇪", regular: 1.55, tracked: 3.10 },
  LU: { country: "Luxemburgo", flag: "🇱🇺", regular: 2.00, tracked: 7.70 },
  CZ: { country: "Rep. Checa", flag: "🇨🇿", regular: 2.28, tracked: 5.49 },
  NL: { country: "Países Bajos", flag: "🇳🇱", regular: 2.30, tracked: 10.85 },
  FR: { country: "Francia", flag: "🇫🇷", regular: 2.40, tracked: 7.80 },
  BG: { country: "Bulgaria", flag: "🇧🇬", regular: 2.40, tracked: 6.23 },
  HR: { country: "Croacia", flag: "🇭🇷", regular: 2.50, tracked: 5.90 },
  MT: { country: "Malta", flag: "🇲🇹", regular: 2.51, tracked: 10.79 },
  PL: { country: "Polonia", flag: "🇵🇱", regular: 2.65, tracked: 5.66 },
  SK: { country: "Eslovaquia", flag: "🇸🇰", regular: 2.70, tracked: 8.20 },
  LV: { country: "Letonia", flag: "🇱🇻", regular: 2.84, tracked: 6.10 },
  PT: { country: "Portugal", flag: "🇵🇹", regular: 2.85, tracked: 7.27 },
  IE: { country: "Irlanda", flag: "🇮🇪", regular: 2.95, tracked: 11.70 },
  NO: { country: "Noruega", flag: "🇳🇴", regular: 3.13, tracked: 24.83 },
  BE: { country: "Bélgica", flag: "🇧🇪", regular: 3.20, tracked: 10.30 },
  GR: { country: "Grecia", flag: "🇬🇷", regular: 3.30, tracked: 7.50 },
  RO: { country: "Rumanía", flag: "🇷🇴", regular: 3.34, tracked: 5.77 },
  FI: { country: "Finlandia", flag: "🇫🇮", regular: 3.35, tracked: 21.95 },
  CY: { country: "Chipre", flag: "🇨🇾", regular: 3.38, tracked: 6.76 },
  SI: { country: "Eslovenia", flag: "🇸🇮", regular: 3.44, tracked: 7.57 },
  HU: { country: "Hungría", flag: "🇭🇺", regular: 3.57, tracked: 10.42 },
  EE: { country: "Estonia", flag: "🇪🇪", regular: 3.80, tracked: 15.05 },
  IT: { country: "Italia", flag: "🇮🇹", regular: 4.05, tracked: 10.70 },
  GB: { country: "Reino Unido", flag: "🇬🇧", regular: 4.10, tracked: 11.91, hasCustoms: true },
  SE: { country: "Suecia", flag: "🇸🇪", regular: 4.30, tracked: 13.58 },
  CH: { country: "Suiza", flag: "🇨🇭", regular: 4.79, tracked: 11.75, hasCustoms: true },
  DK: { country: "Dinamarca", flag: "🇩🇰", regular: 6.90, tracked: 13.80 },
  LT: { country: "Lituania", flag: "🇱🇹", regular: 2.75, tracked: 5.50 },
  AT: { country: "Austria", flag: "🇦🇹", regular: 3.38, tracked: 6.75 },
};

export const getShippingPrice = (countryCode: string) => {
  return SHIPPING_RATES[countryCode] || { regular: 1.50, tracked: 5.00 };
};
