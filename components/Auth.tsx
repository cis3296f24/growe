import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { signUp, login, logout } from '../utils/authenticate';
import { User } from 'firebase/auth'; // Adjust the import path based on your setup

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const handleSignUp = async () => {
    const newUser = await signUp(email, password);
    setUser(newUser);
  };

  const handleLogin = async () => {
    const loggedInUser = await login(email, password);
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>growe</Text>
      <TextInput
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {user ? (
        <View style={styles.userContainer}>
          <Text style={styles.welcomeText}>Welcome, {user.email ?? 'User'}!</Text>
          <Button title="logout" onPress={handleLogout} />
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="sign up" onPress={handleSignUp} />
          <Button title="login" onPress={handleLogin} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  userContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
