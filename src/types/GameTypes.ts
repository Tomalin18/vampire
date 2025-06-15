export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  components: Map<string, Component>;
}

export interface Component {
  type: string;
}

export interface Transform extends Component {
  type: 'transform';
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface Health extends Component {
  type: 'health';
  current: number;
  max: number;
}

export interface Movement extends Component {
  type: 'movement';
  velocity: Vector2;
  speed: number;
  target?: Vector2;
}

export interface Combat extends Component {
  type: 'combat';
  damage: number;
  attackSpeed: number;
  range: number;
  lastAttack: number;
}

export interface Render extends Component {
  type: 'render';
  sprite: string;
  color: string;
  size: number;
}

export interface Player {
  id: string;
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  position: Vector2;
  stats: {
    damage: number;
    attackSpeed: number;
    moveSpeed: number;
    health: number;
    criticalChance: number;
    criticalMultiplier: number;
  };
}

export interface Enemy {
  id: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  speed: number;
  xpValue: number;
  size: number;
}

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  level: number;
  damage: number;
  attackSpeed: number;
  range: number;
  projectileSpeed?: number;
  piercing?: number;
  area?: number;
  description: string;
}

export interface Projectile {
  id: string;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  lifetime: number;
  piercing: number;
  size: number;
  ownerId: string;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  type: UpgradeType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: UpgradeEffect;
}

export interface UpgradeEffect {
  type: 'weapon' | 'stat' | 'passive';
  weaponId?: string;
  statType?: string;
  value: number;
  isPercentage?: boolean;
}

export type EnemyType = 'zombie' | 'ghoul' | 'brute' | 'skeleton' | 'demon' | 'vampire';
export type WeaponType = 'projectile' | 'melee' | 'area' | 'passive';
export type UpgradeType = 'weapon' | 'damage' | 'health' | 'speed' | 'attackSpeed' | 'special';

export interface GameState {
  gameState: 'menu' | 'playing' | 'paused' | 'levelUp' | 'gameOver';
  player: Player;
  currentWave: number;
  survivalTime: number;
  enemiesKilled: number;
  score: number;
  activeWeapons: Weapon[];
  availableUpgrades: Upgrade[];
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    vibrationEnabled: boolean;
    graphics: 'low' | 'medium' | 'high';
  };
}

export interface InputState {
  touch: {
    isPressed: boolean;
    position: Vector2;
  };
  gestures: {
    tap?: Vector2;
    drag?: Vector2;
  };
} 