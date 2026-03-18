// vi.hoisted runs before everything else (including module imports), so the
// ref is available when the vi.mock factory executes.
const reactRef = vi.hoisted(() => ({
  realUseState: null as unknown as typeof import('react').useState
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return { ...actual, useHydrated: () => true };
});

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  reactRef.realUseState = actual.useState;
  return { ...actual, useState: vi.fn(actual.useState) };
});

import { render, screen } from '@testing-library/react';
import * as React from 'react';

import TimeDisplay from './time-display';

describe('TimeDisplay', () => {
  afterEach(() => {
    // Reset to the real implementation after each test, avoiding infinite
    // recursion that occurs when referencing the already-mocked React.useState.
    vi.mocked(React.useState).mockImplementation(reactRef.realUseState);
  });

  it('renders loading on server side', () => {
    // Intercept the first useState call (isClient) to return false,
    // simulating a server-side render before hydration.
    vi.mocked(React.useState).mockImplementationOnce(() => [false, vi.fn()]);

    render(<TimeDisplay timestamp={new Date()} />);
    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
  });

  it('renders formatted time and timezone when timestamp is provided', () => {
    render(<TimeDisplay timestamp="2024-01-01T12:34:56Z" />);
    expect(
      screen.getByText((content) => /GMT|Asia|UTC/.test(content))
    ).toBeInTheDocument();
  });

  it('renders N/A when timestamp is not provided', () => {
    render(<TimeDisplay />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<TimeDisplay className="custom-class" />);
    expect(screen.getByText('N/A')).toHaveClass('custom-class');
  });
});
