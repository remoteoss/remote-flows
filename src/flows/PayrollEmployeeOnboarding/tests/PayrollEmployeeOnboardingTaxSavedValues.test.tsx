import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { PayrollEmployeeOnboardingFlow } from '@/src/flows/PayrollEmployeeOnboarding/PayrollEmployeeOnboardingFlow';
import type { PayrollEmployeeOnboardingRenderProps } from '@/src/flows/PayrollEmployeeOnboarding/types';

const EMPLOYMENT_ID = 'employment-1';
const JURISDICTION = 'CA';

const textField = (title: string) => ({
  title,
  type: 'string',
  'x-jsf-presentation': { inputType: 'text' },
});

const radioField = (title: string, options: [string, string][]) => ({
  title,
  type: 'string',
  oneOf: options.map(([value, label]) => ({ const: value, title: label })),
  'x-jsf-presentation': { inputType: 'radio' },
});

const moneyField = (title: string) => ({
  title,
  type: ['integer', 'null'],
  'x-jsf-presentation': { inputType: 'money', currency: 'USD' },
});

const personalDetailsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: { given_name: textField('Given name') },
  'x-jsf-order': ['given_name'],
};

const addressSchema = {
  type: 'object',
  additionalProperties: false,
  properties: { city: textField('City') },
  'x-jsf-order': ['city'],
};

const federalTaxesSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    filing_status: radioField('Federal filing status', [
      ['single', 'Single'],
      ['married_filing_jointly', 'Married filing jointly'],
    ]),
    two_jobs: radioField('Two jobs', [
      ['yes', 'Yes'],
      ['no', 'No'],
    ]),
    dependents_amount: moneyField('Dependents amount'),
  },
  'x-jsf-order': ['filing_status', 'two_jobs', 'dependents_amount'],
};

const stateTaxesSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    state_filing_status: radioField('State filing status', [
      ['single', 'Single or married filing separately'],
      ['head_of_household', 'Head of household'],
    ]),
    additional_withholding: moneyField('Additional withholding'),
  },
  'x-jsf-order': ['state_filing_status', 'additional_withholding'],
};

const schemasByForm: Record<string, unknown> = {
  global_payroll_personal_details: personalDetailsSchema,
  address_details: addressSchema,
  global_payroll_federal_taxes: federalTaxesSchema,
  global_payroll_state_taxes: stateTaxesSchema,
};

const onboardingStepsResponse = (enrolled: boolean) => ({
  data: {
    steps: [
      {
        id: 'self-onboarding',
        label: 'Self onboarding',
        status: 'completed',
        type: 'self_onboarding',
        sub_steps: [],
      },
      {
        id: 'completion',
        label: 'Completion',
        status: enrolled ? 'completed' : 'not_started',
        type: 'completion',
        sub_steps: [
          {
            id: 'completion-sub-step',
            label: 'Completion',
            optional: false,
            status: enrolled ? 'completed' : 'not_started',
            type: 'completion',
          },
        ],
      },
    ],
  },
});

type SavedRead = Record<string, unknown> | null | 'not_found';

type ReadLog = {
  count: number;
  headers?: Record<string, string | null>;
  jurisdictions: string[];
};

function mockApi({
  enrolled = true,
  federalTaxes = null,
  stateTaxes = null,
}: {
  enrolled?: boolean;
  federalTaxes?: SavedRead;
  stateTaxes?: SavedRead;
} = {}) {
  const putBodies: Record<string, unknown> = {};
  const putJurisdictions: string[] = [];
  const federalReads: ReadLog = { count: 0, jurisdictions: [] };
  const stateReads: ReadLog = { count: 0, jurisdictions: [] };

  const logRead = (log: ReadLog, request: Request) => {
    log.count += 1;
    log.headers = {
      authorization: request.headers.get('authorization'),
      'x-rf-employment-id': request.headers.get('x-rf-employment-id'),
    };
  };

  const taxTaskNotFound = () =>
    HttpResponse.json(
      { message: 'Tax task not found for employment' },
      { status: 404 },
    );

  server.use(
    http.get('*/v1/employments/:employmentId/onboarding-steps', () =>
      HttpResponse.json(onboardingStepsResponse(enrolled)),
    ),
    http.get('*/v1/countries/:countryCode/:form', ({ params }) =>
      HttpResponse.json({ data: schemasByForm[params.form as string] }),
    ),
    http.get('*/v1/employee/personal-details', () =>
      HttpResponse.json({ data: { employment: { personal_details: null } } }),
    ),
    http.get('*/v1/employee/address', () =>
      HttpResponse.json({ data: { employment: { address_details: null } } }),
    ),
    http.put('*/v1/employee/personal-details', () =>
      HttpResponse.json({ data: { employment: {} } }),
    ),
    http.get('*/v1/employee/federal-taxes', async ({ request }) => {
      logRead(federalReads, request);
      await delay(50);
      if (federalTaxes === 'not_found') {
        return taxTaskNotFound();
      }
      return HttpResponse.json({ data: { federal_taxes: federalTaxes } });
    }),
    http.get(
      '*/v1/employee/state-taxes/:jurisdiction',
      async ({ request, params }) => {
        logRead(stateReads, request);
        stateReads.jurisdictions.push(params.jurisdiction as string);
        await delay(50);
        if (stateTaxes === 'not_found') {
          return taxTaskNotFound();
        }
        return HttpResponse.json({ data: { state_taxes: stateTaxes } });
      },
    ),
    http.put('*/v1/employee/federal-taxes', async ({ request }) => {
      putBodies.federal_taxes = await request.json();
      return HttpResponse.json({ data: { status: 'ok' } });
    }),
    http.put(
      '*/v1/employee/state-taxes/:jurisdiction',
      async ({ request, params }) => {
        putBodies.state_taxes = await request.json();
        putJurisdictions.push(params.jurisdiction as string);
        return HttpResponse.json({ data: { status: 'ok' } });
      },
    ),
  );

  return { putBodies, putJurisdictions, federalReads, stateReads };
}

function renderFlow({
  countryCode = 'USA',
  jurisdiction = JURISDICTION,
}: { countryCode?: string; jurisdiction?: string | null } = {}) {
  const renderStep = ({
    employeeBag,
    components,
  }: PayrollEmployeeOnboardingRenderProps) => {
    const {
      PersonalDetailsStep,
      HomeAddressStep,
      FederalTaxesStep,
      StateTaxesStep,
      SubmitButton,
    } = components;
    const currentStep = employeeBag.stepState.currentStep.name;
    const { federal_taxes, state_taxes } = employeeBag.taxStepsAvailability;
    return (
      <>
        <p data-testid='current-step'>{currentStep}</p>
        <p data-testid='federal-unavailable-reason'>
          {String(federal_taxes.unavailableReason)}
        </p>
        <p data-testid='state-unavailable-reason'>
          {String(state_taxes.unavailableReason)}
        </p>
        {currentStep === 'personal_details' && <PersonalDetailsStep />}
        {currentStep === 'home_address' && <HomeAddressStep />}
        {currentStep === 'federal_taxes' && <FederalTaxesStep />}
        {currentStep === 'state_taxes' && <StateTaxesStep />}
        <SubmitButton>Next</SubmitButton>
        <button
          type='button'
          onClick={() => employeeBag.goToStep('federal_taxes')}
        >
          Go to federal taxes
        </button>
        <button
          type='button'
          onClick={() => employeeBag.goToStep('state_taxes')}
        >
          Go to state taxes
        </button>
      </>
    );
  };

  return render(
    <PayrollEmployeeOnboardingFlow
      employmentId={EMPLOYMENT_ID}
      countryCode={countryCode}
      {...(jurisdiction ? { jurisdiction } : {})}
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

async function goToTaxStep(step: 'federal_taxes' | 'state_taxes') {
  await screen.findByLabelText('Given name');
  const label =
    step === 'federal_taxes' ? 'Go to federal taxes' : 'Go to state taxes';
  fireEvent.click(screen.getByRole('button', { name: label }));
  await waitForStep(step);
}

const employeeReadHeaders = {
  authorization: '',
  'x-rf-employment-id': EMPLOYMENT_ID,
};

const savedFederalTaxes = {
  filing_status: 'married_filing_jointly',
  two_jobs: 'yes',
  dependents_amount: 200000,
};

const savedStateTaxes = {
  state_filing_status: 'head_of_household',
  additional_withholding: 5000,
};

describe('PayrollEmployeeOnboardingFlow saved tax values', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  describe('federal taxes', () => {
    it('starts the federal taxes step from the saved answers', async () => {
      const { federalReads } = mockApi({ federalTaxes: savedFederalTaxes });
      renderFlow();
      await goToTaxStep('federal_taxes');

      expect(
        await screen.findByRole('radio', { name: 'Married filing jointly' }),
      ).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Yes' })).toBeChecked();
      expect(screen.getByLabelText('Dependents amount')).toHaveValue('2000');
      expect(federalReads.headers).toEqual(employeeReadHeaders);
    });

    it('sends untouched saved answers back unchanged', async () => {
      const { putBodies } = mockApi({ federalTaxes: savedFederalTaxes });
      renderFlow();
      await goToTaxStep('federal_taxes');

      expect(
        await screen.findByRole('radio', { name: 'Married filing jointly' }),
      ).toBeChecked();
      await clickNext();

      await waitForStep('state_taxes');
      expect(putBodies.federal_taxes).toEqual({
        federal_taxes: savedFederalTaxes,
      });
    });

    it('leaves the form blank and usable when the tax task is not set up yet', async () => {
      const { putBodies } = mockApi({ federalTaxes: 'not_found' });
      renderFlow();
      await goToTaxStep('federal_taxes');

      const single = await screen.findByRole('radio', { name: 'Single' });
      expect(single).not.toBeChecked();
      expect(screen.getByLabelText('Dependents amount')).toHaveValue('');
      expect(
        screen.getByTestId('federal-unavailable-reason'),
      ).toHaveTextContent('null');

      fireEvent.click(single);
      await clickNext();

      await waitForStep('state_taxes');
      expect(putBodies.federal_taxes).toEqual({
        federal_taxes: { filing_status: 'single' },
      });
    });

    it('leaves the form blank when nothing is saved yet', async () => {
      mockApi({ federalTaxes: null });
      renderFlow();
      await goToTaxStep('federal_taxes');

      expect(
        await screen.findByRole('radio', { name: 'Single' }),
      ).not.toBeChecked();
      expect(
        screen.getByRole('radio', { name: 'Married filing jointly' }),
      ).not.toBeChecked();
      expect(screen.getByLabelText('Dependents amount')).toHaveValue('');
    });

    it('starts a remounted flow from what was just saved, not the cached read', async () => {
      mockApi({ federalTaxes: savedFederalTaxes });
      const { unmount } = renderFlow();
      await goToTaxStep('federal_taxes');

      expect(
        await screen.findByRole('radio', { name: 'Married filing jointly' }),
      ).toBeChecked();
      fireEvent.click(screen.getByRole('radio', { name: 'Single' }));
      await clickNext();
      await waitForStep('state_taxes');

      unmount();
      server.use(
        http.get('*/v1/employee/federal-taxes', async () => {
          await delay('infinite');
          return HttpResponse.json({ data: { federal_taxes: null } });
        }),
      );
      renderFlow();
      await goToTaxStep('federal_taxes');

      expect(
        await screen.findByRole('radio', { name: 'Single' }),
      ).toBeChecked();
      expect(screen.getByLabelText('Dependents amount')).toHaveValue('2000');
    });

    it('keeps the form mounted and does not re-read while a save advances the step', async () => {
      let stepFormUnmountedBeforeAdvancing = false;
      const { federalReads } = mockApi({ federalTaxes: savedFederalTaxes });
      renderFlow();
      await goToTaxStep('federal_taxes');

      await screen.findByLabelText('Dependents amount');
      const observer = new MutationObserver(() => {
        if (
          screen.getByTestId('current-step').textContent === 'federal_taxes' &&
          !screen.queryByLabelText('Dependents amount')
        ) {
          stepFormUnmountedBeforeAdvancing = true;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      await clickNext();
      await waitForStep('state_taxes');
      observer.disconnect();

      expect(stepFormUnmountedBeforeAdvancing).toBe(false);
      expect(federalReads.count).toBe(1);
    });
  });

  describe('state taxes', () => {
    it('starts the state taxes step from the saved answers for the jurisdiction', async () => {
      const { stateReads } = mockApi({ stateTaxes: savedStateTaxes });
      renderFlow();
      await goToTaxStep('state_taxes');

      expect(
        await screen.findByRole('radio', { name: 'Head of household' }),
      ).toBeChecked();
      expect(screen.getByLabelText('Additional withholding')).toHaveValue('50');
      expect(stateReads.headers).toEqual(employeeReadHeaders);
      expect(stateReads.jurisdictions).toEqual([JURISDICTION]);
    });

    it('sends untouched saved answers back unchanged', async () => {
      const { putBodies, putJurisdictions } = mockApi({
        stateTaxes: savedStateTaxes,
      });
      renderFlow();
      await goToTaxStep('state_taxes');

      expect(
        await screen.findByRole('radio', { name: 'Head of household' }),
      ).toBeChecked();
      await clickNext();

      await waitFor(() => expect(putBodies.state_taxes).toBeDefined());
      expect(putBodies.state_taxes).toEqual({ state_taxes: savedStateTaxes });
      expect(putJurisdictions).toEqual([JURISDICTION]);
    });

    it('leaves the form blank and usable when the jurisdiction is not set up yet', async () => {
      const { putBodies } = mockApi({ stateTaxes: 'not_found' });
      renderFlow();
      await goToTaxStep('state_taxes');

      const headOfHousehold = await screen.findByRole('radio', {
        name: 'Head of household',
      });
      expect(headOfHousehold).not.toBeChecked();
      expect(screen.getByLabelText('Additional withholding')).toHaveValue('');
      expect(screen.getByTestId('state-unavailable-reason')).toHaveTextContent(
        'null',
      );

      fireEvent.click(headOfHousehold);
      await clickNext();

      await waitFor(() => expect(putBodies.state_taxes).toBeDefined());
      expect(putBodies.state_taxes).toEqual({
        state_taxes: { state_filing_status: 'head_of_household' },
      });
      expect(screen.getByTestId('state-unavailable-reason')).toHaveTextContent(
        'null',
      );
    });

    it('leaves the form blank when nothing is saved yet', async () => {
      mockApi({ stateTaxes: null });
      renderFlow();
      await goToTaxStep('state_taxes');

      expect(
        await screen.findByRole('radio', { name: 'Head of household' }),
      ).not.toBeChecked();
      expect(screen.getByLabelText('Additional withholding')).toHaveValue('');
    });

    it('starts a remounted flow from what was just saved, not the cached read', async () => {
      const { putBodies } = mockApi({ stateTaxes: savedStateTaxes });
      const { unmount } = renderFlow();
      await goToTaxStep('state_taxes');

      expect(
        await screen.findByRole('radio', { name: 'Head of household' }),
      ).toBeChecked();
      fireEvent.click(
        screen.getByRole('radio', {
          name: 'Single or married filing separately',
        }),
      );
      await clickNext();
      await waitFor(() => expect(putBodies.state_taxes).toBeDefined());

      unmount();
      server.use(
        http.get('*/v1/employee/state-taxes/:jurisdiction', async () => {
          await delay('infinite');
          return HttpResponse.json({ data: { state_taxes: null } });
        }),
      );
      renderFlow();
      await goToTaxStep('state_taxes');

      expect(
        await screen.findByRole('radio', {
          name: 'Single or married filing separately',
        }),
      ).toBeChecked();
    });

    it('keeps the form mounted and does not re-read while a save is in flight', async () => {
      let stepFormUnmountedWhileSaving = false;
      const { putBodies, stateReads } = mockApi({
        stateTaxes: savedStateTaxes,
      });
      renderFlow();
      await goToTaxStep('state_taxes');

      await screen.findByLabelText('Additional withholding');
      const observer = new MutationObserver(() => {
        if (!screen.queryByLabelText('Additional withholding')) {
          stepFormUnmountedWhileSaving = true;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      await clickNext();
      await waitFor(() => expect(putBodies.state_taxes).toBeDefined());
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled(),
      );
      observer.disconnect();

      expect(stepFormUnmountedWhileSaving).toBe(false);
      expect(stateReads.count).toBe(1);
    });
  });

  describe('when the tax steps are not shown', () => {
    it('does not read saved taxes outside the USA', async () => {
      const { federalReads, stateReads } = mockApi();
      renderFlow({ countryCode: 'PRT' });

      await screen.findByLabelText('Given name');
      await clickNext();
      await waitForStep('home_address');
      await screen.findByLabelText('City');

      expect(federalReads.count).toBe(0);
      expect(stateReads.count).toBe(0);
    });

    it('does not read saved taxes before enrollment', async () => {
      const { federalReads, stateReads } = mockApi({ enrolled: false });
      renderFlow();

      await screen.findByLabelText('Given name');
      await clickNext();
      await waitForStep('home_address');
      await screen.findByLabelText('City');

      expect(federalReads.count).toBe(0);
      expect(stateReads.count).toBe(0);
    });

    it('does not read saved state taxes without a jurisdiction', async () => {
      const { federalReads, stateReads } = mockApi({
        federalTaxes: savedFederalTaxes,
      });
      renderFlow({ jurisdiction: null });
      await goToTaxStep('federal_taxes');

      expect(
        await screen.findByRole('radio', { name: 'Married filing jointly' }),
      ).toBeChecked();
      expect(federalReads.count).toBe(1);
      expect(stateReads.count).toBe(0);
    });
  });
});
