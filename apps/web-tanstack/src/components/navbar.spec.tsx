import { render, screen } from '@testing-library/react';
import NavBar from './navbar';

describe('AppHeader', () => {
  it('renders the logo and title', async () => {
    render(<NavBar />);
    expect(screen.getByText('Mercari Scraper')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Mercari Scraper/i })
    ).toHaveAttribute('href', '/');
  });
});
