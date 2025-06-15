import { Entity, Vector2 } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/gameConfig';

export interface System {
  priority: number;
  update(entities: Map<string, Entity>, deltaTime: number): void;
}

export class GameEngine {
  private entities: Map<string, Entity> = new Map();
  private systems: System[] = [];
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;
  private fpsUpdateTime: number = 0;

  constructor() {
    this.lastTime = performance.now();
  }

  // Entity Management
  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(id: string): void {
    this.entities.delete(id);
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getEntities(): Map<string, Entity> {
    return this.entities;
  }

  clearEntities(): void {
    this.entities.clear();
  }

  // System Management
  addSystem(system: System): void {
    this.systems.push(system);
    // Sort systems by priority (lower numbers run first)
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  removeSystem(system: System): void {
    const index = this.systems.indexOf(system);
    if (index > -1) {
      this.systems.splice(index, 1);
    }
  }

  // Game Loop
  start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.isRunning = false;
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop();
    }
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Cap delta time to prevent large jumps
    this.deltaTime = Math.min(this.deltaTime, 1 / 30); // Maximum 30 FPS minimum

    // Update FPS counter
    this.updateFPS(currentTime);

    // Update all systems
    this.systems.forEach(system => {
      system.update(this.entities, this.deltaTime);
    });

    // Clean up destroyed entities
    this.cleanupEntities();

    // Continue the game loop
    requestAnimationFrame(this.gameLoop);
  };

  private updateFPS(currentTime: number): void {
    this.frameCount++;
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
  }

  private cleanupEntities(): void {
    const toRemove: string[] = [];
    
    this.entities.forEach((entity, id) => {
      // Check if entity is marked for destruction
      if ((entity as any).destroyed) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => this.removeEntity(id));
  }

  // Utility Methods
  getDeltaTime(): number {
    return this.deltaTime;
  }

  getFPS(): number {
    return this.fps;
  }

  isRunningState(): boolean {
    return this.isRunning;
  }

  getEntityCount(): number {
    return this.entities.size;
  }

  // Helper methods for common operations
  findEntitiesWithComponent(componentType: string): Entity[] {
    const result: Entity[] = [];
    this.entities.forEach(entity => {
      if (entity.components.has(componentType)) {
        result.push(entity);
      }
    });
    return result;
  }

  findNearbyEntities(position: Vector2, radius: number, excludeId?: string): Entity[] {
    const result: Entity[] = [];
    
    this.entities.forEach(entity => {
      if (excludeId && entity.id === excludeId) return;
      
      const transform = entity.components.get('transform');
      if (transform) {
        const dx = (transform as any).x - position.x;
        const dy = (transform as any).y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= radius) {
          result.push(entity);
        }
      }
    });
    
    return result;
  }

  // Collision detection helper
  checkCollision(entity1: Entity, entity2: Entity): boolean {
    const transform1 = entity1.components.get('transform') as any;
    const transform2 = entity2.components.get('transform') as any;
    const render1 = entity1.components.get('render') as any;
    const render2 = entity2.components.get('render') as any;

    if (!transform1 || !transform2 || !render1 || !render2) return false;

    const dx = transform1.x - transform2.x;
    const dy = transform1.y - transform2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (render1.size + render2.size) / 2;

    return distance < minDistance;
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      fps: this.fps,
      entityCount: this.entities.size,
      systemCount: this.systems.length,
      deltaTime: this.deltaTime,
    };
  }
}

export const gameEngine = new GameEngine(); 