import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { Colors } from '../config/colors';
import { FONTS, SPACING, BORDER_RADIUS } from '../config/constants';

interface Props {
  navigation: any;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [audioEnabled, setAudioEnabled] = React.useState(true);
  const [vibrationEnabled, setVibrationEnabled] = React.useState(true);
  const [showFPS, setShowFPS] = React.useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>設定</Text>
      </View>

      <View style={styles.content}>
        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>音效設定</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>啟用音效</Text>
            <Switch
              value={audioEnabled}
              onValueChange={setAudioEnabled}
              trackColor={{ false: Colors.cardBackground, true: Colors.accent }}
              thumbColor={Colors.textPrimary}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>主音量</Text>
            <View style={styles.volumeContainer}>
              <Text style={styles.volumeText}>80%</Text>
            </View>
          </View>
        </View>

        {/* Graphics Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>圖形設定</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>顯示FPS</Text>
            <Switch
              value={showFPS}
              onValueChange={setShowFPS}
              trackColor={{ false: Colors.cardBackground, true: Colors.accent }}
              thumbColor={Colors.textPrimary}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>畫質</Text>
            <TouchableOpacity style={styles.qualityButton}>
              <Text style={styles.qualityText}>中等</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gameplay Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>遊戲設定</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>震動回饋</Text>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: Colors.cardBackground, true: Colors.accent }}
              thumbColor={Colors.textPrimary}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>自動暫停</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: Colors.cardBackground, true: Colors.accent }}
              thumbColor={Colors.textPrimary}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>帳戶</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>重置進度</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>備份存檔</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

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
    paddingHorizontal: SPACING.large,
  },
  section: {
    marginTop: SPACING.large,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.title,
    fontWeight: FONTS.weights.bold,
    color: Colors.textPrimary,
    marginBottom: SPACING.medium,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: FONTS.sizes.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  volumeContainer: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: BORDER_RADIUS.small,
  },
  volumeText: {
    fontSize: FONTS.sizes.caption,
    color: Colors.textSecondary,
  },
  qualityButton: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: BORDER_RADIUS.small,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qualityText: {
    fontSize: FONTS.sizes.caption,
    color: Colors.textPrimary,
  },
  actionButton: {
    backgroundColor: Colors.cardBackground,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: FONTS.sizes.body,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});

export default SettingsScreen; 