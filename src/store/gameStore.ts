import { create } from 'zustand';
import { GameState, PlayerState, GameSession, PlayerProgress, GameSettings, Vector2, Upgrade } from '../types/GameTypes';
import { GAME } from '../config/constants';
import { CHARACTERS, EXP_CONFIG } from '../config/gameConfig';

interface GameStore {
  // Game State
  gameState: GameState;
  isPaused: boolean;
  
  // Player State
  player: PlayerState;
  selectedCharacter: string;
  
  // Session State
  session: GameSession;
  
  // Progress State
  progress: PlayerProgress;
  
  // Settings
  settings: GameSettings;
  
  // UI State
  showLevelUpModal: boolean;
  availableUpgrades: Upgrade[];
  
  // Actions
  setGameState: (state: GameState) => void;
  togglePause: () => void;
  
  // Player Actions
  updatePlayerPosition: (position: Vector2) => void;
  updatePlayerHealth: (health: number) => void;
  addExperience: (amount: number) => void;
  levelUp: () => void;
  selectUpgrade: (upgrade: Upgrade) => void;
  setSelectedCharacter: (characterId: string) => void;
  
  // Session Actions
  startNewGame: (characterId: string) => void;
  endGame: () => void;
  incrementWave: () => void;
  addScore: (points: number) => void;
  addEnemyKill: () => void;
  
  // Progress Actions
  updateProgress: (updates: Partial<PlayerProgress>) => void;
  addCurrency: (amount: number) => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<GameSettings>) => void;
  
  // Utility Actions
  resetGame: () => void;
  initializeGame: () => void;
}

// Default state values
const DEFAULT_PLAYER_STATE: PlayerState = {
  level: 1,
  experience: 0,
  experienceToNext: EXP_CONFIG.getExpForLevel(1),
  health: GAME.PLAYER_HEALTH_BASE,
  maxHealth: GAME.PLAYER_HEALTH_BASE,
  position: { x: 0, y: 0 },
  stats: {
    damage: GAME.PLAYER_DAMAGE_BASE,
    speed: GAME.PLAYER_SPEED_BASE,
    attackSpeed: GAME.ATTACK_SPEED_BASE,
    range: GAME.ATTACK_RANGE_BASE,
  },
  weapons: [],
  upgrades: [],
};

const DEFAULT_SESSION_STATE: GameSession = {
  startTime: Date.now(),
  currentWave: 1,
  enemiesDefeated: 0,
  survivalTime: 0,
  score: 0,
  level: 1,
};

const DEFAULT_PROGRESS_STATE: PlayerProgress = {
  totalGamesPlayed: 0,
  bestSurvivalTime: 0,
  highScore: 0,
  totalEnemiesDefeated: 0,
  unlockedCharacters: ['warrior', 'mage'],
  currency: 0,
  achievements: [],
};

const DEFAULT_SETTINGS: GameSettings = {
  audio: {
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    enabled: true,
  },
  graphics: {
    quality: 'medium',
    showFPS: false,
    particleEffects: true,
  },
  gameplay: {
    autoPause: true,
    vibration: true,
    controlSensitivity: 1.0,
  },
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial State
  gameState: 'menu',
  isPaused: false,
  player: DEFAULT_PLAYER_STATE,
  selectedCharacter: 'warrior',
  session: DEFAULT_SESSION_STATE,
  progress: DEFAULT_PROGRESS_STATE,
  settings: DEFAULT_SETTINGS,
  showLevelUpModal: false,
  availableUpgrades: [],

  // Game State Actions
  setGameState: (gameState: GameState) => set({ gameState }),
  
  togglePause: () => set((state) => ({ 
    isPaused: !state.isPaused,
    gameState: state.isPaused ? 'playing' : 'paused'
  })),

  // Player Actions
  updatePlayerPosition: (position: Vector2) => 
    set((state) => ({
      player: { ...state.player, position }
    })),

  updatePlayerHealth: (health: number) =>
    set((state) => ({
      player: { ...state.player, health: Math.max(0, Math.min(health, state.player.maxHealth)) }
    })),

  addExperience: (amount: number) =>
    set((state) => {
      const newExp = state.player.experience + amount;
      const expNeeded = state.player.experienceToNext;
      
      if (newExp >= expNeeded) {
        // Level up triggered
        return {
          player: {
            ...state.player,
            experience: newExp - expNeeded,
            level: state.player.level + 1,
            experienceToNext: EXP_CONFIG.getExpForLevel(state.player.level + 1),
          },
          gameState: 'levelUp',
          showLevelUpModal: true,
        };
      }
      
      return {
        player: {
          ...state.player,
          experience: newExp,
        }
      };
    }),

  levelUp: () => {
    // This will be called when level up modal is shown
    // The actual leveling logic is handled in addExperience
    set({ showLevelUpModal: false, gameState: 'playing' });
  },

  selectUpgrade: (upgrade: Upgrade) =>
    set((state) => {
      const newStats = { ...state.player.stats };
      let newPlayer = { ...state.player };
      
      // Apply upgrade effects
      switch (upgrade.effect.type) {
        case 'stat':
          const target = upgrade.effect.target;
          if (target in newStats) {
            const currentValue = newStats[target as keyof typeof newStats];
            if (upgrade.effect.value < 1) {
              // Percentage increase
              newStats[target as keyof typeof newStats] = Math.floor(currentValue * (1 + upgrade.effect.value));
            } else {
              // Flat increase
              newStats[target as keyof typeof newStats] = currentValue + upgrade.effect.value;
            }
          }
          break;
        case 'ability':
          // Handle special abilities
          break;
      }
      
      return {
        player: {
          ...newPlayer,
          stats: newStats,
          upgrades: [...state.player.upgrades, upgrade],
        },
        showLevelUpModal: false,
        gameState: 'playing',
      };
    }),

  setSelectedCharacter: (characterId: string) =>
    set({ selectedCharacter: characterId }),

  // Session Actions
  startNewGame: (characterId: string) => {
    const character = CHARACTERS.find(c => c.id === characterId);
    if (!character) return;
    
    set({
      gameState: 'playing',
      selectedCharacter: characterId,
      player: {
        ...DEFAULT_PLAYER_STATE,
        health: character.baseStats.health,
        maxHealth: character.baseStats.health,
        stats: {
          damage: character.baseStats.damage,
          speed: character.baseStats.speed,
          attackSpeed: character.baseStats.attackSpeed,
          range: GAME.ATTACK_RANGE_BASE,
        },
        position: { x: 0, y: 0 },
      },
      session: {
        ...DEFAULT_SESSION_STATE,
        startTime: Date.now(),
      },
      isPaused: false,
    });
  },

  endGame: () => {
    const state = get();
    const finalScore = state.session.score;
    const survivalTime = Date.now() - state.session.startTime;
    
    // Update progress
    set((currentState) => ({
      gameState: 'gameOver',
      progress: {
        ...currentState.progress,
        totalGamesPlayed: currentState.progress.totalGamesPlayed + 1,
        bestSurvivalTime: Math.max(currentState.progress.bestSurvivalTime, survivalTime),
        highScore: Math.max(currentState.progress.highScore, finalScore),
        totalEnemiesDefeated: currentState.progress.totalEnemiesDefeated + currentState.session.enemiesDefeated,
        currency: currentState.progress.currency + Math.floor(finalScore / 10),
      },
      session: {
        ...currentState.session,
        survivalTime,
      },
    }));
  },

  incrementWave: () =>
    set((state) => ({
      session: { ...state.session, currentWave: state.session.currentWave + 1 }
    })),

  addScore: (points: number) =>
    set((state) => ({
      session: { ...state.session, score: state.session.score + points }
    })),

  addEnemyKill: () =>
    set((state) => ({
      session: { ...state.session, enemiesDefeated: state.session.enemiesDefeated + 1 }
    })),

  // Progress Actions
  updateProgress: (updates: Partial<PlayerProgress>) =>
    set((state) => ({
      progress: { ...state.progress, ...updates }
    })),

  addCurrency: (amount: number) =>
    set((state) => ({
      progress: { ...state.progress, currency: state.progress.currency + amount }
    })),

  // Settings Actions
  updateSettings: (settings: Partial<GameSettings>) =>
    set((state) => ({
      settings: { ...state.settings, ...settings }
    })),

  // Utility Actions
  resetGame: () =>
    set({
      gameState: 'menu',
      isPaused: false,
      player: DEFAULT_PLAYER_STATE,
      session: DEFAULT_SESSION_STATE,
      showLevelUpModal: false,
      availableUpgrades: [],
    }),

  initializeGame: () => {
    // Initialize game with saved data
    // This would typically load from AsyncStorage
    set({
      gameState: 'menu',
      player: DEFAULT_PLAYER_STATE,
      session: DEFAULT_SESSION_STATE,
      progress: DEFAULT_PROGRESS_STATE,
      settings: DEFAULT_SETTINGS,
    });
  },
})); 