import { Dimensions } from 'react-native';

// Screen Dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SCREEN = {
  WIDTH: SCREEN_WIDTH,
  HEIGHT: SCREEN_HEIGHT,
  CENTER_X: SCREEN_WIDTH / 2,
  CENTER_Y: SCREEN_HEIGHT / 2,
} as const;

// Typography
export const FONTS = {
  sizes: {
    tiny: 10,
    small: 12,
    caption: 14,
    body: 16,
    title: 18,
    heading: 24,
    large: 28,
    huge: 32,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  families: {
    regular: 'Roboto',
    mono: 'RobotoMono',
  },
} as const;

// Spacing System
export const SPACING = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  huge: 32,
  massive: 48,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  round: 50,
} as const;

// Game Constants
export const GAME = {
  // Performance
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60, // 16.67ms
  
  // Player
  PLAYER_SPEED_BASE: 150,
  PLAYER_HEALTH_BASE: 100,
  PLAYER_DAMAGE_BASE: 10,
  PLAYER_SIZE: 32,
  
  // Combat
  ATTACK_RANGE_BASE: 100,
  ATTACK_SPEED_BASE: 1.0,
  CRITICAL_CHANCE_BASE: 0.05,
  CRITICAL_MULTIPLIER: 2.0,
  
  // Experience
  EXP_BASE: 100,
  EXP_MULTIPLIER: 1.2,
  
  // Enemies
  ENEMY_SPAWN_DISTANCE: 50,
  ENEMY_DESPAWN_DISTANCE: SCREEN_WIDTH + 100,
  ENEMY_SIZE_SMALL: 24,
  ENEMY_SIZE_MEDIUM: 32,
  ENEMY_SIZE_LARGE: 48,
  ENEMY_SIZE_BOSS: 64,
  
  // Waves
  WAVE_DURATION: 30000, // 30 seconds
  ENEMIES_PER_WAVE_BASE: 5,
  WAVE_DIFFICULTY_MULTIPLIER: 1.15,
  BOSS_WAVE_INTERVAL: 5,
  
  // Projectiles
  PROJECTILE_SPEED_BASE: 300,
  PROJECTILE_SIZE: 8,
  PROJECTILE_LIFETIME: 3000, // 3 seconds
  
  // UI
  HUD_MARGIN: 20,
  BUTTON_HEIGHT: 50,
  PROGRESS_BAR_HEIGHT: 8,
  
  // Physics
  COLLISION_TOLERANCE: 2,
  BOUNDARY_BUFFER: 20,
  
  // Audio
  AUDIO_FADE_DURATION: 500,
  SFX_MAX_CONCURRENT: 10,
  
  // Performance Optimization
  MAX_ENTITIES: 500,
  MAX_PROJECTILES: 100,
  MAX_ENEMIES: 50,
  POOLING_INITIAL_SIZE: 20,
  
  // Save System
  SAVE_INTERVAL: 5000, // 5 seconds
  AUTO_SAVE_ENABLED: true,
} as const;

// Input Constants
export const INPUT = {
  TOUCH_THRESHOLD: 10,
  DOUBLE_TAP_THRESHOLD: 300,
  LONG_PRESS_THRESHOLD: 500,
  GESTURE_SENSITIVITY: 1.0,
} as const;

// Animation Constants
export const ANIMATION = {
  FAST: 150,
  MEDIUM: 300,
  SLOW: 500,
  
  // Easing
  EASE_OUT: 'ease-out',
  EASE_IN: 'ease-in',
  EASE_IN_OUT: 'ease-in-out',
  LINEAR: 'linear',
  
  // Springs
  SPRING_CONFIG: {
    damping: 15,
    mass: 1,
    stiffness: 120,
  },
} as const;

// Asset Paths
export const ASSETS = {
  // Characters
  CHARACTERS: {
    WARRIOR: 'characters/warrior.png',
    MAGE: 'characters/mage.png',
    ARCHER: 'characters/archer.png',
    ROGUE: 'characters/rogue.png',
  },
  
  // Enemies
  ENEMIES: {
    BASIC: 'enemies/basic.png',
    ELITE: 'enemies/elite.png',
    BOSS: 'enemies/boss.png',
  },
  
  // Weapons
  WEAPONS: {
    SWORD: 'weapons/sword.png',
    FIREBALL: 'weapons/fireball.png',
    ARROW: 'weapons/arrow.png',
    DAGGER: 'weapons/dagger.png',
  },
  
  // UI
  UI: {
    BUTTON: 'ui/button.png',
    PANEL: 'ui/panel.png',
    HEALTH_BAR: 'ui/health_bar.png',
    PROGRESS_BAR: 'ui/progress_bar.png',
  },
  
  // Audio
  AUDIO: {
    MUSIC: {
      MENU: 'audio/music/menu.mp3',
      GAME: 'audio/music/game.mp3',
      BOSS: 'audio/music/boss.mp3',
    },
    SFX: {
      CLICK: 'audio/sfx/click.wav',
      ATTACK: 'audio/sfx/attack.wav',
      HIT: 'audio/sfx/hit.wav',
      LEVEL_UP: 'audio/sfx/level_up.wav',
      DEATH: 'audio/sfx/death.wav',
    },
  },
} as const;

// Z-Index Layers
export const Z_INDEX = {
  BACKGROUND: 0,
  ENEMIES: 10,
  PLAYER: 20,
  PROJECTILES: 30,
  EFFECTS: 40,
  UI: 50,
  MODAL: 60,
  TOAST: 70,
  DEBUG: 100,
} as const;

// Development Constants
export const DEV = {
  SHOW_FPS: false,
  SHOW_COLLISION_BOXES: false,
  SHOW_DEBUG_INFO: false,
  GOD_MODE: false,
  FAST_LEVEL_UP: false,
} as const; 