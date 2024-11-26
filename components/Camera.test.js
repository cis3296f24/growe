// Camera.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Camera from './Camera'; // Adjust the import path as necessary
import { Alert } from 'react-native';

// Mocks
jest.mock('expo-camera', () => {
  const React = require('react');
  return {
    CameraView: React.forwardRef((props, ref) => {
      if (ref) {
        ref.current = {
          takePictureAsync: jest.fn(),
        };
      }
      return <>{props.children}</>;
    }),
    useCameraPermissions: jest.fn(),
    CameraType: {
      back: 'back',
      front: 'front',
    },
  };
});

jest.mock('./UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('../utils/log', () => ({
  createLogEntry: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('react-native-uuid', () => ({
  v4: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
  },
}));

describe('Camera component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should render a message and button when camera permission is not granted', () => {
    const mockRequestPermission = jest.fn();
    const mockUseCameraPermissions = require('expo-camera').useCameraPermissions;
    mockUseCameraPermissions.mockReturnValue([
      { granted: false },
      mockRequestPermission,
    ]);

    const { getByText } = render(<Camera />);

    expect(getByText('We need your permission to show the camera')).toBeTruthy();
    expect(getByText('Grant permission')).toBeTruthy();
  });

  it('should request permission when "Grant permission" button is pressed', () => {
    const mockRequestPermission = jest.fn();
    const mockUseCameraPermissions = require('expo-camera').useCameraPermissions;
    mockUseCameraPermissions.mockReturnValue([
      { granted: false },
      mockRequestPermission,
    ]);

    const { getByText } = render(<Camera />);

    const button = getByText('Grant permission');
    fireEvent.press(button);

    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('should render the camera when permission is granted', () => {
    const mockUseCameraPermissions = require('expo-camera').useCameraPermissions;
    mockUseCameraPermissions.mockReturnValue([
      { granted: true },
      jest.fn(),
    ]);

    const { getByText } = render(<Camera />);

    expect(getByText('Flip Camera')).toBeTruthy();
    expect(getByText('Take Photo')).toBeTruthy();
  });

  it('should take a picture and show preview when "Take Photo" is pressed', async () => {
    const mockUseCameraPermissions = require('expo-camera').useCameraPermissions;
    mockUseCameraPermissions.mockReturnValue([
      { granted: true },
      jest.fn(),
    ]);

    const mockTakePictureAsync = jest.fn().mockResolvedValue({ uri: 'test-uri' });

    const MockedCameraView = require('expo-camera').CameraView;
    MockedCameraView.mockImplementation(
      React.forwardRef((props, ref) => {
        if (ref) {
          ref.current = {
            takePictureAsync: mockTakePictureAsync,
          };
        }
        return <>{props.children}</>;
      })
    );

    const { getByText } = render(<Camera />);

    const takePhotoButton = getByText('Take Photo');
    fireEvent.press(takePhotoButton);

    await waitFor(() => {
      expect(mockTakePictureAsync).toHaveBeenCalled();
    });

    // Check that preview is displayed
    expect(getByText('Retake')).toBeTruthy();
    expect(getByText('Keep')).toBeTruthy();
  });

  it('should reset preview when "Retake" is pressed', async () => {
    const mockUseCameraPermissions = require('expo-camera').useCameraPermissions;
    mockUseCameraPermissions.mockReturnValue([
      { granted: true },
      jest.fn(),
    ]);

    const mockTakePictureAsync = jest.fn().mockResolvedValue({ uri: 'test-uri' });

    const MockedCameraView = require('expo-camera').CameraView;
    MockedCameraView.mockImplementation(
      React.forwardRef((props, ref) => {
        if (ref) {
          ref.current = {
            takePictureAsync: mockTakePictureAsync,
          };
        }
        return <>{props.children}</>;
      })
    );

    const { getByText, queryByText } = render(<Camera />);

    const takePhotoButton = getByText('Take Photo');
    fireEvent.press(takePhotoButton);

    await waitFor(() => {
      expect(mockTakePictureAsync).toHaveBeenCalled();
    });

    const retakeButton = getByText('Retake');
    fireEvent.press(retakeButton);

    expect(queryByText('Retake')).toBeNull();
    expect(queryByText('Keep')).toBeNull();
    expect(getByText('Take Photo')).toBeTruthy();
  });

  it('should upload the picture and create a log entry when "Keep" is pressed', async () => {
    const mockUseCameraPermissions = require('expo-camera').useCameraPermissions;
    mockUseCameraPermissions.mockReturnValue([
      { granted: true },
      jest.fn(),
    ]);

    const mockTakePictureAsync = jest.fn().mockResolvedValue({ uri: 'test-uri' });

    const MockedCameraView = require('expo-camera').CameraView;
    MockedCameraView.mockImplementation(
      React.forwardRef((props, ref) => {
        if (ref) {
          ref.current = {
            takePictureAsync: mockTakePictureAsync,
          };
        }
        return <>{props.children}</>;
      })
    );

    // Mock user
    const mockUser = { uid: 'user-id' };
    require('./UserContext').useUser.mockReturnValue({ user: mockUser });

    // Mock ImageManipulator
    require('expo-image-manipulator').manipulateAsync.mockResolvedValue({ uri: 'manipulated-uri' });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      blob: () => Promise.resolve('blob'),
    });

    // Mock uploadBytes and getDownloadURL
    const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
    ref.mockReturnValue('storage-ref');
    uploadBytes.mockResolvedValue();
    getDownloadURL.mockResolvedValue('download-url');

    // Mock createLogEntry
    const { createLogEntry } = require('../utils/log');
    createLogEntry.mockResolvedValue();

    // Mock uuid
    const { v4 } = require('react-native-uuid');
    v4.mockReturnValue('unique-id');

    // Mock Alert
    jest.spyOn(Alert, 'alert');

    const { getByText, queryByText } = render(<Camera />);

    const takePhotoButton = getByText('Take Photo');
    fireEvent.press(takePhotoButton);

    await waitFor(() => {
      expect(mockTakePictureAsync).toHaveBeenCalled();
    });

    const keepButton = getByText('Keep');
    fireEvent.press(keepButton);

    await waitFor(() => {
      expect(require('expo-image-manipulator').manipulateAsync).toHaveBeenCalledWith(
        'test-uri',
        [],
        { compress: 0.7, format: 'jpeg' }
      );

      expect(global.fetch).toHaveBeenCalledWith('manipulated-uri');

      expect(uploadBytes).toHaveBeenCalledWith('storage-ref', 'blob');

      expect(getDownloadURL).toHaveBeenCalledWith('storage-ref');

      expect(createLogEntry).toHaveBeenCalledWith(mockUser, 'download-url');

      expect(Alert.alert).toHaveBeenCalledWith('Photo uploaded and log entry created!');

      // Check that preview is reset
      expect(queryByText('Retake')).toBeNull();
      expect(queryByText('Keep')).toBeNull();
      expect(getByText('Take Photo')).toBeTruthy();
    });
  });

  it('should show an alert when taking picture fails', async () => {
    const mockUseCameraPermissions = require('expo-camera').useCameraPermissions;
    mockUseCameraPermissions.mockReturnValue([
      { granted: true },
      jest.fn(),
    ]);

    const mockTakePictureAsync = jest.fn().mockRejectedValue(new Error('Camera error'));

    const MockedCameraView = require('expo-camera').CameraView;
    MockedCameraView.mockImplementation(
      React.forwardRef((props, ref) => {
        if (ref) {
          ref.current = {
            takePictureAsync: mockTakePictureAsync,
          };
        }
        return <>{props.children}</>;
      })
    );

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Alert, 'alert');

    const { getByText } = render(<Camera />);

    const takePhotoButton = getByText('Take Photo');
    fireEvent.press(takePhotoButton);

    await waitFor(() => {
      expect(mockTakePictureAsync).toHaveBeenCalled();
    });

    expect(console.error).toHaveBeenCalledWith('Error taking photo: ', expect.any(Error));
    expect(Alert.alert).toHaveBeenCalledWith('Failed to take photo');
  });

  it('should show an alert when uploading picture fails', async () => {
    const mockUseCameraPermissions = require('expo-camera').useCameraPermissions;
    mockUseCameraPermissions.mockReturnValue([
      { granted: true },
      jest.fn(),
    ]);

    const mockTakePictureAsync = jest.fn().mockResolvedValue({ uri: 'test-uri' });

    const MockedCameraView = require('expo-camera').CameraView;
    MockedCameraView.mockImplementation(
      React.forwardRef((props, ref) => {
        if (ref) {
          ref.current = {
            takePictureAsync: mockTakePictureAsync,
          };
        }
        return <>{props.children}</>;
      })
    );

    // Mock user
    const mockUser = { uid: 'user-id' };
    require('./UserContext').useUser.mockReturnValue({ user: mockUser });

    // Mock ImageManipulator to reject
    require('expo-image-manipulator').manipulateAsync.mockRejectedValue(new Error('Manipulate error'));

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Alert, 'alert');

    const { getByText } = render(<Camera />);

    const takePhotoButton = getByText('Take Photo');
    fireEvent.press(takePhotoButton);

    await waitFor(() => {
      expect(mockTakePictureAsync).toHaveBeenCalled();
    });

    const keepButton = getByText('Keep');
    fireEvent.press(keepButton);

    await waitFor(() => {
      expect(require('expo-image-manipulator').manipulateAsync).toHaveBeenCalledWith(
        'test-uri',
        [],
        { compress: 0.7, format: 'jpeg' }
      );
    });

    expect(console.error).toHaveBeenCalledWith('Error uploading photo: ', expect.any(Error));
    expect(Alert.alert).toHaveBeenCalledWith('Failed to upload photo');
  });
});
