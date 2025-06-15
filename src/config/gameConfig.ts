import { Character, Weapon, Enemy, Upgrade } from '../types';
import { ASSETS } from './constants';

// Character Configurations
export const CHARACTERS: Character[] = [
  {
    id: 'warrior',
    name: '戰士',
    description: '近戰專家，擁有高血量和防禦力',
    baseStats: {
      health: 120,
      damage: 12,
      speed: 140,
      attackSpeed: 1.2,
    },
    sprite: ASSETS.CHARACTERS.WARRIOR,
    unlocked: true,
  },
  {
    id: 'mage',
    name: '法師',
    description: '遠程法術攻擊，高傷害但血量較低',
    baseStats: {
      health: 80,
      damage: 18,
      speed: 130,
      attackSpeed: 0.8,
    },
    sprite: ASSETS.CHARACTERS.MAGE,
    unlocked: true,
  },
  {
    id: 'archer',
    name: '弓箭手',
    description: '遠程物理攻擊，速度快且射程遠',
    baseStats: {
      health: 100,
      damage: 15,
      speed: 160,
      attackSpeed: 1.5,
    },
    sprite: ASSETS.CHARACTERS.ARCHER,
    unlocked: false,
  },
  {
    id: 'rogue',
    name: '盜賊',
    description: '高速度和暴擊率的敏捷角色',
    baseStats: {
      health: 90,
      damage: 14,
      speed: 180,
      attackSpeed: 2.0,
    },
    sprite: ASSETS.CHARACTERS.ROGUE,
    unlocked: false,
  },
];

// Weapon Configurations
export const WEAPONS: Weapon[] = [
  {
    id: 'sword',
    name: '劍',
    damage: 10,
    attackSpeed: 1.0,
    range: 60,
    projectileSpeed: 0, // Melee weapon
    projectileSprite: '',
  },
  {
    id: 'fireball',
    name: '火球術',
    damage: 20,
    attackSpeed: 0.7,
    range: 150,
    projectileSpeed: 250,
    projectileSprite: ASSETS.WEAPONS.FIREBALL,
  },
  {
    id: 'bow',
    name: '弓',
    damage: 12,
    attackSpeed: 1.2,
    range: 200,
    projectileSpeed: 350,
    projectileSprite: ASSETS.WEAPONS.ARROW,
  },
  {
    id: 'dagger',
    name: '匕首',
    damage: 8,
    attackSpeed: 2.5,
    range: 50,
    projectileSpeed: 400,
    projectileSprite: ASSETS.WEAPONS.DAGGER,
  },
];

// Enemy Configurations
export const ENEMY_TYPES: Record<string, Enemy> = {
  basic: {
    id: 'basic',
    type: 'basic',
    health: 20,
    damage: 5,
    speed: 80,
    reward: 10,
    sprite: ASSETS.ENEMIES.BASIC,
  },
  fast: {
    id: 'fast',
    type: 'fast',
    health: 15,
    damage: 4,
    speed: 120,
    reward: 12,
    sprite: ASSETS.ENEMIES.BASIC,
  },
  tank: {
    id: 'tank',
    type: 'tank',
    health: 50,
    damage: 8,
    speed: 60,
    reward: 25,
    sprite: ASSETS.ENEMIES.ELITE,
  },
  elite: {
    id: 'elite',
    type: 'elite',
    health: 40,
    damage: 12,
    speed: 100,
    reward: 30,
    sprite: ASSETS.ENEMIES.ELITE,
  },
  boss: {
    id: 'boss',
    type: 'boss',
    health: 200,
    damage: 20,
    speed: 70,
    reward: 100,
    sprite: ASSETS.ENEMIES.BOSS,
  },
};

// Upgrade Configurations
export const UPGRADE_POOL: Upgrade[] = [
  // Damage Upgrades
  {
    id: 'damage_boost',
    name: '攻擊力提升',
    description: '永久增加 20% 攻擊力',
    icon: '⚔️',
    effect: {
      type: 'stat',
      value: 0.2,
      target: 'damage',
    },
  },
  {
    id: 'critical_chance',
    name: '暴擊機率',
    description: '增加 15% 暴擊機率',
    icon: '💥',
    effect: {
      type: 'stat',
      value: 0.15,
      target: 'criticalChance',
    },
  },
  
  // Speed Upgrades
  {
    id: 'movement_speed',
    name: '移動速度',
    description: '增加 25% 移動速度',
    icon: '💨',
    effect: {
      type: 'stat',
      value: 0.25,
      target: 'speed',
    },
  },
  {
    id: 'attack_speed',
    name: '攻擊速度',
    description: '增加 30% 攻擊速度',
    icon: '⚡',
    effect: {
      type: 'stat',
      value: 0.3,
      target: 'attackSpeed',
    },
  },
  
  // Health Upgrades
  {
    id: 'health_boost',
    name: '生命力提升',
    description: '增加 40 點最大生命值',
    icon: '❤️',
    effect: {
      type: 'stat',
      value: 40,
      target: 'maxHealth',
    },
  },
  {
    id: 'health_regen',
    name: '生命回復',
    description: '每秒回復 2 點生命值',
    icon: '💊',
    effect: {
      type: 'stat',
      value: 2,
      target: 'healthRegen',
    },
  },
  
  // Range Upgrades
  {
    id: 'attack_range',
    name: '攻擊範圍',
    description: '增加 20% 攻擊範圍',
    icon: '🎯',
    effect: {
      type: 'stat',
      value: 0.2,
      target: 'range',
    },
  },
  
  // Special Abilities
  {
    id: 'double_shot',
    name: '雙重射擊',
    description: '每次攻擊發射兩個彈藥',
    icon: '🏹',
    effect: {
      type: 'ability',
      value: 1,
      target: 'multiShot',
    },
  },
  {
    id: 'piercing_shot',
    name: '穿透射擊',
    description: '彈藥可以穿透敵人',
    icon: '🔫',
    effect: {
      type: 'ability',
      value: 1,
      target: 'piercing',
    },
  },
  {
    id: 'explosive_shot',
    name: '爆炸射擊',
    description: '彈藥命中時產生範圍傷害',
    icon: '💣',
    effect: {
      type: 'ability',
      value: 50,
      target: 'explosiveRadius',
    },
  },
];

// Wave Configuration
export const WAVE_CONFIG = {
  // Wave composition by wave number
  getWaveComposition: (waveNumber: number) => {
    const baseEnemies = Math.floor(5 + waveNumber * 1.5);
    const composition: Array<{ type: string; count: number }> = [];
    
    // Basic enemies always present
    composition.push({ type: 'basic', count: Math.floor(baseEnemies * 0.6) });
    
    // Add fast enemies from wave 2
    if (waveNumber >= 2) {
      composition.push({ type: 'fast', count: Math.floor(baseEnemies * 0.2) });
    }
    
    // Add tank enemies from wave 3
    if (waveNumber >= 3) {
      composition.push({ type: 'tank', count: Math.floor(baseEnemies * 0.1) });
    }
    
    // Add elite enemies from wave 5
    if (waveNumber >= 5) {
      composition.push({ type: 'elite', count: Math.floor(baseEnemies * 0.1) });
    }
    
    // Boss waves every 5 waves
    if (waveNumber % 5 === 0) {
      composition.push({ type: 'boss', count: 1 });
    }
    
    return composition;
  },
  
  // Scaling factors
  healthScaling: (waveNumber: number) => 1 + (waveNumber - 1) * 0.15,
  damageScaling: (waveNumber: number) => 1 + (waveNumber - 1) * 0.12,
  speedScaling: (waveNumber: number) => Math.min(1 + (waveNumber - 1) * 0.05, 1.5),
  rewardScaling: (waveNumber: number) => 1 + (waveNumber - 1) * 0.1,
};

// Experience Configuration
export const EXP_CONFIG = {
  // Experience required for each level
  getExpForLevel: (level: number): number => {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  },
  
  // Experience gained from enemies
  getExpFromEnemy: (enemyType: string, waveNumber: number): number => {
    const baseExp = ENEMY_TYPES[enemyType]?.reward || 10;
    return Math.floor(baseExp * (1 + waveNumber * 0.1));
  },
};

// Difficulty Configuration
export const DIFFICULTY_CONFIG = {
  easy: {
    playerDamageMultiplier: 1.2,
    enemyHealthMultiplier: 0.8,
    enemyDamageMultiplier: 0.8,
    expMultiplier: 1.2,
  },
  normal: {
    playerDamageMultiplier: 1.0,
    enemyHealthMultiplier: 1.0,
    enemyDamageMultiplier: 1.0,
    expMultiplier: 1.0,
  },
  hard: {
    playerDamageMultiplier: 0.8,
    enemyHealthMultiplier: 1.3,
    enemyDamageMultiplier: 1.2,
    expMultiplier: 1.5,
  },
}; 