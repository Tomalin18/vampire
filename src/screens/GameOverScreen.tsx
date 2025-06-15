import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '../config/colors';
import { FONTS, SPACING, BORDER_RADIUS } from '../config/constants';

interface Props {
  navigation: any;
  route: any;
}

const GameOverScreen: React.FC<Props> = ({ navigation, route }) => {
  const { score = 0, survivalTime = 0, enemiesDefeated = 0, level = 1 } = route.params || {};

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayAgain = () => {
    navigation.navigate('CharacterSelect');
  };

  const handleMainMenu = () => {
    navigation.navigate('Menu');
  };

  const handleShareScore = () => {
    // Implement share functionality
    console.log('Share score');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Game Over Title */}
          <Text style={styles.gameOverTitle}>遊戲結束</Text>
          
          {/* Results Summary */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>戰鬥結果</Text>
            
            <View style={styles.statsGrid}>
              <StatCard label="最終分數" value={score.toLocaleString()} highlight />
              <StatCard label="存活時間" value={formatTime(survivalTime)} />
              <StatCard label="擊敗敵人" value={enemiesDefeated.toString()} />
              <StatCard label="達到等級" value={level.toString()} />
            </View>
          </View>

          {/* Achievements or Records */}
          <View style={styles.achievementsContainer}>
            <Text style={styles.achievementText}>🏆 新紀錄！</Text>
            <Text style={styles.achievementSubtext}>這是你的最佳分數！</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handlePlayAgain}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>再玩一次</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleMainMenu}
            >
              <Text style={styles.buttonText}>主選單</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={handleShareScore}
            >
              <Text style={styles.shareButtonText}>分享成績</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, highlight = false }) => (
  <View style={[styles.statCard, highlight && styles.highlightCard]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, highlight && styles.highlightValue]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
  },
  content: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.huge,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  gameOverTitle: {
    fontSize: FONTS.sizes.huge,
    fontWeight: FONTS.weights.bold,
    color: Colors.accent,
    marginBottom: SPACING.large,
    textAlign: 'center',
  },
  resultsContainer: {
    width: '100%',
    marginBottom: SPACING.large,
  },
  resultsTitle: {
    fontSize: FONTS.sizes.title,
    fontWeight: FONTS.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.medium,
    marginBottom: SPACING.small,
    alignItems: 'center',
  },
  highlightCard: {
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  statLabel: {
    fontSize: FONTS.sizes.caption,
    color: Colors.textSecondary,
    marginBottom: SPACING.tiny,
    textAlign: 'center',
  },
  statValue: {
    fontSize: FONTS.sizes.title,
    fontWeight: FONTS.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  highlightValue: {
    color: Colors.textPrimary,
    fontSize: FONTS.sizes.large,
  },
  achievementsContainer: {
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  achievementText: {
    fontSize: FONTS.sizes.title,
    color: Colors.warning,
    marginBottom: SPACING.tiny,
  },
  achievementSubtext: {
    fontSize: FONTS.sizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  buttonText: {
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.semibold,
    color: Colors.textPrimary,
  },
  primaryButtonText: {
    fontWeight: FONTS.weights.bold,
  },
  shareButton: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
  },
  shareButtonText: {
    fontSize: FONTS.sizes.caption,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default GameOverScreen; 