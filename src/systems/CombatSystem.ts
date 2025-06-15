import { System, Entity, Vector2, CombatComponent, TransformComponent, HealthComponent, ProjectileComponent } from '../types/GameTypes';
import { gameEngine } from '../game/GameEngine';

export class CombatSystem implements System {
  priority = 20;
  enabled = true;

  update(entities: Map<string, Entity>, deltaTime: number): void {
    // Process combat for all entities with combat component
    for (const entity of entities.values()) {
      const combat = entity.components.combat as CombatComponent;
      const transform = entity.components.transform as TransformComponent;

      if (!combat || !transform) continue;

      // Update attack cooldown
      combat.lastAttackTime += deltaTime * 1000;

      // Find targets within range
      const targets = this.findTargetsInRange(entity, entities);
      
      if (targets.length > 0 && this.canAttack(combat)) {
        const nearestTarget = this.getNearestTarget(transform.position, targets);
        if (nearestTarget) {
          this.attack(entity, nearestTarget);
          combat.lastAttackTime = 0;
        }
      }
    }

    // Update projectiles
    this.updateProjectiles(entities, deltaTime);
  }

  private findTargetsInRange(attacker: Entity, entities: Map<string, Entity>): Entity[] {
    const attackerTransform = attacker.components.transform as TransformComponent;
    const attackerCombat = attacker.components.combat as CombatComponent;
    const targets: Entity[] = [];

    for (const entity of entities.values()) {
      if (entity === attacker) continue;

      const entityTransform = entity.components.transform as TransformComponent;
      if (!entityTransform) continue;

      // Check if this entity is a valid target
      const isValidTarget = this.isValidTarget(attacker, entity);
      if (!isValidTarget) continue;

      // Check distance
      const distance = this.getDistance(
        attackerTransform.position,
        entityTransform.position
      );

      if (distance <= attackerCombat.range) {
        targets.push(entity);
      }
    }

    return targets;
  }

  private isValidTarget(attacker: Entity, target: Entity): boolean {
    // Player can attack enemies
    if (attacker.components.player && target.components.enemy) {
      return true;
    }

    // Enemies can attack player
    if (attacker.components.enemy && target.components.player) {
      return true;
    }

    // Projectiles can hit enemies or player based on owner
    if (attacker.components.projectile) {
      const projectile = attacker.components.projectile as ProjectileComponent;
      const owner = gameEngine.getEntity(projectile.ownerId);
      
      if (owner?.components.player && target.components.enemy) {
        return true;
      }
      if (owner?.components.enemy && target.components.player) {
        return true;
      }
    }

    return false;
  }

  private getNearestTarget(position: Vector2, targets: Entity[]): Entity | null {
    if (targets.length === 0) return null;

    let nearestTarget = targets[0];
    let nearestDistance = this.getDistance(
      position,
      (nearestTarget.components.transform as TransformComponent).position
    );

    for (let i = 1; i < targets.length; i++) {
      const target = targets[i];
      const distance = this.getDistance(
        position,
        (target.components.transform as TransformComponent).position
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = target;
      }
    }

    return nearestTarget;
  }

  private getDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private canAttack(combat: CombatComponent): boolean {
    const attackCooldown = 1000 / combat.attackSpeed; // Convert to milliseconds
    return combat.lastAttackTime >= attackCooldown;
  }

  private attack(attacker: Entity, target: Entity): void {
    const attackerTransform = attacker.components.transform as TransformComponent;
    const attackerCombat = attacker.components.combat as CombatComponent;
    const targetTransform = target.components.transform as TransformComponent;

    // Create projectile or deal direct damage
    if (this.isRangedAttack(attacker)) {
      this.createProjectile(attacker, target);
    } else {
      this.dealDamage(target, attackerCombat.damage);
    }
  }

  private isRangedAttack(entity: Entity): boolean {
    // Check if entity has ranged weapon or is naturally ranged
    return !!entity.components.player || entity.tags?.includes('ranged') || false;
  }

  private createProjectile(attacker: Entity, target: Entity): void {
    const attackerTransform = attacker.components.transform as TransformComponent;
    const attackerCombat = attacker.components.combat as CombatComponent;
    const targetTransform = target.components.transform as TransformComponent;

    // Calculate direction to target
    const direction = this.normalizeVector({
      x: targetTransform.position.x - attackerTransform.position.x,
      y: targetTransform.position.y - attackerTransform.position.y
    });

    const projectileId = `projectile_${Date.now()}_${Math.random()}`;
    const projectile: Entity = {
      id: projectileId,
      components: {
        transform: {
          position: { ...attackerTransform.position },
          rotation: Math.atan2(direction.y, direction.x),
          scale: { x: 1, y: 1 }
        },
        movement: {
          velocity: {
            x: direction.x * 300, // Base projectile speed
            y: direction.y * 300
          },
          speed: 300
        },
        projectile: {
          damage: attackerCombat.damage,
          speed: 300,
          lifetime: 3000, // 3 seconds
          penetration: 1,
          ownerId: attacker.id
        },
        collision: {
          radius: 4,
          layer: 'projectile',
          mask: ['enemy', 'player']
        },
        render: {
          sprite: 'projectile',
          width: 8,
          height: 8,
          color: attacker.components.player ? '#FFD700' : '#FF4444'
        }
      },
      tags: ['projectile']
    };

    gameEngine.addEntity(projectile);
  }

  private updateProjectiles(entities: Map<string, Entity>, deltaTime: number): void {
    for (const entity of entities.values()) {
      const projectile = entity.components.projectile as ProjectileComponent;
      if (!projectile) continue;

      // Update lifetime
      projectile.lifetime -= deltaTime * 1000;
      
      if (projectile.lifetime <= 0) {
        entity.destroyed = true;
        continue;
      }

      // Check for collisions with valid targets
      const targets = this.findTargetsInRange(entity, entities);
      
      for (const target of targets) {
        const distance = this.getDistance(
          (entity.components.transform as TransformComponent).position,
          (target.components.transform as TransformComponent).position
        );

        // If projectile is close enough to target
        if (distance <= 15) {
          this.dealDamage(target, projectile.damage);
          
          projectile.penetration--;
          if (projectile.penetration <= 0) {
            entity.destroyed = true;
            break;
          }
        }
      }
    }
  }

  private dealDamage(target: Entity, damage: number): void {
    const health = target.components.health as HealthComponent;
    if (health) {
      health.current = Math.max(0, health.current - damage);
      
      // Mark entity as destroyed if health reaches 0
      if (health.current <= 0) {
        target.destroyed = true;
      }
    }
  }

  private normalizeVector(vector: Vector2): Vector2 {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (magnitude === 0) return { x: 0, y: 0 };
    
    return {
      x: vector.x / magnitude,
      y: vector.y / magnitude
    };
  }
} 