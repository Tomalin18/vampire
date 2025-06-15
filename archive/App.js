import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function App() {
  const [message, setMessage] = useState('歡迎來到吸血鬼倖存者！');
  const [count, setCount] = useState(0);

  const handlePress = () => {
    setCount(count + 1);
    setMessage(`你點擊了 ${count + 1} 次！`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧛 吸血鬼倖存者</Text>
      <Text style={styles.subtitle}>測試版本</Text>
      <Text style={styles.message}>{message}</Text>
      
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>點我測試 ⚔️</Text>
      </TouchableOpacity>
      
      <Text style={styles.counter}>計數器: {count}</Text>
      
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  counter: {
    fontSize: 14,
    color: '#aaa',
  },
}); 