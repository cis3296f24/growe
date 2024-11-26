// Auth.test.js

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Auth } from './Auth';
import {
  signUp,
  login,
  logout,
  checkUsernameExists,
  checkEmailExists,
  resetPassword,
} from '../utils/authenticate';
import { useRouter } from 'expo-router';
import { useUser } from './UserContext';

// Mock the authentication functions
jest.mock('../utils/authenticate', () => ({
  signUp: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  checkUsernameExists: jest.fn(),
  checkEmailExists: jest.fn(),
  resetPassword: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('./UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('expo-font', () => ({
  useFonts: jest.fn().mockReturnValue([true]),
}));

// Mock the Logo component
jest.mock('../assets/icons/logo.svg', () => 'Logo');

describe('Auth Component', () => {
  const mockedRouterPush = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: mockedRouterPush });
    useUser.mockReturnValue({ user: null });
  });

  it('renders login email input by default', () => {
    const { getByPlaceholderText } = render(<Auth />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('shows error for invalid email', () => {
    const { getByPlaceholderText, getByText } = render(<Auth />);
    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(getByText('Continue'));
    expect(getByText('Please enter a valid email address')).toBeTruthy();
  });

  it('proceeds to login password step with valid email', () => {
    const { getByPlaceholderText, getByText, queryByPlaceholderText } = render(<Auth />);
    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(getByText('Continue'));
    expect(queryByPlaceholderText('Email')).toBeNull();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('calls login with correct credentials', async () => {
    login.mockResolvedValue(true); // mock successful login
    const { getByPlaceholderText, getByText } = render(<Auth />);
    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(getByText('Continue'));

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockedRouterPush).toHaveBeenCalledWith('./home');
    });
  });

  it('shows error on failed login', async () => {
    login.mockImplementation(() => {
      throw new Error('Invalid credentials');
    });
    const { getByPlaceholderText, getByText, findByText } = render(<Auth />);
    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(getByText('Continue'));

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(getByText('Login'));

    const errorText = await findByText(/Error logging in:/);
    expect(errorText).toBeTruthy();
  });

  it('navigates to signup email step when clicking Sign Up', () => {
    const { getByText, getByPlaceholderText } = render(<Auth />);
    fireEvent.press(getByText('Sign Up'));
    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('handles signup flow correctly', async () => {
    checkEmailExists.mockResolvedValue(false);
    checkUsernameExists.mockResolvedValue(false);
    signUp.mockResolvedValue(true);

    const { getByPlaceholderText, getByText } = render(<Auth />);
    fireEvent.press(getByText('Sign Up'));

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'newuser@example.com');
    fireEvent.press(getByText('Next'));

    const usernameInput = getByPlaceholderText('Username');
    fireEvent.changeText(usernameInput, 'newuser');
    const displayNameInput = getByPlaceholderText('Display Name');
    fireEvent.changeText(displayNameInput, 'New User');
    fireEvent.press(getByText('Next'));

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'newpassword');
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        'newuser@example.com',
        'newpassword',
        'newuser',
        'New User'
      );
      expect(mockedRouterPush).toHaveBeenCalledWith('./home');
    });
  });

  it('shows error if username already exists', async () => {
    checkEmailExists.mockResolvedValue(false);
    checkUsernameExists.mockResolvedValue(true);

    const { getByPlaceholderText, getByText, findByText } = render(<Auth />);
    fireEvent.press(getByText('Sign Up'));

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'newuser@example.com');
    fireEvent.press(getByText('Next'));

    const usernameInput = getByPlaceholderText('Username');
    fireEvent.changeText(usernameInput, 'existinguser');
    const displayNameInput = getByPlaceholderText('Display Name');
    fireEvent.changeText(displayNameInput, 'Existing User');
    fireEvent.press(getByText('Next'));

    const errorText = await findByText(/That username is already taken/);
    expect(errorText).toBeTruthy();
  });

  it('handles password reset', async () => {
    resetPassword.mockResolvedValue(true);

    const { getByPlaceholderText, getByText } = render(<Auth />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByText('Continue'));
    fireEvent.press(getByText('Forgot Password?'));

    fireEvent.press(getByText('Send Email'));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith('test@example.com');
      expect(getByText('Password reset email sent!')).toBeTruthy();
    });
  });

  it('shows error if password reset fails', async () => {
    resetPassword.mockResolvedValue(false);

    const { getByPlaceholderText, getByText, findByText } = render(<Auth />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByText('Continue'));
    fireEvent.press(getByText('Forgot Password?'));

    fireEvent.press(getByText('Send Email'));

    const errorText = await findByText('Error sending password reset email');
    expect(errorText).toBeTruthy();
  });

  it('handles logout correctly', async () => {
    useUser.mockReturnValue({ user: { email: 'user@example.com' } });
    const { getByText } = render(<Auth />);
    fireEvent.press(getByText('logout'));

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(getByText('Email')).toBeTruthy(); // Back to login email step
    });
  });
});
