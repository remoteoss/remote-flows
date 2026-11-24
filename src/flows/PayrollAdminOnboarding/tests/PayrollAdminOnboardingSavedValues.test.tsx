import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { PayrollAdminOnboardingFlow } from '@/src/flows/PayrollAdminOnboarding/PayrollAdminOnboardingFlow';
import type { PayrollAdminOnboardingRenderProps } from '@/src/flows/PayrollAdminOnboarding/types';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

const EMPLOYMENT_ID = 'employment-1';

const textField = (title: string) => ({
  title,
  type: 'string',
  'x-jsf-presentation': { inputType: 'text' },
});

const moneyField = (title: string) => ({
  title,
  type: ['integer', 'null'],
  'x-jsf-presentation': { inputType: 'money', currency: 'CAD' },
});

const contractDetailsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    job_title: textField('Job title'),
    annual_salary: moneyField('Annual salary'),
    work_email: textField('Work email'),
  },
  'x-jsf-order': ['job_title', 'annual_salary', 'work_email'],
};

const administrativeDetailsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: { tax_number: textField('Tax number') },
  'x-jsf-order': ['tax_number'],
};

const schemasByForm: Record<string, unknown> = {
  global_payroll_contract_details: contractDetailsSchema,
  global_payroll_administrative_details: administrativeDetailsSchema,
};

const legalEntitiesResponse = {
  data: {
    legal_entities: [
      {
        id: 'le-1',
        name: 'Acme GP Legal Entity',
        country_code: 'CAN',
        is_default: true,
        global_payroll_enabled: true,
      },
    ],
    current_page: 1,
    total_pages: 1,
    total_count: 1,
  },
};

const savedEmployment = {
  contract_details: {
    job_title: 'Payroll analyst',
    annual_salary: 500000,
    work_email: null,
  },
  administrative_details: { tax_number: '123-456' },
};

type EmploymentSections = Partial<
  Record<keyof typeof savedEmployment, Record<string, unknown>>
>;

function mockApi({
  employmentStatus = 200,
  schemaDelayMs = 0,
  employmentDelayMs = 0,
}: {
  employmentStatus?: number;
  schemaDelayMs?: number;
  employmentDelayMs?: number;
} = {}) {
  const employment: EmploymentSections = structuredClone(savedEmployment);
  const putBodies: Record<string, unknown> = {};

  server.use(
    http.get('*/v1/companies/*/legal-entities', () =>
      HttpResponse.json(legalEntitiesResponse),
    ),
    http.get('*/v1/countries/:countryCode/:form', async ({ params }) => {
      await delay(schemaDelayMs);
      return HttpResponse.json({ data: schemasByForm[params.form as string] });
    }),
    http.get('*/v1/employments/:employmentId/onboarding-steps', () =>
      HttpResponse.json({ data: { steps: [] } }),
    ),
    http.get('*/v1/employments/:employmentId', async () => {
      await delay(employmentDelayMs);
      if (employmentStatus !== 200) {
        return HttpResponse.json(
          { message: 'Not found' },
          { status: employmentStatus },
        );
      }
      return HttpResponse.json({ data: { employment } });
    }),
    http.put(
      '*/v2/employments/:employmentId/contract-details',
      async ({ request }) => {
        const body = (await request.json()) as {
          contract_details: Record<string, unknown>;
        };
        putBodies.contract_details = body;
        employment.contract_details = body.contract_details;
        return HttpResponse.json({ data: { employment } });
      },
    ),
    http.put(
      '*/v2/employments/:employmentId/administrative-details',
      async ({ request }) => {
        const body = (await request.json()) as {
          administrative_details: Record<string, unknown>;
        };
        putBodies.administrative_details = body;
        employment.administrative_details = body.administrative_details;
        return HttpResponse.json({ data: { employment } });
      },
    ),
  );

  return { putBodies };
}

function renderStep({
  adminBag,
  components,
}: PayrollAdminOnboardingRenderProps) {
  const {
    ContractDetailsStep,
    AdministrativeDetailsStep,
    SubmitButton,
    BackButton,
  } = components;
  const currentStep = adminBag.stepState.currentStep.name;
  if (adminBag.isLoading) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <p data-testid='current-step'>{currentStep}</p>
      {currentStep === 'contract_details' && <ContractDetailsStep />}
      {currentStep === 'administrative_details' && (
        <AdministrativeDetailsStep />
      )}
      <BackButton>Back</BackButton>
      <SubmitButton>Next</SubmitButton>
    </>
  );
}

function renderFlow(initialValues?: Record<string, unknown>) {
  return render(
    <PayrollAdminOnboardingFlow
      companyId='company-1'
      countryCode='CAN'
      employmentId={EMPLOYMENT_ID}
      initialValues={initialValues}
      render={renderStep}
    />,
    { wrapper: TestProviders },
  );
}

async function clickNext() {
  const next = screen.getByRole('button', { name: 'Next' });
  await waitFor(() => expect(next).toBeEnabled());
  fireEvent.click(next);
}

describe('PayrollAdminOnboardingFlow saved values', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('opens the contract and administrative details steps with what is saved, money in dollars', async () => {
    const { putBodies } = mockApi();
    renderFlow();

    expect(await screen.findByLabelText('Job title')).toHaveValue(
      'Payroll analyst',
    );
    expect(screen.getByLabelText('Annual salary')).toHaveValue('5000');

    await clickNext();

    expect(await screen.findByLabelText('Tax number')).toHaveValue('123-456');
    expect(putBodies.contract_details).toEqual({
      contract_details: { job_title: 'Payroll analyst', annual_salary: 500000 },
    });
  });

  it('prefers saved values over initialValues and keeps initialValues for fields nothing saved', async () => {
    mockApi();
    renderFlow({
      contract_details: {
        job_title: 'Partner title',
        work_email: 'ada@example.com',
      },
    });

    expect(await screen.findByLabelText('Job title')).toHaveValue(
      'Payroll analyst',
    );
    expect(screen.getByLabelText('Work email')).toHaveValue('ada@example.com');
  });

  it('keeps what the admin typed over what is saved when they come back to a step', async () => {
    mockApi();
    renderFlow();

    fireEvent.change(await screen.findByLabelText('Job title'), {
      target: { value: 'Payroll lead' },
    });
    await clickNext();
    await screen.findByLabelText('Tax number');

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByLabelText('Job title')).toHaveValue(
      'Payroll lead',
    );
  });

  it('opens with initialValues and still submits when the saved read fails', async () => {
    const { putBodies } = mockApi({ employmentStatus: 404 });
    renderFlow({ contract_details: { job_title: 'Partner title' } });

    expect(await screen.findByLabelText('Job title')).toHaveValue(
      'Partner title',
    );

    await clickNext();

    await screen.findByLabelText('Tax number');
    expect(putBodies.contract_details).toEqual({
      contract_details: { job_title: 'Partner title' },
    });
  });

  it('shows what was last saved when the flow is reopened in the same session', async () => {
    mockApi();
    const { unmount } = renderFlow();

    fireEvent.change(await screen.findByLabelText('Job title'), {
      target: { value: 'Payroll lead' },
    });
    await clickNext();
    await screen.findByLabelText('Tax number');
    unmount();

    renderFlow();

    expect(await screen.findByLabelText('Job title')).toHaveValue(
      'Payroll lead',
    );
    expect(screen.getByLabelText('Annual salary')).toHaveValue('5000');
  });

  it('waits for the step schema and the saved employment before opening the form', async () => {
    mockApi({ schemaDelayMs: 30, employmentDelayMs: 80 });
    renderFlow();

    expect(await screen.findByLabelText('Job title')).toHaveValue(
      'Payroll analyst',
    );
  });
});
