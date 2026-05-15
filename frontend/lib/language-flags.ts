export const getLanguageFlag = (language: string) => {
  switch (language?.toUpperCase()) {
    case 'EN':
    case 'ENGLISH':
      return '🇺🇸';
    case 'ES':
    case 'SPANISH':
    case 'ESPAÑOL':
      return '🇪🇸';
    case 'FR':
    case 'FRENCH':
    case 'FRANCÉS':
      return '🇫🇷';
    case 'DE':
    case 'GERMAN':
    case 'ALEMÁN':
      return '🇩🇪';
    case 'IT':
    case 'ITALIAN':
    case 'ITALIANO':
      return '🇮🇹';
    case 'PT':
    case 'PORTUGUESE':
    case 'PORTUGUÉS':
      return '🇵🇹';
    default:
      return '🏳️';
  }
};
