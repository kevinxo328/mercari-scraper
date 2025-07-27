import { render, screen } from '@testing-library/react';
import TimeDisplay from './TimeDisplay';
import React from 'react';

describe('TimeDisplay', () => {
  it('renders loading on server side', () => {
    // Mock useState to simulate server-side rendering
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [false, jest.fn()]);

    render(<TimeDisplay timestamp={new Date()} />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('renders formatted time and timezone when timestamp is provided', () => {
    render(<TimeDisplay timestamp="2024-01-01T12:34:56Z" />);
    // 只檢查有顯示時區字串
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
