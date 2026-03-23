import { cn, deepEqual, parseCommaSeparatedString } from './utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2', { class3: true, class4: false });
    expect(result).toBe('class1 class2 class3');
  });
  it('should handle empty class names', () => {
    const result = cn('', 'class2', { class3: true });
    expect(result).toBe('class2 class3');
  });
  it('should handle falsy values', () => {
    const result = cn('class1', false, null, 'class2');
    expect(result).toBe('class1 class2');
  });
  it('should handle undefined values', () => {
    const result = cn('class1', undefined, 'class2');
    expect(result).toBe('class1 class2');
  });
  it('should handle arrays of class names', () => {
    const result = cn(['class1', 'class2'], { class3: true });
    expect(result).toBe('class1 class2 class3');
  });
  it('should handle nested arrays of class names', () => {
    const result = cn(['class1', ['class2', 'class3']], { class4: true });
    expect(result).toBe('class1 class2 class3 class4');
  });
  it('should handle empty arrays', () => {
    const result = cn([]);
    expect(result).toBe('');
  });
  it('should handle multiple falsy values', () => {
    const result = cn(false, null, undefined, '');
    expect(result).toBe('');
  });
  it('should handle mixed types', () => {
    const result = cn('class1', false, null, 'class2', { class3: true });
    expect(result).toBe('class1 class2 class3');
  });
  it('should handle boolean values', () => {
    const result = cn('class1', true, 'class2', { class3: false });
    expect(result).toBe('class1 class2');
  });
  it('should handle numbers as class names', () => {
    const result = cn('class1', 123, 'class2', { class3: true });
    expect(result).toBe('class1 123 class2 class3');
  });
});

describe('parseCommaSeparatedString', () => {
  it('should return an empty array for undefined input', () => {
    expect(parseCommaSeparatedString(undefined)).toEqual([]);
  });

  it('should return an empty array for null input', () => {
    expect(parseCommaSeparatedString(null)).toEqual([]);
  });

  it('should return an empty array for empty string input', () => {
    expect(parseCommaSeparatedString('')).toEqual([]);
  });

  it('should return an array of strings for valid input', () => {
    expect(parseCommaSeparatedString('apple, banana, cherry')).toEqual([
      'apple',
      'banana',
      'cherry'
    ]);
  });

  it('should handle extra whitespace correctly', () => {
    expect(parseCommaSeparatedString('apple,   banana , cherry')).toEqual([
      'apple',
      'banana',
      'cherry'
    ]);
  });
});

describe('deepEqual', () => {
  it('should return true for identical objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    expect(deepEqual(obj1, obj2)).toBe(true);
  });

  it('should return false for different objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 3 } };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  it('should return true for identical arrays', () => {
    const arr1 = [1, 2, [3, 4]];
    const arr2 = [1, 2, [3, 4]];
    expect(deepEqual(arr1, arr2)).toBe(true);
  });

  it('should return false for different arrays', () => {
    const arr1 = [1, 2, [3, 4]];
    const arr2 = [1, 2, [3, 5]];
    expect(deepEqual(arr1, arr2)).toBe(false);
  });

  it('should return true for identical nested objects', () => {
    const obj1 = { a: { b: { c: { d: 1 } } } };
    const obj2 = { a: { b: { c: { d: 1 } } } };
    expect(deepEqual(obj1, obj2)).toBe(true);
  });

  it('should return false for different nested objects', () => {
    const obj1 = { a: { b: { c: { d: 1 } } } };
    const obj2 = { a: { b: { c: { d: 2 } } } };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });
});
