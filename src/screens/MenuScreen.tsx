import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Colors } from '../config/colors';
import { FONTS, SPACING, BORDER_RADIUS } from '../config/constants';

type MenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Menu'>;

interface Props {
  navigation: MenuScreenNavigationProp;
}

const MenuScreen: React.FC<Props> = ({ navigation }) => {
  const handlePlayPress = () => {
    navigation.navigate('CharacterSelect');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Background */}
      <View style={styles.backgroundContainer}>
        {/* Animated particles could go here */}
        <View style={styles.particleBackground} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Area */}
        <View style={styles.logoContainer}>
          <Text style={styles.gameTitle}>倖存者任務</Text>
          <Text style={styles.gameSubtitle}>SURVIVOR'S QUEST</Text>
        </View>

        {/* Button Container */}
        <View style={styles.buttonContainer}>
          <MenuButton
            title="開始遊戲"
            onPress={handlePlayPress}
            primary
          />
          <MenuButton
            title="角色選擇"
            onPress={() => navigation.navigate('CharacterSelect')}
          />
          <MenuButton
            title="設定"
            onPress={handleSettingsPress}
          />
        </View>

        {/* Stats Display */}
        <View style={styles.statsContainer}>
          <StatItem label="最高分數" value="0" />
          <StatItem label="最長存活" value="0:00" />
        </View>
      </View>
    </SafeAreaView>
  );
};

// Menu Button Component
interface MenuButtonProps {
  title: string;
  onPress: () => void;
  primary?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, onPress, primary = false }) => (
  <TouchableOpacity
    style={[styles.button, primary && styles.primaryButton]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.buttonText, primary && styles.primaryButtonText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// Stat Item Component
interface StatItemProps {
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particleBackground: {
    flex: 1,
    backgroundColor: Colors.background,
    // Add particle animation background here
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.huge,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.massive,
  },
  gameTitle: {
    fontSize: FONTS.sizes.huge + 8,
    fontWeight: FONTS.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.small,
    textShadowColor: Colors.accent,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  gameSubtitle: {
    fontSize: FONTS.sizes.title,
    fontWeight: FONTS.weights.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 60,
    backgroundColor: Colors.cardBackground,
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
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: FONTS.sizes.title,
    fontWeight: FONTS.weights.semibold,
    color: Colors.textPrimary,
  },
  primaryButtonText: {
    color: Colors.textPrimary,
    fontWeight: FONTS.weights.bold,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 300,
    paddingHorizontal: SPACING.medium,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONTS.sizes.small,
    color: Colors.textSecondary,
    marginBottom: SPACING.tiny,
  },
  statValue: {
    fontSize: FONTS.sizes.title,
    fontWeight: FONTS.weights.bold,
    color: Colors.accent,
  },
});

export default MenuScreen; 