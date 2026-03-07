import { render, screen } from '@testing-library/react';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRoute
} from '@tanstack/react-router';
import NavBar from './navbar';

function renderWithRouter(ui: React.ReactElement) {
  const rootRoute = createRootRoute({ component: () => ui });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] })
  });
  return render(<RouterProvider router={router} />);
}

describe('AppHeader', () => {
  it('renders the logo and title', async () => {
    renderWithRouter(<NavBar />);
    expect(await screen.findByText('Mercari Scraper')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Mercari Scraper/i })
    ).toHaveAttribute('href', '/');
  });
});
