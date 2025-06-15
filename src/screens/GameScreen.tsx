import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '../config/colors';
import { FONTS, SPACING } from '../config/constants';

interface Props {
  navigation: any;
  route: any;
}

const GameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { characterId } = route.params || { characterId: 'warrior' };

  const handlePausePress = () => {
    // Implement pause functionality
    console.log('Pause game');
  };

  const handleBackToMenu = () => {
    navigation.navigate('Menu');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Game HUD */}
      <View style={styles.hud}>
        <View style={styles.topHUD}>
          <View style={styles.healthContainer}>
            <Text style={styles.hudLabel}>生命值</Text>
            <View style={styles.healthBar}>
              <View style={[styles.healthFill, { width: '100%' }]} />
            </View>
          </View>
          
          <TouchableOpacity onPress={handlePausePress} style={styles.pauseButton}>
            <Text style={styles.pauseButtonText}>⏸️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsHUD}>
          <Text style={styles.statText}>等級: 1</Text>
          <Text style={styles.statText}>波數: 1</Text>
          <Text style={styles.statText}>分數: 0</Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        <View style={styles.player}>
          <Text style={styles.playerText}>👤</Text>
        </View>
        
        {/* Temporary game info */}
        <View style={styles.gameInfo}>
          <Text style={styles.gameInfoText}>遊戲區域</Text>
          <Text style={styles.gameInfoText}>角色: {characterId}</Text>
          <Text style={styles.gameInfoText}>觸摸移動角色</Text>
        </View>
      </View>

      {/* Bottom HUD */}
      <View style={styles.bottomHUD}>
        <TouchableOpacity onPress={handleBackToMenu} style={styles.menuButton}>
          <Text style={styles.menuButtonText}>主選單</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
  },
  topHUD: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
  },
  healthContainer: {
    flex: 1,
    marginRight: SPACING.medium,
  },
  hudLabel: {
    fontSize: FONTS.sizes.small,
    color: Colors.textSecondary,
    marginBottom: SPACING.tiny,
  },
  healthBar: {
    height: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    backgroundColor: Colors.health,
  },
  pauseButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.cardBackground,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    fontSize: 20,
  },
  statsHUD: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.small,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  statText: {
    fontSize: FONTS.sizes.caption,
    color: Colors.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  player: {
    width: 40,
    height: 40,
    backgroundColor: Colors.accent,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerText: {
    fontSize: 24,
  },
  gameInfo: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  gameInfoText: {
    fontSize: FONTS.sizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.tiny,
  },
  bottomHUD: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
  },
  menuButton: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SPACING.small,
    alignSelf: 'center',
  },
  menuButtonText: {
    fontSize: FONTS.sizes.caption,
    color: Colors.textPrimary,
  },
});

export default GameScreen; 