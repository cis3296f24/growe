import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Group } from './Group';

jest.mock('./UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('../utils/group', () => ({
  checkUserHasGroup: jest.fn(),
  joinGroup: jest.fn(),
  createGroup: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  DocumentReference: jest.fn(),
  DocumentSnapshot: jest.fn(),
}));

describe('Group component', () => {
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = { displayName: 'Test User' };
    require('./UserContext').useUser.mockReturnValue({ user: mockUser });
  });

  test('renders initial step when user has no groups', async () => {
    // Mock checkUserHasGroup to return empty array
    require('../utils/group').checkUserHasGroup.mockResolvedValue([]);

    const { getByText } = render(<Group />);

    // Wait for useEffect to complete
    await act(async () => {});

    expect(getByText('Welcome to your garden.')).toBeTruthy();
    expect(getByText("It's time to plant a new seed.")).toBeTruthy();
    expect(getByText('Create a Group')).toBeTruthy();
    expect(getByText('Join a Group')).toBeTruthy();
  });

  test('renders group information when user has a group', async () => {
    // Mock DocumentReference and DocumentSnapshot
    const mockGroupRef = { id: 'group1' };
    const mockUserRef = { id: 'user1' };

    const mockGroupSnapshot = {
      exists: () => true,
      get: jest.fn((field) => {
        switch (field) {
          case 'users':
            return [mockUserRef];
          case 'habit':
            return 'Go for a walk';
          case 'frequency':
            return 3;
          case 'name':
            return "Test User's group";
          case 'joinCode':
            return 'ABC123';
          default:
            return null;
        }
      }),
    };

    const mockUserSnapshot = {
      exists: () => true,
      get: jest.fn((field) => {
        switch (field) {
          case 'displayName':
            return 'Test User';
          default:
            return null;
        }
      }),
    };

    // Mock checkUserHasGroup to return array with one group reference
    require('../utils/group').checkUserHasGroup.mockResolvedValue([mockGroupRef]);

    // Mock getDoc to return group data when called with group reference
    const { getDoc } = require('firebase/firestore');
    getDoc.mockImplementation(async (ref) => {
      if (ref === mockGroupRef) {
        return mockGroupSnapshot;
      } else if (ref === mockUserRef) {
        return mockUserSnapshot;
      } else {
        return { exists: () => false };
      }
    });

    const { getByText } = render(<Group />);

    // Wait for useEffect to complete
    await act(async () => {});

    expect(getByText('Group Code: ABC123')).toBeTruthy();
    expect(getByText("Group Name: Test User's group")).toBeTruthy();
    expect(getByText('Habit: Go for a walk')).toBeTruthy();
    expect(getByText('Frequency: 3')).toBeTruthy();
    expect(getByText('Members:')).toBeTruthy();
    expect(getByText('Test User')).toBeTruthy();
  });

  test('navigates to group name step when Create a Group is pressed', async () => {
    require('../utils/group').checkUserHasGroup.mockResolvedValue([]);

    const { getByText, queryByText } = render(<Group />);

    // Wait for useEffect to complete
    await act(async () => {});

    const createGroupButton = getByText('Create a Group');

    act(() => {
      fireEvent.press(createGroupButton);
    });

    expect(getByText("What is the group's name?")).toBeTruthy();
    expect(queryByText('Create a Group')).toBeNull();
  });

  test('handles creating a group successfully', async () => {
    require('../utils/group').checkUserHasGroup.mockResolvedValue([]);

    const mockNewGroupRef = { id: 'group1' };

    require('../utils/group').createGroup.mockResolvedValue(mockNewGroupRef);

    const { getByText, getByPlaceholderText } = render(<Group />);

    // Wait for useEffect to complete
    await act(async () => {});

    // Navigate to 'name-group' step
    act(() => {
      fireEvent.press(getByText('Create a Group'));
    });

    // Enter group name
    const groupNameInput = getByPlaceholderText('Group Name');
    act(() => {
      fireEvent.changeText(groupNameInput, 'My Test Group');
    });

    // Press Next to go to 'create-habit' step
    act(() => {
      fireEvent.press(getByText('Next'));
    });

    // Enter habit
    const habitInput = getByPlaceholderText('Habit');
    act(() => {
      fireEvent.changeText(habitInput, 'Read a book');
    });

    // Press Next to go to 'set-frequency' step
    act(() => {
      fireEvent.press(getByText('Next'));
    });

    // Press 'Create Group'
    act(() => {
      fireEvent.press(getByText('Create Group'));
    });

    // Mock getDoc to return group data
    const { getDoc } = require('firebase/firestore');
    const mockGroupSnapshot = {
      exists: () => true,
      get: jest.fn((field) => {
        switch (field) {
          case 'users':
            return [{ id: 'user1' }];
          case 'habit':
            return 'Read a book';
          case 'frequency':
            return 3;
          case 'name':
            return 'My Test Group';
          case 'joinCode':
            return 'ABC123';
          default:
            return null;
        }
      }),
    };

    const mockUserSnapshot = {
      exists: () => true,
      get: jest.fn(() => 'Test User'),
    };

    getDoc.mockImplementation(async (ref) => {
      if (ref === mockNewGroupRef) {
        return mockGroupSnapshot;
      } else {
        return mockUserSnapshot;
      }
    });

    // Wait for async operations to complete
    await act(async () => {});

    // Now, the component should show the group information
    expect(getByText('Group Code: ABC123')).toBeTruthy();
    expect(getByText('Group Name: My Test Group')).toBeTruthy();
    expect(getByText('Habit: Read a book')).toBeTruthy();
    expect(getByText('Frequency: 3')).toBeTruthy();
    expect(getByText('Members:')).toBeTruthy();
    expect(getByText('Test User')).toBeTruthy();
  });

  test('displays error when creating group fails', async () => {
    require('../utils/group').checkUserHasGroup.mockResolvedValue([]);

    require('../utils/group').createGroup.mockResolvedValue(null);

    const { getByText, getByPlaceholderText } = render(<Group />);

    // Wait for useEffect to complete
    await act(async () => {});

    // Navigate to 'name-group' step
    act(() => {
      fireEvent.press(getByText('Create a Group'));
    });

    // Press Next without changing group name
    act(() => {
      fireEvent.press(getByText('Next'));
    });

    // Press Next without changing habit
    act(() => {
      fireEvent.press(getByText('Next'));
    });

    // Press 'Create Group' to attempt creating group
    act(() => {
      fireEvent.press(getByText('Create Group'));
    });

    // Wait for async operations to complete
    await act(async () => {});

    // Check that error is displayed
    expect(getByText('Failed to create group')).toBeTruthy();
  });

  test('handles joining a group successfully', async () => {
    require('../utils/group').checkUserHasGroup.mockResolvedValue([]);

    const mockJoinedGroupRef = { id: 'group1' };

    require('../utils/group').joinGroup.mockResolvedValue(mockJoinedGroupRef);

    const { getByText, getByPlaceholderText } = render(<Group />);

    // Wait for useEffect to complete
    await act(async () => {});

    // Navigate to 'enter-code' step
    act(() => {
      fireEvent.press(getByText('Join a Group'));
    });

    // Enter group code
    const codeInput = getByPlaceholderText('Group Code');
    act(() => {
      fireEvent.changeText(codeInput, 'ABC123');
    });

    // Press 'Join' to attempt joining group
    act(() => {
      fireEvent.press(getByText('Join'));
    });

    // Mock getDoc to return group data
    const { getDoc } = require('firebase/firestore');
    const mockGroupSnapshot = {
      exists: () => true,
      get: jest.fn((field) => {
        switch (field) {
          case 'users':
            return [{ id: 'user1' }];
          case 'habit':
            return 'Go for a walk';
          case 'frequency':
            return 3;
          case 'name':
            return 'Joined Group';
          case 'joinCode':
            return 'ABC123';
          default:
            return null;
        }
      }),
    };

    const mockUserSnapshot = {
      exists: () => true,
      get: jest.fn(() => 'Test User'),
    };

    getDoc.mockImplementation(async (ref) => {
      if (ref === mockJoinedGroupRef) {
        return mockGroupSnapshot;
      } else {
        return mockUserSnapshot;
      }
    });

    // Wait for async operations to complete
    await act(async () => {});

    // Now, the component should show the group information
    expect(getByText('Group Code: ABC123')).toBeTruthy();
    expect(getByText('Group Name: Joined Group')).toBeTruthy();
    expect(getByText('Habit: Go for a walk')).toBeTruthy();
    expect(getByText('Frequency: 3')).toBeTruthy();
    expect(getByText('Members:')).toBeTruthy();
    expect(getByText('Test User')).toBeTruthy();
  });

  test('displays error when joining group fails', async () => {
    require('../utils/group').checkUserHasGroup.mockResolvedValue([]);

    require('../utils/group').joinGroup.mockResolvedValue(null);

    const { getByText, getByPlaceholderText } = render(<Group />);

    // Wait for useEffect to complete
    await act(async () => {});

    // Navigate to 'enter-code' step
    act(() => {
      fireEvent.press(getByText('Join a Group'));
    });

    // Enter invalid group code
    const codeInput = getByPlaceholderText('Group Code');
    act(() => {
      fireEvent.changeText(codeInput, 'INVALID');
    });

    // Press 'Join' to attempt joining group
    act(() => {
      fireEvent.press(getByText('Join'));
    });

    // Wait for async operations to complete
    await act(async () => {});

    // Check that error is displayed
    expect(getByText('Invalid group code')).toBeTruthy();
  });
});
