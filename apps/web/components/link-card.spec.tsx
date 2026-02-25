import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
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

  it('does not show delete button when disabled', () => {
    render(<LinkCard {...props} />);
    expect(screen.queryByRole('button', { name: /delete item/i })).toBeNull();
  });

  it('shows delete button and triggers handler', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();

    render(<LinkCard {...props} showDelete onDelete={handleDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete item/i });
    await user.click(deleteButton);

    expect(handleDelete).toHaveBeenCalled();
  });

  it('disables delete button when deleting', () => {
    render(<LinkCard {...props} showDelete isDeleting onDelete={() => {}} />);

    const deleteButton = screen.getByRole('button', { name: /delete item/i });
    expect(deleteButton).toBeDisabled();
  });
});
