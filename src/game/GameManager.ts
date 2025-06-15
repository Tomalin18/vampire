import { Entity, PlayerComponent, TransformComponent, HealthComponent, MovementComponent, CombatComponent, RenderComponent, CollisionComponent } from '../types/GameTypes';
import { gameEngine } from './GameEngine';
import { MovementSystem } from '../systems/MovementSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { useGameStore } from '../store/gameStore';
import { SCREEN, GAME } from '../config/constants';
import { CHARACTERS } from '../config/gameConfig';

export class GameManager {
  private movementSystem: MovementSystem;
  private combatSystem: CombatSystem;
  private spawnSystem: SpawnSystem;
  private playerEntity: Entity | null = null;
  private isInitialized = false;

  constructor() {
    this.movementSystem = new MovementSystem();
    this.combatSystem = new CombatSystem();
    this.spawnSystem = new SpawnSystem();
  }

  initialize(): void {
    if (this.isInitialized) return;

    // Add systems to game engine
    gameEngine.addSystem(this.movementSystem);
    gameEngine.addSystem(this.combatSystem);
    gameEngine.addSystem(this.spawnSystem);

    this.isInitialized = true;
  }

  startNewGame(characterId: string): void {
    // Clear existing entities
    gameEngine.clearAllEntities();
    
    // Reset spawn system
    this.spawnSystem.reset();

    // Create player entity
    this.createPlayer(characterId);

    // Start game engine
    gameEngine.start();

    // Update game store
    const gameStore = useGameStore.getState();
    gameStore.setGameState('playing');
    gameStore.startNewGame(characterId);
  }

  private createPlayer(characterId: string): void {
    const character = CHARACTERS.find(c => c.id === characterId);
    if (!character) throw new Error(`Character ${characterId} not found`);

    const playerId = 'player';
    this.playerEntity = {
      id: playerId,
      components: {
        transform: {
          position: { x: SCREEN.CENTER_X, y: SCREEN.CENTER_Y },
          rotation: 0,
          scale: { x: 1, y: 1 }
        },
        health: {
          current: character.baseStats.health,
          max: character.baseStats.health
        },
        movement: {
          velocity: { x: 0, y: 0 },
          speed: character.baseStats.speed,
          target: undefined
        },
        combat: {
          damage: character.baseStats.damage,
          attackSpeed: character.baseStats.attackSpeed,
          range: GAME.ATTACK_RANGE_BASE,
          lastAttackTime: 0,
          targets: ['enemy']
        },
        player: {
          level: 1,
          experience: 0,
          experienceToNext: 100
        },
        collision: {
          radius: GAME.PLAYER_SIZE / 2,
          layer: 'player',
          mask: ['enemy', 'pickup']
        },
        render: {
          sprite: character.sprite,
          width: GAME.PLAYER_SIZE,
          height: GAME.PLAYER_SIZE,
          color: '#4CAF50'
        }
      },
      tags: ['player']
    };

    gameEngine.addEntity(this.playerEntity);
  }

  movePlayer(target: { x: number; y: number }): void {
    if (this.playerEntity) {
      MovementSystem.moveToTarget(this.playerEntity, target);
    }
  }

  pauseGame(): void {
    gameEngine.pause();
    const gameStore = useGameStore.getState();
    gameStore.setGameState('paused');
  }

  resumeGame(): void {
    gameEngine.resume();
    const gameStore = useGameStore.getState();
    gameStore.setGameState('playing');
  }

  endGame(): void {
    gameEngine.stop();
    const gameStore = useGameStore.getState();
    gameStore.endGame();
    gameStore.setGameState('gameOver');
  }

  getPlayerPosition(): { x: number; y: number } | null {
    if (!this.playerEntity || !this.playerEntity.components.transform) {
      return null;
    }
    const transform = this.playerEntity.components.transform as TransformComponent;
    return { ...transform.position };
  }

  getPlayerHealth(): { current: number; max: number } | null {
    if (!this.playerEntity || !this.playerEntity.components.health) {
      return null;
    }
    const health = this.playerEntity.components.health as HealthComponent;
    return { current: health.current, max: health.max };
  }

  getAllEntities(): Entity[] {
    return gameEngine.getAllEntities();
  }

  getEnemies(): Entity[] {
    return gameEngine.getAllEntities().filter(entity => entity.components.enemy);
  }

  getProjectiles(): Entity[] {
    return gameEngine.getAllEntities().filter(entity => entity.components.projectile);
  }

  getCurrentWave(): number {
    return this.spawnSystem.getCurrentWave();
  }

  // Update method to be called from React component
  update(): void {
    if (!this.playerEntity) return;

    try {
      // Check if player is dead
      const health = this.playerEntity.components.health as HealthComponent;
      if (health && health.current <= 0) {
        this.endGame();
        return;
      }

      // Update game store with current game state (less frequently)
      if (Math.random() < 0.1) { // Only update store 10% of the time to reduce overhead
        const gameStore = useGameStore.getState();
        
        // Update player health in store
        if (health) {
          gameStore.updatePlayerHealth(health.current);
        }

        // Update wave information
        const currentWave = this.getCurrentWave();
        if (currentWave !== gameStore.session.currentWave) {
          gameStore.incrementWave();
        }
      }

      // Handle experience and leveling (less frequently)
      if (Math.random() < 0.2) { // Only check 20% of the time
        this.handleExperience();
      }
    } catch (error) {
      console.log('GameManager update error:', error);
    }
  }

  private handleExperience(): void {
    const gameStore = useGameStore.getState();
    const playerComponent = this.playerEntity?.components.player as PlayerComponent;
    
    if (!playerComponent) return;

    // Check for destroyed enemies and add experience
    const destroyedEnemies = gameEngine.getAllEntities().filter(
      entity => entity.destroyed && entity.components.enemy
    );

    for (const enemy of destroyedEnemies) {
      const enemyComponent = enemy.components.enemy;
      if (enemyComponent && enemyComponent.reward) {
        gameStore.addExperience(enemyComponent.reward);
        gameStore.addScore(enemyComponent.reward * 10);
        gameStore.addEnemyKill();
      }
    }
  }

  destroy(): void {
    gameEngine.stop();
    gameEngine.clearAllEntities();
    this.playerEntity = null;
    this.isInitialized = false;
  }
}

export const gameManager = new GameManager(); 