import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (Object.is(obj1, obj2)) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  if (obj1 === null || obj2 === null) return false;

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

/**
 * @description This function takes a string and returns an array of strings
 *              by splitting the string by commas and removing any whitespace.
 *              If the string is undefined, null, or empty, it returns an empty array.
 * @param str string | undefined | null
 * @returns []
 */
export const parseCommaSeparatedString = (
  str: string | undefined | null
): string[] => {
  if (!str) return [];

  return str
    .replaceAll(/\s+/g, '')
    .split(',')
    .filter((keyword) => keyword.length > 0);
};
