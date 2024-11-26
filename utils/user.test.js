// user.test.js

import { checkPendingVotes, updateUserVote, addUser } from './user';
import { db } from './firebaseConfig';

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';

// Mock the Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  Timestamp: {
    now: jest.fn(),
  },
}));

// Mock firebaseConfig
jest.mock('./firebaseConfig', () => ({
  db: {},
}));

describe('addUser', () => {
  it('should add a user to the users collection and return the user', async () => {
    const { setDoc, doc, collection, Timestamp } = require('firebase/firestore');

    const mockSetDoc = jest.fn().mockResolvedValue();
    const mockDoc = jest.fn();
    const mockCollection = jest.fn();
    const mockTimestampNow = jest.fn().mockReturnValue('mockTimestamp');

    setDoc.mockImplementation(mockSetDoc);
    doc.mockImplementation(mockDoc);
    collection.mockImplementation(mockCollection);
    Timestamp.now.mockImplementation(mockTimestampNow);

    const user = { uid: 'user123', email: 'user@example.com' };
    const username = 'testuser';
    const displayName = 'Test User';

    const usersCollectionRef = {};
    const userDocRef = {};

    mockCollection.mockReturnValue(usersCollectionRef);
    mockDoc.mockReturnValue(userDocRef);

    const result = await addUser(user, username, displayName);

    expect(collection).toHaveBeenCalledWith(db, 'users');
    expect(doc).toHaveBeenCalledWith(usersCollectionRef, user.uid);
    expect(setDoc).toHaveBeenCalledWith(userDocRef, {
      email: user.email,
      username,
      displayName,
      createdAt: 'mockTimestamp',
      profileImageUrl: null,
      groups: [],
      friends: [],
      friendRequests: [],
      notifications: [],
      groupInvites: [],
      settings: {
        notifications: true,
        emailNotifications: true,
      },
      credits: 0,
      pledges: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
      logs: [],
      online: true,
      lastOnline: 'mockTimestamp',
    });
    expect(result).toEqual(user);
  });

  it('should throw an error if setDoc fails', async () => {
    const { setDoc, doc, collection, Timestamp } = require('firebase/firestore');

    const mockSetDoc = jest.fn().mockRejectedValue(new Error('setDoc failed'));
    const mockDoc = jest.fn();
    const mockCollection = jest.fn();
    const mockTimestampNow = jest.fn().mockReturnValue('mockTimestamp');

    setDoc.mockImplementation(mockSetDoc);
    doc.mockImplementation(mockDoc);
    collection.mockImplementation(mockCollection);
    Timestamp.now.mockImplementation(mockTimestampNow);

    const user = { uid: 'user123', email: 'user@example.com' };
    const username = 'testuser';
    const displayName = 'Test User';

    const usersCollectionRef = {};
    const userDocRef = {};

    mockCollection.mockReturnValue(usersCollectionRef);
    mockDoc.mockReturnValue(userDocRef);

    await expect(addUser(user, username, displayName)).rejects.toThrow('setDoc failed');
  });
});

describe('updateUserVote', () => {
  it('should update the user vote correctly for valid voteType', async () => {
    const { updateDoc, arrayUnion } = require('firebase/firestore');

    const mockUpdateDoc = jest.fn().mockResolvedValue();
    const mockArrayUnion = jest.fn().mockReturnValue('mockArrayUnionValue');

    updateDoc.mockImplementation(mockUpdateDoc);
    arrayUnion.mockImplementation(mockArrayUnion);

    const logRef = 'logRef123';
    const userRef = 'userRef123';
    const voteType = 'approve';

    const result = await updateUserVote(logRef, userRef, voteType);

    expect(updateDoc).toHaveBeenCalledWith(logRef, {
      voteApprove: 'mockArrayUnionValue',
    });
    expect(arrayUnion).toHaveBeenCalledWith(userRef);
    expect(result).toBe(true);
  });

  it('should return false and log error for invalid voteType', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await updateUserVote('logRef123', 'userRef123', 'invalidVoteType');

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error updating user vote:',
      new Error('Invalid vote type. Must be "approve", "deny", or "unsure".')
    );

    consoleErrorSpy.mockRestore();
  });

  it('should return false if updateDoc fails', async () => {
    const { updateDoc, arrayUnion } = require('firebase/firestore');

    const mockUpdateDoc = jest.fn().mockRejectedValue(new Error('updateDoc failed'));
    const mockArrayUnion = jest.fn().mockReturnValue('mockArrayUnionValue');

    updateDoc.mockImplementation(mockUpdateDoc);
    arrayUnion.mockImplementation(mockArrayUnion);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await updateUserVote('logRef123', 'userRef123', 'approve');

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating user vote:', new Error('updateDoc failed'));

    consoleErrorSpy.mockRestore();
  });
});

describe('checkPendingVotes', () => {
  it('should return false and log error if user is undefined', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await checkPendingVotes(undefined);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith('User UID is undefined');

    consoleErrorSpy.mockRestore();
  });

  it('should return false if user has no groups', async () => {
    const { getDoc, doc } = require('firebase/firestore');

    const mockGetDoc = jest.fn().mockResolvedValue({
      data: () => ({
        groups: [],
      }),
    });
    const mockDoc = jest.fn().mockReturnValue('userDocRef');

    getDoc.mockImplementation(mockGetDoc);
    doc.mockImplementation(mockDoc);

    const user = { uid: 'user123' };

    const result = await checkPendingVotes(user);

    expect(result).toBe(false);
  });

  it('should return false if user has groups but no logs', async () => {
    const { getDoc, getDocs, doc, collection, query, where } = require('firebase/firestore');

    const mockGetDoc = jest.fn().mockResolvedValue({
      data: () => ({
        groups: ['groupRef1', 'groupRef2'],
      }),
    });

    const mockGetDocs = jest.fn().mockResolvedValue({
      forEach: jest.fn(),
    });

    const mockDoc = jest.fn().mockReturnValue('userDocRef');
    const mockCollection = jest.fn().mockReturnValue('logsCollectionRef');
    const mockQuery = jest.fn().mockReturnValue('logsQuery');
    const mockWhere = jest.fn().mockReturnValue('whereCondition');

    getDoc.mockImplementation(mockGetDoc);
    getDocs.mockImplementation(mockGetDocs);
    doc.mockImplementation(mockDoc);
    collection.mockImplementation(mockCollection);
    query.mockImplementation(mockQuery);
    where.mockImplementation(mockWhere);

    const user = { uid: 'user123' };

    const result = await checkPendingVotes(user);

    expect(result).toBe(false);
  });

  it('should return false if user has voted on all logs', async () => {
    const { getDoc, getDocs, doc, collection, query, where } = require('firebase/firestore');

    const mockGetDoc = jest.fn().mockResolvedValue({
      data: () => ({
        groups: ['groupRef1'],
      }),
    });

    const userRefPath = 'users/user123';
    const mockDoc = jest.fn().mockImplementation((dbParam, collectionName, uid) => {
      if (collectionName === 'users') {
        return { path: userRefPath };
      }
      return {};
    });

    const mockGetDocs = jest.fn().mockResolvedValue({
      forEach: (callback) => {
        const logDoc = {
          data: () => ({
            voteApprove: [userRefPath],
            voteDeny: [],
            voteUnsure: [],
          }),
          ref: 'logRef1',
        };
        callback(logDoc);
      },
    });

    const mockCollection = jest.fn().mockReturnValue('logsCollectionRef');
    const mockQuery = jest.fn().mockReturnValue('logsQuery');
    const mockWhere = jest.fn().mockReturnValue('whereCondition');

    getDoc.mockImplementation(mockGetDoc);
    getDocs.mockImplementation(mockGetDocs);
    doc.mockImplementation(mockDoc);
    collection.mockImplementation(mockCollection);
    query.mockImplementation(mockQuery);
    where.mockImplementation(mockWhere);

    const user = { uid: 'user123' };

    const result = await checkPendingVotes(user);

    expect(result).toBe(false);
  });

  it('should return pendingVotes if user has not voted on some logs', async () => {
    const { getDoc, getDocs, doc, collection, query, where } = require('firebase/firestore');

    const mockGetDoc = jest.fn().mockResolvedValue({
      data: () => ({
        groups: ['groupRef1'],
      }),
    });

    const userRefPath = 'users/user123';
    const userRef = { path: userRefPath };
    const mockDoc = jest.fn().mockImplementation((dbParam, collectionName, uid) => {
      if (collectionName === 'users') {
        return userRef;
      }
      return {};
    });

    const pendingLogRef = 'logRefPendingVote';
    const mockGetDocs = jest.fn().mockResolvedValue({
      forEach: (callback) => {
        const logDocVoted = {
          data: () => ({
            voteApprove: [userRefPath],
            voteDeny: [],
            voteUnsure: [],
          }),
          ref: 'logRefVoted',
        };
        const logDocNotVoted = {
          data: () => ({
            voteApprove: [],
            voteDeny: [],
            voteUnsure: [],
          }),
          ref: pendingLogRef,
        };
        callback(logDocVoted);
        callback(logDocNotVoted);
      },
    });

    const mockCollection = jest.fn().mockReturnValue('logsCollectionRef');
    const mockQuery = jest.fn().mockReturnValue('logsQuery');
    const mockWhere = jest.fn().mockReturnValue('whereCondition');

    getDoc.mockImplementation(mockGetDoc);
    getDocs.mockImplementation(mockGetDocs);
    doc.mockImplementation(mockDoc);
    collection.mockImplementation(mockCollection);
    query.mockImplementation(mockQuery);
    where.mockImplementation(mockWhere);

    const user = { uid: 'user123' };

    const result = await checkPendingVotes(user);

    expect(result).toEqual([pendingLogRef]);
  });

  it('should catch errors and return default error response when getDoc fails', async () => {
    const { getDoc, doc } = require('firebase/firestore');

    const mockGetDoc = jest.fn().mockRejectedValue(new Error('getDoc failed'));
    const mockDoc = jest.fn();

    getDoc.mockImplementation(mockGetDoc);
    doc.mockImplementation(mockDoc);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const user = { uid: 'user123' };

    const result = await checkPendingVotes(user);

    expect(result).toEqual({ hasPendingVotes: false, pendingVotes: [] });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error checking pending votes: ', new Error('getDoc failed'));

    consoleErrorSpy.mockRestore();
  });
});
