const tintColorLight = '#7B1FA2'; // A slightly richer, more professional purple
const tintColorDark = '#BB86FC'; // A standard light purple for contrast in dark mode

export default {
  light: {
    // Core Colors
    text: '#171717',         // Dark text for high contrast
    background: '#FFFFFF',   // Clean white background
    tint: tintColorLight,    // Primary accent color (Purple)
    tabIconDefault: '#9E9E9E',// Neutral gray for inactive icons
    tabIconSelected: tintColorLight, // Purple for active icons

    // Commerce/Design Specific Colors
    purple: tintColorLight,
    gold: '#FFC107',         // A slightly warmer gold for accents/sales
    lightPurple: '#F3E5F5',  // Very light purple for subtle surface/highlights
    white: '#FFFFFF',
    black: '#000000',
    secondaryText: '#757575', // Medium gray for secondary info/labels
    surface: '#FAFAFA',      // Off-white for cards/surfaces

    // 🛍️ E-commerce Chat Colors (Purple-Themed)
    headerBackground: '#7B1FA2', // Primary Purple for Chat Header
    chatBackground: '#F0F0F0',   // Light Gray/Off-White for chat area
    messageBubbleSender: '#E1BEE7', // Light Lavender/Purple for your messages
    messageBubbleReceiver: '#FFFFFF', // White for the other person's messages
    
    // Add a Success/Danger/Warning set for commerce feedback
    success: '#4CAF50', // Green for successful orders/actions
    danger: '#D32F2F',  // Red for errors/alerts
  },
  dark: {
    // Core Colors
    text: '#E0E0E0',         // Light text
    background: '#121212',   // Standard dark background
    tint: tintColorDark,     // Light Purple accent
    tabIconDefault: '#757575',
    tabIconSelected: tintColorDark,

    // Commerce/Design Specific Colors
    purple: tintColorDark,
    gold: '#FFD700',
    lightPurple: '#2C2033',  // Darker light purple for surfaces
    white: '#FFFFFF',
    black: '#000000',
    secondaryText: '#BDBDBD', // Lighter gray for secondary text
    surface: '#1E1E1E',      // Darker surface for cards

    // 🛍️ E-commerce Chat Colors (Purple-Themed)
    headerBackground: '#4A148C', // Deeper purple for Chat Header
    chatBackground: '#1D1D1D',   // Darker background for chat area
    messageBubbleSender: '#512DA8', // Richer purple for your messages
    messageBubbleReceiver: '#333333', // Darker gray for the other person's messages
    
    // Success/Danger/Warning for dark mode
    success: '#66BB6A',
    danger: '#EF5350',
  },
};