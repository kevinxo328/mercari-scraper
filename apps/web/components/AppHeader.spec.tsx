import { render, screen } from '@testing-library/react';
import AppHeader from './AppHeader';

describe('AppHeader', () => {
  it('renders the logo and title', async () => {
    render(<AppHeader />);
    expect(screen.getByText('Mercari Scraper')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Mercari Scraper/i })
    ).toHaveAttribute('href', '/');
  });
});
