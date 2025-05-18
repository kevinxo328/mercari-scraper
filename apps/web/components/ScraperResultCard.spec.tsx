import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScraperResultCard, { Props } from './ScraperResultCard';

describe('ScraperResultCard', () => {
  const props: Props = {
    url: 'https://example.com/item/123',
    title: 'Test Item',
    imageUrl: 'https://example.com/image.jpg',
    price: 12345,
    currency: 'JPY'
  };

  it('renders link with correct href', () => {
    render(<ScraperResultCard {...props} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', props.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders image with correct src and alt', () => {
    render(<ScraperResultCard {...props} />);
    const img = screen.getByAltText(props.title);
    expect(img).toBeInTheDocument();
  });

  it('renders price and currency', () => {
    render(<ScraperResultCard {...props} />);
    expect(screen.getByText(/12,345 JPY/)).toBeInTheDocument();
  });
});
