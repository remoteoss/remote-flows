import { server } from '@/src/tests/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  act,
} from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { CreateCompanyFlow } from '@/src/flows/CreateCompany/CreateCompany';
import {
  countriesResponse,
  currenciesResponse,
  companyCreatedResponse,
  addressDetailsSchema,
  companyUpdatedResponse,
  createCompanyErrorResponse,
  updateCompanyErrorResponse,
} from '@/src/flows/CreateCompany/tests/fixtures';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { CreateCompanyRenderProps } from '@/src/flows/CreateCompany/types';
import userEvent from '@testing-library/user-event';

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

function MultiStepForm({
  components,
  createCompanyBag,
}: CreateCompanyRenderProps) {
  const { CompanyBasicInformationStep, AddressDetailsStep, SubmitButton } =
    components;

  if (createCompanyBag.isLoading) {
    return <div data-testid='spinner'>Loading...</div>;
  }

  switch (createCompanyBag.stepState.currentStep.name) {
    case 'company_basic_information':
      return (
        <>
          <CompanyBasicInformationStep
            onSubmit={mockOnSubmit}
            onSuccess={mockOnSuccess}
            onError={mockOnError}
          />
          <div className='buttons-container'>
            <SubmitButton
              className='submit-button'
              disabled={createCompanyBag.isSubmitting}
            >
              Continue
            </SubmitButton>
          </div>
        </>
      );
    case 'address_details':
      return (
        <>
          <AddressDetailsStep
            onSubmit={mockOnSubmit}
            onSuccess={mockOnSuccess}
            onError={mockOnError}
          />
          <button
            type='button'
            onClick={() => createCompanyBag.back()}
            data-testid='back-button'
          >
            Back
          </button>
          <SubmitButton
            className='submit-button'
            disabled={createCompanyBag.isSubmitting}
          >
            Complete
          </SubmitButton>
        </>
      );
    default:
      return null;
  }
}

const defaultProps = {
  countryCode: undefined,
  options: {},
  render: ({ createCompanyBag, components }: CreateCompanyRenderProps) => (
    <MultiStepForm
      createCompanyBag={createCompanyBag}
      components={components}
    />
  ),
};

describe('CreateCompanyFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('Step 1: Company Basic Information', () => {
    it('should render the company basic information step and load countries', async () => {
      server.use(
        http.get('*/v1/countries', () => {
          return HttpResponse.json(countriesResponse.data);
        }),
        http.get('*/v1/company-currencies', () => {
          return HttpResponse.json(currenciesResponse.data);
        }),
      );

      render(
        <TestProviders>
          <CreateCompanyFlow {...defaultProps} />
        </TestProviders>,
      );

      await waitForElementToBeRemoved(() => screen.queryByTestId('spinner'));

      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/desired currency/i)).toBeInTheDocument();
    });

    it('should create company and move to address details step', async () => {
      const user = userEvent.setup();
      server.use(
        http.get('*/v1/countries', () => {
          return HttpResponse.json(countriesResponse.data);
        }),
        http.get('*/v1/company-currencies', () => {
          return HttpResponse.json(currenciesResponse.data);
        }),
        http.post('*/v1/companies', () => {
          return HttpResponse.json(companyCreatedResponse.data, {
            status: 201,
          });
        }),
        http.get('*/v1/countries/:countryCode/address_details', () => {
          return HttpResponse.json(addressDetailsSchema.data);
        }),
      );

      render(
        <TestProviders>
          <CreateCompanyFlow {...defaultProps} />
        </TestProviders>,
      );

      await waitForElementToBeRemoved(() => screen.queryByTestId('spinner'));

      await user.type(
        screen.getByLabelText(/company owner email/i),
        'owner@example.com',
      );
      await user.type(screen.getByLabelText(/company owner name/i), 'John Doe');
      await user.type(screen.getByLabelText(/^name$/i), 'Test Company');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
      await user.type(screen.getByLabelText(/tax number/i), 'TAX123');

      await user.selectOptions(screen.getByLabelText(/country/i), 'USA');
      await user.selectOptions(
        screen.getByLabelText(/desired currency/i),
        'USD',
      );

      // Blur all fields to trigger validation
      await user.tab();

      // Wait for button to be enabled and clickable
      const submitButton = screen.getByRole('button', { name: /continue/i });
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      // Submit the form directly - user.click doesn't work with form attribute in tests
      const form = document.querySelector('form[id]');
      if (form) {
        await act(async () => {
          fireEvent.submit(form);
        });
      } else {
        await user.click(submitButton);
      }

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      // Wait for navigation to address details step (indicated by Complete button)
      await waitFor(
        () => {
          expect(
            screen.getByRole('button', { name: /complete/i }),
          ).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Wait for spinner to disappear (schema loading)
      const spinner = screen.queryByTestId('spinner');
      if (spinner) {
        await waitForElementToBeRemoved(() => screen.queryByTestId('spinner'), {
          timeout: 10000,
        });
      }

      // Wait for address details form to render
      await waitFor(
        () => {
          expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });

    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();
      server.use(
        http.get('*/v1/countries', () => {
          return HttpResponse.json(countriesResponse.data);
        }),
        http.get('*/v1/company-currencies', () => {
          return HttpResponse.json(currenciesResponse.data);
        }),
      );

      render(
        <TestProviders>
          <CreateCompanyFlow {...defaultProps} />
        </TestProviders>,
      );

      await waitForElementToBeRemoved(() => screen.queryByTestId('spinner'));

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /continue/i });

      // Submit the form directly - user.click doesn't work with form attribute in tests
      const form = document.querySelector('form[id]');
      if (form) {
        await act(async () => {
          fireEvent.submit(form);
        });
      } else {
        await user.click(submitButton);
      }

      // Wait for validation errors to appear - form validation happens on submit
      await waitFor(
        () => {
          const requiredErrors = screen.queryAllByText(/required/i);
          expect(requiredErrors.length).toBeGreaterThan(0);
        },
        { timeout: 5000 },
      );

      // Verify we're still on the company basic information step
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    });

    it('should handle errors when creating company', async () => {
      const user = userEvent.setup();
      server.use(
        http.get('*/v1/countries', () => {
          return HttpResponse.json(countriesResponse.data);
        }),
        http.get('*/v1/company-currencies', () => {
          return HttpResponse.json(currenciesResponse.data);
        }),
        http.post('*/v1/companies', () => {
          return HttpResponse.json(createCompanyErrorResponse.error, {
            status: 400,
          });
        }),
      );

      render(
        <TestProviders>
          <CreateCompanyFlow {...defaultProps} />
        </TestProviders>,
      );

      await waitForElementToBeRemoved(() => screen.queryByTestId('spinner'));

      // Fill all required fields
      await user.type(
        screen.getByLabelText(/company owner email/i),
        'invalid-email',
      );
      await user.type(screen.getByLabelText(/company owner name/i), 'John Doe');
      await user.type(screen.getByLabelText(/^name$/i), 'Test Company');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
      await user.selectOptions(screen.getByLabelText(/country/i), 'USA');
      await user.selectOptions(
        screen.getByLabelText(/desired currency/i),
        'USD',
      );

      // Blur all fields to trigger validation
      await user.tab();

      // Wait for button to be enabled and clickable
      const submitButton = screen.getByRole('button', { name: /continue/i });
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      // Submit the form directly - user.click doesn't work with form attribute in tests
      const form = document.querySelector('form[id]');
      if (form) {
        await act(async () => {
          fireEvent.submit(form);
        });
      } else {
        await user.click(submitButton);
      }

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });

      const errorCall = mockOnError.mock.calls[0][0];
      expect(errorCall.error).toBeInstanceOf(Error);
      expect(errorCall.fieldErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Step 2: Address Details', () => {
    beforeEach(() => {
      server.use(
        http.get('*/v1/countries', () => {
          return HttpResponse.json(countriesResponse.data);
        }),
        http.get('*/v1/company-currencies', () => {
          return HttpResponse.json(currenciesResponse.data);
        }),
        http.post('*/v1/companies', () => {
          return HttpResponse.json(companyCreatedResponse.data, {
            status: 201,
          });
        }),
        http.get('*/v1/countries/:countryCode/address_details', () => {
          return HttpResponse.json(addressDetailsSchema.data);
        }),
      );
    });

    it(
      'should render address details form after company creation',
      { timeout: 15000 },
      async () => {
        const user = userEvent.setup();

        render(
          <TestProviders>
            <CreateCompanyFlow {...defaultProps} />
          </TestProviders>,
        );

        await waitForElementToBeRemoved(() => screen.queryByTestId('spinner'));

        // Fill all required fields
        await user.type(
          screen.getByLabelText(/company owner email/i),
          'owner@example.com',
        );
        await user.type(
          screen.getByLabelText(/company owner name/i),
          'John Doe',
        );
        await user.type(screen.getByLabelText(/^name$/i), 'Test Company');
        await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
        await user.type(screen.getByLabelText(/tax number/i), 'TAX123');
        await user.selectOptions(screen.getByLabelText(/country/i), 'USA');
        await user.selectOptions(
          screen.getByLabelText(/desired currency/i),
          'USD',
        );

        // Blur all fields to trigger validation
        await user.tab();

        // Wait for button to be enabled and clickable
        const submitButton = screen.getByRole('button', { name: /continue/i });
        await waitFor(() => {
          expect(submitButton).not.toBeDisabled();
        });

        // Submit the form directly - user.click doesn't work with form attribute in tests
        const form = document.querySelector('form[id]');
        if (form) {
          await act(async () => {
            fireEvent.submit(form);
          });
        } else {
          await user.click(submitButton);
        }

        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(mockOnSuccess).toHaveBeenCalled();
        });

        // Wait for navigation to address details step and schema to load
        await waitFor(
          () => {
            expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
          },
          { timeout: 10000 },
        );

        expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
      },
    );

    it(
      'should update company with address details',
      { timeout: 15000 },
      async () => {
        const user = userEvent.setup();
        server.use(
          http.patch('*/v1/companies/:companyId', () => {
            return HttpResponse.json(companyUpdatedResponse.data, {
              status: 200,
            });
          }),
        );

        render(
          <TestProviders>
            <CreateCompanyFlow {...defaultProps} />
          </TestProviders>,
        );

        await waitForElementToBeRemoved(() => screen.queryByTestId('spinner'));

        // Fill all required fields
        await user.type(
          screen.getByLabelText(/company owner email/i),
          'owner@example.com',
        );
        await user.type(
          screen.getByLabelText(/company owner name/i),
          'John Doe',
        );
        await user.type(screen.getByLabelText(/^name$/i), 'Test Company');
        await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
        await user.type(screen.getByLabelText(/tax number/i), 'TAX123');
        await user.selectOptions(screen.getByLabelText(/country/i), 'USA');
        await user.selectOptions(
          screen.getByLabelText(/desired currency/i),
          'USD',
        );

        // Blur all fields to trigger validation
        await user.tab();

        // Wait for button to be enabled and clickable
        const submitButton = screen.getByRole('button', { name: /continue/i });
        await waitFor(() => {
          expect(submitButton).not.toBeDisabled();
        });

        // Submit the form directly - user.click doesn't work with form attribute in tests
        const form = document.querySelector('form[id]');
        if (form) {
          await act(async () => {
            fireEvent.submit(form);
          });
        } else {
          await user.click(submitButton);
        }

        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(mockOnSuccess).toHaveBeenCalled();
        });

        // Wait for navigation to address details step and schema to load
        await waitFor(
          () => {
            expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
          },
          { timeout: 10000 },
        );

        await user.type(screen.getByLabelText(/address/i), '123 Main St');
        await user.type(screen.getByLabelText(/city/i), 'San Francisco');
        await user.type(screen.getByLabelText(/postal code/i), '94101');
        await user.type(screen.getByLabelText(/state/i), 'CA');

        // Submit the address details form directly
        const addressForm = document.querySelector('form[id]');
        if (addressForm) {
          await act(async () => {
            fireEvent.submit(addressForm);
          });
        } else {
          await user.click(screen.getByRole('button', { name: /complete/i }));
        }

        await waitFor(() => {
          expect(mockOnSuccess).toHaveBeenCalledTimes(2);
        });
      },
    );

    it(
      'should handle errors when updating company',
      { timeout: 15000 },
      async () => {
        const user = userEvent.setup();
        server.use(
          http.get('*/v1/countries', () => {
            return HttpResponse.json(countriesResponse.data);
          }),
          http.get('*/v1/company-currencies', () => {
            return HttpResponse.json(currenciesResponse.data);
          }),
          http.post('*/v1/companies', () => {
            return HttpResponse.json(companyCreatedResponse.data, {
              status: 201,
            });
          }),
          http.get('*/v1/countries/:countryCode/address_details', () => {
            return HttpResponse.json(addressDetailsSchema.data);
          }),
          http.patch('*/v1/companies/:companyId', () => {
            return HttpResponse.json(updateCompanyErrorResponse.error, {
              status: 400,
            });
          }),
        );

        render(
          <TestProviders>
            <CreateCompanyFlow {...defaultProps} />
          </TestProviders>,
        );

        await waitForElementToBeRemoved(() => screen.queryByTestId('spinner'));

        // Fill all required fields
        await user.type(
          screen.getByLabelText(/company owner email/i),
          'owner@example.com',
        );
        await user.type(
          screen.getByLabelText(/company owner name/i),
          'John Doe',
        );
        await user.type(screen.getByLabelText(/^name$/i), 'Test Company');
        await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
        await user.type(screen.getByLabelText(/tax number/i), 'TAX123');
        await user.selectOptions(screen.getByLabelText(/country/i), 'USA');
        await user.selectOptions(
          screen.getByLabelText(/desired currency/i),
          'USD',
        );

        // Tab away from the last field to trigger validation
        await user.tab();

        // Wait for button to be enabled and clickable
        const submitButton = screen.getByRole('button', { name: /continue/i });
        await waitFor(() => {
          expect(submitButton).not.toBeDisabled();
        });

        // Submit the form directly - user.click doesn't work with form attribute in tests
        const form = document.querySelector('form[id]');
        if (form) {
          await act(async () => {
            fireEvent.submit(form);
          });
        } else {
          await user.click(submitButton);
        }

        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(mockOnSuccess).toHaveBeenCalled();
        });

        // Wait for navigation to address details step and schema to load
        await waitFor(
          () => {
            expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
          },
          { timeout: 10000 },
        );

        // Fill address fields before submitting
        await user.type(screen.getByLabelText(/address/i), '123 Main St');
        await user.type(screen.getByLabelText(/city/i), 'San Francisco');
        await user.type(screen.getByLabelText(/postal code/i), '94101');
        await user.type(screen.getByLabelText(/state/i), 'CA');

        // Submit the address details form directly
        const addressForm = document.querySelector('form[id]');
        if (addressForm) {
          await act(async () => {
            fireEvent.submit(addressForm);
          });
        } else {
          await user.click(screen.getByRole('button', { name: /complete/i }));
        }

        await waitFor(
          () => {
            expect(mockOnError).toHaveBeenCalled();
          },
          { timeout: 10000 },
        );
      },
    );

    it(
      'should allow going back to company basic information step',
      { timeout: 15000 },
      async () => {
        const user = userEvent.setup();

        render(
          <TestProviders>
            <CreateCompanyFlow {...defaultProps} />
          </TestProviders>,
        );

        await waitForElementToBeRemoved(() => screen.queryByTestId('spinner'));

        // Fill all required fields
        await user.type(
          screen.getByLabelText(/company owner email/i),
          'owner@example.com',
        );
        await user.type(
          screen.getByLabelText(/company owner name/i),
          'John Doe',
        );
        await user.type(screen.getByLabelText(/^name$/i), 'Test Company');
        await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
        await user.type(screen.getByLabelText(/tax number/i), 'TAX123');
        await user.selectOptions(screen.getByLabelText(/country/i), 'USA');
        await user.selectOptions(
          screen.getByLabelText(/desired currency/i),
          'USD',
        );

        // Blur all fields to trigger validation
        await user.tab();

        // Wait for button to be enabled and clickable
        const submitButton = screen.getByRole('button', { name: /continue/i });
        await waitFor(() => {
          expect(submitButton).not.toBeDisabled();
        });

        // Submit the form directly - user.click doesn't work with form attribute in tests
        const form = document.querySelector('form[id]');
        if (form) {
          await act(async () => {
            fireEvent.submit(form);
          });
        } else {
          await user.click(submitButton);
        }

        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(mockOnSuccess).toHaveBeenCalled();
        });

        // Wait for navigation to address details step (indicated by Complete button)
        await waitFor(
          () => {
            expect(
              screen.getByRole('button', { name: /complete/i }),
            ).toBeInTheDocument();
          },
          { timeout: 10000 },
        );

        // Wait for spinner to disappear (schema loading)
        const spinner = screen.queryByTestId('spinner');
        if (spinner) {
          await waitForElementToBeRemoved(
            () => screen.queryByTestId('spinner'),
            {
              timeout: 10000,
            },
          );
        }

        // Wait for address details form to render
        await waitFor(
          () => {
            expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
          },
          { timeout: 10000 },
        );

        await user.click(screen.getByTestId('back-button'));

        await waitFor(() => {
          expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
        });
      },
    );
  });

  describe('Loading states', () => {
    it('should show loading state while fetching countries and currencies', () => {
      server.use(
        http.get('*/v1/countries', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(countriesResponse.data);
        }),
        http.get('*/v1/companies/currencies', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(currenciesResponse.data);
        }),
      );

      render(
        <TestProviders>
          <CreateCompanyFlow {...defaultProps} />
        </TestProviders>,
      );

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });
});
