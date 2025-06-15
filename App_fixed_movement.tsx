import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  SafeAreaView, 
  PanResponder
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 簡化的遊戲配置
const GAME_CONFIG = {
  PLAYER_START_HEALTH: 100,
  PLAYER_START_DAMAGE: 10,
  PLAYER_START_SPEED: 150,
  ENEMY_SPAWN_RATE: 2000, // milliseconds
  MAX_ENEMIES: 50,
};

const COLORS = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#e94560',
  textPrimary: '#ffffff',
  textSecondary: '#b0b3b8',
  background: '#0a0a0a',
  cardBackground: '#1e1e1e',
  buttonPrimary: '#4CAF50',
  buttonSecondary: '#2196F3',
};

const ENEMY_TYPES = {
  zombie: {
    health: 50,
    damage: 10,
    speed: 80,
    xpValue: 10,
    size: 24,
    sprite: '🧟',
    color: '#4a5568',
  },
  ghoul: {
    health: 30,
    damage: 15,
    speed: 120,
    xpValue: 15,
    size: 20,
    sprite: '👻',
    color: '#2d3748',
  },
  brute: {
    health: 150,
    damage: 25,
    speed: 50,
    xpValue: 30,
    size: 40,
    sprite: '👹',
    color: '#744210',
  },
};

const CHARACTER_TYPES = {
  warrior: {
    name: '戰士',
    sprite: '⚔️',
    baseStats: {
      health: 120,
      damage: 12,
      moveSpeed: 140,
    },
  },
  mage: {
    name: '法師', 
    sprite: '🔮',
    baseStats: {
      health: 80,
      damage: 18,
      moveSpeed: 130,
    },
  },
  archer: {
    name: '弓箭手',
    sprite: '🏹', 
    baseStats: {
      health: 100,
      damage: 14,
      moveSpeed: 160,
    },
  },
};

interface Player {
  worldX: number; // 虛擬世界座標
  worldY: number; // 虛擬世界座標
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  experienceToNext: number;
  character: string;
  velocityX: number;
  velocityY: number;
  speed: number;
}

interface Enemy {
  id: string;
  worldX: number; // 虛擬世界座標
  worldY: number; // 虛擬世界座標
  health: number;
  maxHealth: number;
  type: keyof typeof ENEMY_TYPES;
}

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [enemiesKilled, setEnemiesKilled] = useState(0);

  const [player, setPlayer] = useState<Player>({
    worldX: 0, // 虛擬世界中心
    worldY: 0, // 虛擬世界中心
    health: 100,
    maxHealth: 100,
    level: 1,
    experience: 0,
    experienceToNext: 100,
    character: 'warrior',
    velocityX: 0,
    velocityY: 0,
    speed: 150,
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // 遊戲計時器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
        setScore(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // 敵人生成函數
  const spawnEnemy = useCallback(() => {
    if (enemies.length >= GAME_CONFIG.MAX_ENEMIES) return;

    const enemyTypes = Object.keys(ENEMY_TYPES) as Array<keyof typeof ENEMY_TYPES>;
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const config = ENEMY_TYPES[randomType];
    
    // 在玩家虛擬世界位置周圍生成敵人
    const spawnDistance = 400; // 距離玩家的生成距離
    const angle = Math.random() * Math.PI * 2; // 隨機角度
    
    const worldX = player.worldX + Math.cos(angle) * spawnDistance;
    const worldY = player.worldY + Math.sin(angle) * spawnDistance;

    const newEnemy: Enemy = {
      id: `enemy_${Date.now()}_${Math.random()}`,
      worldX,
      worldY,
      health: config.health,
      maxHealth: config.health,
      type: randomType,
    };

    setEnemies(prev => [...prev, newEnemy]);
  }, [enemies.length, player.worldX, player.worldY]);

  // 敵人生成定時器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        spawnEnemy();
      }, GAME_CONFIG.ENEMY_SPAWN_RATE);
    }
    return () => clearInterval(interval);
  }, [gameState, spawnEnemy]);

  // 遊戲更新邏輯
  const updateGame = useCallback((deltaTime: number) => {
    // 更新玩家在虛擬世界中的位置
    setPlayer(prev => {
      const newWorldX = prev.worldX + prev.velocityX * deltaTime;
      const newWorldY = prev.worldY + prev.velocityY * deltaTime;
      
      return {
        ...prev,
        worldX: newWorldX,
        worldY: newWorldY,
      };
    });

    // 更新敵人位置 - 追蹤玩家
    setEnemies(prevEnemies => {
      return prevEnemies.map(enemy => {
        const dx = player.worldX - enemy.worldX;
        const dy = player.worldY - enemy.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const speed = ENEMY_TYPES[enemy.type].speed * deltaTime;
          const moveX = (dx / distance) * speed;
          const moveY = (dy / distance) * speed;
          
          return {
            ...enemy,
            worldX: enemy.worldX + moveX,
            worldY: enemy.worldY + moveY,
          };
        }
        return enemy;
      }).filter(enemy => {
        // 移除太遠的敵人
        const dx = player.worldX - enemy.worldX;
        const dy = player.worldY - enemy.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 1000;
      });
    });

    // 碰撞檢測
    const playerRadius = 25;
    const collidingEnemies = enemies.filter(enemy => {
      const dx = player.worldX - enemy.worldX;
      const dy = player.worldY - enemy.worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const enemyRadius = ENEMY_TYPES[enemy.type].size / 2;
      return distance < (playerRadius + enemyRadius);
    });

    // 處理碰撞傷害
    if (collidingEnemies.length > 0) {
      const damage = collidingEnemies.reduce((total, enemy) => 
        total + ENEMY_TYPES[enemy.type].damage, 0) * deltaTime;
      
      setPlayer(prev => {
        const newHealth = prev.health - damage;
        if (newHealth <= 0) {
          setGameState('gameOver');
          return { ...prev, health: 0, velocityX: 0, velocityY: 0 };
        }
        return { ...prev, health: newHealth };
      });
    }
  }, [enemies, player.worldX, player.worldY, player.velocityX, player.velocityY]);

  // 主遊戲循環
  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = (currentTime: number) => {
        if (lastTimeRef.current === 0) lastTimeRef.current = currentTime;
        const deltaTime = (currentTime - lastTimeRef.current) / 1000;
        lastTimeRef.current = currentTime;

        updateGame(deltaTime);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, updateGame]);

  // 開始遊戲
  const startGame = useCallback((characterId: keyof typeof CHARACTER_TYPES) => {
    const character = CHARACTER_TYPES[characterId];
    setPlayer({
      worldX: 0, // 虛擬世界座標起點
      worldY: 0, // 虛擬世界座標起點
      health: character.baseStats.health,
      maxHealth: character.baseStats.health,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      character: characterId,
      velocityX: 0,
      velocityY: 0,
      speed: character.baseStats.moveSpeed,
    });
    setEnemies([]);
    setScore(0);
    setGameTime(0);
    setEnemiesKilled(0);
    setGameState('playing');
    lastTimeRef.current = 0;
  }, []);

  // 觸控處理 - 方向性移動
  const handleTouch = useCallback((event: any) => {
    if (gameState !== 'playing') return;
    
    const { locationX, locationY } = event.nativeEvent;
    
    // 計算玩家固定位置（螢幕中央）到點擊位置的方向
    const playerCenterX = SCREEN_WIDTH / 2;
    const playerCenterY = SCREEN_HEIGHT / 2;
    
    const dx = locationX - playerCenterX;
    const dy = locationY - playerCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 20) { // 避免在中心點擊時的抖動
      // 正規化方向向量並設定速度
      const directionX = dx / distance;
      const directionY = dy / distance;
      
      setPlayer(prev => ({
        ...prev,
        velocityX: directionX * prev.speed,
        velocityY: directionY * prev.speed,
      }));
    } else {
      // 如果點擊太接近中心，停止移動
      setPlayer(prev => ({
        ...prev,
        velocityX: 0,
        velocityY: 0,
      }));
    }
  }, [gameState]);

  // 手勢響應器
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: handleTouch,
    onPanResponderMove: handleTouch,
  });

  // 時間格式化
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 主選單畫面
  const renderMenuScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.menuContainer}>
        <Text style={styles.title}>🧛 吸血鬼倖存者</Text>
        <Text style={styles.subtitle}>修正移動版</Text>
        
        <View style={styles.buttonContainer}>
          {Object.entries(CHARACTER_TYPES).map(([id, character]) => (
            <TouchableOpacity 
              key={id}
              style={styles.menuButton} 
              onPress={() => startGame(id as keyof typeof CHARACTER_TYPES)}
            >
              <Text style={styles.buttonText}>
                {character.sprite} {character.name}開始
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );

  // 遊戲畫面
  const renderGameScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* 遊戲HUD */}
      <View style={styles.gameHUD}>
        <View style={styles.hudLeft}>
          <Text style={styles.hudText}>❤️ {Math.round(player.health)}/{player.maxHealth}</Text>
          <Text style={styles.hudText}>🌟 等級 {player.level}</Text>
        </View>
        
        <View style={styles.hudRight}>
          <Text style={styles.hudText}>🏆 {score} 分</Text>
          <Text style={styles.hudText}>⏱️ {formatTime(gameTime)}</Text>
        </View>
      </View>

      {/* 遊戲區域 */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* 玩家固定在螢幕中央 */}
        <View style={[styles.player, { 
          left: SCREEN_WIDTH / 2 - 25, 
          top: SCREEN_HEIGHT / 2 - 25
        }]}>
          <Text style={styles.playerEmoji}>
            {CHARACTER_TYPES[player.character as keyof typeof CHARACTER_TYPES].sprite}
          </Text>
        </View>

        {/* 敵人相對於玩家的位置顯示 */}
        {enemies.map(enemy => {
          // 計算敵人相對於玩家的螢幕位置
          const relativeX = enemy.worldX - player.worldX + SCREEN_WIDTH / 2;
          const relativeY = enemy.worldY - player.worldY + SCREEN_HEIGHT / 2;
          
          // 只顯示在螢幕範圍內的敵人
          if (relativeX > -50 && relativeX < SCREEN_WIDTH + 50 && 
              relativeY > -50 && relativeY < SCREEN_HEIGHT + 50) {
            return (
              <View 
                key={enemy.id} 
                style={[styles.enemy, { 
                  left: relativeX - ENEMY_TYPES[enemy.type].size / 2, 
                  top: relativeY - ENEMY_TYPES[enemy.type].size / 2,
                  width: ENEMY_TYPES[enemy.type].size,
                  height: ENEMY_TYPES[enemy.type].size,
                  backgroundColor: `${ENEMY_TYPES[enemy.type].color}80`,
                }]}
              >
                <Text style={[styles.enemyEmoji, { 
                  fontSize: ENEMY_TYPES[enemy.type].size * 0.6 
                }]}>
                  {ENEMY_TYPES[enemy.type].sprite}
                </Text>
              </View>
            );
          }
          return null;
        })}

        {/* 移動指示器 */}
        {(player.velocityX !== 0 || player.velocityY !== 0) && (
          <View style={[styles.moveIndicator, {
            left: SCREEN_WIDTH / 2 - 5 + (player.velocityX > 0 ? 40 : player.velocityX < 0 ? -40 : 0),
            top: SCREEN_HEIGHT / 2 - 5 + (player.velocityY > 0 ? 40 : player.velocityY < 0 ? -40 : 0),
          }]}>
            <Text style={styles.moveIndicatorText}>➤</Text>
          </View>
        )}
      </View>

      {/* 控制按鈕 */}
      <View style={styles.gameControls}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setGameState('menu')}
        >
          <Text style={styles.controlButtonText}>🏠</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // 遊戲結束畫面
  const renderGameOverScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.gameOverContainer}>
        <Text style={styles.gameOverTitle}>💀 遊戲結束</Text>
        
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>遊戲統計</Text>
          <Text style={styles.statItem}>🏆 最終分數: {score}</Text>
          <Text style={styles.statItem}>⏱️ 生存時間: {formatTime(gameTime)}</Text>
          <Text style={styles.statItem}>👹 擊殺敵人: {enemiesKilled}</Text>
          <Text style={styles.statItem}>🌟 達到等級: {player.level}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => startGame(player.character as keyof typeof CHARACTER_TYPES)}
          >
            <Text style={styles.buttonText}>🔄 再玩一次</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuButton, styles.secondaryButton]} 
            onPress={() => setGameState('menu')}
          >
            <Text style={styles.buttonText}>🏠 返回主選單</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  // 根據遊戲狀態渲染不同畫面
  switch (gameState) {
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
    zIndex: 10,
  },
  playerEmoji: {
    fontSize: 30,
  },
  enemy: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  enemyEmoji: {
    fontSize: 16,
  },
  moveIndicator: {
    position: 'absolute',
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  moveIndicatorText: {
    color: COLORS.accent,
    fontSize: 12,
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