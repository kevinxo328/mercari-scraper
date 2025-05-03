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
