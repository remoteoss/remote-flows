import { render, screen } from '@testing-library/react';
import { EmploymentAgreementInfoContent } from '../EmploymentAgreementInfoContent';

describe('EmploymentAgreementInfoContent', () => {
  it('should render without crashing', () => {
    render(<EmploymentAgreementInfoContent />);

    // Just check some key text is present
    expect(screen.getByText(/previewing a draft version/i)).toBeInTheDocument();
    expect(
      screen.getByText(/strongly discourage customizations/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/help@remote.com/i)).toBeInTheDocument();
  });
});
