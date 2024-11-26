// diffusion.test.js

import { generateImage, uploadImageToFirebase } from './diffusion';
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Mock axios
jest.mock('axios');

// Mock Firebase functions
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('generateImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate an image given a prompt', async () => {
    const prompt = 'A cat sitting on a skateboard';

    // Mock axios response
    const mockResponse = {
      status: 200,
      data: {
        image: 'base64EncodedImageString',
      },
    };

    axios.postForm.mockResolvedValue(mockResponse);
    axios.toFormData = jest.fn().mockReturnValue({}); // Mock toFormData

    const result = await generateImage(prompt);

    expect(result).toBe('base64EncodedImageString');
    expect(axios.postForm).toHaveBeenCalledWith(
      'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      expect.any(Object),
      expect.objectContaining({
        validateStatus: undefined,
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Bearer '),
          Accept: 'application/json',
        }),
        responseType: 'json',
      })
    );
  });

  it('should throw an error when the API response is not 200', async () => {
    const prompt = 'A dog playing guitar';

    // Mock axios response with error
    const mockResponse = {
      status: 400,
      statusText: 'Bad Request',
      data: {},
    };

    axios.postForm.mockResolvedValue(mockResponse);
    axios.toFormData = jest.fn().mockReturnValue({});

    await expect(generateImage(prompt)).rejects.toThrow('400: Bad Request');
  });

  it('should handle axios errors', async () => {
    const prompt = 'A sunset over the mountains';

    const mockError = new Error('Network Error');
    axios.postForm.mockRejectedValue(mockError);
    axios.toFormData = jest.fn().mockReturnValue({});

    await expect(generateImage(prompt)).rejects.toThrow('Network Error');
  });
});

describe('uploadImageToFirebase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload an image to Firebase and return the download URL', async () => {
    const base64Image = 'base64EncodedImageString';
    const filePath = 'images/test.png';

    // Mock fetch response
    const mockBlob = {};
    const mockResponse = {
      blob: jest.fn().mockResolvedValue(mockBlob),
    };
    global.fetch.mockResolvedValue(mockResponse);

    // Mock Firebase functions
    ref.mockReturnValue('storageRef');
    uploadBytes.mockResolvedValue();
    getDownloadURL.mockResolvedValue('https://firebase.storage/download/url');

    const downloadURL = await uploadImageToFirebase(base64Image, filePath);

    expect(global.fetch).toHaveBeenCalledWith(`data:image/png;base64,${base64Image}`);
    expect(ref).toHaveBeenCalledWith(expect.any(Object), filePath);
    expect(uploadBytes).toHaveBeenCalledWith('storageRef', mockBlob);
    expect(getDownloadURL).toHaveBeenCalledWith('storageRef');
    expect(downloadURL).toBe('https://firebase.storage/download/url');
  });

  it('should throw an error when upload fails', async () => {
    const base64Image = 'base64EncodedImageString';
    const filePath = 'images/test.png';

    // Mock fetch response
    const mockBlob = {};
    const mockResponse = {
      blob: jest.fn().mockResolvedValue(mockBlob),
    };
    global.fetch.mockResolvedValue(mockResponse);

    // Mock Firebase functions
    ref.mockReturnValue('storageRef');
    const mockError = new Error('Upload failed');
    uploadBytes.mockRejectedValue(mockError);

    await expect(uploadImageToFirebase(base64Image, filePath)).rejects.toThrow('Upload failed');
  });

  it('should throw an error when fetch fails', async () => {
    const base64Image = 'base64EncodedImageString';
    const filePath = 'images/test.png';

    const mockError = new Error('Fetch failed');
    global.fetch.mockRejectedValue(mockError);

    await expect(uploadImageToFirebase(base64Image, filePath)).rejects.toThrow('Fetch failed');
  });
});
