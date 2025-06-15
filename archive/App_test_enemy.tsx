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
    speed: 100, // 增加速度讓移動更明顯
    xpValue: 10,
    size: 30,
    sprite: '🧟',
    color: '#4a5568',
  },
};

interface Player {
  worldX: number;
  worldY: number;
  health: number;
  maxHealth: number;
  velocityX: number;
  velocityY: number;
  speed: number;
}

interface Enemy {
  id: string;
  worldX: number;
  worldY: number;
  health: number;
  maxHealth: number;
  type: keyof typeof ENEMY_TYPES;
}

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [score, setScore] = useState(0);

  const [player, setPlayer] = useState<Player>({
    worldX: 0,
    worldY: 0,
    health: 100,
    maxHealth: 100,
    velocityX: 0,
    velocityY: 0,
    speed: 150,
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const playerRef = useRef(player);

  // 更新 playerRef 當 player 狀態改變時
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // 敵人生成函數
  const spawnEnemy = useCallback(() => {
    if (enemies.length >= 10) return;

    const currentPlayer = playerRef.current;
    const spawnDistance = 300;
    const angle = Math.random() * Math.PI * 2;
    
    const worldX = currentPlayer.worldX + Math.cos(angle) * spawnDistance;
    const worldY = currentPlayer.worldY + Math.sin(angle) * spawnDistance;

    const newEnemy: Enemy = {
      id: `enemy_${Date.now()}_${Math.random()}`,
      worldX,
      worldY,
      health: 50,
      maxHealth: 50,
      type: 'zombie',
    };

    setEnemies(prev => [...prev, newEnemy]);
    console.log('敵人生成:', newEnemy.worldX.toFixed(1), newEnemy.worldY.toFixed(1), '玩家位置:', currentPlayer.worldX.toFixed(1), currentPlayer.worldY.toFixed(1));
  }, [enemies.length]);

  // 敵人生成定時器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        spawnEnemy();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [gameState, spawnEnemy]);

  // 遊戲更新邏輯
  const updateGame = useCallback((deltaTime: number) => {
    // 更新玩家位置
    setPlayer(prev => ({
      ...prev,
      worldX: prev.worldX + prev.velocityX * deltaTime,
      worldY: prev.worldY + prev.velocityY * deltaTime,
    }));

    // 更新敵人位置 - 使用最新的玩家位置
    setEnemies(prevEnemies => {
      const currentPlayer = playerRef.current;
      
      return prevEnemies.map(enemy => {
        const dx = currentPlayer.worldX - enemy.worldX;
        const dy = currentPlayer.worldY - enemy.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) { // 避免過度接近時的抖動
          const speed = ENEMY_TYPES[enemy.type].speed * deltaTime;
          const moveX = (dx / distance) * speed;
          const moveY = (dy / distance) * speed;
          
          const newEnemy = {
            ...enemy,
            worldX: enemy.worldX + moveX,
            worldY: enemy.worldY + moveY,
          };
          
          // 調試輸出
          if (Math.random() < 0.05) { // 增加調試輸出頻率
            console.log('敵人移動:', enemy.id.slice(-4), '從', enemy.worldX.toFixed(1), enemy.worldY.toFixed(1), '到', newEnemy.worldX.toFixed(1), newEnemy.worldY.toFixed(1));
            console.log('玩家位置:', currentPlayer.worldX.toFixed(1), currentPlayer.worldY.toFixed(1), '距離:', distance.toFixed(1));
          }
          
          return newEnemy;
        }
        return enemy;
      });
    });
  }, []);

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
  const startGame = useCallback(() => {
    setPlayer({
      worldX: 0,
      worldY: 0,
      health: 100,
      maxHealth: 100,
      velocityX: 0,
      velocityY: 0,
      speed: 150,
    });
    setEnemies([]);
    setScore(0);
    setGameState('playing');
    lastTimeRef.current = 0;
    console.log('遊戲開始');
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
      
      console.log('玩家移動方向:', directionX.toFixed(2), directionY.toFixed(2));
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
      // 觸控結束時停止移動
      if (gameState === 'playing') {
        setPlayer(prev => ({
          ...prev,
          velocityX: 0,
          velocityY: 0,
        }));
        console.log('觸控結束，玩家停止移動');
      }
    },
  });

  // 主選單畫面
  const renderMenuScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.menuContainer}>
        <Text style={styles.title}>🧛 敵人移動測試</Text>
        
        <TouchableOpacity style={styles.menuButton} onPress={startGame}>
          <Text style={styles.buttonText}>開始測試</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // 遊戲畫面
  const renderGameScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* 遊戲HUD */}
      <View style={styles.gameHUD}>
        <Text style={styles.hudText}>敵人數量: {enemies.length}</Text>
        <Text style={styles.hudText}>玩家位置: ({player.worldX.toFixed(0)}, {player.worldY.toFixed(0)})</Text>
        <Text style={styles.hudText}>玩家速度: ({player.velocityX.toFixed(0)}, {player.velocityY.toFixed(0)})</Text>
        <Text style={styles.hudText}>移動狀態: {(player.velocityX !== 0 || player.velocityY !== 0) ? '移動中' : '靜止'}</Text>
      </View>

      {/* 遊戲區域 */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* 玩家固定在螢幕中央 */}
        <View style={[styles.player, { 
          left: SCREEN_WIDTH / 2 - 25, 
          top: SCREEN_HEIGHT / 2 - 25
        }]}>
          <Text style={styles.playerEmoji}>⚔️</Text>
        </View>

        {/* 敵人相對位置顯示 */}
        {enemies.map(enemy => {
          const relativeX = enemy.worldX - player.worldX + SCREEN_WIDTH / 2;
          const relativeY = enemy.worldY - player.worldY + SCREEN_HEIGHT / 2;
          
          // 顯示所有敵人，包括螢幕外的
          return (
            <View 
              key={enemy.id} 
              style={[styles.enemy, { 
                left: relativeX - 15, 
                top: relativeY - 15,
                opacity: (relativeX > -50 && relativeX < SCREEN_WIDTH + 50 && 
                         relativeY > -50 && relativeY < SCREEN_HEIGHT + 50) ? 1 : 0.3
              }]}
            >
              <Text style={styles.enemyEmoji}>🧟</Text>
            </View>
          );
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
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={spawnEnemy}
        >
          <Text style={styles.controlButtonText}>➕</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return gameState === 'playing' ? renderGameScreen() : renderMenuScreen();
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
    marginBottom: 40,
  },
  menuButton: {
    backgroundColor: COLORS.buttonPrimary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameHUD: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 15,
  },
  enemyEmoji: {
    fontSize: 20,
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
    flexDirection: 'column',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  controlButtonText: {
    fontSize: 20,
  },
}); 