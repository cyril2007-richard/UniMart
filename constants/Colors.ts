const primaryAccent = '#2563EB';
const mainBackground = '#F7F8FA';
const surfaceWhite = '#FFFFFF';
const secondaryBackground = '#EEF1F4';

const commonColors = {
  text: '#0F172A',
  secondaryText: '#475569',
  mutedText: '#94A3B8',
  background: mainBackground,
  secondaryBackground: secondaryBackground,
  surface: surfaceWhite,
  tint: primaryAccent,
  tabIconDefault: '#94A3B8',
  tabIconSelected: primaryAccent,
  
  primary: primaryAccent,
  white: '#FFFFFF',
  black: '#0F172A',
  
  // Status Colors
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  error: '#DC2626',
};

export default {
  light: commonColors,
  dark: commonColors, // STRICTLY LIGHT MODE: Dark mode maps to light mode
};
