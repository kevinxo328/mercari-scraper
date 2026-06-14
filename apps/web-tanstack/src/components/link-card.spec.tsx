import { render, screen } from '@testing-library/react';

import LinkCard, { Props } from './link-card';

describe('ScraperResultCard', () => {
  const props: Props = {
    url: 'https://example.com/item/123',
    title: 'Test Item',
    imageUrl: 'https://example.com/image.jpg',
    price: 12345,
    currency: 'JPY'
  };

  it('renders link with correct href', () => {
    render(<LinkCard {...props} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', props.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders image with correct src and alt', () => {
    render(<LinkCard {...props} />);
    const img = screen.getByAltText(props.title);
    expect(img).toBeInTheDocument();
  });

  it('renders price and currency', () => {
    render(<LinkCard {...props} />);
    expect(screen.getByText(/12,345 JPY/)).toBeInTheDocument();
  });

  it('does not show a delete button because result cards are browse-only', () => {
    render(<LinkCard {...props} />);
    expect(screen.queryByRole('button', { name: /delete item/i })).toBeNull();
  });

  it('does not show a NEW badge for first-seen items because no top-left badge means newly listed', () => {
    render(
      <LinkCard
        {...props}
        firstSeenRunId="11111111-1111-1111-1111-111111111111"
        latestRunId="11111111-1111-1111-1111-111111111111"
      />
    );

    expect(screen.queryByText(/new/i)).toBeNull();
    expect(screen.queryByLabelText(/price decreased/i)).toBeNull();
    expect(screen.queryByLabelText(/price increased/i)).toBeNull();
  });

  it('shows a decrease badge when the latest run lowered the price so users can spot discounts', () => {
    render(
      <LinkCard
        {...props}
        price={1200}
        previousPrice={1500}
        priceChangedRunId="11111111-1111-1111-1111-111111111111"
        latestRunId="11111111-1111-1111-1111-111111111111"
      />
    );

    expect(screen.getByLabelText(/price decreased/i)).toHaveTextContent('300');
  });

  it('shows an increase badge when the latest run raised the price so users can distinguish direction', () => {
    render(
      <LinkCard
        {...props}
        price={1800}
        previousPrice={1500}
        priceChangedRunId="11111111-1111-1111-1111-111111111111"
        latestRunId="11111111-1111-1111-1111-111111111111"
      />
    );

    expect(screen.getByLabelText(/price increased/i)).toHaveTextContent('300');
  });

  it('uses the price-change badge when an item is both first-seen and price-changed in the latest run', () => {
    render(
      <LinkCard
        {...props}
        price={1200}
        previousPrice={1500}
        firstSeenRunId="11111111-1111-1111-1111-111111111111"
        priceChangedRunId="11111111-1111-1111-1111-111111111111"
        latestRunId="11111111-1111-1111-1111-111111111111"
      />
    );

    expect(screen.queryByText(/new/i)).toBeNull();
    expect(screen.getByLabelText(/price decreased/i)).toHaveTextContent('300');
  });
});
