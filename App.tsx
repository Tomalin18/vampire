import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, SafeAreaView, PanResponder } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Player {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  level: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedCharacter, setSelectedCharacter] = useState('warrior');
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  
  const [player, setPlayer] = useState<Player>({
    x: SCREEN_WIDTH / 2,
    y: SCREEN_HEIGHT / 2,
    health: 100,
    maxHealth: 100,
    level: 1,
  });
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const enemySpawnRef = useRef<NodeJS.Timeout | null>(null);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameRunning) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
        setScore(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameRunning]);

  // Spawn enemies
  const spawnEnemy = React.useCallback(() => {
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

    const newEnemy: Enemy = {
      id: Date.now() + Math.random(),
      x,
      y,
      health: 50,
    };

    setEnemies(prev => [...prev.slice(-10), newEnemy]); // Keep only last 10 enemies
  }, []);

  // Update game
  const updateGame = React.useCallback(() => {
    // Update enemies (move towards player)
    setEnemies(prevEnemies => {
      return prevEnemies.map(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const speed = 1;
          return {
            ...enemy,
            x: enemy.x + (dx / distance) * speed,
            y: enemy.y + (dy / distance) * speed
          };
        }
        return enemy;
      }).filter(enemy => {
        // Remove enemies that are too far
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 800;
      });
    });
  }, [player.x, player.y]);

  // Enemy spawning
  useEffect(() => {
    if (isGameRunning) {
      enemySpawnRef.current = setInterval(() => {
        spawnEnemy();
      }, 2000); // Every 2 seconds
    } else {
      if (enemySpawnRef.current) {
        clearInterval(enemySpawnRef.current);
      }
    }
    return () => {
      if (enemySpawnRef.current) {
        clearInterval(enemySpawnRef.current);
      }
    };
  }, [isGameRunning, spawnEnemy]);

  // Game loop
  useEffect(() => {
    if (isGameRunning) {
      gameLoopRef.current = setInterval(() => {
        updateGame();
      }, 50); // 20 FPS
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isGameRunning, updateGame]);

  const startGame = (character: string) => {
    setSelectedCharacter(character);
    setIsGameRunning(true);
    setGameTime(0);
    setScore(0);
    setPlayer({
      x: SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT / 2,
      health: 100,
      maxHealth: 100,
      level: 1,
    });
    setEnemies([]);
    setCurrentScreen('game');
  };

  const endGame = () => {
    setIsGameRunning(false);
    setCurrentScreen('gameOver');
  };

  const returnToMenu = () => {
    setIsGameRunning(false);
    setCurrentScreen('menu');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCharacterEmoji = (character: string) => {
    switch (character) {
      case 'warrior': return '⚔️';
      case 'mage': return '🔮';
      default: return '⚔️';
    }
  };

  // Touch control
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setPlayer(prev => ({
        ...prev,
        x: Math.max(25, Math.min(SCREEN_WIDTH - 25, locationX)),
        y: Math.max(100, Math.min(SCREEN_HEIGHT - 100, locationY))
      }));
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setPlayer(prev => ({
        ...prev,
        x: Math.max(25, Math.min(SCREEN_WIDTH - 25, locationX)),
        y: Math.max(100, Math.min(SCREEN_HEIGHT - 100, locationY))
      }));
    }
  });

  // Main Menu Screen
  if (currentScreen === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <View style={styles.menuContainer}>
          <Text style={styles.title}>🧛 吸血鬼倖存者</Text>
          <Text style={styles.subtitle}>簡化版測試</Text>
          
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
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Game Screen
  if (currentScreen === 'game') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        
        {/* Game HUD */}
        <View style={styles.gameHUD}>
          <View style={styles.hudLeft}>
            <Text style={styles.hudText}>❤️ {player.health}/{player.maxHealth}</Text>
            <Text style={styles.hudText}>🌟 等級 {player.level}</Text>
          </View>
          
          <View style={styles.hudRight}>
            <Text style={styles.hudText}>🏆 {score} 分</Text>
            <Text style={styles.hudText}>⏱️ {formatTime(gameTime)}</Text>
          </View>
        </View>

        {/* Game Area */}
        <View style={styles.gameArea} {...panResponder.panHandlers}>
          {/* Player */}
          <View style={[styles.player, { 
            left: player.x - 25, 
            top: player.y - 25
          }]}>
            <Text style={styles.playerEmoji}>{getCharacterEmoji(selectedCharacter)}</Text>
          </View>

          {/* Enemies */}
          {enemies.map(enemy => (
            <View 
              key={enemy.id} 
              style={[styles.enemy, { left: enemy.x - 15, top: enemy.y - 15 }]}
            >
              <Text style={styles.enemyEmoji}>👹</Text>
            </View>
          ))}
        </View>

        {/* Controls */}
        <View style={styles.gameControls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={returnToMenu}
          >
            <Text style={styles.controlButtonText}>🏠</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Game Over Screen
  if (currentScreen === 'gameOver') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>💀 遊戲結束</Text>
          
          <View style={styles.statsCard}>
            <Text style={styles.statTitle}>遊戲統計</Text>
            <Text style={styles.statItem}>🏆 最終分數: {score}</Text>
            <Text style={styles.statItem}>⏱️ 生存時間: {formatTime(gameTime)}</Text>
            <Text style={styles.statItem}>🎭 使用角色: {getCharacterEmoji(selectedCharacter)}</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => startGame(selectedCharacter)}
            >
              <Text style={styles.buttonText}>🔄 再玩一次</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuButton, styles.secondaryButton]} 
              onPress={returnToMenu}
            >
              <Text style={styles.buttonText}>🏠 返回主選單</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return null;
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
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  menuButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
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
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0a0a0a',
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
    borderColor: '#4CAF50',
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
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsCard: {
    backgroundColor: '#2a2a4e',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    width: '100%',
    maxWidth: 350,
  },
  statTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  statItem: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
}); 