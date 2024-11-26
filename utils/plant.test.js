import { getDecayDate, checkDecayDate, getDecayProgress } from './plant';

describe('getDecayDate', () => {
  it('should return a date 7 days after the current date as a UTC string', () => {
    const currentDate = new Date('2023-01-01T00:00:00Z');
    const expectedDate = new Date('2023-01-08T00:00:00Z').toUTCString();
    const decayDate = getDecayDate(currentDate);
    expect(decayDate).toBe(expectedDate);
  });

  it('should throw an error when currentDate is not a Date object', () => {
    expect(() => getDecayDate('2023-01-01')).toThrow('Invalid Input: currentDate must be a Date object');
    expect(() => getDecayDate(null)).toThrow('Invalid Input: currentDate must be a Date object');
    expect(() => getDecayDate(12345)).toThrow('Invalid Input: currentDate must be a Date object');
    expect(() => getDecayDate({})).toThrow('Invalid Input: currentDate must be a Date object');
  });
});

describe('checkDecayDate', () => {
  it('should return false when currentDate is before decayAt', () => {
    const decayAt = new Date('2023-01-08T00:00:00Z');
    const currentDate = new Date('2023-01-07T23:59:59Z');
    expect(checkDecayDate(decayAt, currentDate)).toBe(false);
  });

  it('should return true when currentDate is equal to decayAt', () => {
    const decayAt = new Date('2023-01-08T00:00:00Z');
    const currentDate = new Date('2023-01-08T00:00:00Z');
    expect(checkDecayDate(decayAt, currentDate)).toBe(true);
  });

  it('should return true when currentDate is after decayAt', () => {
    const decayAt = new Date('2023-01-08T00:00:00Z');
    const currentDate = new Date('2023-01-08T00:00:01Z');
    expect(checkDecayDate(decayAt, currentDate)).toBe(true);
  });

  it('should throw an error when decayAt is not a Date object', () => {
    const currentDate = new Date();
    expect(() => checkDecayDate('2023-01-08', currentDate)).toThrow('Invalid Input: currentDate must be a Date object');
  });

  it('should throw an error when currentDate is not a Date object', () => {
    const decayAt = new Date();
    expect(() => checkDecayDate(decayAt, '2023-01-08')).toThrow('Invalid Input: currentDate must be a Date object');
  });
});

describe('getDecayProgress', () => {
  it('should return 0.00 when the plantingDate is now', () => {
    const plantingDate = new Date();
    const decayProgress = getDecayProgress(plantingDate);
    expect(decayProgress).toBe('0.00');
  });

  it('should return 15.00 when the plantingDate was 1 day ago', () => {
    const plantingDate = new Date();
    plantingDate.setDate(plantingDate.getDate() - 1);
    const decayProgress = getDecayProgress(plantingDate);
    expect(decayProgress).toBe('15.00');
  });

  it('should return 30.00 when the plantingDate was 2 days ago', () => {
    const plantingDate = new Date();
    plantingDate.setDate(plantingDate.getDate() - 2);
    const decayProgress = getDecayProgress(plantingDate);
    expect(decayProgress).toBe('30.00');
  });

  it('should return 90.00 when the plantingDate was 6 days ago', () => {
    const plantingDate = new Date();
    plantingDate.setDate(plantingDate.getDate() - 6);
    const decayProgress = getDecayProgress(plantingDate);
    expect(decayProgress).toBe('90.00');
  });

  it('should return 0.00 when the plantingDate was 7 days ago or more', () => {
    const plantingDate = new Date();
    plantingDate.setDate(plantingDate.getDate() - 7);
    const decayProgress = getDecayProgress(plantingDate);
    expect(decayProgress).toBe('0.00');
  });

  it('should throw an error when plantingDate is not a Date object', () => {
    expect(() => getDecayProgress('2023-01-01')).toThrow('Invalid Input: currentDate must be a Date object');
    expect(() => getDecayProgress(null)).toThrow('Invalid Input: currentDate must be a Date object');
    expect(() => getDecayProgress(12345)).toThrow('Invalid Input: currentDate must be a Date object');
    expect(() => getDecayProgress({})).toThrow('Invalid Input: currentDate must be a Date object');
  });
});
