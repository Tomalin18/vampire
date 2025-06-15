import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  SafeAreaView, 
  PanResponder,
  Alert
} from 'react-native';
import { useGameStore } from './src/store/gameStore';
import { GameEngine } from './src/game/GameEngine';
import { MovementSystem } from './src/systems/MovementSystem';
import { COLORS, CHARACTER_CONFIG, ENEMY_CONFIG } from './src/config/gameConfig';
import { Entity, Transform, Movement, Health, Render, Combat } from './src/types/GameTypes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const gameStore = useGameStore();
  const gameEngineRef = useRef<GameEngine>();
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // Initialize game engine
  useEffect(() => {
    gameEngineRef.current = new GameEngine();
    
    // Add systems
    gameEngineRef.current.addSystem(new MovementSystem());
    
    // Initialize player entity when game starts
    return () => {
      gameEngineRef.current?.stop();
    };
  }, []);

  // Game timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStore.gameState === 'playing') {
      interval = setInterval(() => {
        gameStore.incrementTime();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStore.gameState]);

  // Enemy spawning effect
        useEffect(() => {
     let interval: NodeJS.Timeout;
     if (gameStore.gameState === 'playing') {
       interval = setInterval(() => {
         spawnEnemy();
       }, 2000);
     }
     return () => clearInterval(interval);
    }, [gameStore.gameState]);

  // Game engine loop effect
  useEffect(() => {
    let animationFrame: number;
    
    if (gameStore.gameState === 'playing') {
      const gameLoop = () => {
        updateGame();
        animationFrame = requestAnimationFrame(gameLoop);
      };
      animationFrame = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [gameStore.gameState]);

  const createPlayerEntity = useCallback((characterId: string): Entity => {
    const character = CHARACTER_CONFIG[characterId as keyof typeof CHARACTER_CONFIG];
    const components = new Map<string, any>();
    
    components.set('transform', {
      type: 'transform',
      x: SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT / 2,
      rotation: 0,
      scale: 1
    } as Transform);
    
    components.set('movement', {
      type: 'movement',
      velocity: { x: 0, y: 0 },
      speed: character.baseStats.moveSpeed
    } as Movement);
    
    components.set('health', {
      type: 'health',
      current: character.baseStats.health,
      max: character.baseStats.health
    } as Health);
    
    components.set('render', {
      type: 'render',
      sprite: character.sprite,
      color: '#4CAF50',
      size: 50
    } as Render);
    
    components.set('combat', {
      type: 'combat',
      damage: character.baseStats.damage,
      attackSpeed: character.baseStats.attackSpeed,
      range: 100,
      lastAttack: 0
    } as Combat);
    
    return {
      id: 'player',
      components
    };
  }, []);

  const createEnemyEntity = useCallback((enemyType: keyof typeof ENEMY_CONFIG): Entity => {
    const config = ENEMY_CONFIG[enemyType];
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (side) {
      case 0: // Top
        x = Math.random() * SCREEN_WIDTH;
        y = -50;
        break;
      case 1: // Right
        x = SCREEN_WIDTH + 50;
        y = Math.random() * SCREEN_HEIGHT;
        break;
      case 2: // Bottom
        x = Math.random() * SCREEN_WIDTH;
        y = SCREEN_HEIGHT + 50;
        break;
      default: // Left
        x = -50;
        y = Math.random() * SCREEN_HEIGHT;
        break;
    }

    const components = new Map<string, any>();
    
    components.set('transform', {
      type: 'transform',
      x,
      y,
      rotation: 0,
      scale: 1
    } as Transform);
    
    components.set('movement', {
      type: 'movement',
      velocity: { x: 0, y: 0 },
      speed: config.speed
    } as Movement);
    
    components.set('health', {
      type: 'health',
      current: config.health,
      max: config.health
    } as Health);
    
    components.set('render', {
      type: 'render',
      sprite: config.sprite,
      color: config.color,
      size: config.size
    } as Render);

    return {
      id: `enemy_${Date.now()}_${Math.random()}`,
      components
    };
  }, []);

  const spawnEnemy = useCallback(() => {
    if (!gameEngineRef.current) return;
    
    const enemyTypes = Object.keys(ENEMY_CONFIG) as Array<keyof typeof ENEMY_CONFIG>;
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const enemy = createEnemyEntity(randomType);
    
    gameEngineRef.current.addEntity(enemy);
    gameStore.addEnemy({
      id: enemy.id,
      type: randomType,
      health: ENEMY_CONFIG[randomType].health,
      maxHealth: ENEMY_CONFIG[randomType].health,
      position: { 
        x: (enemy.components.get('transform') as Transform).x,
        y: (enemy.components.get('transform') as Transform).y
      },
      velocity: { x: 0, y: 0 },
      damage: ENEMY_CONFIG[randomType].damage,
      speed: ENEMY_CONFIG[randomType].speed,
      xpValue: ENEMY_CONFIG[randomType].xpValue,
      size: ENEMY_CONFIG[randomType].size
    });
  }, [createEnemyEntity, gameStore]);

  const updateGame = useCallback(() => {
    if (!gameEngineRef.current) return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000;
    setLastUpdateTime(currentTime);

    // Update all entities through game engine
    gameEngineRef.current.getEntities().forEach(entity => {
      if (entity.id.startsWith('enemy_')) {
        updateEnemyAI(entity);
      }
    });

    // Update game store with current entity positions
    const enemies = Array.from(gameEngineRef.current.getEntities().values())
      .filter(entity => entity.id.startsWith('enemy_'))
      .map(entity => {
        const transform = entity.components.get('transform') as Transform;
        const health = entity.components.get('health') as Health;
        const enemyType = 'zombie' as keyof typeof ENEMY_CONFIG; // Default for now
        
        return {
          id: entity.id,
          type: enemyType,
          health: health.current,
          maxHealth: health.max,
          position: { x: transform.x, y: transform.y },
          velocity: { x: 0, y: 0 },
          damage: ENEMY_CONFIG[enemyType].damage,
          speed: ENEMY_CONFIG[enemyType].speed,
          xpValue: ENEMY_CONFIG[enemyType].xpValue,
          size: ENEMY_CONFIG[enemyType].size
        };
      });

    gameStore.updateEnemies(enemies);
  }, [lastUpdateTime, gameStore]);

  const updateEnemyAI = useCallback((enemy: Entity) => {
    const playerEntity = gameEngineRef.current?.getEntity('player');
    if (!playerEntity) return;

    const playerTransform = playerEntity.components.get('transform') as Transform;
    const enemyMovement = enemy.components.get('movement') as Movement;

    if (playerTransform && enemyMovement) {
      MovementSystem.setTarget(enemy, { x: playerTransform.x, y: playerTransform.y });
    }
  }, []);

  const startGame = useCallback((characterId: string) => {
    if (!gameEngineRef.current) return;

    gameStore.startGame(characterId);
    
    // Clear existing entities
    gameEngineRef.current.clearEntities();
    
    // Create and add player entity
    const playerEntity = createPlayerEntity(characterId);
    gameEngineRef.current.addEntity(playerEntity);
    
    // Start game engine
    gameEngineRef.current.start();
  }, [gameStore, createPlayerEntity]);

  const handleTouch = useCallback((event: any) => {
    if (gameStore.gameState !== 'playing') return;
    
    const { locationX, locationY } = event.nativeEvent;
    const playerEntity = gameEngineRef.current?.getEntity('player');
    
    if (playerEntity) {
      MovementSystem.setTarget(playerEntity, { x: locationX, y: locationY });
      gameStore.updatePlayerPosition(locationX, locationY);
    }
  }, [gameStore]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: handleTouch,
    onPanResponderMove: handleTouch,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCharacterEmoji = (character: string) => {
    return CHARACTER_CONFIG[character as keyof typeof CHARACTER_CONFIG]?.sprite || '⚔️';
  };

  const renderGameScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Game HUD */}
      <View style={styles.gameHUD}>
        <View style={styles.hudLeft}>
          <Text style={styles.hudText}>❤️ {gameStore.player.health}/{gameStore.player.maxHealth}</Text>
          <Text style={styles.hudText}>🌟 等級 {gameStore.player.level}</Text>
        </View>
        
        <View style={styles.hudRight}>
          <Text style={styles.hudText}>🏆 {gameStore.score} 分</Text>
          <Text style={styles.hudText}>⏱️ {formatTime(gameStore.survivalTime)}</Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* Player */}
        <View style={[styles.player, { 
          left: gameStore.player.position.x - 25, 
          top: gameStore.player.position.y - 25
        }]}>
          <Text style={styles.playerEmoji}>{getCharacterEmoji('warrior')}</Text>
        </View>

        {/* Enemies */}
        {gameStore.enemies.map(enemy => (
          <View 
            key={enemy.id} 
            style={[styles.enemy, { 
              left: enemy.position.x - enemy.size / 2, 
              top: enemy.position.y - enemy.size / 2,
              width: enemy.size,
              height: enemy.size
            }]}
          >
            <Text style={styles.enemyEmoji}>{ENEMY_CONFIG[enemy.type].sprite}</Text>
          </View>
        ))}
      </View>

      {/* Controls */}
      <View style={styles.gameControls}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={gameStore.returnToMenu}
        >
          <Text style={styles.controlButtonText}>🏠</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderMenuScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.menuContainer}>
        <Text style={styles.title}>🧛 吸血鬼倖存者</Text>
        <Text style={styles.subtitle}>改進版 - ECS架構</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => startGame('warrior')}
          >
            <Text style={styles.buttonText}>⚔️ 戰士開始</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => startGame('mage')}
          >
            <Text style={styles.buttonText}>🔮 法師開始</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => startGame('archer')}
          >
            <Text style={styles.buttonText}>🏹 弓箭手開始</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  const renderGameOverScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.gameOverContainer}>
        <Text style={styles.gameOverTitle}>💀 遊戲結束</Text>
        
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>遊戲統計</Text>
          <Text style={styles.statItem}>🏆 最終分數: {gameStore.score}</Text>
          <Text style={styles.statItem}>⏱️ 生存時間: {formatTime(gameStore.survivalTime)}</Text>
          <Text style={styles.statItem}>👹 擊殺敵人: {gameStore.enemiesKilled}</Text>
          <Text style={styles.statItem}>🌟 達到等級: {gameStore.player.level}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => startGame('warrior')}
          >
            <Text style={styles.buttonText}>🔄 再玩一次</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuButton, styles.secondaryButton]} 
            onPress={gameStore.returnToMenu}
          >
            <Text style={styles.buttonText}>🏠 返回主選單</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  // Main render logic
  switch (gameStore.gameState) {
    case 'playing':
      return renderGameScreen();
    case 'gameOver':
      return renderGameOverScreen();
    default:
      return renderMenuScreen();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  menuButton: {
    backgroundColor: COLORS.buttonPrimary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.buttonSecondary,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameHUD: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  hudLeft: {
    flex: 1,
  },
  hudRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  hudText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 2,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  player: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.buttonPrimary,
  },
  playerEmoji: {
    fontSize: 30,
  },
  enemy: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 15,
  },
  enemyEmoji: {
    fontSize: 16,
  },
  gameControls: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 25,
  },
  controlButtonText: {
    fontSize: 20,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 30,
  },
  statsCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    width: '100%',
    maxWidth: 350,
  },
  statTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  statItem: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
}); 