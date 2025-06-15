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

// 遊戲配置
const GAME_CONFIG = {
  ENEMY_SPAWN_RATE: 1500, // 敵人生成間隔
  MAX_ENEMIES: 30,
  PROJECTILE_SPEED: 300,
  ATTACK_RANGE: 150,
  ATTACK_COOLDOWN: 1000, // 攻擊冷卻時間
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
  health: '#ff4444',
  experience: '#44ff44',
};

const ENEMY_TYPES = {
  zombie: {
    health: 30,
    damage: 15,
    speed: 60,
    xpValue: 10,
    size: 24,
    sprite: '🧟',
    color: '#4a5568',
  },
  ghoul: {
    health: 20,
    damage: 10,
    speed: 100,
    xpValue: 15,
    size: 20,
    sprite: '👻',
    color: '#2d3748',
  },
  brute: {
    health: 80,
    damage: 25,
    speed: 40,
    xpValue: 25,
    size: 32,
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
      damage: 15,
      moveSpeed: 140,
      attackSpeed: 1.0,
    },
  },
  mage: {
    name: '法師', 
    sprite: '🔮',
    baseStats: {
      health: 80,
      damage: 25,
      moveSpeed: 130,
      attackSpeed: 1.2,
    },
  },
  archer: {
    name: '弓箭手',
    sprite: '🏹', 
    baseStats: {
      health: 100,
      damage: 20,
      moveSpeed: 160,
      attackSpeed: 1.5,
    },
  },
};

interface Player {
  worldX: number;
  worldY: number;
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  experienceToNext: number;
  character: string;
  velocityX: number;
  velocityY: number;
  speed: number;
  damage: number;
  attackSpeed: number;
  lastAttackTime: number;
}

interface Enemy {
  id: string;
  worldX: number;
  worldY: number;
  health: number;
  maxHealth: number;
  type: keyof typeof ENEMY_TYPES;
}

interface Projectile {
  id: string;
  worldX: number;
  worldY: number;
  velocityX: number;
  velocityY: number;
  damage: number;
  sprite: string;
}

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver' | 'levelUp'>('menu');
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [enemiesKilled, setEnemiesKilled] = useState(0);

  const [player, setPlayer] = useState<Player>({
    worldX: 0,
    worldY: 0,
    health: 100,
    maxHealth: 100,
    level: 1,
    experience: 0,
    experienceToNext: 100,
    character: 'warrior',
    velocityX: 0,
    velocityY: 0,
    speed: 150,
    damage: 15,
    attackSpeed: 1.0,
    lastAttackTime: 0,
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const playerRef = useRef(player);

  // 更新 playerRef
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

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

    const currentPlayer = playerRef.current;
    const enemyTypes = Object.keys(ENEMY_TYPES) as Array<keyof typeof ENEMY_TYPES>;
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const config = ENEMY_TYPES[randomType];
    
    const spawnDistance = 400;
    const angle = Math.random() * Math.PI * 2;
    
    const worldX = currentPlayer.worldX + Math.cos(angle) * spawnDistance;
    const worldY = currentPlayer.worldY + Math.sin(angle) * spawnDistance;

    const newEnemy: Enemy = {
      id: `enemy_${Date.now()}_${Math.random()}`,
      worldX,
      worldY,
      health: config.health,
      maxHealth: config.health,
      type: randomType,
    };

    setEnemies(prev => [...prev, newEnemy]);
  }, [enemies.length]);

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

  // 自動攻擊系統
  const autoAttack = useCallback((currentTime: number) => {
    const currentPlayer = playerRef.current;
    
    if (currentTime - currentPlayer.lastAttackTime < GAME_CONFIG.ATTACK_COOLDOWN / currentPlayer.attackSpeed) {
      return;
    }

    // 找到最近的敵人
    let nearestEnemy: Enemy | null = null;
    let nearestDistance = GAME_CONFIG.ATTACK_RANGE;

    enemies.forEach(enemy => {
      const dx = enemy.worldX - currentPlayer.worldX;
      const dy = enemy.worldY - currentPlayer.worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < nearestDistance) {
        nearestEnemy = enemy;
        nearestDistance = distance;
      }
    });

    if (nearestEnemy) {
      // 創建投射物
      const dx = nearestEnemy.worldX - currentPlayer.worldX;
      const dy = nearestEnemy.worldY - currentPlayer.worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const velocityX = (dx / distance) * GAME_CONFIG.PROJECTILE_SPEED;
      const velocityY = (dy / distance) * GAME_CONFIG.PROJECTILE_SPEED;

      const newProjectile: Projectile = {
        id: `projectile_${Date.now()}_${Math.random()}`,
        worldX: currentPlayer.worldX,
        worldY: currentPlayer.worldY,
        velocityX,
        velocityY,
        damage: currentPlayer.damage,
        sprite: '✨',
      };

      setProjectiles(prev => [...prev, newProjectile]);
      setPlayer(prev => ({ ...prev, lastAttackTime: currentTime }));
    }
  }, [enemies]);

  // 遊戲更新邏輯
  const updateGame = useCallback((deltaTime: number, currentTime: number) => {
    // 更新玩家位置
    setPlayer(prev => ({
      ...prev,
      worldX: prev.worldX + prev.velocityX * deltaTime,
      worldY: prev.worldY + prev.velocityY * deltaTime,
    }));

    // 自動攻擊
    autoAttack(currentTime);

    // 更新敵人位置
    setEnemies(prevEnemies => {
      const currentPlayer = playerRef.current;
      
      return prevEnemies.map(enemy => {
        const dx = currentPlayer.worldX - enemy.worldX;
        const dy = currentPlayer.worldY - enemy.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
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
      });
    });

    // 更新投射物位置
    setProjectiles(prevProjectiles => {
      return prevProjectiles.map(projectile => ({
        ...projectile,
        worldX: projectile.worldX + projectile.velocityX * deltaTime,
        worldY: projectile.worldY + projectile.velocityY * deltaTime,
      })).filter(projectile => {
        // 移除太遠的投射物
        const dx = projectile.worldX - playerRef.current.worldX;
        const dy = projectile.worldY - playerRef.current.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 500;
      });
    });

    // 投射物與敵人碰撞檢測
    setEnemies(prevEnemies => {
      let newEnemies = [...prevEnemies];
      let hitProjectiles: string[] = [];

      projectiles.forEach(projectile => {
        newEnemies.forEach((enemy, enemyIndex) => {
          const dx = projectile.worldX - enemy.worldX;
          const dy = projectile.worldY - enemy.worldY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 20 && !hitProjectiles.includes(projectile.id)) {
            // 敵人受傷
            const newHealth = enemy.health - projectile.damage;
            if (newHealth <= 0) {
              // 敵人死亡，獲得經驗值
              const xpGain = ENEMY_TYPES[enemy.type].xpValue;
              setPlayer(prev => {
                const newExp = prev.experience + xpGain;
                const newLevel = Math.floor(newExp / prev.experienceToNext) + 1;
                
                if (newLevel > prev.level) {
                  setGameState('levelUp');
                  return {
                    ...prev,
                    level: newLevel,
                    experience: newExp,
                    experienceToNext: newLevel * 100,
                  };
                }
                
                return {
                  ...prev,
                  experience: newExp,
                };
              });
              
              setEnemiesKilled(prev => prev + 1);
              setScore(prev => prev + xpGain * 10);
              newEnemies.splice(enemyIndex, 1);
            } else {
              newEnemies[enemyIndex] = { ...enemy, health: newHealth };
            }
            hitProjectiles.push(projectile.id);
          }
        });
      });

      // 移除命中的投射物
      setProjectiles(prev => prev.filter(p => !hitProjectiles.includes(p.id)));
      
      return newEnemies;
    });

    // 玩家與敵人碰撞檢測
    const playerRadius = 25;
    const currentPlayer = playerRef.current;
    
    const collidingEnemies = enemies.filter(enemy => {
      const dx = currentPlayer.worldX - enemy.worldX;
      const dy = currentPlayer.worldY - enemy.worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const enemyRadius = ENEMY_TYPES[enemy.type].size / 2;
      return distance < (playerRadius + enemyRadius);
    });

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
  }, [enemies, projectiles, autoAttack]);

  // 主遊戲循環
  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = (currentTime: number) => {
        if (lastTimeRef.current === 0) lastTimeRef.current = currentTime;
        const deltaTime = (currentTime - lastTimeRef.current) / 1000;
        lastTimeRef.current = currentTime;

        updateGame(deltaTime, currentTime);
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
      worldX: 0,
      worldY: 0,
      health: character.baseStats.health,
      maxHealth: character.baseStats.health,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      character: characterId,
      velocityX: 0,
      velocityY: 0,
      speed: character.baseStats.moveSpeed,
      damage: character.baseStats.damage,
      attackSpeed: character.baseStats.attackSpeed,
      lastAttackTime: 0,
    });
    setEnemies([]);
    setProjectiles([]);
    setScore(0);
    setGameTime(0);
    setEnemiesKilled(0);
    setGameState('playing');
    lastTimeRef.current = 0;
  }, []);

  // 升級選擇
  const selectUpgrade = useCallback((upgradeType: string) => {
    setPlayer(prev => {
      switch (upgradeType) {
        case 'damage':
          return { ...prev, damage: prev.damage + 5 };
        case 'health':
          return { ...prev, maxHealth: prev.maxHealth + 20, health: prev.health + 20 };
        case 'speed':
          return { ...prev, speed: prev.speed + 20 };
        case 'attackSpeed':
          return { ...prev, attackSpeed: prev.attackSpeed + 0.2 };
        default:
          return prev;
      }
    });
    setGameState('playing');
  }, []);

  // 觸控處理
  const handleTouch = useCallback((event: any) => {
    if (gameState !== 'playing') return;
    
    const { locationX, locationY } = event.nativeEvent;
    
    const playerCenterX = SCREEN_WIDTH / 2;
    const playerCenterY = SCREEN_HEIGHT / 2;
    
    const dx = locationX - playerCenterX;
    const dy = locationY - playerCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 20) {
      const directionX = dx / distance;
      const directionY = dy / distance;
      
      setPlayer(prev => ({
        ...prev,
        velocityX: directionX * prev.speed,
        velocityY: directionY * prev.speed,
      }));
    } else {
      setPlayer(prev => ({
        ...prev,
        velocityX: 0,
        velocityY: 0,
      }));
    }
  }, [gameState]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: handleTouch,
    onPanResponderMove: handleTouch,
    onPanResponderRelease: () => {
      if (gameState === 'playing') {
        setPlayer(prev => ({
          ...prev,
          velocityX: 0,
          velocityY: 0,
        }));
      }
    },
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
        <Text style={styles.subtitle}>完整版</Text>
        
        <View style={styles.buttonContainer}>
          {Object.entries(CHARACTER_TYPES).map(([id, character]) => (
            <TouchableOpacity 
              key={id}
              style={styles.menuButton} 
              onPress={() => startGame(id as keyof typeof CHARACTER_TYPES)}
            >
              <Text style={styles.buttonText}>
                {character.sprite} {character.name}
              </Text>
              <Text style={styles.buttonSubText}>
                ❤️{character.baseStats.health} ⚔️{character.baseStats.damage} 🏃{character.baseStats.moveSpeed}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>🎮 遊戲說明</Text>
          <Text style={styles.instructionText}>• 角色固定在螢幕中央，自動攻擊敵人</Text>
          <Text style={styles.instructionText}>• 點擊螢幕控制移動方向</Text>
          <Text style={styles.instructionText}>• 擊殺敵人獲得經驗值升級</Text>
          <Text style={styles.instructionText}>• 生存越久分數越高</Text>
        </View>
      </View>
    </SafeAreaView>
  );

  // 升級選擇畫面
  const renderLevelUpScreen = () => (
    <View style={styles.levelUpOverlay}>
      <View style={styles.levelUpContainer}>
        <Text style={styles.levelUpTitle}>🌟 升級！</Text>
        <Text style={styles.levelUpSubtitle}>選擇一個升級</Text>
        
        <View style={styles.upgradeOptions}>
          <TouchableOpacity style={styles.upgradeButton} onPress={() => selectUpgrade('damage')}>
            <Text style={styles.upgradeEmoji}>⚔️</Text>
            <Text style={styles.upgradeText}>攻擊力 +5</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.upgradeButton} onPress={() => selectUpgrade('health')}>
            <Text style={styles.upgradeEmoji}>❤️</Text>
            <Text style={styles.upgradeText}>生命值 +20</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.upgradeButton} onPress={() => selectUpgrade('speed')}>
            <Text style={styles.upgradeEmoji}>🏃</Text>
            <Text style={styles.upgradeText}>移動速度 +20</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.upgradeButton} onPress={() => selectUpgrade('attackSpeed')}>
            <Text style={styles.upgradeEmoji}>⚡</Text>
            <Text style={styles.upgradeText}>攻擊速度 +20%</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // 遊戲畫面
  const renderGameScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* 遊戲HUD */}
      <View style={styles.gameHUD}>
        <View style={styles.hudLeft}>
          <View style={styles.healthBar}>
            <View style={[styles.healthFill, { width: `${(player.health / player.maxHealth) * 100}%` }]} />
            <Text style={styles.healthText}>❤️ {Math.round(player.health)}/{player.maxHealth}</Text>
          </View>
          <View style={styles.expBar}>
            <View style={[styles.expFill, { width: `${(player.experience / player.experienceToNext) * 100}%` }]} />
            <Text style={styles.expText}>🌟 Lv.{player.level} ({player.experience}/{player.experienceToNext})</Text>
          </View>
        </View>
        
        <View style={styles.hudRight}>
          <Text style={styles.hudText}>🏆 {score}</Text>
          <Text style={styles.hudText}>⏱️ {formatTime(gameTime)}</Text>
          <Text style={styles.hudText}>💀 {enemiesKilled}</Text>
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

        {/* 敵人顯示 */}
        {enemies.map(enemy => {
          const relativeX = enemy.worldX - player.worldX + SCREEN_WIDTH / 2;
          const relativeY = enemy.worldY - player.worldY + SCREEN_HEIGHT / 2;
          
          if (relativeX > -50 && relativeX < SCREEN_WIDTH + 50 && 
              relativeY > -50 && relativeY < SCREEN_HEIGHT + 50) {
            return (
              <View key={enemy.id}>
                <View 
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
                {/* 敵人血條 */}
                <View style={[styles.enemyHealthBar, {
                  left: relativeX - 15,
                  top: relativeY - ENEMY_TYPES[enemy.type].size / 2 - 8,
                }]}>
                  <View style={[styles.enemyHealthFill, { 
                    width: `${(enemy.health / enemy.maxHealth) * 100}%` 
                  }]} />
                </View>
              </View>
            );
          }
          return null;
        })}

        {/* 投射物顯示 */}
        {projectiles.map(projectile => {
          const relativeX = projectile.worldX - player.worldX + SCREEN_WIDTH / 2;
          const relativeY = projectile.worldY - player.worldY + SCREEN_HEIGHT / 2;
          
          if (relativeX > -20 && relativeX < SCREEN_WIDTH + 20 && 
              relativeY > -20 && relativeY < SCREEN_HEIGHT + 20) {
            return (
              <View 
                key={projectile.id}
                style={[styles.projectile, { 
                  left: relativeX - 5, 
                  top: relativeY - 5,
                }]}
              >
                <Text style={styles.projectileEmoji}>{projectile.sprite}</Text>
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

      {/* 升級覆蓋層 */}
      {gameState === 'levelUp' && renderLevelUpScreen()}
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
          <Text style={styles.statItem}>💀 擊殺敵人: {enemiesKilled}</Text>
          <Text style={styles.statItem}>🌟 達到等級: {player.level}</Text>
          <Text style={styles.statItem}>🎭 使用角色: {CHARACTER_TYPES[player.character as keyof typeof CHARACTER_TYPES].name}</Text>
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
    case 'levelUp':
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
    marginBottom: 20,
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
  buttonSubText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 5,
  },
  instructionContainer: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 15,
    width: '100%',
    maxWidth: 350,
  },
  instructionTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  instructionText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'left',
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
  healthBar: {
    width: 150,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    marginBottom: 5,
    position: 'relative',
  },
  healthFill: {
    height: '100%',
    backgroundColor: COLORS.health,
    borderRadius: 10,
  },
  healthText: {
    position: 'absolute',
    top: 2,
    left: 5,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  expBar: {
    width: 150,
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    position: 'relative',
  },
  expFill: {
    height: '100%',
    backgroundColor: COLORS.experience,
    borderRadius: 8,
  },
  expText: {
    position: 'absolute',
    top: 1,
    left: 5,
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
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
  enemyHealthBar: {
    position: 'absolute',
    width: 30,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  enemyHealthFill: {
    height: '100%',
    backgroundColor: COLORS.health,
    borderRadius: 2,
  },
  projectile: {
    position: 'absolute',
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectileEmoji: {
    fontSize: 12,
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
  levelUpOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  levelUpContainer: {
    backgroundColor: COLORS.cardBackground,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: 350,
    width: '90%',
  },
  levelUpTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  levelUpSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 30,
  },
  upgradeOptions: {
    width: '100%',
  },
  upgradeButton: {
    backgroundColor: COLORS.buttonPrimary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  upgradeText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
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