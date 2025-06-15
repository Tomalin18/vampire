import { EnemyType, WeaponType } from '../types/GameTypes';

export const GAME_CONFIG = {
  // Screen
  SCREEN_WIDTH: 400,
  SCREEN_HEIGHT: 800,
  
  // Player
  PLAYER_START_HEALTH: 100,
  PLAYER_START_DAMAGE: 10,
  PLAYER_START_SPEED: 150,
  PLAYER_SIZE: 32,
  
  // Enemies
  ENEMY_SPAWN_RATE: 2, // enemies per second
  ENEMY_SPAWN_DISTANCE: 50, // pixels from screen edge
  MAX_ENEMIES: 100,
  
  // Combat
  PROJECTILE_SPEED: 300,
  PROJECTILE_LIFETIME: 3000, // milliseconds
  CRITICAL_CHANCE: 0.1, // 10%
  CRITICAL_MULTIPLIER: 2.0,
  
  // Progression
  BASE_XP_REQUIREMENT: 100,
  XP_SCALING: 1.2, // multiplier per level
  
  // Difficulty Scaling
  DIFFICULTY_SCALE_INTERVAL: 30000, // 30 seconds
  HEALTH_SCALE_RATE: 0.1, // 10% increase
  DAMAGE_SCALE_RATE: 0.05, // 5% increase
  SPAWN_RATE_SCALE: 0.15, // 15% increase
  
  // Performance
  TARGET_FPS: 60,
  MAX_PROJECTILES: 50,
  MAX_PARTICLES: 100,
};

export const ENEMY_CONFIG = {
  zombie: {
    health: 50,
    damage: 10,
    speed: 80,
    xpValue: 10,
    size: 24,
    color: '#4a5568',
    sprite: '🧟',
    description: '基本殭屍 - 緩慢但持續追擊',
  },
  ghoul: {
    health: 30,
    damage: 15,
    speed: 120,
    xpValue: 15,
    size: 20,
    color: '#2d3748',
    sprite: '👻',
    description: '惡鬼 - 快速移動，血量較低',
  },
  brute: {
    health: 150,
    damage: 25,
    speed: 50,
    xpValue: 30,
    size: 40,
    color: '#744210',
    sprite: '👹',
    description: '蠻獸 - 高血量高攻擊，移動緩慢',
  },
  skeleton: {
    health: 40,
    damage: 12,
    speed: 90,
    xpValue: 20,
    size: 22,
    color: '#e2e8f0',
    sprite: '💀',
    description: '骷髏兵 - 平衡型敵人',
  },
  demon: {
    health: 80,
    damage: 20,
    speed: 100,
    xpValue: 25,
    size: 30,
    color: '#c53030',
    sprite: '😈',
    description: '惡魔 - 強力的中階敵人',
  },
  vampire: {
    health: 300,
    damage: 40,
    speed: 70,
    xpValue: 100,
    size: 50,
    color: '#702459',
    sprite: '🧛',
    description: 'BOSS - 吸血鬼領主',
  },
} as const;

export const WEAPON_CONFIG = {
  basicGun: {
    id: 'basicGun',
    name: '基礎手槍',
    type: 'projectile' as WeaponType,
    damage: 15,
    attackSpeed: 2.0,
    range: 200,
    projectileSpeed: 400,
    piercing: 0,
    description: '基礎射擊武器',
    sprite: '🔫',
  },
  shotgun: {
    id: 'shotgun',
    name: '霰彈槍',
    type: 'projectile' as WeaponType,
    damage: 25,
    attackSpeed: 1.0,
    range: 150,
    projectileSpeed: 350,
    piercing: 0,
    description: '近距離強力武器，一次發射多發子彈',
    sprite: '🔫',
  },
  sword: {
    id: 'sword',
    name: '旋轉劍',
    type: 'melee' as WeaponType,
    damage: 20,
    attackSpeed: 3.0,
    range: 80,
    description: '圍繞角色旋轉的近戰武器',
    sprite: '⚔️',
  },
  fireball: {
    id: 'fireball',
    name: '火球術',
    type: 'projectile' as WeaponType,
    damage: 30,
    attackSpeed: 1.5,
    range: 250,
    projectileSpeed: 300,
    piercing: 1,
    area: 40,
    description: '魔法火球，可穿透一個敵人並造成範圍傷害',
    sprite: '🔥',
  },
  lightning: {
    id: 'lightning',
    name: '閃電鏈',
    type: 'area' as WeaponType,
    damage: 35,
    attackSpeed: 2.5,
    range: 180,
    description: '電擊最近的敵人，可連鎖傳導',
    sprite: '⚡',
  },
} as const;

export const CHARACTER_CONFIG = {
  warrior: {
    id: 'warrior',
    name: '戰士',
    description: '平衡型角色，攻防兼備',
    sprite: '⚔️',
    baseStats: {
      health: 120,
      damage: 12,
      moveSpeed: 140,
      attackSpeed: 1.0,
      criticalChance: 0.05,
      criticalMultiplier: 2.0,
    },
    startingWeapon: 'basicGun',
  },
  mage: {
    id: 'mage',
    name: '法師',
    description: '高攻擊低血量，擅長魔法攻擊',
    sprite: '🔮',
    baseStats: {
      health: 80,
      damage: 18,
      moveSpeed: 130,
      attackSpeed: 1.2,
      criticalChance: 0.1,
      criticalMultiplier: 2.5,
    },
    startingWeapon: 'fireball',
  },
  archer: {
    id: 'archer',
    name: '弓箭手',
    description: '遠程專家，攻擊速度快',
    sprite: '🏹',
    baseStats: {
      health: 100,
      damage: 14,
      moveSpeed: 160,
      attackSpeed: 1.5,
      criticalChance: 0.15,
      criticalMultiplier: 1.8,
    },
    startingWeapon: 'basicGun',
  },
} as const;

export const COLORS = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#e94560',
  success: '#0f3460',
  warning: '#f39c12',
  textPrimary: '#ffffff',
  textSecondary: '#b0b3b8',
  background: '#0a0a0a',
  cardBackground: '#1e1e1e',
  healthBar: '#e94560',
  xpBar: '#f39c12',
  manaBar: '#0f3460',
  
  // Enemy colors
  enemyRed: '#c53030',
  enemyOrange: '#dd6b20',
  enemyPurple: '#702459',
  
  // UI colors
  buttonPrimary: '#4CAF50',
  buttonSecondary: '#2196F3',
  buttonDanger: '#f44336',
  
  // Rarity colors
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
};

export const UPGRADE_CONFIG = [
  {
    id: 'damage_boost',
    name: '傷害提升',
    description: '增加 20% 基礎傷害',
    type: 'damage' as const,
    rarity: 'common' as const,
    effect: {
      type: 'stat' as const,
      statType: 'damage',
      value: 0.2,
      isPercentage: true,
    },
  },
  {
    id: 'health_boost',
    name: '生命提升',
    description: '增加 30 點最大生命值',
    type: 'health' as const,
    rarity: 'common' as const,
    effect: {
      type: 'stat' as const,
      statType: 'health',
      value: 30,
      isPercentage: false,
    },
  },
  {
    id: 'speed_boost',
    name: '移動速度',
    description: '增加 15% 移動速度',
    type: 'speed' as const,
    rarity: 'common' as const,
    effect: {
      type: 'stat' as const,
      statType: 'moveSpeed',
      value: 0.15,
      isPercentage: true,
    },
  },
  {
    id: 'attack_speed_boost',
    name: '攻擊速度',
    description: '增加 25% 攻擊速度',
    type: 'attackSpeed' as const,
    rarity: 'rare' as const,
    effect: {
      type: 'stat' as const,
      statType: 'attackSpeed',
      value: 0.25,
      isPercentage: true,
    },
  },
  {
    id: 'critical_chance',
    name: '暴擊機率',
    description: '增加 5% 暴擊機率',
    type: 'special' as const,
    rarity: 'rare' as const,
    effect: {
      type: 'stat' as const,
      statType: 'criticalChance',
      value: 0.05,
      isPercentage: false,
    },
  },
] as const; 