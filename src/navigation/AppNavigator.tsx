import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// Import screens (temporarily comment out problematic imports)
// import MenuScreen from '../screens/MenuScreen';
// import GameScreen from '../screens/GameScreen';
// import CharacterSelectScreen from '../screens/CharacterSelectScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import GameOverScreen from '../screens/GameOverScreen';

// Temporary simple screens
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../config/colors';

const MenuScreen = ({ navigation }: any) => (
  <View style={styles.screen}>
    <Text style={styles.title}>倖存者任務</Text>
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.navigate('CharacterSelect')}
    >
      <Text style={styles.buttonText}>開始遊戲</Text>
    </TouchableOpacity>
  </View>
);

const CharacterSelectScreen = ({ navigation }: any) => (
  <View style={styles.screen}>
    <Text style={styles.title}>選擇角色</Text>
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.navigate('Game', { characterId: 'warrior' })}
    >
      <Text style={styles.buttonText}>戰士</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.buttonText}>返回</Text>
    </TouchableOpacity>
  </View>
);

const GameScreen = ({ navigation }: any) => (
  <View style={styles.screen}>
    <Text style={styles.title}>遊戲中</Text>
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.navigate('Menu')}
    >
      <Text style={styles.buttonText}>返回主選單</Text>
    </TouchableOpacity>
  </View>
);

const SettingsScreen = ({ navigation }: any) => (
  <View style={styles.screen}>
    <Text style={styles.title}>設定</Text>
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.buttonText}>返回</Text>
    </TouchableOpacity>
  </View>
);

const GameOverScreen = ({ navigation }: any) => (
  <View style={styles.screen}>
    <Text style={styles.title}>遊戲結束</Text>
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.navigate('Menu')}
    >
      <Text style={styles.buttonText}>返回主選單</Text>
    </TouchableOpacity>
  </View>
);

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Menu"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="CharacterSelect" component={CharacterSelectScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="GameOver" component={GameOverScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 40,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 200,
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AppNavigator; 