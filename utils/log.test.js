// log.test.js
import { createLogEntry } from './log';
import { Timestamp, addDoc, collection, doc } from 'firebase/firestore';
import { updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { checkUserHasGroup } from '@/utils/group';

jest.mock('firebase/firestore', () => ({
  Timestamp: {
    now: jest.fn(),
  },
  addDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
}));

jest.mock('./firebaseConfig', () => ({
  db: {},
}));

jest.mock('@/utils/group', () => ({
  checkUserHasGroup: jest.fn(),
}));

describe('createLogEntry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a log entry successfully', async () => {
    // Arrange
    const user = { uid: 'user123' };
    const imageUrl = 'http://example.com/image.png';
    const userRef = { id: 'user123Ref' };
    const groupRefs = [{ id: 'group1' }, { id: 'group2' }];
    const logRef = { id: 'log123' };

    // Mock functions
    doc.mockReturnValue(userRef);
    checkUserHasGroup.mockResolvedValue(groupRefs);
    addDoc.mockResolvedValue(logRef);
    Timestamp.now.mockReturnValue('mockTimestamp');
    collection.mockReturnValue('logsCollection');
    arrayUnion.mockReturnValue('arrayUnionValue');

    // Act
    const result = await createLogEntry(user, imageUrl);

    // Assert
    expect(doc).toHaveBeenCalledWith(db, 'users', user.uid);
    expect(checkUserHasGroup).toHaveBeenCalledWith(user);
    expect(collection).toHaveBeenCalledWith(db, 'logs');
    expect(addDoc).toHaveBeenCalledWith('logsCollection', {
      author: userRef,
      voteUnsure: [],
      voteApprove: [],
      voteDeny: [],
      logImageUrl: imageUrl,
      loggedAt: 'mockTimestamp',
      group: groupRefs.at(-1),
    });
    expect(arrayUnion).toHaveBeenCalledWith(logRef.id);
    expect(updateDoc).toHaveBeenCalledWith(userRef, {
      logs: 'arrayUnionValue',
    });
    expect(result).toBe(logRef.id);
  });

  it('should throw an error if user is not found', async () => {
    // Arrange
    const user = null;
    const imageUrl = 'http://example.com/image.png';

    // Act & Assert
    await expect(createLogEntry(user, imageUrl)).rejects.toThrow('User not found');
  });

  it('should handle errors from addDoc', async () => {
    // Arrange
    const user = { uid: 'user123' };
    const imageUrl = 'http://example.com/image.png';
    const userRef = { id: 'user123Ref' };
    const groupRefs = [{ id: 'group1' }, { id: 'group2' }];
    const error = new Error('addDoc error');

    doc.mockReturnValue(userRef);
    checkUserHasGroup.mockResolvedValue(groupRefs);
    addDoc.mockRejectedValue(error);
    collection.mockReturnValue('logsCollection');

    // Act & Assert
    await expect(createLogEntry(user, imageUrl)).rejects.toThrow('addDoc error');
  });

  it('should handle errors from updateDoc', async () => {
    // Arrange
    const user = { uid: 'user123' };
    const imageUrl = 'http://example.com/image.png';
    const userRef = { id: 'user123Ref' };
    const groupRefs = [{ id: 'group1' }, { id: 'group2' }];
    const logRef = { id: 'log123' };
    const error = new Error('updateDoc error');

    doc.mockReturnValue(userRef);
    checkUserHasGroup.mockResolvedValue(groupRefs);
    addDoc.mockResolvedValue(logRef);
    Timestamp.now.mockReturnValue('mockTimestamp');
    collection.mockReturnValue('logsCollection');
    arrayUnion.mockReturnValue('arrayUnionValue');
    updateDoc.mockRejectedValue(error);

    // Act & Assert
    await expect(createLogEntry(user, imageUrl)).rejects.toThrow('updateDoc error');
  });
});
