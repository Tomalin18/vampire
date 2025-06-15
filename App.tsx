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
  Modal,
  ScrollView
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 遊戲配置
const GAME_CONFIG = {
  PLAYER_START_HEALTH: 100,
  PLAYER_START_DAMAGE: 10,
  PLAYER_START_SPEED: 150,
  ENEMY_SPAWN_RATE: 2000,
  MAX_ENEMIES: 50,
  BASE_XP_REQUIREMENT: 100,
  XP_SCALING: 1.2,
  PROJECTILE_SPEED: 400,
  ATTACK_RANGE: 200,
  ATTACK_COOLDOWN: 800, // ms
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
  gold: '#FFD700',
  danger: '#FF4444',
};

const ENEMY_TYPES = {
  zombie: {
    health: 50,
    damage: 10,
    speed: 150, // 增加速度
    xpValue: 10,
    size: 24,
    sprite: '🧟',
    color: '#4a5568',
  },
  ghoul: {
    health: 30,
    damage: 15,
    speed: 200, // 增加速度
    xpValue: 15,
    size: 20,
    sprite: '👻',
    color: '#2d3748',
  },
  brute: {
    health: 150,
    damage: 25,
    speed: 100, // 增加速度
    xpValue: 30,
    size: 40,
    sprite: '👹',
    color: '#744210',
  },
  skeleton: {
    health: 40,
    damage: 12,
    speed: 180, // 增加速度
    xpValue: 20,
    size: 22,
    sprite: '💀',
    color: '#e2e8f0',
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
      attackSpeed: 1.0,
      criticalChance: 0.05,
    },
    startingWeapon: 'basicGun',
  },
  mage: {
    name: '法師', 
    sprite: '🔮',
    baseStats: {
      health: 80,
      damage: 18,
      moveSpeed: 130,
      attackSpeed: 1.2,
      criticalChance: 0.1,
    },
    startingWeapon: 'fireball',
  },
  archer: {
    name: '弓箭手',
    sprite: '🏹', 
    baseStats: {
      health: 100,
      damage: 14,
      moveSpeed: 160,
      attackSpeed: 1.5,
      criticalChance: 0.08,
    },
    startingWeapon: 'basicGun',
  },
};

const WEAPON_TYPES = {
  basicGun: {
    name: '基礎手槍',
    damage: 15,
    attackSpeed: 2.0,
    range: 200,
    projectileSpeed: 400,
    sprite: '🔫',
    color: '#FFD700',
  },
  fireball: {
    name: '火球術',
    damage: 30,
    attackSpeed: 1.5,
    range: 250,
    projectileSpeed: 300,
    sprite: '🔥',
    color: '#FF6B35',
  },
  sword: {
    name: '旋轉劍',
    damage: 20,
    attackSpeed: 3.0,
    range: 80,
    sprite: '⚔️',
    color: '#C0C0C0',
  },
};

const UPGRADE_OPTIONS = [
  {
    id: 'health',
    name: '生命增強',
    description: '最大生命值 +20',
    icon: '❤️',
    effect: { type: 'stat', stat: 'maxHealth', value: 20 },
  },
  {
    id: 'damage',
    name: '攻擊強化',
    description: '攻擊力 +10%',
    icon: '💪',
    effect: { type: 'stat', stat: 'damage', value: 0.1, isPercentage: true },
  },
  {
    id: 'speed',
    name: '移動加速',
    description: '移動速度 +15%',
    icon: '💨',
    effect: { type: 'stat', stat: 'speed', value: 0.15, isPercentage: true },
  },
  {
    id: 'attackSpeed',
    name: '攻擊速度',
    description: '攻擊速度 +20%',
    icon: '⚡',
    effect: { type: 'stat', stat: 'attackSpeed', value: 0.2, isPercentage: true },
  },
  {
    id: 'criticalChance',
    name: '暴擊機率',
    description: '暴擊機率 +5%',
    icon: '🎯',
    effect: { type: 'stat', stat: 'criticalChance', value: 0.05 },
  },
];

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
  criticalChance: number;
  lastAttackTime: number;
  weapon: string;
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
  lifetime: number;
  penetration: number;
  color: string;
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: any;
}

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver' | 'levelUp'>('menu');
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [availableUpgrades, setAvailableUpgrades] = useState<Upgrade[]>([]);

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
    damage: 12,
    attackSpeed: 1.0,
    criticalChance: 0.05,
    lastAttackTime: 0,
    weapon: 'basicGun',
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const playerRef = useRef(player);

  // 同步 playerRef
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

  // 敵人生成
  const spawnEnemy = useCallback(() => {
    if (enemies.length >= GAME_CONFIG.MAX_ENEMIES) return;

    const enemyTypes = Object.keys(ENEMY_TYPES) as Array<keyof typeof ENEMY_TYPES>;
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const config = ENEMY_TYPES[randomType];
    
    const currentPlayer = playerRef.current;
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

  // 創建射彈
  const createProjectile = useCallback((startX: number, startY: number, targetX: number, targetY: number, damage: number, color: string) => {
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    const speed = GAME_CONFIG.PROJECTILE_SPEED;
    const velocityX = (dx / distance) * speed;
    const velocityY = (dy / distance) * speed;

    const projectile: Projectile = {
      id: `projectile_${Date.now()}_${Math.random()}`,
      worldX: startX,
      worldY: startY,
      velocityX,
      velocityY,
      damage,
      lifetime: 3000,
      penetration: 1,
      color,
    };

    setProjectiles(prev => [...prev, projectile]);
  }, []);

  // 自動攻擊系統
  const handleAutoAttack = useCallback((currentTime: number) => {
    const currentPlayer = playerRef.current;
    const weapon = WEAPON_TYPES[currentPlayer.weapon as keyof typeof WEAPON_TYPES];
    const attackCooldown = GAME_CONFIG.ATTACK_COOLDOWN / currentPlayer.attackSpeed;
    
    if (currentTime - currentPlayer.lastAttackTime < attackCooldown) return;

    // 尋找最近的敵人
    let nearestEnemy: Enemy | null = null;
    let nearestDistance = Infinity;

    enemies.forEach(enemy => {
      const dx = enemy.worldX - currentPlayer.worldX;
      const dy = enemy.worldY - currentPlayer.worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < nearestDistance && distance <= weapon.range) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    });

    if (nearestEnemy) {
      // 計算暴擊
      const isCritical = Math.random() < currentPlayer.criticalChance;
      const finalDamage = currentPlayer.damage * weapon.damage * (isCritical ? 2 : 1);
      
      createProjectile(
        currentPlayer.worldX,
        currentPlayer.worldY,
        nearestEnemy.worldX,
        nearestEnemy.worldY,
        finalDamage,
        weapon.color
      );

      setPlayer(prev => ({
        ...prev,
        lastAttackTime: currentTime,
      }));
    }
  }, [enemies, createProjectile]);

  // 升級系統
  const gainExperience = useCallback((amount: number) => {
    setScore(prev => prev + amount);
    
    setPlayer(prev => {
      const newExperience = prev.experience + amount;
      
      if (newExperience >= prev.experienceToNext) {
        // 升級！
        const newLevel = prev.level + 1;
        const newExperienceToNext = Math.floor(GAME_CONFIG.BASE_XP_REQUIREMENT * Math.pow(GAME_CONFIG.XP_SCALING, newLevel - 1));
        
        // 生成升級選項
        const shuffled = [...UPGRADE_OPTIONS].sort(() => Math.random() - 0.5);
        setAvailableUpgrades(shuffled.slice(0, 3));
        setGameState('levelUp');
        
        return {
          ...prev,
          experience: newExperience - prev.experienceToNext,
          level: newLevel,
          experienceToNext: newExperienceToNext,
        };
      }
      
      return {
        ...prev,
        experience: newExperience,
      };
    });
  }, []);

  // 應用升級
  const applyUpgrade = useCallback((upgrade: Upgrade) => {
    setPlayer(prev => {
      const newPlayer = { ...prev };
      const effect = upgrade.effect;
      
      if (effect.type === 'stat') {
        const currentValue = newPlayer[effect.stat as keyof Player] as number;
        
        if (effect.isPercentage) {
          (newPlayer as any)[effect.stat] = currentValue * (1 + effect.value);
        } else {
          (newPlayer as any)[effect.stat] = currentValue + effect.value;
        }
        
        // 特殊處理血量
        if (effect.stat === 'maxHealth') {
          newPlayer.health = Math.min(newPlayer.health + effect.value, newPlayer.maxHealth);
        }
      }
      
      return newPlayer;
    });
    
    setGameState('playing');
    setAvailableUpgrades([]);
  }, []);

  // 遊戲更新邏輯
  const updateGame = useCallback((deltaTime: number, currentTime: number) => {
    // 更新玩家位置
    setPlayer(prev => ({
      ...prev,
      worldX: prev.worldX + prev.velocityX * deltaTime,
      worldY: prev.worldY + prev.velocityY * deltaTime,
    }));

    // 自動攻擊
    handleAutoAttack(currentTime);

    // 更新敵人位置 - 讓敵人直直朝向玩家
    setEnemies(prevEnemies => 
      prevEnemies.map(enemy => {
        const currentPlayer = playerRef.current;
        const dx = currentPlayer.worldX - enemy.worldX;
        const dy = currentPlayer.worldY - enemy.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 只有當距離大於最小距離時才移動
        if (distance > 8) {
          const speed = ENEMY_TYPES[enemy.type].speed * deltaTime;
          // 計算單位向量 (方向)
          const normalizedX = dx / distance;
          const normalizedY = dy / distance;
          
          // 計算移動量
          const moveX = normalizedX * speed;
          const moveY = normalizedY * speed;
          
          return {
            ...enemy,
            worldX: enemy.worldX + moveX,
            worldY: enemy.worldY + moveY,
          };
        }
        return enemy;
      })
    );

    // 更新射彈
    setProjectiles(prevProjectiles => {
      return prevProjectiles.map(projectile => ({
        ...projectile,
        worldX: projectile.worldX + projectile.velocityX * deltaTime,
        worldY: projectile.worldY + projectile.velocityY * deltaTime,
        lifetime: projectile.lifetime - deltaTime * 1000,
      })).filter(projectile => projectile.lifetime > 0);
    });

    // 碰撞檢測 - 射彈與敵人
    setEnemies(prevEnemies => {
      let newEnemies = [...prevEnemies];
      
      projectiles.forEach(projectile => {
        newEnemies = newEnemies.map(enemy => {
          const dx = projectile.worldX - enemy.worldX;
          const dy = projectile.worldY - enemy.worldY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < ENEMY_TYPES[enemy.type].size / 2 + 5) {
            const newHealth = enemy.health - projectile.damage;
            
            if (newHealth <= 0) {
              // 敵人死亡，給予經驗值
              gainExperience(ENEMY_TYPES[enemy.type].xpValue);
              setEnemiesKilled(prev => prev + 1);
              
              // 移除射彈
              setProjectiles(prev => prev.filter(p => p.id !== projectile.id));
              
              return null; // 標記為移除
            }
            
            return { ...enemy, health: newHealth };
          }
          
          return enemy;
        }).filter(enemy => enemy !== null) as Enemy[];
      });
      
      return newEnemies;
    });

    // 碰撞檢測 - 玩家與敵人
    const currentPlayer = playerRef.current;
    const collidingEnemies = enemies.filter(enemy => {
      const dx = currentPlayer.worldX - enemy.worldX;
      const dy = currentPlayer.worldY - enemy.worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const enemyRadius = ENEMY_TYPES[enemy.type].size / 2;
      return distance < (20 + enemyRadius);
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
  }, [enemies, projectiles, handleAutoAttack, gainExperience]);

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
      experienceToNext: GAME_CONFIG.BASE_XP_REQUIREMENT,
      character: characterId,
      velocityX: 0,
      velocityY: 0,
      speed: character.baseStats.moveSpeed,
      damage: character.baseStats.damage,
      attackSpeed: character.baseStats.attackSpeed,
      criticalChance: character.baseStats.criticalChance,
      lastAttackTime: 0,
      weapon: character.startingWeapon,
    });
    setEnemies([]);
    setProjectiles([]);
    setScore(0);
    setGameTime(0);
    setEnemiesKilled(0);
    setGameState('playing');
    lastTimeRef.current = 0;
  }, []);

  // 觸控處理
  const handleTouch = useCallback((event: any) => {
    if (gameState !== 'playing') return;
    
    const { locationX, locationY } = event.nativeEvent;
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT / 2;
    
    const dx = locationX - centerX;
    const dy = locationY - centerY;
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
    onStartShouldSetPanResponder: () => gameState === 'playing',
    onMoveShouldSetPanResponder: () => gameState === 'playing',
    onPanResponderGrant: handleTouch,
    onPanResponderMove: handleTouch,
  });

  // 時間格式化
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 升級選單
  const renderLevelUpScreen = () => (
    <Modal visible={gameState === 'levelUp'} transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.levelUpContainer}>
          <Text style={styles.levelUpTitle}>🎉 升級！</Text>
          <Text style={styles.levelUpSubtitle}>等級 {player.level} 選擇一個升級</Text>
          
          <ScrollView style={styles.upgradeList}>
            {availableUpgrades.map((upgrade, index) => (
              <TouchableOpacity
                key={index}
                style={styles.upgradeOption}
                onPress={() => applyUpgrade(upgrade)}
              >
                <Text style={styles.upgradeIcon}>{upgrade.icon}</Text>
                <View style={styles.upgradeText}>
                  <Text style={styles.upgradeName}>{upgrade.name}</Text>
                  <Text style={styles.upgradeDescription}>{upgrade.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // 主選單畫面
  const renderMenuScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.menuContainer}>
        <Text style={styles.title}>🧛 吸血鬼倖存者</Text>
        <Text style={styles.subtitle}>完整版</Text>
        
        <View style={styles.characterSelection}>
          <Text style={styles.sectionTitle}>選擇角色</Text>
          {Object.entries(CHARACTER_TYPES).map(([id, character]) => (
            <TouchableOpacity 
              key={id}
              style={styles.characterButton} 
              onPress={() => startGame(id as keyof typeof CHARACTER_TYPES)}
            >
              <Text style={styles.characterEmoji}>{character.sprite}</Text>
              <View style={styles.characterInfo}>
                <Text style={styles.characterName}>{character.name}</Text>
                <Text style={styles.characterStats}>
                  ❤️{character.baseStats.health} ⚔️{character.baseStats.damage} 🏃{character.baseStats.moveSpeed}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );

  // 遊戲畫面
  const renderGameScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* 遊戲HUD */}
      <View style={styles.gameHUD}>
        <View style={styles.hudRow}>
          <View style={styles.healthContainer}>
            <View style={styles.healthBar}>
              <View 
                style={[styles.healthBarFill, { 
                  width: `${(player.health / player.maxHealth) * 100}%` 
                }]} 
              />
            </View>
            <Text style={styles.healthText}>
              {Math.round(player.health)}/{player.maxHealth}
            </Text>
          </View>
          
          <View style={styles.statsContainer}>
            <Text style={styles.hudText}>🌟 {player.level}</Text>
            <Text style={styles.hudText}>🏆 {score}</Text>
            <Text style={styles.hudText}>⏱️ {formatTime(gameTime)}</Text>
          </View>
        </View>
        
        <View style={styles.expContainer}>
          <View style={styles.expBar}>
            <View 
              style={[styles.expBarFill, { 
                width: `${(player.experience / player.experienceToNext) * 100}%` 
              }]} 
            />
          </View>
          <Text style={styles.expText}>
            {player.experience}/{player.experienceToNext}
          </Text>
        </View>
      </View>

      {/* 遊戲區域 */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* 玩家 - 固定在螢幕中央 */}
        <View style={[styles.player, {
          left: SCREEN_WIDTH / 2 - 25,
          top: SCREEN_HEIGHT / 2 - 25,
        }]}>
          <Text style={styles.playerEmoji}>
            {CHARACTER_TYPES[player.character as keyof typeof CHARACTER_TYPES].sprite}
          </Text>
        </View>

        {/* 敵人 */}
        {enemies.map(enemy => {
          const relativeX = enemy.worldX - player.worldX + SCREEN_WIDTH / 2;
          const relativeY = enemy.worldY - player.worldY + SCREEN_HEIGHT / 2;
          
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
                  backgroundColor: ENEMY_TYPES[enemy.type].color,
                }]}
              >
                <Text style={[styles.enemyEmoji, {
                  fontSize: ENEMY_TYPES[enemy.type].size * 0.6
                }]}>
                  {ENEMY_TYPES[enemy.type].sprite}
                </Text>
                
                {/* 敵人血條 */}
                <View style={styles.enemyHealthBar}>
                  <View style={[styles.enemyHealthFill, {
                    width: `${(enemy.health / enemy.maxHealth) * 100}%`
                  }]} />
                </View>
              </View>
            );
          }
          return null;
        })}

        {/* 射彈 */}
        {projectiles.map(projectile => {
          const relativeX = projectile.worldX - player.worldX + SCREEN_WIDTH / 2;
          const relativeY = projectile.worldY - player.worldY + SCREEN_HEIGHT / 2;
          
          if (relativeX > -20 && relativeX < SCREEN_WIDTH + 20 && 
              relativeY > -20 && relativeY < SCREEN_HEIGHT + 20) {
            return (
              <View
                key={projectile.id}
                style={[styles.projectile, {
                  left: relativeX - 3,
                  top: relativeY - 3,
                  backgroundColor: projectile.color,
                }]}
              />
            );
          }
          return null;
        })}
      </View>

      {/* 控制按鈕 */}
      <TouchableOpacity 
        style={styles.pauseButton} 
        onPress={() => setGameState('paused')}
      >
        <Text style={styles.pauseButtonText}>⏸️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // 暫停畫面
  const renderPausedScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.pauseOverlay}>
        <Text style={styles.pauseTitle}>⏸️ 遊戲暫停</Text>
        <TouchableOpacity 
          style={styles.resumeButton} 
          onPress={() => setGameState('playing')}
        >
          <Text style={styles.resumeButtonText}>繼續遊戲</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setGameState('menu')}
        >
          <Text style={styles.menuButtonText}>回主選單</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // 遊戲結束畫面
  const renderGameOverScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameOverContainer}>
        <Text style={styles.gameOverTitle}>💀 遊戲結束</Text>
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>最終統計</Text>
          <Text style={styles.statItem}>🏆 分數: {score}</Text>
          <Text style={styles.statItem}>⏱️ 時間: {formatTime(gameTime)}</Text>
          <Text style={styles.statItem}>👹 擊殺: {enemiesKilled}</Text>
          <Text style={styles.statItem}>🌟 等級: {player.level}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.restartButton} 
          onPress={() => startGame(player.character as keyof typeof CHARACTER_TYPES)}
        >
          <Text style={styles.restartButtonText}>重新開始</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backToMenuButton} 
          onPress={() => setGameState('menu')}
        >
          <Text style={styles.backToMenuButtonText}>回主選單</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // 根據遊戲狀態渲染
  const renderCurrentScreen = () => {
    switch (gameState) {
      case 'menu':
        return renderMenuScreen();
      case 'playing':
        return renderGameScreen();
      case 'paused':
        return renderPausedScreen();
      case 'gameOver':
        return renderGameOverScreen();
      case 'levelUp':
        return renderGameScreen(); // 遊戲畫面作為背景
      default:
        return renderMenuScreen();
    }
  };

  return (
    <>
      {renderCurrentScreen()}
      {renderLevelUpScreen()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // 主選單樣式
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
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  characterSelection: {
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  characterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  characterEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  characterStats: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  
  // 遊戲HUD樣式
  gameHUD: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  hudRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  healthContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  healthBar: {
    flex: 1,
    height: 20,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 8,
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  healthText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    minWidth: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hudText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  expContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  expBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  expText: {
    color: COLORS.gold,
    fontSize: 10,
    minWidth: 60,
  },
  
  // 遊戲區域樣式
  gameArea: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    position: 'relative',
  },
  player: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: COLORS.accent,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
  },
  playerEmoji: {
    fontSize: 24,
  },
  enemy: {
    position: 'absolute',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  enemyEmoji: {
    textAlign: 'center',
  },
  enemyHealthBar: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 2,
  },
  enemyHealthFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  projectile: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.textPrimary,
  },
  
  // 升級選單樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpContainer: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  levelUpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  levelUpSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  upgradeList: {
    maxHeight: 400,
  },
  upgradeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  upgradeIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  upgradeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  
  // 暫停按鈕
  pauseButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: COLORS.buttonSecondary,
    padding: 10,
    borderRadius: 25,
    zIndex: 101,
  },
  pauseButtonText: {
    fontSize: 20,
  },
  
  // 暫停畫面
  pauseOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  pauseTitle: {
    fontSize: 24,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  resumeButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 15,
  },
  resumeButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuButton: {
    backgroundColor: COLORS.buttonSecondary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  menuButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // 遊戲結束畫面
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    width: '100%',
  },
  statTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  statItem: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  restartButtonText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToMenuButton: {
    backgroundColor: COLORS.buttonSecondary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  backToMenuButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 