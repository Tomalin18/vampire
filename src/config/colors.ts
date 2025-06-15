// Color Palette Configuration
export const Colors = {
  // Primary Colors
  primary: '#1a1a2e',        // Dark Navy
  secondary: '#16213e',      // Deep Blue
  accent: '#e94560',         // Crimson Red
  success: '#0f3460',        // Royal Blue
  warning: '#f39c12',        // Golden Orange
  
  // Background Colors
  background: '#0a0a0a',     // Pure Black
  cardBackground: '#1e1e1e', // Dark Gray
  surface: '#2d2d2d',        // Surface Gray
  
  // Text Colors
  textPrimary: '#ffffff',    // White
  textSecondary: '#b0b3b8',  // Light Gray
  textMuted: '#8a8a8a',      // Muted Gray
  
  // Game UI Colors
  health: '#e74c3c',         // Health Red
  mana: '#3498db',           // Mana Blue
  experience: '#f1c40f',     // Experience Yellow
  
  // Status Colors
  damage: '#e74c3c',         // Damage Red
  heal: '#2ecc71',           // Heal Green
  critical: '#ff6b6b',       // Critical Hit
  
  // Enemy Colors
  enemyBasic: '#8b4513',     // Brown
  enemyElite: '#9370db',     // Purple
  enemyBoss: '#dc143c',      // Crimson
  
  // Rarity Colors
  common: '#ffffff',         // White
  uncommon: '#1eff00',       // Green
  rare: '#0070dd',           // Blue
  epic: '#a335ee',           // Purple
  legendary: '#ff8000',      // Orange
  mythic: '#e6cc80',         // Gold
  
  // Utility Colors
  transparent: 'transparent',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
  
  // Gradient Definitions
  gradients: {
    primary: ['#1a1a2e', '#16213e'],
    accent: ['#e94560', '#c73650'],
    health: ['#e74c3c', '#c0392b'],
    experience: ['#f1c40f', '#f39c12'],
    rare: ['#0070dd', '#004499'],
    epic: ['#a335ee', '#722bb3'],
    legendary: ['#ff8000', '#cc6600'],
  },
} as const;

// Color utility functions
export const getColorWithOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case 'common':
      return Colors.common;
    case 'uncommon':
      return Colors.uncommon;
    case 'rare':
      return Colors.rare;
    case 'epic':
      return Colors.epic;
    case 'legendary':
      return Colors.legendary;
    case 'mythic':
      return Colors.mythic;
    default:
      return Colors.common;
  }
};

export const getHealthColor = (healthPercent: number): string => {
  if (healthPercent > 0.6) return Colors.heal;
  if (healthPercent > 0.3) return Colors.warning;
  return Colors.health;
}; 