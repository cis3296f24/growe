import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { signUp, login, logout, checkUsernameExists, checkEmailExists } from '../utils/authenticate';
import { User } from 'firebase/auth';
import Logo from '../assets/icons/logo.svg';
import { useRouter } from 'expo-router';

export function Auth() {
  const router = useRouter();
  const [step, setStep] = useState<'initial' | 'login-email' | 'login-password' | 'signup-email' | 'signup-username' | 'signup-password'>('initial');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(' ');

  const handleSignUp = async () => {
    const newUser = await signUp(email, password, username);
    if (newUser) {
      setUser(newUser);
      router.push({ pathname: '/home', params: {} });
    }
  };

  const handleStep = (newStep: typeof step) => {
    setStep(newStep);
    setError(' ');
  };

  const handleLogin = async () => {
    const loggedInUser = await login(email, password);
    if (!loggedInUser) {
      setError('Invalid email or password');
      return;
    }
    setUser(loggedInUser);
    router.push({ pathname: '/home', params: {} });
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setStep('initial');
  };

  const handleCheckUsername = async () => {
    const exists = await checkUsernameExists(username);
    if (exists) {
      setError('That username is already taken. Try another one.');
    } else {
      setPassword('');
      setStep('signup-password');
      setError(' ');
    }
  };

  const handleCheckEmail = async () => {
    const exists = await checkEmailExists(email);
    if (exists) {
      setError('That email is already in use. Log in instead.');
    } else {
      setStep('signup-username');
      setError(' ');
    }
  }

  const handleLoginPassword = () => {
    setPassword('');
    setStep('login-password');
  }

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
              <Button title="sign up" onPress={() => handleStep('signup-email')} />
              <Button title="login" onPress={() => handleStep('login-email')} />
            </View>
          )}
          {step === 'login-email' && (
            <View>
              <TextInput
                placeholder="Email"
                placeholderTextColor="gray"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.buttonContainer}>
                <Button title='back' onPress={() => handleStep('initial')} />
                {email.includes('@') && <Button title="next" onPress={handleLoginPassword} />}
              </View>
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
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.buttonContainer}>
                <Button title='back' onPress={() => handleStep('login-email')} />
                {password && <Button title="login" onPress={handleLogin} />}
              </View>
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
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.buttonContainer}>
                <Button title='back' onPress={() => handleStep('initial')} />
                {email.includes('@') && <Button title="next" onPress={handleCheckEmail} />}
              </View>
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
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.buttonContainer}>
                <Button title='back' onPress={() => handleStep('signup-email')}/>
                {username && <Button title="next" onPress={handleCheckUsername} />}
              </View>
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
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.buttonContainer}>
                <Button title='back' onPress={() => handleStep('signup-username')} />
                {password.length >= 6 && <Button title="sign up" onPress={handleSignUp} />}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: 'red',
  },
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
    minWidth: 300,
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
