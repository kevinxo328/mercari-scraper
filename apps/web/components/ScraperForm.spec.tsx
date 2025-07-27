import { screen, render } from '@testing-library/react';
import ScraperForm from './ScraperForm';
import { ScraperFormProvider } from '@/providers/scraper-form-provider';
import { ScraperProvider } from '@/providers/scraper-store-provider';

function renderScraperForm() {
  return render(
    <ScraperProvider>
      <ScraperFormProvider>
        <ScraperForm />
      </ScraperFormProvider>
    </ScraperProvider>
  );
}

beforeEach(() => {
  renderScraperForm();
});

describe('ScraperForm', () => {
  it('renders the form with the correct fields', () => {
    expect(screen.getByLabelText(/Min/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max/)).toBeInTheDocument();
  });
});
