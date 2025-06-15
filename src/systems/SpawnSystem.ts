import { System, Entity, Vector2, EnemyComponent, TransformComponent, HealthComponent, MovementComponent, RenderComponent, CollisionComponent, CombatComponent } from '../types/GameTypes';
import { gameEngine } from '../game/GameEngine';
import { SCREEN, GAME } from '../config/constants';
import { ENEMY_TYPES } from '../config/gameConfig';

export class SpawnSystem implements System {
  priority = 5;
  enabled = true;

  private spawnTimer = 0;
  private spawnInterval = 1500; // 1.5 seconds
  private currentWave = 1;
  private enemiesThisWave = 0;
  private maxEnemiesPerWave = 5;
  private waveTimer = 0;
  private waveDuration = GAME.WAVE_DURATION;

  update(entities: Map<string, Entity>, deltaTime: number): void {
    this.spawnTimer += deltaTime * 1000;
    this.waveTimer += deltaTime * 1000;

    // Check if wave is complete
    if (this.waveTimer >= this.waveDuration) {
      this.nextWave();
    }

    // Spawn enemies
    if (this.spawnTimer >= this.spawnInterval && this.shouldSpawnEnemy(entities)) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    // Update enemy AI
    this.updateEnemyAI(entities, deltaTime);
  }

  private shouldSpawnEnemy(entities: Map<string, Entity>): boolean {
    // Count current enemies
    const enemyCount = Array.from(entities.values()).filter(
      entity => entity.components.enemy
    ).length;

    return enemyCount < GAME.MAX_ENEMIES && this.enemiesThisWave < this.maxEnemiesPerWave;
  }

  private spawnEnemy(): void {
    const enemyType = this.selectEnemyType();
    const spawnPosition = this.getSpawnPosition();
    
    const enemyId = `enemy_${Date.now()}_${Math.random()}`;
    const enemyConfig = ENEMY_TYPES[enemyType];

    // Scale enemy stats based on current wave
    const difficultyMultiplier = Math.pow(GAME.WAVE_DIFFICULTY_MULTIPLIER, this.currentWave - 1);
    
    const enemy: Entity = {
      id: enemyId,
      components: {
        transform: {
          position: spawnPosition,
          rotation: 0,
          scale: { x: 1, y: 1 }
        },
        health: {
          current: Math.floor(enemyConfig.health * difficultyMultiplier),
          max: Math.floor(enemyConfig.health * difficultyMultiplier)
        },
        movement: {
          velocity: { x: 0, y: 0 },
          speed: enemyConfig.speed
        },
        combat: {
          damage: Math.floor(enemyConfig.damage * difficultyMultiplier),
          attackSpeed: 1.0,
          range: 30,
          lastAttackTime: 0,
          targets: ['player']
        },
        enemy: {
          type: enemyType,
          reward: Math.floor(enemyConfig.reward * difficultyMultiplier),
          aiType: this.getAIType(enemyType)
        },
        collision: {
          radius: this.getEnemySize(enemyType),
          layer: 'enemy',
          mask: ['player', 'projectile']
        },
        render: {
          sprite: enemyConfig.sprite,
          width: this.getEnemySize(enemyType) * 2,
          height: this.getEnemySize(enemyType) * 2,
          color: this.getEnemyColor(enemyType)
        }
      },
      tags: ['enemy']
    };

    gameEngine.addEntity(enemy);
    this.enemiesThisWave++;
  }

  private selectEnemyType(): string {
    // Determine enemy type based on wave and probability
    const rand = Math.random();
    
    // Boss every 5 waves
    if (this.currentWave % GAME.BOSS_WAVE_INTERVAL === 0 && rand < 0.1) {
      return 'boss';
    }

    // Elite enemies become more common in later waves
    if (this.currentWave >= 3 && rand < 0.15) {
      return 'elite';
    }

    // Tank enemies
    if (this.currentWave >= 2 && rand < 0.2) {
      return 'tank';
    }

    // Fast enemies
    if (rand < 0.3) {
      return 'fast';
    }

    // Default to basic enemy
    return 'basic';
  }

  private getSpawnPosition(): Vector2 {
    // Spawn enemies outside screen bounds
    const side = Math.floor(Math.random() * 4);
    const buffer = GAME.ENEMY_SPAWN_DISTANCE;
    
    switch (side) {
      case 0: // Top
        return {
          x: Math.random() * SCREEN.WIDTH,
          y: -buffer
        };
      case 1: // Right
        return {
          x: SCREEN.WIDTH + buffer,
          y: Math.random() * SCREEN.HEIGHT
        };
      case 2: // Bottom
        return {
          x: Math.random() * SCREEN.WIDTH,
          y: SCREEN.HEIGHT + buffer
        };
      default: // Left
        return {
          x: -buffer,
          y: Math.random() * SCREEN.HEIGHT
        };
    }
  }

  private getAIType(enemyType: string): 'chase' | 'patrol' | 'ranged' {
    switch (enemyType) {
      case 'fast':
      case 'basic':
        return 'chase';
      case 'tank':
        return 'chase';
      case 'elite':
      case 'boss':
        return 'ranged';
      default:
        return 'chase';
    }
  }

  private getEnemySize(enemyType: string): number {
    switch (enemyType) {
      case 'basic':
      case 'fast':
        return GAME.ENEMY_SIZE_SMALL;
      case 'tank':
      case 'elite':
        return GAME.ENEMY_SIZE_MEDIUM;
      case 'boss':
        return GAME.ENEMY_SIZE_BOSS;
      default:
        return GAME.ENEMY_SIZE_SMALL;
    }
  }

  private getEnemyColor(enemyType: string): string {
    switch (enemyType) {
      case 'basic':
        return '#FF6B6B';
      case 'fast':
        return '#4ECDC4';
      case 'tank':
        return '#45B7D1';
      case 'elite':
        return '#96CEB4';
      case 'boss':
        return '#FFEAA7';
      default:
        return '#FF6B6B';
    }
  }

  private updateEnemyAI(entities: Map<string, Entity>, deltaTime: number): void {
    // Find player entity
    const player = Array.from(entities.values()).find(entity => entity.components.player);
    if (!player || !player.components.transform) return;

    const playerTransform = player.components.transform as TransformComponent;

    for (const entity of entities.values()) {
      const enemy = entity.components.enemy as EnemyComponent;
      if (!enemy) continue;

      const transform = entity.components.transform as TransformComponent;
      const movement = entity.components.movement as MovementComponent;
      if (!transform || !movement) continue;

      // Update AI based on type
      switch (enemy.aiType) {
        case 'chase':
          this.chaseAI(entity, playerTransform.position);
          break;
        case 'ranged':
          this.rangedAI(entity, playerTransform.position);
          break;
        case 'patrol':
          this.patrolAI(entity);
          break;
      }

      // Remove enemies that are too far from player
      const distance = this.getDistance(transform.position, playerTransform.position);
      if (distance > GAME.ENEMY_DESPAWN_DISTANCE) {
        entity.destroyed = true;
      }
    }
  }

  private chaseAI(enemy: Entity, playerPosition: Vector2): void {
    const transform = enemy.components.transform as TransformComponent;
    const movement = enemy.components.movement as MovementComponent;

    // Calculate direction to player
    const direction = this.normalizeVector({
      x: playerPosition.x - transform.position.x,
      y: playerPosition.y - transform.position.y
    });

    // Set velocity to chase player
    movement.velocity = {
      x: direction.x * movement.speed,
      y: direction.y * movement.speed
    };
  }

  private rangedAI(enemy: Entity, playerPosition: Vector2): void {
    const transform = enemy.components.transform as TransformComponent;
    const movement = enemy.components.movement as MovementComponent;
    const combat = enemy.components.combat as CombatComponent;

    const distance = this.getDistance(transform.position, playerPosition);
    const optimalRange = combat.range * 0.8; // Stay at 80% of attack range

    if (distance > optimalRange) {
      // Move towards player
      const direction = this.normalizeVector({
        x: playerPosition.x - transform.position.x,
        y: playerPosition.y - transform.position.y
      });

      movement.velocity = {
        x: direction.x * movement.speed * 0.5, // Move slower for ranged enemies
        y: direction.y * movement.speed * 0.5
      };
    } else if (distance < optimalRange * 0.6) {
      // Move away from player
      const direction = this.normalizeVector({
        x: transform.position.x - playerPosition.x,
        y: transform.position.y - playerPosition.y
      });

      movement.velocity = {
        x: direction.x * movement.speed * 0.3,
        y: direction.y * movement.speed * 0.3
      };
    } else {
      // Stay in position
      movement.velocity = { x: 0, y: 0 };
    }
  }

  private patrolAI(enemy: Entity): void {
    // Simple patrol behavior - can be expanded later
    const movement = enemy.components.movement as MovementComponent;
    
    // Random movement changes
    if (Math.random() < 0.05) { // 5% chance per frame to change direction
      const angle = Math.random() * Math.PI * 2;
      movement.velocity = {
        x: Math.cos(angle) * movement.speed * 0.3,
        y: Math.sin(angle) * movement.speed * 0.3
      };
    }
  }

  private nextWave(): void {
    this.currentWave++;
    this.enemiesThisWave = 0;
    this.waveTimer = 0;
    
    // Increase difficulty
    this.maxEnemiesPerWave = Math.floor(GAME.ENEMIES_PER_WAVE_BASE * Math.pow(1.2, this.currentWave - 1));
    
    // Slightly reduce spawn interval
    this.spawnInterval = Math.max(800, this.spawnInterval * 0.95);
  }

  private getDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private normalizeVector(vector: Vector2): Vector2 {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (magnitude === 0) return { x: 0, y: 0 };
    
    return {
      x: vector.x / magnitude,
      y: vector.y / magnitude
    };
  }

  // Public methods for game state management
  getCurrentWave(): number {
    return this.currentWave;
  }

  setWave(wave: number): void {
    this.currentWave = wave;
    this.enemiesThisWave = 0;
    this.waveTimer = 0;
    this.maxEnemiesPerWave = Math.floor(GAME.ENEMIES_PER_WAVE_BASE * Math.pow(1.2, wave - 1));
  }

  reset(): void {
    this.currentWave = 1;
    this.enemiesThisWave = 0;
    this.waveTimer = 0;
    this.maxEnemiesPerWave = GAME.ENEMIES_PER_WAVE_BASE;
    this.spawnInterval = 1500;
  }
} 