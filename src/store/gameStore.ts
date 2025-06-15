import { create } from 'zustand';
import { GameState, Player, Enemy, Projectile, Weapon, Upgrade } from '../types/GameTypes';
import { GAME_CONFIG, CHARACTER_CONFIG } from '../config/gameConfig';

interface GameStore extends GameState {
  // Entities
  enemies: Enemy[];
  projectiles: Projectile[];
  
  // Game Actions
  startGame: (characterId: string) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  returnToMenu: () => void;
  
  // Player Actions
  updatePlayerPosition: (x: number, y: number) => void;
  updatePlayerHealth: (health: number) => void;
  gainExperience: (amount: number) => void;
  levelUp: () => void;
  applyUpgrade: (upgrade: Upgrade) => void;
  
  // Enemy Actions
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (enemyId: string) => void;
  updateEnemies: (enemies: Enemy[]) => void;
  
  // Projectile Actions
  addProjectile: (projectile: Projectile) => void;
  removeProjectile: (projectileId: string) => void;
  updateProjectiles: (projectiles: Projectile[]) => void;
  
  // Weapon Actions
  addWeapon: (weapon: Weapon) => void;
  upgradeWeapon: (weaponId: string) => void;
  
  // Game Progress
  incrementTime: () => void;
  incrementScore: (points: number) => void;
  incrementKills: () => void;
  
  // Settings
  updateSettings: (settings: Partial<GameState['settings']>) => void;
}

const createInitialPlayer = (characterId: string): Player => {
  const character = CHARACTER_CONFIG[characterId as keyof typeof CHARACTER_CONFIG];
  
  return {
    id: 'player',
    level: 1,
    experience: 0,
    experienceToNext: GAME_CONFIG.BASE_XP_REQUIREMENT,
    health: character.baseStats.health,
    maxHealth: character.baseStats.health,
    position: { x: GAME_CONFIG.SCREEN_WIDTH / 2, y: GAME_CONFIG.SCREEN_HEIGHT / 2 },
    stats: {
      damage: character.baseStats.damage,
      attackSpeed: character.baseStats.attackSpeed,
      moveSpeed: character.baseStats.moveSpeed,
      health: character.baseStats.health,
      criticalChance: character.baseStats.criticalChance,
      criticalMultiplier: character.baseStats.criticalMultiplier,
    },
  };
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial State
  gameState: 'menu',
  player: createInitialPlayer('warrior'),
  currentWave: 1,
  survivalTime: 0,
  enemiesKilled: 0,
  score: 0,
  activeWeapons: [],
  availableUpgrades: [],
  enemies: [],
  projectiles: [],
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    vibrationEnabled: true,
    graphics: 'medium',
  },
  
  // Game Actions
  startGame: (characterId: string) => {
    const player = createInitialPlayer(characterId);
    set({
      gameState: 'playing',
      player,
      currentWave: 1,
      survivalTime: 0,
      enemiesKilled: 0,
      score: 0,
      enemies: [],
      projectiles: [],
      activeWeapons: [],
      availableUpgrades: [],
    });
  },
  
  pauseGame: () => {
    set({ gameState: 'paused' });
  },
  
  resumeGame: () => {
    set({ gameState: 'playing' });
  },
  
  endGame: () => {
    set({ gameState: 'gameOver' });
  },
  
  returnToMenu: () => {
    set({ 
      gameState: 'menu',
      enemies: [],
      projectiles: [],
    });
  },
  
  // Player Actions
  updatePlayerPosition: (x: number, y: number) => {
    set(state => ({
      player: {
        ...state.player,
        position: { x, y },
      },
    }));
  },
  
  updatePlayerHealth: (health: number) => {
    set(state => ({
      player: {
        ...state.player,
        health: Math.max(0, Math.min(health, state.player.maxHealth)),
      },
    }));
  },
  
  gainExperience: (amount: number) => {
    set(state => {
      const newExperience = state.player.experience + amount;
      const newScore = state.score + amount;
      
      if (newExperience >= state.player.experienceToNext) {
        return {
          player: {
            ...state.player,
            experience: newExperience - state.player.experienceToNext,
            level: state.player.level + 1,
            experienceToNext: Math.floor(GAME_CONFIG.BASE_XP_REQUIREMENT * Math.pow(GAME_CONFIG.XP_SCALING, state.player.level)),
          },
          score: newScore,
          gameState: 'levelUp' as const,
        };
      }
      
      return {
        player: {
          ...state.player,
          experience: newExperience,
        },
        score: newScore,
      };
    });
  },
  
  levelUp: () => {
    set({ gameState: 'playing' });
  },
  
  applyUpgrade: (upgrade: Upgrade) => {
    set(state => {
      const newPlayer = { ...state.player };
      
      if (upgrade.effect.type === 'stat') {
        const statType = upgrade.effect.statType as keyof Player['stats'];
        const currentValue = newPlayer.stats[statType] as number;
        
        if (upgrade.effect.isPercentage) {
          (newPlayer.stats as any)[statType] = currentValue * (1 + upgrade.effect.value);
        } else {
          (newPlayer.stats as any)[statType] = currentValue + upgrade.effect.value;
        }
        
        // Update max health if health stat is increased
        if (statType === 'health') {
          newPlayer.maxHealth = newPlayer.stats.health;
          newPlayer.health = Math.min(newPlayer.health, newPlayer.maxHealth);
        }
      }
      
      return {
        player: newPlayer,
        gameState: 'playing' as const,
      };
    });
  },
  
  // Enemy Actions
  addEnemy: (enemy: Enemy) => {
    set(state => ({
      enemies: [...state.enemies, enemy],
    }));
  },
  
  removeEnemy: (enemyId: string) => {
    set(state => ({
      enemies: state.enemies.filter(enemy => enemy.id !== enemyId),
    }));
  },
  
  updateEnemies: (enemies: Enemy[]) => {
    set({ enemies });
  },
  
  // Projectile Actions
  addProjectile: (projectile: Projectile) => {
    set(state => ({
      projectiles: [...state.projectiles, projectile],
    }));
  },
  
  removeProjectile: (projectileId: string) => {
    set(state => ({
      projectiles: state.projectiles.filter(projectile => projectile.id !== projectileId),
    }));
  },
  
  updateProjectiles: (projectiles: Projectile[]) => {
    set({ projectiles });
  },
  
  // Weapon Actions
  addWeapon: (weapon: Weapon) => {
    set(state => ({
      activeWeapons: [...state.activeWeapons, weapon],
    }));
  },
  
  upgradeWeapon: (weaponId: string) => {
    set(state => ({
      activeWeapons: state.activeWeapons.map(weapon =>
        weapon.id === weaponId
          ? { ...weapon, level: weapon.level + 1, damage: weapon.damage * 1.2 }
          : weapon
      ),
    }));
  },
  
  // Game Progress
  incrementTime: () => {
    set(state => ({
      survivalTime: state.survivalTime + 1,
    }));
  },
  
  incrementScore: (points: number) => {
    set(state => ({
      score: state.score + points,
    }));
  },
  
  incrementKills: () => {
    set(state => ({
      enemiesKilled: state.enemiesKilled + 1,
    }));
  },
  
  // Settings
  updateSettings: (newSettings) => {
    set(state => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },
})); 