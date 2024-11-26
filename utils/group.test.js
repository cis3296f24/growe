// group.test.js

import { checkUserHasGroup, createGroup, joinGroup } from './group';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  addDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

describe('Group functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkUserHasGroup', () => {
    it('should return groups if user has groups', async () => {
      const user = { uid: 'user123' };
      const mockUserRef = {};
      const mockUserSnapshot = {
        data: () => ({
          groups: ['group1', 'group2'],
        }),
      };

      doc.mockReturnValue(mockUserRef);
      getDoc.mockResolvedValue(mockUserSnapshot);

      const result = await checkUserHasGroup(user);
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', user.uid);
      expect(getDoc).toHaveBeenCalledWith(mockUserRef);
      expect(result).toEqual(['group1', 'group2']);
    });

    it('should return false if user has no groups', async () => {
      const user = { uid: 'user123' };
      const mockUserRef = {};
      const mockUserSnapshot = {
        data: () => ({
          groups: [],
        }),
      };

      doc.mockReturnValue(mockUserRef);
      getDoc.mockResolvedValue(mockUserSnapshot);

      const result = await checkUserHasGroup(user);
      expect(result).toBe(false);
    });

    it('should return false if user data is empty', async () => {
      const user = { uid: 'user123' };
      const mockUserRef = {};
      const mockUserSnapshot = {
        data: () => ({}),
      };

      doc.mockReturnValue(mockUserRef);
      getDoc.mockResolvedValue(mockUserSnapshot);

      const result = await checkUserHasGroup(user);
      expect(result).toBe(false);
    });

    it('should throw error if getDoc fails', async () => {
      const user = { uid: 'user123' };
      const mockUserRef = {};
      const mockError = new Error('Failed to get document');

      doc.mockReturnValue(mockUserRef);
      getDoc.mockRejectedValue(mockError);

      await expect(checkUserHasGroup(user)).rejects.toThrow(
        'Failed to get document'
      );
    });
  });

  describe('createGroup', () => {
    it('should create a group successfully when user has existing groups', async () => {
      const user = { uid: 'user123' };
      const groupName = 'Test Group';
      const habit = 'Exercise';
      const frequency = 'Daily';

      const mockGroupRef = {};
      const mockUserRef = {};
      const mockUserSnapshot = {
        data: () => ({
          groups: ['group1', 'group2'],
        }),
      };

      const mockNewGroupDoc = {};

      collection.mockReturnValue(mockGroupRef);
      doc.mockReturnValue(mockUserRef);
      getDoc.mockResolvedValue(mockUserSnapshot);
      addDoc.mockResolvedValue(mockNewGroupDoc);
      updateDoc.mockResolvedValue();

      // Mock Math.random
      jest.spyOn(Math, 'random').mockReturnValue(0.123456);

      const result = await createGroup(
        user,
        groupName,
        habit,
        frequency
      );

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'groups');
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', user.uid);
      expect(getDoc).toHaveBeenCalledWith(mockUserRef);
      expect(addDoc).toHaveBeenCalledWith(
        mockGroupRef,
        expect.objectContaining({
          users: [mockUserRef],
          name: groupName,
          admin: mockUserRef,
          habit: habit,
          frequency: frequency,
          garden: null,
          streak: 0,
          joinCode: '3V1ROK', // Based on the mocked Math.random
        })
      );
      expect(updateDoc).toHaveBeenCalledWith(mockUserRef, {
        groups: [...mockUserSnapshot.data().groups, mockNewGroupDoc],
      });
      expect(result).toBe(mockNewGroupDoc);

      // Restore Math.random
      Math.random.mockRestore();
    });

    it('should create a group successfully when user has no existing groups', async () => {
      const user = { uid: 'user123' };
      const groupName = 'Test Group';
      const habit = 'Exercise';
      const frequency = 'Daily';

      const mockGroupRef = {};
      const mockUserRef = {};
      const mockUserSnapshot = {
        data: () => ({
          groups: [],
        }),
      };

      const mockNewGroupDoc = {};

      collection.mockReturnValue(mockGroupRef);
      doc.mockReturnValue(mockUserRef);
      getDoc.mockResolvedValue(mockUserSnapshot);
      addDoc.mockResolvedValue(mockNewGroupDoc);
      updateDoc.mockResolvedValue();

      // Mock Math.random
      jest.spyOn(Math, 'random').mockReturnValue(0.123456);

      const result = await createGroup(
        user,
        groupName,
        habit,
        frequency
      );

      expect(updateDoc).toHaveBeenCalledWith(mockUserRef, {
        groups: [mockNewGroupDoc],
      });
      expect(result).toBe(mockNewGroupDoc);

      // Restore Math.random
      Math.random.mockRestore();
    });

    it('should return false if user UID is undefined', async () => {
      const user = {};
      const groupName = 'Test Group';
      const habit = 'Exercise';
      const frequency = 'Daily';

      console.error = jest.fn();

      const result = await createGroup(
        user,
        groupName,
        habit,
        frequency
      );

      expect(console.error).toHaveBeenCalledWith('User UID is undefined');
      expect(result).toBe(false);
    });

    it('should throw error if getDoc fails', async () => {
      const user = { uid: 'user123' };
      const groupName = 'Test Group';
      const habit = 'Exercise';
      const frequency = 'Daily';

      const mockUserRef = {};
      const mockError = new Error('Failed to get document');

      doc.mockReturnValue(mockUserRef);
      getDoc.mockRejectedValue(mockError);

      await expect(
        createGroup(user, groupName, habit, frequency)
      ).rejects.toThrow('Failed to get document');
    });
  });

  describe('joinGroup', () => {
    it('should join group successfully when joinCode matches', async () => {
      const user = { uid: 'user123' };
      const joinCode = 'ABCDEF';

      const mockGroupsCollectionRef = {};
      const mockQuery = {};
      const mockGroupDocRef = {};
      const mockGroupDocSnapshot = {
        ref: mockGroupDocRef,
        data: () => ({
          users: ['userRef1', 'userRef2'],
        }),
      };
      const mockQuerySnapshot = {
        size: 1,
        docs: [mockGroupDocSnapshot],
      };
      const mockUserRef = {};
      const mockUserSnapshot = {
        data: () => ({
          groups: ['groupRef1', 'groupRef2'],
        }),
      };
      const mockGroupRef = mockGroupDocRef;

      collection.mockReturnValue(mockGroupsCollectionRef);
      where.mockReturnValue('whereResult');
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue(mockQuerySnapshot);
      doc.mockReturnValue(mockUserRef);
      getDoc.mockResolvedValue(mockUserSnapshot);
      updateDoc.mockResolvedValue();

      const result = await joinGroup(user, joinCode);

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'groups');
      expect(where).toHaveBeenCalledWith('joinCode', '==', joinCode);
      expect(query).toHaveBeenCalledWith(
        mockGroupsCollectionRef,
        'whereResult'
      );
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', user.uid);
      expect(getDoc).toHaveBeenCalledWith(mockUserRef);
      expect(updateDoc).toHaveBeenCalledWith(mockUserRef, {
        groups: [...mockUserSnapshot.data().groups, mockGroupRef],
      });
      expect(updateDoc).toHaveBeenCalledWith(mockGroupRef, {
        users: [...mockGroupDocSnapshot.data().users, mockUserRef],
      });
      expect(result).toBe(mockGroupRef);
    });

    it('should return false when joinCode does not match any group', async () => {
      const user = { uid: 'user123' };
      const joinCode = 'INVALID';

      const mockGroupsCollectionRef = {};
      const mockQuery = {};
      const mockQuerySnapshot = {
        size: 0,
        docs: [],
      };

      collection.mockReturnValue(mockGroupsCollectionRef);
      where.mockReturnValue('whereResult');
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await joinGroup(user, joinCode);

      expect(result).toBe(false);
    });

    it('should return false when querySnapshot has no docs', async () => {
      const user = { uid: 'user123' };
      const joinCode = 'INVALID';

      const mockGroupsCollectionRef = {};
      const mockQuery = {};
      const mockQuerySnapshot = {
        size: 1,
        docs: [],
      };

      collection.mockReturnValue(mockGroupsCollectionRef);
      where.mockReturnValue('whereResult');
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await joinGroup(user, joinCode);

      expect(result).toBe(false);
    });

    it('should throw error if getDocs fails', async () => {
      const user = { uid: 'user123' };
      const joinCode = 'ABCDEF';

      const mockGroupsCollectionRef = {};
      const mockQuery = {};
      const mockError = new Error('Failed to get documents');

      collection.mockReturnValue(mockGroupsCollectionRef);
      where.mockReturnValue('whereResult');
      query.mockReturnValue(mockQuery);
      getDocs.mockRejectedValue(mockError);

      await expect(joinGroup(user, joinCode)).rejects.toThrow(
        'Failed to get documents'
      );
    });

    it('should throw error if getDoc fails', async () => {
      const user = { uid: 'user123' };
      const joinCode = 'ABCDEF';

      const mockGroupsCollectionRef = {};
      const mockQuery = {};
      const mockGroupDocRef = {};
      const mockGroupDocSnapshot = {
        ref: mockGroupDocRef,
        data: () => ({
          users: ['userRef1', 'userRef2'],
        }),
      };
      const mockQuerySnapshot = {
        size: 1,
        docs: [mockGroupDocSnapshot],
      };
      const mockUserRef = {};
      const mockError = new Error('Failed to get document');

      collection.mockReturnValue(mockGroupsCollectionRef);
      where.mockReturnValue('whereResult');
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue(mockQuerySnapshot);
      doc.mockReturnValue(mockUserRef);
      getDoc.mockRejectedValue(mockError);

      await expect(joinGroup(user, joinCode)).rejects.toThrow(
        'Failed to get document'
      );
    });
  });
});
