// authenticate.test.js
import {
    signUp,
    login,
    logout,
    resetPassword,
    checkUsernameExists,
    checkEmailExists,
  } from './authenticate';
  import { auth, db } from './firebaseConfig';
  import { addUser } from './user';
  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
  } from 'firebase/auth';
  import { collection, getDocs } from 'firebase/firestore';
  
  jest.mock('./firebaseConfig', () => ({
    auth: {},
    db: {},
  }));
  
  jest.mock('./user', () => ({
    addUser: jest.fn(),
  }));
  
  jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    updateProfile: jest.fn(),
  }));
  
  jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn(),
  }));
  
  describe('authenticate.js', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });
  
    afterEach(() => {
      jest.clearAllMocks();
      console.log.mockRestore();
      console.error.mockRestore();
    });
  
    describe('signUp', () => {
      it('should sign up a user successfully', async () => {
        const email = 'test@example.com';
        const password = 'password';
        const username = 'testuser';
        const displayName = 'Test User';
  
        const mockUser = { uid: '123', email };
        createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
        updateProfile.mockResolvedValue();
        addUser.mockResolvedValue();
  
        const result = await signUp(email, password, username, displayName);
  
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          auth,
          email,
          password
        );
        expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName });
        expect(addUser).toHaveBeenCalledWith(mockUser, username, displayName);
        expect(console.log).toHaveBeenCalledWith('User signed up:', mockUser);
        expect(result).toEqual(mockUser);
      });
  
      it('should return null on error', async () => {
        const email = 'test@example.com';
        const password = 'password';
        const username = 'testuser';
        const displayName = 'Test User';
  
        const error = new Error('Sign up failed');
        createUserWithEmailAndPassword.mockRejectedValue(error);
  
        const result = await signUp(email, password, username, displayName);
  
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          auth,
          email,
          password
        );
        expect(console.error).toHaveBeenCalledWith(
          `Error signing up with email ${email}: ${error.message}`
        );
        expect(result).toBeNull();
      });
    });
  
    describe('login', () => {
      it('should log in a user successfully', async () => {
        const email = 'test@example.com';
        const password = 'password';
  
        const mockUser = { uid: '123', email };
        signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
  
        const result = await login(email, password);
  
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          auth,
          email,
          password
        );
        expect(console.log).toHaveBeenCalledWith('User logged in:', mockUser);
        expect(result).toEqual(mockUser);
      });
  
      it('should return null on error', async () => {
        const email = 'test@example.com';
        const password = 'password';
  
        const error = new Error('Login failed');
        signInWithEmailAndPassword.mockRejectedValue(error);
  
        const result = await login(email, password);
  
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          auth,
          email,
          password
        );
        expect(console.error).toHaveBeenCalledWith(
          'Error logging in:',
          error.message
        );
        expect(result).toBeNull();
      });
    });
  
    describe('logout', () => {
      it('should log out a user successfully', async () => {
        signOut.mockResolvedValue();
  
        await logout();
  
        expect(signOut).toHaveBeenCalledWith(auth);
        expect(console.log).toHaveBeenCalledWith('User logged out');
      });
  
      it('should log error on failure', async () => {
        const error = new Error('Logout failed');
        signOut.mockRejectedValue(error);
  
        await logout();
  
        expect(signOut).toHaveBeenCalledWith(auth);
        expect(console.error).toHaveBeenCalledWith(
          'Error logging out:',
          error.message
        );
      });
    });
  
    describe('resetPassword', () => {
      it('should send password reset email successfully', async () => {
        const email = 'test@example.com';
        sendPasswordResetEmail.mockResolvedValue();
  
        const result = await resetPassword(email);
  
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, email);
        expect(console.log).toHaveBeenCalledWith('Password reset email sent');
        expect(result).toBe(true);
      });
  
      it('should return false on error', async () => {
        const email = 'test@example.com';
        const error = new Error('Reset password failed');
        sendPasswordResetEmail.mockRejectedValue(error);
  
        const result = await resetPassword(email);
  
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, email);
        expect(console.error).toHaveBeenCalledWith(
          'Error sending password reset email:',
          error.message
        );
        expect(result).toBe(false);
      });
    });
  
    describe('checkUsernameExists', () => {
      it('should return true if username exists', async () => {
        const username = 'existingUser';
        const mockDocs = [
          { data: () => ({ username: 'user1' }) },
          { data: () => ({ username: 'existingUser' }) },
        ];
        collection.mockReturnValue('usersCollection');
        getDocs.mockResolvedValue({ docs: mockDocs });
  
        const result = await checkUsernameExists(username);
  
        expect(collection).toHaveBeenCalledWith(db, 'users');
        expect(getDocs).toHaveBeenCalledWith('usersCollection');
        expect(result).toBe(true);
      });
  
      it('should return false if username does not exist', async () => {
        const username = 'newUser';
        const mockDocs = [
          { data: () => ({ username: 'user1' }) },
          { data: () => ({ username: 'user2' }) },
        ];
        collection.mockReturnValue('usersCollection');
        getDocs.mockResolvedValue({ docs: mockDocs });
  
        const result = await checkUsernameExists(username);
  
        expect(collection).toHaveBeenCalledWith(db, 'users');
        expect(getDocs).toHaveBeenCalledWith('usersCollection');
        expect(result).toBe(false);
      });
    });
  
    describe('checkEmailExists', () => {
      it('should return true if email exists', async () => {
        const email = 'test@example.com';
        const mockDocs = [
          { data: () => ({ email: 'user1@example.com' }) },
          { data: () => ({ email: 'test@example.com' }) },
        ];
        collection.mockReturnValue('usersCollection');
        getDocs.mockResolvedValue({ docs: mockDocs });
  
        const result = await checkEmailExists(email);
  
        expect(collection).toHaveBeenCalledWith(db, 'users');
        expect(getDocs).toHaveBeenCalledWith('usersCollection');
        expect(result).toBe(true);
      });
  
      it('should return false if email does not exist', async () => {
        const email = 'new@example.com';
        const mockDocs = [
          { data: () => ({ email: 'user1@example.com' }) },
          { data: () => ({ email: 'user2@example.com' }) },
        ];
        collection.mockReturnValue('usersCollection');
        getDocs.mockResolvedValue({ docs: mockDocs });
  
        const result = await checkEmailExists(email);
  
        expect(collection).toHaveBeenCalledWith(db, 'users');
        expect(getDocs).toHaveBeenCalledWith('usersCollection');
        expect(result).toBe(false);
      });
    });
  });
  