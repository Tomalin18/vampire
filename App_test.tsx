import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function App() {
  const [message, setMessage] = React.useState('Hello, Vampire Survivors!');
  const [count, setCount] = React.useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧛 測試版本</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.counter}>點擊次數: {count}</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          setCount(count + 1);
          setMessage(`你點擊了 ${count + 1} 次!`);
        }}
      >
        <Text style={styles.buttonText}>點我測試</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  counter: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 