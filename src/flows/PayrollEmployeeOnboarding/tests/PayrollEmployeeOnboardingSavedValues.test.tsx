import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { PayrollEmployeeOnboardingFlow } from '@/src/flows/PayrollEmployeeOnboarding/PayrollEmployeeOnboardingFlow';
import type { PayrollEmployeeOnboardingRenderProps } from '@/src/flows/PayrollEmployeeOnboarding/types';

const EMPLOYMENT_ID = 'employment-1';

const textField = (title: string) => ({
  title,
  type: 'string',
  'x-jsf-presentation': { inputType: 'text' },
});

const personalDetailsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    given_name: textField('Given name'),
    surname: textField('Surname'),
    sex: {
      title: 'Sex',
      type: 'string',
      oneOf: [
        { const: 'female', title: 'Female' },
        { const: 'male', title: 'Male' },
      ],
      'x-jsf-presentation': { inputType: 'radio' },
    },
    birthdate: {
      title: 'Birthdate',
      type: 'string',
      format: 'date',
      'x-jsf-presentation': { inputType: 'date' },
    },
    has_preferred_name: {
      title: 'Has preferred name',
      type: 'string',
      oneOf: [
        { const: 'yes', title: 'Yes' },
        { const: 'no', title: 'No' },
      ],
      'x-jsf-presentation': { inputType: 'radio' },
    },
    preferred_name: textField('Preferred name'),
  },
  allOf: [
    {
      if: {
        properties: { has_preferred_name: { const: 'yes' } },
        required: ['has_preferred_name'],
      },
      then: { required: ['preferred_name'] },
      else: { properties: { preferred_name: false } },
    },
  ],
  'x-jsf-order': [
    'given_name',
    'surname',
    'sex',
    'birthdate',
    'has_preferred_name',
    'preferred_name',
  ],
};

const addressSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    address_line_1: textField('Address line 1'),
    city: textField('City'),
    postal_code: textField('Postal code'),
  },
  'x-jsf-order': ['address_line_1', 'city', 'postal_code'],
};

const bankAccountSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    account_holder: textField('Account holder'),
    account_number: textField('Account number'),
  },
  'x-jsf-order': ['account_holder', 'account_number'],
};

const schemasByForm: Record<string, unknown> = {
  global_payroll_personal_details: personalDetailsSchema,
  address_details: addressSchema,
  global_payroll_bank_account_details: bankAccountSchema,
};

const onboardingStepsResponse = (withBankSubstep: boolean) => ({
  data: {
    steps: [
      {
        id: 'self-onboarding',
        label: 'Self onboarding',
        status: 'in_progress',
        type: 'self_onboarding',
        sub_steps: withBankSubstep
          ? [
              {
                id: 'bank',
                label: 'Bank details',
                optional: false,
                status: 'not_started',
                type: 'employee_provides_bank_details',
              },
            ]
          : [],
      },
    ],
  },
});

const employmentResponse = (employment: Record<string, unknown>) => ({
  data: { employment },
});

type SavedReads = {
  personalDetails?: Record<string, unknown> | null;
  address?: Record<string, unknown> | null;
  bankAccounts?: Record<string, unknown>[];
  failPersonalDetails?: boolean;
};

function mockApi({
  withBankSubstep = false,
  saved = {},
}: { withBankSubstep?: boolean; saved?: SavedReads } = {}) {
  const putBodies: Record<string, unknown> = {};
  const savedReadHeaders: Record<string, Record<string, string | null>> = {};
  const bankReads = { count: 0 };

  const recordHeaders = (key: string, request: Request) => {
    savedReadHeaders[key] = {
      authorization: request.headers.get('authorization'),
      'x-rf-employment-id': request.headers.get('x-rf-employment-id'),
    };
  };

  server.use(
    http.get('*/v1/employments/:employmentId/onboarding-steps', () =>
      HttpResponse.json(onboardingStepsResponse(withBankSubstep)),
    ),
    http.get('*/v1/countries/:countryCode/:form', ({ params }) =>
      HttpResponse.json({ data: schemasByForm[params.form as string] }),
    ),
    http.get('*/v1/employee/personal-details', async ({ request }) => {
      recordHeaders('personal_details', request);
      await delay(50);
      if (saved.failPersonalDetails) {
        return HttpResponse.json({ message: 'boom' }, { status: 500 });
      }
      return HttpResponse.json(
        employmentResponse({ personal_details: saved.personalDetails ?? null }),
      );
    }),
    http.get('*/v1/employee/address', async ({ request }) => {
      recordHeaders('home_address', request);
      await delay(50);
      return HttpResponse.json(
        employmentResponse({ address_details: saved.address ?? null }),
      );
    }),
    http.get('*/v1/employee/bank-account', async ({ request }) => {
      recordHeaders('bank_account', request);
      bankReads.count += 1;
      await delay(50);
      return HttpResponse.json(
        employmentResponse({ bank_account_details: saved.bankAccounts ?? [] }),
      );
    }),
    http.put('*/v1/employee/personal-details', async ({ request }) => {
      putBodies.personal_details = await request.json();
      return HttpResponse.json(employmentResponse({}));
    }),
    http.put('*/v1/employee/address', async ({ request }) => {
      putBodies.home_address = await request.json();
      return HttpResponse.json(employmentResponse({}));
    }),
    http.put('*/v1/employee/bank-account', async ({ request }) => {
      putBodies.bank_account = await request.json();
      return HttpResponse.json(employmentResponse({}));
    }),
  );

  return { putBodies, savedReadHeaders, bankReads };
}

function renderFlow(initialValues?: Record<string, unknown>) {
  const renderStep = ({
    employeeBag,
    components,
  }: PayrollEmployeeOnboardingRenderProps) => {
    const {
      PersonalDetailsStep,
      HomeAddressStep,
      BankAccountStep,
      SubmitButton,
      BackButton,
    } = components;
    const currentStep = employeeBag.stepState.currentStep.name;
    return (
      <>
        <p data-testid='current-step'>{currentStep}</p>
        {currentStep === 'personal_details' && <PersonalDetailsStep />}
        {currentStep === 'home_address' && <HomeAddressStep />}
        {currentStep === 'bank_account' && <BankAccountStep />}
        <BackButton>Back</BackButton>
        <SubmitButton>Next</SubmitButton>
        <button
          type='button'
          onClick={() => employeeBag.goToStep('bank_account')}
        >
          Go to bank account
        </button>
      </>
    );
  };

  return render(
    <PayrollEmployeeOnboardingFlow
      employmentId={EMPLOYMENT_ID}
      countryCode='PRT'
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

async function waitForStep(step: string) {
  await waitFor(() =>
    expect(screen.getByTestId('current-step')).toHaveTextContent(step),
  );
}

const employeeReadHeaders = {
  authorization: '',
  'x-rf-employment-id': EMPLOYMENT_ID,
};

const savedPersonalDetails = {
  given_name: 'Jane',
  surname: 'Doe',
  sex: 'female',
  birthdate: '1990-05-17',
};

describe('PayrollEmployeeOnboardingFlow saved values', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('starts the personal details step from the saved personal details', async () => {
    const { savedReadHeaders } = mockApi({
      saved: { personalDetails: savedPersonalDetails },
    });
    renderFlow();

    expect(await screen.findByLabelText('Given name')).toHaveValue('Jane');
    expect(screen.getByLabelText('Surname')).toHaveValue('Doe');
    expect(screen.getByRole('radio', { name: 'Female' })).toBeChecked();
    expect(screen.getByTestId('birthdate')).toHaveValue('1990-05-17');
    expect(savedReadHeaders.personal_details).toEqual(employeeReadHeaders);
  });

  it('sends untouched saved personal details back unchanged', async () => {
    const { putBodies } = mockApi({
      saved: { personalDetails: savedPersonalDetails },
    });
    renderFlow();

    expect(await screen.findByLabelText('Given name')).toHaveValue('Jane');
    await clickNext();

    await waitForStep('home_address');
    expect(putBodies.personal_details).toEqual({
      personal_details: savedPersonalDetails,
    });
  });

  it('does not send saved keys the form has no field for', async () => {
    const { putBodies } = mockApi({
      saved: {
        personalDetails: {
          ...savedPersonalDetails,
          full_preferred_name: 'Jane Doe',
          recovery_number: '+351900000000',
          is_us_person: false,
        },
      },
    });
    renderFlow();

    expect(await screen.findByLabelText('Given name')).toHaveValue('Jane');
    await clickNext();

    await waitForStep('home_address');
    expect(putBodies.personal_details).toEqual({
      personal_details: savedPersonalDetails,
    });
  });

  it('sends an untouched saved address back unchanged', async () => {
    const savedAddress = {
      address_line_1: 'Rua Augusta 1',
      city: 'Lisbon',
      postal_code: '1100-048',
    };
    const { putBodies, savedReadHeaders } = mockApi({
      saved: { personalDetails: savedPersonalDetails, address: savedAddress },
    });
    renderFlow();

    expect(await screen.findByLabelText('Given name')).toHaveValue('Jane');
    await clickNext();
    await waitForStep('home_address');

    expect(await screen.findByLabelText('City')).toHaveValue('Lisbon');
    expect(screen.getByLabelText('Address line 1')).toHaveValue(
      'Rua Augusta 1',
    );
    await clickNext();

    await waitFor(() => expect(putBodies.home_address).toBeDefined());
    expect(putBodies.home_address).toEqual({ address_details: savedAddress });
    expect(savedReadHeaders.home_address).toEqual(employeeReadHeaders);
  });

  it('shows a conditional field that the saved values turn on', async () => {
    mockApi({
      saved: {
        personalDetails: {
          ...savedPersonalDetails,
          has_preferred_name: 'yes',
          preferred_name: 'Jo',
        },
      },
    });
    renderFlow();

    expect(await screen.findByLabelText('Preferred name')).toHaveValue('Jo');
  });

  it('prefers saved values over initialValues, and in-session edits over saved values', async () => {
    mockApi({ saved: { personalDetails: { given_name: 'Jane' } } });
    renderFlow({
      personal_details: { given_name: 'Initial', surname: 'Initial surname' },
    });

    const givenName = await screen.findByLabelText('Given name');
    expect(givenName).toHaveValue('Jane');
    expect(screen.getByLabelText('Surname')).toHaveValue('Initial surname');

    await userEvent.clear(givenName);
    await userEvent.type(givenName, 'Janet');
    await clickNext();
    await waitForStep('home_address');

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitForStep('personal_details');

    expect(await screen.findByLabelText('Given name')).toHaveValue('Janet');
  });

  it('starts a remounted flow from what was just saved, not the cached read', async () => {
    let storedPersonalDetails: Record<string, unknown> = savedPersonalDetails;
    mockApi();
    server.use(
      http.get('*/v1/employee/personal-details', async () => {
        await delay(50);
        return HttpResponse.json(
          employmentResponse({ personal_details: storedPersonalDetails }),
        );
      }),
      http.put('*/v1/employee/personal-details', async ({ request }) => {
        const body = (await request.json()) as {
          personal_details: Record<string, unknown>;
        };
        storedPersonalDetails = body.personal_details;
        return HttpResponse.json(
          employmentResponse({ personal_details: storedPersonalDetails }),
        );
      }),
    );
    const { unmount } = renderFlow();

    const givenName = await screen.findByLabelText('Given name');
    expect(givenName).toHaveValue('Jane');
    await userEvent.clear(givenName);
    await userEvent.type(givenName, 'Janet');
    await clickNext();
    await waitForStep('home_address');
    await waitFor(() =>
      expect(storedPersonalDetails).toEqual({
        ...savedPersonalDetails,
        given_name: 'Janet',
      }),
    );

    unmount();
    renderFlow();

    expect(await screen.findByLabelText('Given name')).toHaveValue('Janet');
  });

  it('starts the bank account step from the default saved account without is_default', async () => {
    const { putBodies, savedReadHeaders } = mockApi({
      withBankSubstep: true,
      saved: {
        bankAccounts: [
          { account_holder: 'Old', account_number: '111', is_default: false },
          {
            account_holder: 'Jane Doe',
            account_number: '222',
            is_default: true,
          },
        ],
      },
    });
    renderFlow();

    await screen.findByLabelText('Given name');
    fireEvent.click(screen.getByRole('button', { name: 'Go to bank account' }));
    await waitForStep('bank_account');

    expect(await screen.findByLabelText('Account holder')).toHaveValue(
      'Jane Doe',
    );
    expect(screen.getByLabelText('Account number')).toHaveValue('222');
    await clickNext();

    await waitFor(() => expect(putBodies.bank_account).toBeDefined());
    expect(putBodies.bank_account).toEqual({
      bank_account_details: {
        account_holder: 'Jane Doe',
        account_number: '222',
      },
    });
    expect(savedReadHeaders.bank_account).toEqual(employeeReadHeaders);
  });

  it('falls back to the first saved bank account when none is the default', async () => {
    mockApi({
      withBankSubstep: true,
      saved: {
        bankAccounts: [
          { account_holder: 'First', account_number: '111' },
          { account_holder: 'Second', account_number: '222' },
        ],
      },
    });
    renderFlow();

    await screen.findByLabelText('Given name');
    fireEvent.click(screen.getByRole('button', { name: 'Go to bank account' }));

    expect(await screen.findByLabelText('Account holder')).toHaveValue('First');
  });

  it('does not read the saved bank account when the bank step is hidden', async () => {
    const { bankReads } = mockApi({ withBankSubstep: false });
    renderFlow();

    await screen.findByLabelText('Given name');
    await clickNext();
    await waitForStep('home_address');
    await screen.findByLabelText('City');

    expect(bankReads.count).toBe(0);
  });

  it('leaves the form blank and usable when the saved read fails', async () => {
    const { putBodies } = mockApi({ saved: { failPersonalDetails: true } });
    renderFlow();

    const givenName = await screen.findByLabelText('Given name');
    expect(givenName).toHaveValue('');

    await userEvent.type(givenName, 'Jane');
    await clickNext();

    await waitForStep('home_address');
    expect(putBodies.personal_details).toEqual({
      personal_details: { given_name: 'Jane' },
    });
  });

  it('leaves the form blank when nothing is saved yet', async () => {
    mockApi({ saved: { personalDetails: null } });
    renderFlow();

    expect(await screen.findByLabelText('Given name')).toHaveValue('');
    expect(screen.getByLabelText('Surname')).toHaveValue('');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled(),
    );
  });
});
