import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, SafeAreaView } from 'react-native';
import { signUp, login, logout, checkUsernameExists, checkEmailExists, resetPassword } from '@/utils/authenticate';
import { User } from 'firebase/auth';
import Logo from '../assets/icons/logo.svg';
import { useRouter } from 'expo-router';
import { useUser } from './UserContext';
import {
  Button as ButtonGluestack,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,
} from '@/components/ui/button';
import colors from 'tailwindcss/colors';
import { Input, InputField } from '@/components/ui/input';
import { useFonts } from 'expo-font';
import { Text as GlueText } from '@/components/ui/text';

export function Auth() {
  const router = useRouter();
  const [step, setStep] = useState<'initial' | 'login-email' | 'login-password' | 'signup-email' | 'signup-username' | 'signup-password' | 'reset-password'>('login-email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [fontsLoaded] = useFonts({
    "SF-Pro-Rounded-Regular": require("../assets/fonts/SF-Pro-Rounded-Regular.ttf"),
    "SF-Pro-Rounded-Bold": require("../assets/fonts/SF-Pro-Rounded-Bold.ttf"),
    "cmunci": require("../assets/fonts/cmunci.ttf"),
  });

  const handleSignUp = async () => {
    try {
      const newUser = await signUp(email, password, username, displayName);
      if (newUser) {
        router.push('./home');
      }
    } catch (e) {
      setError('Error signing up: ' + e);
    }
    return;
  };

  const handleStep = (newStep: typeof step) => {
    setStep(newStep);
    setError('');
  };

  const handleLogin = async () => {
    try {
      const loggedInUser = await login(email, password);
      if (!loggedInUser) {
        setError('Invalid email or password');
        return;
      }
    } catch (e) {
      setError('Error logging in: ' + e);
      return;
    }
    router.push('./home');
    return;
  };

  const handleLogout = async () => {
    try {
      await logout();
      setStep('login-email');
    } catch (e) {
      setError('Error logging out: ' + e);
    }
  };

  const handleCheckUsername = async () => {
    try {
      const exists = await checkUsernameExists(username);
      if (exists) {
        setError('That username is already taken. Try another one.');
      } else {
        setPassword('');
        setStep('signup-password');
        setError('');
      }
    } catch (e) {
      setError('Error checking username: ' + e);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(email);
    if (!valid) {
      setEmailValid(false);
      return false;
    } else {
      setEmailValid(true);
      setError('');
      return true;
    }
  }

  const handleCheckEmail = async () => {
    try {
      const exists = await checkEmailExists(email);
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
      if (exists) {
        setError('That email is already in use. Log in instead.');
      } else {
        setStep('signup-username');
        setError('');
      }
    } catch (e) {
      setError('Error checking email: ' + e);
    }
  }

  const handleLoginPassword = () => {
    setPassword('');
    setStep('login-password');
  }

  const handleResetPassword = async () => {
    const success = await resetPassword(email);
    if (success) {
      setError('Password reset email sent!');
      setStep('login-email');
    } else {
      setError('Error sending password reset email');
    }
  }

  return (
    <View style={styles.container}>
      <Logo width={50} height={50} style={styles.icon} />
      {user ? (
        <View style={styles.userContainer}>
          <Text style={styles.welcomeText}>welcome {username ?? 'user'}.</Text>
          <Button title="logout" onPress={handleLogout} />
          <Button title="go to groups" onPress={() => router.push(`./group`)} />
        </View>
      ) : (
        <View>
          {step === 'login-email' && (
            <View>
              <Input
                variant="outline"
                size="xl"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
                className='rounded-2xl min-w-72'
              >
                <InputField
                  className='font-regular'
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    isValidEmail(text);
                  }}
                />
              </Input>
              {error && <Text className='color-red-400 font-regular pl-1 pt-1'>{error}</Text>}
              <View className='pl-1 pt-2 flex-row'>
                <GlueText className="font-regular text-neutral-300" size='xl'>
                  Don't have an account?
                </GlueText>
                <ButtonGluestack size='xl' variant="link" onPress={() => handleStep('signup-email')} className='pl-1 h-auto min-h-0'>
                  <ButtonText className="font-regular text-primaryGreen">Sign Up</ButtonText>
                </ButtonGluestack>
              </View>
              <View className='flex-row justify-between pt-2'>
                <ButtonGluestack isDisabled={!emailValid} className="bg-primaryGreen p-2 rounded-2xl w-72" size="xl" variant="solid" action="primary" onPress={handleLoginPassword}>
                  <ButtonText className='font-bold'>Continue</ButtonText>
                </ButtonGluestack>
              </View>
            </View>
          )}
          {step === 'login-password' && (
            <View>
              <Input
                variant="outline"
                size="xl"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
                className='rounded-2xl min-w-72'
              >
                <InputField
                  className='font-regular'
                  placeholder="Password"
                  placeholderTextColor="gray"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </Input>
              {error && <Text className='color-red-400 font-regular pl-1 pt-1'>{error}</Text>}
              <View className='pt-2'>
                <ButtonGluestack
                  className={`pl-1 h-auto min-h-0 self-start`}
                  size="xl"
                  variant="link"
                  action="primary"
                  data-active={isActive}
                  onPressIn={() => setIsActive(true)}
                  onPressOut={() => setIsActive(false)}
                  onPress={() => handleStep('reset-password')}
                >
                  <ButtonText className='font-regular text-neutral-300'>Forgot Password?</ButtonText>
                </ButtonGluestack>
              </View>
              <View className='flex-row justify-between pt-2'>
                <ButtonGluestack
                  className={`bg-primaryGreen p-2 rounded-2xl w-16`}
                  size="xl"
                  variant="solid"
                  action="primary"
                  data-active={isActive}
                  onPressIn={() => setIsActive(true)}
                  onPressOut={() => setIsActive(false)}
                  onPress={() => handleStep('login-email')}
                >
                  <ButtonText className='font-bold'>Back</ButtonText>
                </ButtonGluestack>
                {emailValid &&
                  <ButtonGluestack className="bg-primaryGreen p-2 rounded-2xl w-20" size="xl" variant="solid" action="primary" onPress={handleLogin}>
                    <ButtonText className='font-bold'>Login</ButtonText>
                  </ButtonGluestack>}
              </View>
            </View>
          )}
          {step === 'signup-email' && (
            <View>
              <Input
                variant="outline"
                size="xl"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
                className='rounded-2xl min-w-72'
              >
                <InputField
                  className='font-regular'
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    isValidEmail(text);
                  }}
                />
              </Input>
              {error && <Text className='color-red-400 font-regular pl-1 pt-1'>{error}</Text>}
              <View className='pl-1 pt-2 flex-row'>
                <GlueText size='xl' className="font-regular text-neutral-300">
                  Already have an account?
                </GlueText>
                <ButtonGluestack size='xl' variant="link" onPress={() => handleStep('login-email')} className='pl-1 h-auto min-h-0'>
                  <ButtonText className="font-bold text-primaryGreen">Login</ButtonText>
                </ButtonGluestack>
              </View>
              <View className='flex-row justify-between pt-2'>
                <ButtonGluestack
                  className={`bg-primaryGreen p-2 rounded-2xl w-16`}
                  size="xl"
                  variant="solid"
                  action="primary"
                  data-active={isActive}
                  onPressIn={() => setIsActive(true)}
                  onPressOut={() => setIsActive(false)}
                  onPress={() => handleStep('login-email')}
                >
                  <ButtonText className='font-bold'>Back</ButtonText>
                </ButtonGluestack>
                {emailValid &&
                  <ButtonGluestack className="bg-primaryGreen p-2 rounded-2xl w-16" size="xl" variant="solid" action="primary" onPress={handleCheckEmail}>
                    <ButtonText className='font-bold'>Next</ButtonText>
                  </ButtonGluestack>}
              </View>
            </View>
          )}
          {step === 'signup-username' && (
            <View className='flex-col'>
              <Input
                variant="outline"
                size="xl"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
                className='rounded-2xl min-w-72'
              >
                <InputField
                  className='font-regular'
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                />
              </Input>
              <View className='pt-3'>
                <Input
                  variant="outline"
                  size="xl"
                  isDisabled={false}
                  isInvalid={false}
                  isReadOnly={false}
                  className='rounded-2xl min-w-72'
                >
                  <InputField
                    className='font-regular'
                    placeholder="Display Name"
                    value={displayName}
                    onChangeText={setDisplayName}
                  />
                </Input>
              </View>
              {error && <Text className='color-red-400 font-regular pl-1'>{error}</Text>}
              <View className='flex-row justify-between pt-3'>
                <ButtonGluestack
                  className={`bg-primaryGreen p-2 rounded-2xl w-16`}
                  size="xl"
                  variant="solid"
                  action="primary"
                  data-active={isActive}
                  onPressIn={() => setIsActive(true)}
                  onPressOut={() => setIsActive(false)}
                  onPress={() => handleStep('signup-email')}
                >
                  <ButtonText className='font-bold'>Back</ButtonText>
                </ButtonGluestack>
                {(username && displayName) &&
                  <ButtonGluestack className="bg-primaryGreen p-2 rounded-2xl w-16" size="xl" variant="solid" action="primary" onPress={handleCheckUsername}>
                    <ButtonText className='font-bold'>Next</ButtonText>
                  </ButtonGluestack>}
              </View>
            </View>
          )}
          {step === 'signup-password' && (
            <View className='flex-col'>
              <Input
                variant="outline"
                size="xl"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
                className='rounded-2xl min-w-72'
              >
                <InputField
                  className='font-regular'
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </Input>
              {error && <Text className='color-red-400 font-regular pl-1'>{error}</Text>}
              <View className='flex-row justify-between pt-3'>
                <ButtonGluestack
                  className={`bg-primaryGreen p-2 rounded-2xl w-16`}
                  size="xl"
                  variant="solid"
                  action="primary"
                  data-active={isActive}
                  onPressIn={() => setIsActive(true)}
                  onPressOut={() => setIsActive(false)}
                  onPress={() => handleStep('signup-username')}
                >
                  <ButtonText className='font-bold'>Back</ButtonText>
                </ButtonGluestack>
                {password.length >= 6 &&
                  <ButtonGluestack className="bg-primaryGreen p-2 rounded-2xl w-24" size="xl" variant="solid" action="primary" onPress={handleSignUp}>
                    <ButtonText className='font-bold'>Sign Up</ButtonText>
                  </ButtonGluestack>}
              </View>
            </View>
          )}
          {step === 'reset-password' && (
            <View className='flex-col'>
              <Input
                variant="outline"
                size="xl"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
                className='rounded-2xl min-w-72'
              >
                <InputField
                  className='font-regular'
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    isValidEmail(text);
                  }}
                />
              </Input>
              {error && <Text className='color-red-400 font-regular pl-1 pt-1'>{error}</Text>}
              <View className='flex-row justify-between pt-3'>
                <ButtonGluestack
                  className={`bg-primaryGreen p-2 rounded-2xl w-16`}
                  size="xl"
                  variant="solid"
                  action="primary"
                  data-active={isActive}
                  onPressIn={() => setIsActive(true)}
                  onPressOut={() => setIsActive(false)}
                  onPress={() => handleStep('login-email')}
                >
                  <ButtonText className='font-bold'>Back</ButtonText>
                </ButtonGluestack>
                {emailValid &&
                  <ButtonGluestack className="bg-primaryGreen p-2 rounded-2xl w-32" size="xl" variant="solid" action="primary" onPress={handleResetPassword}>
                    <ButtonText className='font-bold'>Send Email</ButtonText>
                  </ButtonGluestack>}
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
    color: '#8F9C8F',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    paddingBottom: 128,
    backgroundColor: '#596558',
  },
  input: {
    height: 40,
    minWidth: 300,
    width: '100%',
    borderColor: 'lightgray',
    borderWidth: 1,
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
