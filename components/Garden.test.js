import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Garden } from './Garden';
import { useUser } from './UserContext';
import { useRouter } from 'expo-router';
import { checkUserHasGroup } from '../utils/group';

jest.mock('./UserContext');
jest.mock('expo-router');
jest.mock('../utils/group');

describe('Garden Component', () => {
  const mockUser = { uid: '123', name: 'Test User' };
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
  });

  it('should display a message and button when user is not logged in', async () => {
    useUser.mockReturnValue({ user: null });
    checkUserHasGroup.mockResolvedValue(null);

    const { getByText } = render(<Garden />);

    await waitFor(() => {
      expect(getByText('You need to be in a group to start a garden!')).toBeTruthy();
      expect(getByText('Go to Groups')).toBeTruthy();
    });
  });

  it('should display a message and button when user has no groups', async () => {
    useUser.mockReturnValue({ user: mockUser });
    checkUserHasGroup.mockResolvedValue(null);

    const { getByText } = render(<Garden />);

    await waitFor(() => {
      expect(getByText('You need to be in a group to start a garden!')).toBeTruthy();
      expect(getByText('Go to Groups')).toBeTruthy();
    });
  });

  it('should display "Garden" text when user has groups', async () => {
    useUser.mockReturnValue({ user: mockUser });
    checkUserHasGroup.mockResolvedValue([{}]); // Mock group references

    const { getByText } = render(<Garden />);

    await waitFor(() => {
      expect(getByText('Garden')).toBeTruthy();
    });
  });

  it('should navigate to group page when "Go to Groups" button is pressed', async () => {
    useUser.mockReturnValue({ user: mockUser });
    checkUserHasGroup.mockResolvedValue(null);

    const { getByText } = render(<Garden />);

    await waitFor(() => {
      const button = getByText('Go to Groups');
      fireEvent.press(button);
      expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/group', params: {} });
    });
  });
});
