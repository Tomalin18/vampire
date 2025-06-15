import { Entity, Vector2, Transform, Movement } from '../types/GameTypes';
import { System } from '../game/GameEngine';
import { GAME_CONFIG } from '../config/gameConfig';

export class MovementSystem implements System {
  priority = 1; // Low priority, runs early

  update(entities: Map<string, Entity>, deltaTime: number): void {
    entities.forEach(entity => {
      const transform = entity.components.get('transform') as Transform;
      const movement = entity.components.get('movement') as Movement;

      if (!transform || !movement) return;

      // Update position based on velocity
      transform.x += movement.velocity.x * deltaTime;
      transform.y += movement.velocity.y * deltaTime;

      // Handle screen boundaries
      this.constrainToScreen(transform);

      // Update rotation to face movement direction
      if (movement.velocity.x !== 0 || movement.velocity.y !== 0) {
        transform.rotation = Math.atan2(movement.velocity.y, movement.velocity.x);
      }

      // Handle target-based movement (for AI)
      if (movement.target) {
        this.moveToTarget(transform, movement, deltaTime);
      }

      // Apply friction/damping
      this.applyDamping(movement, deltaTime);
    });
  }

  private constrainToScreen(transform: Transform): void {
    const padding = 20; // Keep entities slightly within bounds
    
    transform.x = Math.max(padding, Math.min(GAME_CONFIG.SCREEN_WIDTH - padding, transform.x));
    transform.y = Math.max(padding, Math.min(GAME_CONFIG.SCREEN_HEIGHT - padding, transform.y));
  }

  private moveToTarget(transform: Transform, movement: Movement, deltaTime: number): void {
    if (!movement.target) return;

    const dx = movement.target.x - transform.x;
    const dy = movement.target.y - transform.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) { // Dead zone to prevent jittering
      // Normalize direction and apply speed
      const directionX = dx / distance;
      const directionY = dy / distance;
          
      movement.velocity.x = directionX * movement.speed;
      movement.velocity.y = directionY * movement.speed;
        } else {
      // Close enough to target, stop moving
          movement.velocity.x = 0;
          movement.velocity.y = 0;
          movement.target = undefined;
        }
      }

  private applyDamping(movement: Movement, deltaTime: number): void {
    const dampingFactor = 0.95; // Adjust for different feel
    
    movement.velocity.x *= Math.pow(dampingFactor, deltaTime);
    movement.velocity.y *= Math.pow(dampingFactor, deltaTime);

    // Stop very small velocities to prevent floating point drift
    if (Math.abs(movement.velocity.x) < 0.1) movement.velocity.x = 0;
    if (Math.abs(movement.velocity.y) < 0.1) movement.velocity.y = 0;
  }

  // Utility methods for external use
  static setVelocity(entity: Entity, velocity: Vector2): void {
    const movement = entity.components.get('movement') as Movement;
    if (movement) {
      movement.velocity.x = velocity.x;
      movement.velocity.y = velocity.y;
      movement.target = undefined; // Clear target when setting manual velocity
    }
  }

  static setTarget(entity: Entity, target: Vector2): void {
    const movement = entity.components.get('movement') as Movement;
    if (movement) {
      movement.target = { ...target };
    }
  }

  static stopMovement(entity: Entity): void {
    const movement = entity.components.get('movement') as Movement;
    if (movement) {
      movement.velocity.x = 0;
      movement.velocity.y = 0;
      movement.target = undefined;
    }
  }

  static getSpeed(entity: Entity): number {
    const movement = entity.components.get('movement') as Movement;
    return movement ? Math.sqrt(movement.velocity.x ** 2 + movement.velocity.y ** 2) : 0;
  }

  static isMoving(entity: Entity): boolean {
    return MovementSystem.getSpeed(entity) > 0.1;
  }
} 