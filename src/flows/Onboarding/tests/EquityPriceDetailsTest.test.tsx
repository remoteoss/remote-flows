import { render, screen } from '@testing-library/react';
import { EquityPriceDetails } from '../components/EquityPriceDetails';

const mockEquityCostWithDiscount = {
  original: {
    currency: 'USD',
    amount: 100,
  },
  discount: {
    currency: 'USD',
    amount: 20,
  },
  calculated: {
    currency: 'USD',
    amount: 80,
  },
};

const mockEquityCostWithoutDiscount = {
  original: {
    currency: 'EUR',
    amount: 150,
  },
  calculated: {
    currency: 'EUR',
    amount: 150,
  },
};

describe('EquityPriceDetails', () => {
  describe('when offerEquity is "yes" and equityCost is provided', () => {
    it('should render the equity price details with fee waived (strikethrough) when discount exists', () => {
      const { container } = render(
        <EquityPriceDetails
          offerEquity="yes"
          equityCost={mockEquityCostWithDiscount}
        />,
      );

      const strikethroughPrice = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 's' && content === '100 USD';
      });
      expect(strikethroughPrice).toBeInTheDocument();

      const calculatedPrice = screen.getByText((content, element) => {
        const hasText = content.includes('80 USD');
        const notInStrikethrough = !element?.closest('s');
        return hasText && notInStrikethrough;
      });
      expect(calculatedPrice).toBeInTheDocument();

      const strongElement = container?.querySelector('strong');
      expect(strongElement).toHaveTextContent(/100 USD.*80 USD.*will apply/i);
    });

    it('should render the equity price details without strikethrough when no discount exists', () => {
      const { container } = render(
        <EquityPriceDetails
          offerEquity="yes"
          equityCost={mockEquityCostWithoutDiscount}
        />,
      );

      // Check that calculated price is displayed
      const calculatedPrice = screen.getByText((content) => {
        const hasText = content.includes('150 EUR');
        return hasText;
      });
      expect(calculatedPrice).toBeInTheDocument();

      expect(screen.queryByRole('deletion')).not.toBeInTheDocument();
      expect(document.querySelector('s')).not.toBeInTheDocument();

      const strongElement = container?.querySelector('strong');
      expect(strongElement).toHaveTextContent(/150 EUR.*will apply/i);
    });
  });

  describe('when offerEquity is "no"', () => {
    it('should not render anything', () => {
      render(
        <EquityPriceDetails
          offerEquity="no"
          equityCost={mockEquityCostWithDiscount}
        />,
      );

      expect(
        screen.queryByText('This is a fee for managing equity through Remote.'),
      ).not.toBeInTheDocument();
    });
  });

  describe('when offerEquity is null', () => {
    it('should not render anything', () => {
      render(
        <EquityPriceDetails
          offerEquity={null}
          equityCost={mockEquityCostWithDiscount}
        />,
      );

      expect(
        screen.queryByText('This is a fee for managing equity through Remote.'),
      ).not.toBeInTheDocument();
    });
  });

  describe('when equityCost is not provided', () => {
    it('should not render anything even if offerEquity is "yes"', () => {
      render(<EquityPriceDetails offerEquity="yes" />);

      expect(
        screen.queryByText('This is a fee for managing equity through Remote.'),
      ).not.toBeInTheDocument();
    });
  });
});
