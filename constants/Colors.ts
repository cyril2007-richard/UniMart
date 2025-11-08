const tintColorLight = '#680082ff'; // UNIBEN Purple
const tintColorDark = '#FFD700';  // UNIBEN Gold

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#C4C4C4',
    tabIconSelected: tintColorLight,
    purple: '#320082ff',
    gold: '#FFD700',
    lightPurple: '#ffffffff',
    white: '#FFFFFF', // 👈 add these
    black: '#000000',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#C4C4C4',
    tabIconSelected: tintColorDark,
    purple: '#4B0082',
    gold: '#FFD700',
    lightPurple: '#6A0DAD',
    white: '#FFFFFF', // 👈 add these
    black: '#000000',
  },
};
