const primaryPurple = '#6B21A8'; // Deep Purple
const primaryGold = '#B45309';   // Dark Gold for contrast
const accentGold = '#F59E0B';    // Brighter Gold for non-text accents
const appBackground = '#F8F9FA'; // Very Light Grey
const surfaceWhite = '#FFFFFF';  // White

const commonColors = {
  text: '#1A1A1A',
  background: appBackground,
  tint: primaryPurple,
  tabIconDefault: '#9CA3AF',
  tabIconSelected: primaryPurple,
  
  purple: primaryPurple,
  gold: primaryGold,
  accentGold: accentGold,
  lightPurple: '#F3E8FF', // Light purple tint
  white: '#FFFFFF',
  black: '#000000',
  secondaryText: '#4B5563', // Dark Grey
  surface: surfaceWhite,
  
  // Validation only
  success: '#10B981',
  danger: '#EF4444',
};

export default {
  light: commonColors,
  dark: commonColors, // STRICTLY LIGHT MODE: Dark mode maps to light mode
};
