import { Entity, Component, System } from '../types/GameTypes';

export class GameEngine {
  private entities: Map<string, Entity> = new Map();
  private systems: System[] = [];
  private isRunning = false;
  private lastTime = 0;
  private deltaTime = 0;
  
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

  getEntitiesWithComponent<T extends Component>(componentType: string): Entity[] {
    return Array.from(this.entities.values()).filter(entity => 
      entity.components[componentType] !== undefined
    );
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  // System Management
  addSystem(system: System): void {
    this.systems.push(system);
    this.systems.sort((a, b) => (a.priority || 0) - (b.priority || 0));
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

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.016); // Cap at ~60fps
    this.lastTime = currentTime;

    this.update(this.deltaTime);
    
    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Update all systems
    for (const system of this.systems) {
      if (system.enabled !== false) {
        system.update(this.entities, deltaTime);
      }
    }

    // Clean up destroyed entities
    this.cleanupDestroyedEntities();
  }

  private cleanupDestroyedEntities(): void {
    for (const [id, entity] of this.entities) {
      if (entity.destroyed) {
        this.entities.delete(id);
      }
    }
  }

  // Utility Methods
  getDeltaTime(): number {
    return this.deltaTime;
  }

  getEntityCount(): number {
    return this.entities.size;
  }

  clearAllEntities(): void {
    this.entities.clear();
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    if (!this.isRunning) {
      this.lastTime = performance.now();
      this.start();
    }
  }
}

export const gameEngine = new GameEngine(); 