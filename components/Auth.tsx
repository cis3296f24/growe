import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { signUp, login, logout } from '../utils/authenticate';
import { User } from 'firebase/auth';
import Logo from '../assets/icons/logo.svg';

export function Auth() {
  const [step, setStep] = useState<'initial' | 'login-email' | 'login-password' | 'signup-email' | 'signup-username' | 'signup-password'>('initial');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
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
    setStep('initial');
  };

  return (
    <View style={styles.container}>
      <Logo width={50} height={50} style={styles.icon}/>
      {user ? (
        <View style={styles.userContainer}>
          <Text style={styles.welcomeText}>welcome {username ?? 'user'}.</Text>
          <Button title="logout" onPress={handleLogout} />
        </View>
      ) : (
        <View>
          {step === 'initial' && (
            <View style={styles.buttonContainer}>
              <Button title="sign up" onPress={() => setStep('signup-email')} />
              <Button title="login" onPress={() => setStep('login-email')} />
            </View>
          )}
          {step === 'login-email' && (
            <View>
              <TextInput
                placeholder="Email or Username"
                placeholderTextColor="gray"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
              <Button title="next" onPress={() => setStep('login-password')} />
            </View>
          )}
          {step === 'login-password' && (
            <View>
              <TextInput
                placeholder="Password"
                placeholderTextColor="gray"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
              <Button title="login" onPress={handleLogin} />
            </View>
          )}
          {step === 'signup-email' && (
            <View>
              <TextInput
                placeholder="Email"
                placeholderTextColor="gray"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
              <Button title="next" onPress={() => setStep('signup-username')} />
            </View>
          )}
          {step === 'signup-username' && (
            <View>
              <TextInput
                placeholder="Username"
                placeholderTextColor="gray"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
              />
              <Button title="next" onPress={() => setStep('signup-password')} />
            </View>
          )}
          {step === 'signup-password' && (
            <View>
              <TextInput
                placeholder="Password"
                placeholderTextColor="gray"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
              <Button title="sign up" onPress={handleSignUp} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginBottom: 12,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    paddingBottom: 128,
  },
  input: {
    height: 40,
    minWidth: 200,
    width: '100%',
    borderColor: 'lightgray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: 'black',
    borderRadius: 10,
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
