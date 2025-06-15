import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '../config/colors';
import { FONTS, SPACING } from '../config/constants';

interface Props {
  navigation: any; // Temporary any type to avoid navigation issues
}

const CharacterSelectScreen: React.FC<Props> = ({ navigation }) => {
  const handleCharacterSelect = (characterId: string) => {
    navigation.navigate('Game', { characterId });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>選擇角色</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.characterGrid}>
          <CharacterCard
            name="戰士"
            description="近戰專家"
            onPress={() => handleCharacterSelect('warrior')}
            unlocked={true}
          />
          <CharacterCard
            name="法師"
            description="魔法攻擊"
            onPress={() => handleCharacterSelect('mage')}
            unlocked={true}
          />
          <CharacterCard
            name="弓箭手"
            description="遠程攻擊"
            onPress={() => handleCharacterSelect('archer')}
            unlocked={false}
          />
          <CharacterCard
            name="盜賊"
            description="高速敏捷"
            onPress={() => handleCharacterSelect('rogue')}
            unlocked={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

interface CharacterCardProps {
  name: string;
  description: string;
  onPress: () => void;
  unlocked: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ name, description, onPress, unlocked }) => (
  <TouchableOpacity
    style={[styles.characterCard, !unlocked && styles.lockedCard]}
    onPress={unlocked ? onPress : undefined}
    disabled={!unlocked}
  >
    <View style={styles.characterAvatar}>
      <Text style={styles.avatarText}>{name[0]}</Text>
    </View>
    <Text style={[styles.characterName, !unlocked && styles.lockedText]}>{name}</Text>
    <Text style={[styles.characterDescription, !unlocked && styles.lockedText]}>
      {unlocked ? description : '未解鎖'}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: SPACING.small,
  },
  backButtonText: {
    fontSize: FONTS.sizes.body,
    color: Colors.accent,
    fontWeight: FONTS.weights.medium,
  },
  title: {
    fontSize: FONTS.sizes.heading,
    fontWeight: FONTS.weights.bold,
    color: Colors.textPrimary,
    marginLeft: SPACING.medium,
  },
  content: {
    flex: 1,
    padding: SPACING.large,
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  characterCard: {
    width: '48%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: SPACING.medium,
    alignItems: 'center',
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lockedCard: {
    opacity: 0.5,
  },
  characterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  avatarText: {
    fontSize: FONTS.sizes.heading,
    fontWeight: FONTS.weights.bold,
    color: Colors.textPrimary,
  },
  characterName: {
    fontSize: FONTS.sizes.title,
    fontWeight: FONTS.weights.bold,
    color: Colors.textPrimary,
    marginBottom: SPACING.tiny,
  },
  characterDescription: {
    fontSize: FONTS.sizes.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  lockedText: {
    color: Colors.textMuted,
  },
});

export default CharacterSelectScreen; 