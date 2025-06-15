// Core Game Types
export interface Vector2 {
  x: number;
  y: number;
}

export interface Transform {
  position: Vector2;
  rotation: number;
  scale: Vector2;
}

export interface Health {
  current: number;
  max: number;
}

export interface Movement {
  speed: number;
  direction: Vector2;
  isMoving: boolean;
}

export interface Combat {
  damage: number;
  attackSpeed: number;
  range: number;
  lastAttackTime: number;
}

// Entity Component System
export interface Entity {
  id: string;
  components: {
    transform?: Transform;
    health?: Health;
    movement?: Movement;
    combat?: Combat;
    [key: string]: any;
  };
}

// Character Types
export interface Character {
  id: string;
  name: string;
  description: string;
  baseStats: {
    health: number;
    damage: number;
    speed: number;
    attackSpeed: number;
  };
  sprite: string;
  unlocked: boolean;
}

// Enemy Types
export interface Enemy {
  id: string;
  type: string;
  health: number;
  damage: number;
  speed: number;
  reward: number;
  sprite: string;
}

// Weapon Types
export interface Weapon {
  id: string;
  name: string;
  damage: number;
  attackSpeed: number;
  range: number;
  projectileSpeed: number;
  projectileSprite: string;
}

// Upgrade Types
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: {
    type: 'stat' | 'weapon' | 'ability';
    value: number;
    target: string;
  };
}

// Game State Types
export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelUp';

export interface PlayerState {
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  position: Vector2;
  stats: {
    damage: number;
    speed: number;
    attackSpeed: number;
    range: number;
  };
  weapons: Weapon[];
  upgrades: Upgrade[];
}

export interface GameSession {
  startTime: number;
  currentWave: number;
  enemiesDefeated: number;
  survivalTime: number;
  score: number;
  level: number;
}

export interface PlayerProgress {
  totalGamesPlayed: number;
  bestSurvivalTime: number;
  highScore: number;
  totalEnemiesDefeated: number;
  unlockedCharacters: string[];
  currency: number;
  achievements: string[];
}

// Screen Navigation Types
export type RootStackParamList = {
  Menu: undefined;
  Game: { characterId: string };
  CharacterSelect: undefined;
  Settings: undefined;
  GameOver: { 
    score: number; 
    survivalTime: number; 
    enemiesDefeated: number; 
    level: number; 
  };
};

// Settings Types
export interface GameSettings {
  audio: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    enabled: boolean;
  };
  graphics: {
    quality: 'low' | 'medium' | 'high';
    showFPS: boolean;
    particleEffects: boolean;
  };
  gameplay: {
    autoPause: boolean;
    vibration: boolean;
    controlSensitivity: number;
  };
}

// System Types
export interface System {
  name: string;
  update(entities: Map<string, Entity>, deltaTime: number): void;
  initialize?(): void;
  cleanup?(): void;
}

// Event Types
export interface GameEvent {
  type: string;
  data?: any;
  timestamp: number;
}

export type GameEventType = 
  | 'ENEMY_SPAWNED'
  | 'ENEMY_DEFEATED'
  | 'PLAYER_DAMAGED'
  | 'PLAYER_LEVEL_UP'
  | 'WAVE_COMPLETED'
  | 'GAME_OVER'
  | 'POWER_UP_COLLECTED'; 