// Footer.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Footer from './Footer';

// Mock expo-router module
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock SVG icons
jest.mock('../assets/icons/log.svg', () => 'LogIcon');
jest.mock('../assets/icons/group.svg', () => 'GroupIcon');
jest.mock('../assets/icons/garden.svg', () => 'GardenIcon');

describe('Footer component', () => {
  let useRouterMock;
  let usePathnameMock;
  let routerPushMock;

  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();

    // Mock implementations
    routerPushMock = jest.fn();
    useRouterMock = require('expo-router').useRouter;
    useRouterMock.mockReturnValue({ push: routerPushMock });

    usePathnameMock = require('expo-router').usePathname;
    usePathnameMock.mockReturnValue('/home');
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<Footer />);
    expect(getByTestId('footer')).toBeTruthy();
  });

  it('initially selects the correct screen based on pathname', () => {
    usePathnameMock.mockReturnValue('/log');
    const { getByTestId } = render(<Footer />);
    const logButton = getByTestId('log-button');
    expect(logButton.props.disabled).toBe(true);
  });

  it('navigates to the correct screen on button press', () => {
    const { getByTestId } = render(<Footer />);
    const logButton = getByTestId('log-button');

    fireEvent.press(logButton);

    expect(routerPushMock).toHaveBeenCalledWith('./log');
  });

  it('updates selected state on button press', () => {
    const { getByTestId } = render(<Footer />);
    const logButton = getByTestId('log-button');

    fireEvent.press(logButton);

    // Re-render component to reflect state change
    const updatedLogButton = getByTestId('log-button');
    expect(updatedLogButton.props.disabled).toBe(true);
  });

  it('icons have correct color based on selected state', () => {
    const { getByTestId } = render(<Footer />);

    const homeIcon = getByTestId('home-icon');
    const logIcon = getByTestId('log-icon');
    const groupIcon = getByTestId('group-icon');

    expect(homeIcon.props.color).toBe('#ECFFEB'); // Selected
    expect(logIcon.props.color).toBe('#B0C5AF');
    expect(groupIcon.props.color).toBe('#B0C5AF');
  });
});
