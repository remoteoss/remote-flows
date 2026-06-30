import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import {
  PreOnboardingRequirements,
  usePreOnboardingRequirements,
} from '../PreOnboardingRequirements';
import { OnboardingContext } from '@/src/flows/Onboarding/context';
import {
  generatedDocumentMock,
  documentDetailsMock,
  signDocumentResponseMock,
} from '@/src/common/api/fixtures/pre-onboarding-requirements';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';

const TEST_EMPLOYMENT_ID = '8384e0c2-6d7f-40c6-aed2-2cffd4830210';
const TEST_DOCUMENT_ID = 'bdbe050d-2628-4c45-8fd1-1259904294cb';

const mockOnboardingBag = {
  employmentId: TEST_EMPLOYMENT_ID,
  countryCode: 'DEU',
  employment: {
    id: TEST_EMPLOYMENT_ID,
    country_code: 'DEU',
  },
  isLoading: false,
  stepState: {
    currentStep: {
      name: 'review',
      index: 4,
    },
  },
  options: {
    features: ['pre_onboarding_requirements'],
  },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TestProviders>
    <OnboardingContext.Provider
      value={{
        formId: 'test-form-id',
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: false,
        },
        setCreditScore: vi.fn(),
        onboardingBag: mockOnboardingBag as unknown as ReturnType<
          typeof useOnboarding
        >,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  </TestProviders>
);

describe('PreOnboardingRequirements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should display requirements after loading', async () => {
    render(
      <PreOnboardingRequirements
        render={(bag) => (
          <div>
            {bag.isLoadingRequirements && <div>Loading requirements...</div>}
            {bag.requirements && (
              <ul>
                {bag.requirements.map((req) => (
                  <li key={req.slug}>{req.name}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText('Loading requirements...')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByText('Loading requirements...'),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText('Individual Labor Agreement')).toBeInTheDocument();
    expect(screen.getByText('Master Service Agreement')).toBeInTheDocument();
  });

  it('should show finished status for completed requirements', async () => {
    render(
      <PreOnboardingRequirements
        render={(bag) => (
          <div>
            {bag.requirements?.map((req) => (
              <div key={req.slug} data-testid={`req-${req.slug}`}>
                <span>{req.name}</span>
                <span data-testid={`status-${req.slug}`}>{req.status}</span>
              </div>
            ))}
          </div>
        )}
      />,
      { wrapper: TestWrapper },
    );

    await waitFor(() => {
      expect(screen.getByText('Master Service Agreement')).toBeInTheDocument();
    });

    const msaStatus = screen.getByTestId(
      'status-dc3b954c-9d6c-4ddd-b8dc-531f9be773fb',
    );
    expect(msaStatus).toHaveTextContent('finished');

    const ilaStatus = screen.getByTestId(
      'status-5e39159e-96ef-40ea-82bc-b054917fc82f',
    );
    expect(ilaStatus).toHaveTextContent('awaiting_signatures');
  });

  describe('document generation', () => {
    it('should generate document when onCreateDocument is called', async () => {
      const createDocumentSpy = vi.fn(() =>
        HttpResponse.json(generatedDocumentMock),
      );

      server.use(
        http.post(
          '*/v1/onboarding/employments/:employmentId/pre-onboarding-documents',
          createDocumentSpy,
        ),
      );

      let renderBag: ReturnType<typeof usePreOnboardingRequirements>;

      render(
        <PreOnboardingRequirements
          render={(bag) => {
            renderBag = bag;
            return (
              <button
                onClick={() =>
                  bag.onCreateDocument('5e39159e-96ef-40ea-82bc-b054917fc82f')
                }
              >
                Generate Document
              </button>
            );
          }}
        />,
        { wrapper: TestWrapper },
      );

      await waitFor(() => {
        expect(renderBag?.requirements).not.toBeUndefined();
      });

      const button = screen.getByText('Generate Document');
      fireEvent.click(button);

      await waitFor(() => {
        expect(createDocumentSpy).toHaveBeenCalled();
      });

      expect(createDocumentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            employmentId: TEST_EMPLOYMENT_ID,
          }),
        }),
      );
    });

    it('should set documentId after document generation', async () => {
      let renderBag: ReturnType<typeof usePreOnboardingRequirements>;

      render(
        <PreOnboardingRequirements
          render={(bag) => {
            renderBag = bag;
            return (
              <div>
                <button
                  onClick={() =>
                    bag.onCreateDocument('5e39159e-96ef-40ea-82bc-b054917fc82f')
                  }
                >
                  Generate Document
                </button>
                {bag.documentPreview && (
                  <div data-testid='document-preview'>
                    {bag.documentPreview.pre_onboarding_document.name}
                  </div>
                )}
              </div>
            );
          }}
        />,
        { wrapper: TestWrapper },
      );

      await waitFor(() => {
        expect(renderBag?.requirements).toBeDefined();
      });

      const button = screen.getByText('Generate Document');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('document-preview')).toBeInTheDocument();
      });

      expect(screen.getByTestId('document-preview')).toHaveTextContent(
        '2026-05-19_GermanyMSAtemplate_MagicLinkTestCompanyUSA_Gabriel_Unsigned.pdf',
      );
    });

    it('should include constraints_ack_at when provided', async () => {
      const createDocumentSpy = vi.fn(() =>
        HttpResponse.json(generatedDocumentMock),
      );

      server.use(
        http.post(
          '*/v1/onboarding/employments/:employmentId/pre-onboarding-documents',
          createDocumentSpy,
        ),
      );

      let renderBag: ReturnType<typeof usePreOnboardingRequirements>;

      render(
        <PreOnboardingRequirements
          render={(bag) => {
            renderBag = bag;
            return (
              <button
                onClick={() =>
                  bag.onCreateDocument('5e39159e-96ef-40ea-82bc-b054917fc82f')
                }
              >
                Generate with Ack
              </button>
            );
          }}
        />,
        { wrapper: TestWrapper },
      );

      await waitFor(() => {
        expect(renderBag?.requirements).toBeDefined();
      });

      const button = screen.getByText('Generate with Ack');
      fireEvent.click(button);

      await waitFor(() => {
        expect(createDocumentSpy).toHaveBeenCalled();
      });
    });
  });

  describe('document signing', () => {
    it('should sign document when onSignDocument is called', async () => {
      const signDocumentSpy = vi.fn(() =>
        HttpResponse.json(signDocumentResponseMock),
      );

      server.use(
        http.post(
          '*/v1/onboarding/employments/:employmentId/pre-onboarding-documents/:documentId/sign',
          signDocumentSpy,
        ),
      );

      let renderBag: ReturnType<typeof usePreOnboardingRequirements>;

      render(
        <PreOnboardingRequirements
          render={(bag) => {
            renderBag = bag;
            return (
              <div>
                <button
                  onClick={async () => {
                    await bag.onCreateDocument(
                      '5e39159e-96ef-40ea-82bc-b054917fc82f',
                    );
                  }}
                >
                  Generate
                </button>
                {bag.documentPreview && (
                  <button onClick={() => bag.onSignDocument('test-signature')}>
                    Sign Document
                  </button>
                )}
              </div>
            );
          }}
        />,
        { wrapper: TestWrapper },
      );

      await waitFor(() => {
        expect(renderBag?.requirements).toBeDefined();
      });

      const generateButton = screen.getByText('Generate');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Sign Document')).toBeInTheDocument();
      });

      const signButton = screen.getByText('Sign Document');
      fireEvent.click(signButton);

      await waitFor(() => {
        expect(signDocumentSpy).toHaveBeenCalled();
      });

      expect(signDocumentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            employmentId: TEST_EMPLOYMENT_ID,
            documentId: TEST_DOCUMENT_ID,
          }),
        }),
      );
    });

    it('should throw error when signing without active requirement', async () => {
      let renderBag: ReturnType<typeof usePreOnboardingRequirements>;
      let error: unknown = null;

      render(
        <PreOnboardingRequirements
          render={(bag) => {
            renderBag = bag;
            return (
              <button
                onClick={async () => {
                  try {
                    await bag.onSignDocument('test-signature');
                  } catch (e) {
                    error = e;
                  }
                }}
              >
                Sign Without Document
              </button>
            );
          }}
        />,
        { wrapper: TestWrapper },
      );

      await waitFor(() => {
        expect(renderBag?.requirements).toBeDefined();
      });

      const button = screen.getByText('Sign Without Document');
      fireEvent.click(button);

      await waitFor(() => {
        expect(error).not.toBeNull();
      });

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('No active requirement selected');
    });
  });

  describe('loading states', () => {
    it('should show isCreatingDocument during document generation', async () => {
      server.use(
        http.post(
          '*/v1/onboarding/employments/:employmentId/pre-onboarding-documents',
          () => {
            return new Promise(() => {});
          },
        ),
      );

      let renderBag: ReturnType<typeof usePreOnboardingRequirements>;

      render(
        <PreOnboardingRequirements
          render={(bag) => {
            renderBag = bag;
            return (
              <div>
                <button
                  onClick={() =>
                    bag.onCreateDocument('5e39159e-96ef-40ea-82bc-b054917fc82f')
                  }
                >
                  Generate
                </button>
                {bag.isCreatingDocument && <div>Creating document...</div>}
              </div>
            );
          }}
        />,
        { wrapper: TestWrapper },
      );

      await waitFor(() => {
        expect(renderBag?.requirements).toBeDefined();
      });

      const button = screen.getByText('Generate');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Creating document...')).toBeInTheDocument();
      });
    });

    it('should show isSigning during document signing', async () => {
      server.use(
        http.post(
          '*/v1/onboarding/employments/:employmentId/pre-onboarding-documents/:documentId/sign',
          () => {
            return new Promise(() => {});
          },
        ),
      );

      let renderBag: ReturnType<typeof usePreOnboardingRequirements>;

      render(
        <PreOnboardingRequirements
          render={(bag) => {
            renderBag = bag;
            return (
              <div>
                <button
                  onClick={async () => {
                    await bag.onCreateDocument(
                      '5e39159e-96ef-40ea-82bc-b054917fc82f',
                    );
                  }}
                >
                  Generate
                </button>
                {bag.documentPreview && (
                  <button onClick={() => bag.onSignDocument('test-signature')}>
                    Sign
                  </button>
                )}
                {bag.isSigning && <div>Signing document...</div>}
              </div>
            );
          }}
        />,
        { wrapper: TestWrapper },
      );

      await waitFor(() => {
        expect(renderBag?.requirements).toBeDefined();
      });

      const generateButton = screen.getByText('Generate');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Sign')).toBeInTheDocument();
      });

      const signButton = screen.getByText('Sign');
      fireEvent.click(signButton);

      await waitFor(() => {
        expect(screen.getByText('Signing document...')).toBeInTheDocument();
      });
    });
  });

  describe('document preview', () => {
    it('should load document preview when documentId is set', async () => {
      const getDocumentSpy = vi.fn(() =>
        HttpResponse.json(documentDetailsMock),
      );

      server.use(
        http.get(
          '*/v1/onboarding/employments/:employmentId/pre-onboarding-documents/:documentId',
          getDocumentSpy,
        ),
      );

      let renderBag: ReturnType<typeof usePreOnboardingRequirements>;

      render(
        <PreOnboardingRequirements
          render={(bag) => {
            renderBag = bag;
            return (
              <div>
                <button
                  onClick={() =>
                    bag.onCreateDocument('5e39159e-96ef-40ea-82bc-b054917fc82f')
                  }
                >
                  Generate
                </button>
                {bag.documentPreview && (
                  <div data-testid='document-details'>
                    <div>
                      {bag.documentPreview.pre_onboarding_document.name}
                    </div>
                    <div>
                      Status:{' '}
                      {bag.documentPreview.pre_onboarding_document.status}
                    </div>
                    <div>
                      Signatories:{' '}
                      {
                        bag.documentPreview.pre_onboarding_document.signatories
                          .length
                      }
                    </div>
                  </div>
                )}
              </div>
            );
          }}
        />,
        { wrapper: TestWrapper },
      );

      await waitFor(() => {
        expect(renderBag?.requirements).toBeDefined();
      });

      const button = screen.getByText('Generate');
      fireEvent.click(button);

      await waitFor(() => {
        expect(getDocumentSpy).toHaveBeenCalled();
        expect(screen.getByTestId('document-details')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/2026-05-19_GermanyMSAtemplate/),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Status: awaiting_signatures'),
      ).toBeInTheDocument();
      expect(screen.getByText('Signatories: 1')).toBeInTheDocument();
    });

    it('should show different previews for multiple requirements and not duplicate API calls', async () => {
      const createDocumentSpy = vi.fn(() =>
        HttpResponse.json(generatedDocumentMock),
      );

      server.use(
        http.post(
          '*/v1/onboarding/employments/:employmentId/pre-onboarding-documents',
          createDocumentSpy,
        ),
      );

      render(
        <PreOnboardingRequirements
          render={(bag) => (
            <div>
              <button
                onClick={() => bag.onCreateDocument('req-1')}
                disabled={bag.isCreatingDocument}
              >
                Open Req 1
              </button>
              <button
                onClick={() => bag.onCreateDocument('req-2')}
                disabled={bag.isCreatingDocument}
              >
                Open Req 2
              </button>
              {bag.documentPreview && <div>Preview loaded</div>}
            </div>
          )}
        />,
        { wrapper: TestWrapper },
      );

      fireEvent.click(screen.getByText('Open Req 1'));
      await waitFor(() =>
        expect(screen.getByText('Preview loaded')).toBeInTheDocument(),
      );
      expect(createDocumentSpy).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('Open Req 2'));
      await waitFor(() => expect(createDocumentSpy).toHaveBeenCalledTimes(2));

      fireEvent.click(screen.getByText('Open Req 1'));
      expect(createDocumentSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('blocked requirements', () => {
    it('should not call API when creating document for blocked requirement', async () => {
      const createDocumentSpy = vi.fn(() =>
        Promise.resolve(HttpResponse.json(generatedDocumentMock)),
      );

      server.use(
        http.get(
          '*/v1/onboarding/employments/:employmentId/pre-onboarding-document-requirements',
          () => {
            return HttpResponse.json({
              data: [
                {
                  name: 'Individual Labor Agreement',
                  status: 'blocked',
                  description: 'Blocked until MSA is signed',
                  slug: '5e39159e-96ef-40ea-82bc-b054917fc82f',
                  depends_on_requirement: {
                    name: 'Master Service Agreement',
                    status: 'awaiting_signatures',
                    description: 'Master Service Agreement',
                    slug: 'dc3b954c-9d6c-4ddd-b8dc-531f9be773fb',
                    depends_on_requirement: null,
                    document_constraints_ack_at: null,
                    freeze_employment_data: false,
                    needs_constraints_ack: true,
                    redlining_help_email: null,
                    supports_redlining: false,
                  },
                  document_constraints_ack_at: null,
                  freeze_employment_data: false,
                  needs_constraints_ack: true,
                  redlining_help_email: null,
                  supports_redlining: false,
                },
              ],
            });
          },
        ),
        http.post(
          '*/v1/onboarding/employments/:employmentId/pre-onboarding-documents',
          createDocumentSpy,
        ),
      );

      render(
        <PreOnboardingRequirements
          render={(bag) => (
            <div>
              {bag.requirements?.map((req) => (
                <div key={req.slug}>
                  <span>
                    {req.name} - {req.status}
                  </span>
                  <button
                    onClick={() => bag.onCreateDocument(req.slug)}
                    disabled={req.status === 'blocked'}
                  >
                    Create Document
                  </button>
                </div>
              ))}
            </div>
          )}
        />,
        { wrapper: TestWrapper },
      );

      await waitFor(() => {
        expect(
          screen.getByText('Individual Labor Agreement - blocked'),
        ).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create Document');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(createDocumentSpy).not.toHaveBeenCalled();
      });
    });

    it('should throw error when attempting to create document for blocked requirement', async () => {
      server.use(
        http.get(
          '*/v1/onboarding/employments/:employmentId/pre-onboarding-document-requirements',
          () => {
            return HttpResponse.json({
              data: [
                {
                  name: 'Individual Labor Agreement',
                  status: 'blocked',
                  description: 'Blocked until MSA is signed',
                  slug: '5e39159e-96ef-40ea-82bc-b054917fc82f',
                  depends_on_requirement: {
                    name: 'Master Service Agreement',
                    status: 'awaiting_signatures',
                    description: 'Master Service Agreement',
                    slug: 'dc3b954c-9d6c-4ddd-b8dc-531f9be773fb',
                    depends_on_requirement: null,
                    document_constraints_ack_at: null,
                    freeze_employment_data: false,
                    needs_constraints_ack: true,
                    redlining_help_email: null,
                    supports_redlining: false,
                  },
                  document_constraints_ack_at: null,
                  freeze_employment_data: false,
                  needs_constraints_ack: true,
                  redlining_help_email: null,
                  supports_redlining: false,
                },
              ],
            });
          },
        ),
      );

      let renderBag!: ReturnType<typeof usePreOnboardingRequirements>;

      render(
        <PreOnboardingRequirements
          render={(bag) => {
            renderBag = bag;
            return <div>Test</div>;
          }}
        />,
        { wrapper: TestWrapper },
      );

      await waitFor(() => {
        expect(renderBag.requirements).toBeDefined();
      });

      await expect(
        renderBag.onCreateDocument('5e39159e-96ef-40ea-82bc-b054917fc82f'),
      ).rejects.toThrow(
        'Cannot create document for blocked requirement. Master Service Agreement must be completed first.',
      );
    });
  });
});
