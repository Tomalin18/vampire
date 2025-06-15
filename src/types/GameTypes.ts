export interface Vector2 {
  x: number;
  y: number;
}

export interface Component {
  [key: string]: any;
}

export interface TransformComponent extends Component {
  position: Vector2;
  rotation: number;
  scale: Vector2;
}

export interface HealthComponent extends Component {
  current: number;
  max: number;
}

export interface MovementComponent extends Component {
  velocity: Vector2;
  speed: number;
  target?: Vector2;
}

export interface CombatComponent extends Component {
  damage: number;
  attackSpeed: number;
  range: number;
  lastAttackTime: number;
  targets: string[];
}

export interface RenderComponent extends Component {
  sprite: string;
  width: number;
  height: number;
  color?: string;
  opacity?: number;
}

export interface CollisionComponent extends Component {
  radius: number;
  layer: string;
  mask: string[];
}

export interface PlayerComponent extends Component {
  level: number;
  experience: number;
  experienceToNext: number;
}

export interface EnemyComponent extends Component {
  type: string;
  reward: number;
  aiType: 'chase' | 'patrol' | 'ranged';
}

export interface ProjectileComponent extends Component {
  damage: number;
  speed: number;
  lifetime: number;
  penetration: number;
  ownerId: string;
}

export interface Entity {
  id: string;
  components: { [key: string]: Component };
  destroyed?: boolean;
  tags?: string[];
}

export interface System {
  priority?: number;
  enabled?: boolean;
  update(entities: Map<string, Entity>, deltaTime: number): void;
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
  weapons: string[];
  upgrades: string[];
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

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  attackSpeed: number;
  range: number;
  projectileSpeed: number;
  projectileSprite: string;
}

export interface Enemy {
  id: string;
  type: string;
  health: number;
  damage: number;
  speed: number;
  reward: number;
  sprite: string;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: {
    type: 'stat' | 'ability' | 'weapon';
    value: number;
    target: string;
  };
} 