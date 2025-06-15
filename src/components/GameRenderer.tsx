import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { gameManager } from '../game/GameManager';
import { Entity, TransformComponent, RenderComponent, HealthComponent } from '../types/GameTypes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GameRendererProps {
  isGameActive: boolean;
  onPlayerMove?: (x: number, y: number) => void;
}

export const GameRenderer: React.FC<GameRendererProps> = ({ 
  isGameActive, 
  onPlayerMove 
}) => {
  const containerRef = useRef<View>(null);
  const [entities, setEntities] = useState<Entity[]>([]);

  // Update entities periodically
  useEffect(() => {
    if (!isGameActive) return;

    const updateInterval = setInterval(() => {
      try {
        const currentEntities = gameManager.getAllEntities();
        setEntities([...currentEntities]); // Create a new array to trigger re-render
      } catch (error) {
        console.log('Error updating entities:', error);
      }
    }, 50); // Update every 50ms (20 FPS for rendering)

    return () => clearInterval(updateInterval);
  }, [isGameActive]);

  // Pan responder for handling touch input
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        if (isGameActive && onPlayerMove) {
          const { locationX, locationY } = event.nativeEvent;
          onPlayerMove(locationX, locationY);
        }
      },
      onPanResponderMove: (event) => {
        if (isGameActive && onPlayerMove) {
          const { locationX, locationY } = event.nativeEvent;
          onPlayerMove(locationX, locationY);
        }
      },
    })
  ).current;

  const renderEntity = useCallback((entity: Entity, index: number) => {
    const transform = entity.components.transform as TransformComponent;
    const render = entity.components.render as RenderComponent;
    const health = entity.components.health as HealthComponent;

    if (!transform || !render) return null;

    // Safety check for position values
    const safeX = isNaN(transform.position.x) ? 0 : transform.position.x;
    const safeY = isNaN(transform.position.y) ? 0 : transform.position.y;
    const safeWidth = isNaN(render.width) ? 32 : render.width;
    const safeHeight = isNaN(render.height) ? 32 : render.height;

    const style = {
      position: 'absolute' as const,
      left: safeX - safeWidth / 2,
      top: safeY - safeHeight / 2,
      width: safeWidth,
      height: safeHeight,
      backgroundColor: render.color || '#666',
      borderRadius: safeWidth / 2,
      borderWidth: entity.components.player ? 2 : 1,
      borderColor: entity.components.player ? '#4CAF50' : '#333',
    };

    return (
      <View key={`${entity.id}-${index}`} style={style}>
        {/* Health bar for entities with health */}
        {health && health.max > 0 && (
          <View style={styles.healthBarContainer}>
            <View style={styles.healthBarBackground}>
              <View 
                style={[
                  styles.healthBar, 
                  { 
                    width: `${Math.max(0, Math.min(100, (health.current / health.max) * 100))}%`,
                    backgroundColor: entity.components.player ? '#4CAF50' : '#f44336'
                  }
                ]} 
              />
            </View>
          </View>
        )}
        
        {/* Visual indicator for different entity types */}
        {entity.components.player && (
          <View style={styles.playerIndicator}>
            <View style={styles.playerDot} />
          </View>
        )}
        
        {entity.components.enemy && (
          <View style={styles.enemyIndicator}>
            <View style={styles.enemyDot} />
          </View>
        )}
        
        {entity.components.projectile && (
          <View style={styles.projectileIndicator} />
        )}
      </View>
    );
  }, []);

  return (
    <View 
      ref={containerRef}
      style={styles.container} 
      {...panResponder.panHandlers}
    >
      {/* Render all game entities */}
      {entities.slice(0, 100).map((entity, index) => renderEntity(entity, index))}
      
      {/* Game boundaries visualization */}
      <View style={styles.boundaries} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    position: 'relative',
    overflow: 'hidden',
  },
  boundaries: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#333',
    pointerEvents: 'none',
  },
  healthBarContainer: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  healthBarBackground: {
    width: '120%',
    height: 3,
    backgroundColor: '#333',
    borderRadius: 1.5,
  },
  healthBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  playerIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -2 }, { translateY: -2 }],
  },
  playerDot: {
    width: 4,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  enemyIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -1.5 }, { translateY: -1.5 }],
  },
  enemyDot: {
    width: 3,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 1.5,
  },
  projectileIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 2,
    height: 2,
    backgroundColor: '#FFD700',
    borderRadius: 1,
    transform: [{ translateX: -1 }, { translateY: -1 }],
  },
}); 