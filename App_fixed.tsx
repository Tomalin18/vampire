import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  SafeAreaView,
  Animated,
  PanResponder 
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Simple game state management
interface GameState {
  screen: 'menu' | 'game' | 'gameOver';
  score: number;
  time: number;
  playerHealth: number;
  playerX: number;
  playerY: number;
  enemies: Array<{ id: number; x: number; y: number; }>;
}

export default function App() {
  // Single state object to minimize re-renders
  const [game, setGame] = useState<GameState>({
    screen: 'menu',
    score: 0,
    time: 0,
    playerHealth: 100,
    playerX: SCREEN_WIDTH / 2,
    playerY: SCREEN_HEIGHT / 2,
    enemies: []
  });

  // Refs for timers (prevent memory leaks)
  const gameTimer = useRef<NodeJS.Timeout | null>(null);
  const enemySpawner = useRef<NodeJS.Timeout | null>(null);
  const isGameActive = useRef(false);

  // Cleanup function
  const cleanup = () => {
    if (gameTimer.current) {
      clearInterval(gameTimer.current);
      gameTimer.current = null;
    }
    if (enemySpawner.current) {
      clearInterval(enemySpawner.current);
      enemySpawner.current = null;
    }
    isGameActive.current = false;
  };

  // Start game function
  const startGame = () => {
    cleanup(); // Clean up any existing timers
    
    setGame({
      screen: 'game',
      score: 0,
      time: 0,
      playerHealth: 100,
      playerX: SCREEN_WIDTH / 2,
      playerY: SCREEN_HEIGHT / 2,
      enemies: []
    });

    isGameActive.current = true;

    // Game timer (updates every second)
    gameTimer.current = setInterval(() => {
      if (!isGameActive.current) return;
      
      setGame(prev => ({
        ...prev,
        time: prev.time + 1,
        score: prev.score + 1
      }));
    }, 1000);

    // Enemy spawner (spawns enemy every 3 seconds)
    enemySpawner.current = setInterval(() => {
      if (!isGameActive.current) return;
      
      const side = Math.floor(Math.random() * 4);
      let x, y;
      
      switch (side) {
        case 0: x = Math.random() * SCREEN_WIDTH; y = -50; break;
        case 1: x = SCREEN_WIDTH + 50; y = Math.random() * SCREEN_HEIGHT; break;
        case 2: x = Math.random() * SCREEN_WIDTH; y = SCREEN_HEIGHT + 50; break;
        default: x = -50; y = Math.random() * SCREEN_HEIGHT; break;
      }

      setGame(prev => ({
        ...prev,
        enemies: [...prev.enemies.slice(-5), { // Keep max 5 enemies
          id: Date.now(),
          x,
          y
        }]
      }));
    }, 3000);

    // Enemy movement (simplified)
    const moveEnemies = setInterval(() => {
      if (!isGameActive.current) return;
      
      setGame(prev => ({
        ...prev,
        enemies: prev.enemies.map(enemy => {
          const dx = prev.playerX - enemy.x;
          const dy = prev.playerY - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const speed = 2;
            return {
              ...enemy,
              x: enemy.x + (dx / distance) * speed,
              y: enemy.y + (dy / distance) * speed
            };
          }
          return enemy;
        }).filter(enemy => {
          // Remove enemies that are too close (collision) or too far
          const dx = prev.playerX - enemy.x;
          const dy = prev.playerY - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 30) {
            // Enemy hit player
            return false;
          }
          return distance < 1000;
        })
      }));
    }, 100);

    // Store the movement timer for cleanup
    setTimeout(() => {
      if (moveEnemies) clearInterval(moveEnemies);
    }, 60000); // Stop after 1 minute to prevent infinite loops
  };

  // End game function
  const endGame = () => {
    cleanup();
    setGame(prev => ({ ...prev, screen: 'gameOver' }));
  };

  // Return to menu
  const returnToMenu = () => {
    cleanup();
    setGame(prev => ({ ...prev, screen: 'menu' }));
  };

  // Touch controls for player movement
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => game.screen === 'game',
    onMoveShouldSetPanResponder: () => game.screen === 'game',
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setGame(prev => ({
        ...prev,
        playerX: Math.max(25, Math.min(SCREEN_WIDTH - 25, locationX)),
        playerY: Math.max(100, Math.min(SCREEN_HEIGHT - 100, locationY))
      }));
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setGame(prev => ({
        ...prev,
        playerX: Math.max(25, Math.min(SCREEN_WIDTH - 25, locationX)),
        playerY: Math.max(100, Math.min(SCREEN_HEIGHT - 100, locationY))
      }));
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Menu Screen
  if (game.screen === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.menuContainer}>
          <Text style={styles.title}>🧛 吸血鬼倖存者</Text>
          <Text style={styles.subtitle}>修復版本</Text>
          
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.buttonText}>⚔️ 開始遊戲</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Game Screen
  if (game.screen === 'game') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* HUD */}
        <View style={styles.hud}>
          <Text style={styles.hudText}>❤️ {game.playerHealth}/100</Text>
          <Text style={styles.hudText}>🏆 {game.score}</Text>
          <Text style={styles.hudText}>⏱️ {formatTime(game.time)}</Text>
        </View>

        {/* Game Area */}
        <View style={styles.gameArea} {...panResponder.panHandlers}>
          {/* Player */}
          <View style={[styles.player, {
            left: game.playerX - 25,
            top: game.playerY - 25
          }]}>
            <Text style={styles.playerEmoji}>⚔️</Text>
          </View>

          {/* Enemies */}
          {game.enemies.map(enemy => (
            <View
              key={enemy.id}
              style={[styles.enemy, {
                left: enemy.x - 15,
                top: enemy.y - 15
              }]}
            >
              <Text style={styles.enemyEmoji}>👹</Text>
            </View>
          ))}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={endGame}>
            <Text style={styles.controlText}>🏠</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Game Over Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.gameOverContainer}>
        <Text style={styles.gameOverTitle}>💀 遊戲結束</Text>
        
        <View style={styles.statsCard}>
          <Text style={styles.statText}>🏆 最終分數: {game.score}</Text>
          <Text style={styles.statText}>⏱️ 生存時間: {formatTime(game.time)}</Text>
        </View>
        
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.buttonText}>🔄 再玩一次</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuButton} onPress={returnToMenu}>
          <Text style={styles.buttonText}>🏠 返回選單</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  menuButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  hudText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    position: 'relative',
  },
  player: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  playerEmoji: {
    fontSize: 24,
  },
  enemy: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enemyEmoji: {
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 25,
  },
  controlText: {
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
    color: '#fff',
    marginBottom: 30,
  },
  statsCard: {
    backgroundColor: '#2a2a4e',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    minWidth: 200,
  },
  statText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
}); 