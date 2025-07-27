import '@testing-library/jest-dom';

// TODO: mock next/navigation
// References: https://www.npmjs.com/package/next-router-mock, https://github.com/vercel/next.js/discussions/23034, https://github.com/vercel/next.js/discussions/42527
jest.mock('next/router', () => jest.requireActual('next-router-mock'));
jest.mock('next/navigation', () => require('next-router-mock/navigation'));
