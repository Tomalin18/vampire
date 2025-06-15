import { System, Entity, Vector2, MovementComponent, TransformComponent } from '../types/GameTypes';
import { SCREEN } from '../config/constants';

export class MovementSystem implements System {
  priority = 10;
  enabled = true;

  update(entities: Map<string, Entity>, deltaTime: number): void {
    for (const entity of entities.values()) {
      const movement = entity.components.movement as MovementComponent;
      const transform = entity.components.transform as TransformComponent;

      if (!movement || !transform) continue;

      // Calculate movement based on velocity
      const newPosition: Vector2 = {
        x: transform.position.x + movement.velocity.x * deltaTime,
        y: transform.position.y + movement.velocity.y * deltaTime
      };

      // Handle target-based movement (for player)
      if (movement.target) {
        const dx = movement.target.x - transform.position.x;
        const dy = movement.target.y - transform.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;
          
          movement.velocity.x = normalizedDx * movement.speed;
          movement.velocity.y = normalizedDy * movement.speed;
        } else {
          // Reached target, stop moving
          movement.velocity.x = 0;
          movement.velocity.y = 0;
          movement.target = undefined;
        }
      }

      // Apply boundaries for player entities
      if (entity.components.player) {
        newPosition.x = Math.max(25, Math.min(SCREEN.WIDTH - 25, newPosition.x));
        newPosition.y = Math.max(100, Math.min(SCREEN.HEIGHT - 100, newPosition.y));
      }

      // Update position
      transform.position = newPosition;

      // Update rotation based on movement direction
      if (Math.abs(movement.velocity.x) > 0.1 || Math.abs(movement.velocity.y) > 0.1) {
        transform.rotation = Math.atan2(movement.velocity.y, movement.velocity.x);
      }
    }
  }

  // Utility method to move entity to target
  static moveToTarget(entity: Entity, target: Vector2): void {
    const movement = entity.components.movement as MovementComponent;
    if (movement) {
      movement.target = { ...target };
    }
  }

  // Utility method to set velocity directly
  static setVelocity(entity: Entity, velocity: Vector2): void {
    const movement = entity.components.movement as MovementComponent;
    if (movement) {
      movement.velocity = { ...velocity };
      movement.target = undefined; // Clear target when setting velocity directly
    }
  }

  // Stop entity movement
  static stopMovement(entity: Entity): void {
    const movement = entity.components.movement as MovementComponent;
    if (movement) {
      movement.velocity = { x: 0, y: 0 };
      movement.target = undefined;
    }
  }
} 