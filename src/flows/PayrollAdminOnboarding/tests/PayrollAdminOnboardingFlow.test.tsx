import { useState } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { PayrollAdminOnboardingFlow } from '@/src/flows/PayrollAdminOnboarding/PayrollAdminOnboardingFlow';
import { PayrollAdminOnboardingRenderProps } from '@/src/flows/PayrollAdminOnboarding/types';
import { server } from '@/src/tests/server';
import {
  fillSelect,
  queryClient,
  TestProviders,
} from '@/src/tests/testHelpers';

const gpEnabledLegalEntity = {
  id: 'le-1',
  name: 'Acme GP Legal Entity',
  country_code: 'USA',
  is_default: true,
  global_payroll_enabled: true,
};

const basicInformationSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: {
      title: 'Full name',
      type: 'string',
      'x-jsf-presentation': { inputType: 'text' },
    },
  },
  required: ['name'],
};

function SelectCountryWithModal({
  adminBag,
  components,
}: PayrollAdminOnboardingRenderProps) {
  const { SelectCountryStep, SubmitButton } = components;
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (adminBag.stepState.currentStep.name !== 'select_country') {
    return <p>Step: {adminBag.stepState.currentStep.name}</p>;
  }

  return (
    <>
      <SelectCountryStep />
      <SubmitButton>Continue</SubmitButton>
      <p>{`Countries: ${adminBag.fields[0]?.options?.length ?? 0}`}</p>
      <button
        type='button'
        onClick={async () => {
          await adminBag.handleValidation({});
          setIsModalOpen(true);
        }}
      >
        Review country
      </button>
      {isModalOpen && <div role='dialog'>Country review</div>}
    </>
  );
}

describe('PayrollAdminOnboardingFlow select country step', () => {
  let employmentBody: unknown;

  beforeEach(() => {
    queryClient.clear();
    employmentBody = undefined;
    server.use(
      http.get('*/v1/companies/*/legal-entities', () =>
        HttpResponse.json({
          data: {
            legal_entities: [gpEnabledLegalEntity],
            current_page: 1,
            total_pages: 1,
            total_count: 1,
          },
        }),
      ),
      http.get('*/v1/countries/*/global_payroll_basic_information', () =>
        HttpResponse.json({ data: basicInformationSchema }),
      ),
      http.post('*/v1/employments', async ({ request }) => {
        employmentBody = await request.json();
        return HttpResponse.json({ data: { employment: { id: 'emp-1' } } });
      }),
      http.get('*/v1/countries/*/global_payroll_contract_details', () =>
        HttpResponse.json({ data: { type: 'object', properties: {} } }),
      ),
      http.get('*/v1/employments/*/onboarding-steps', () =>
        HttpResponse.json({ data: { steps: [] } }),
      ),
    );
  });

  const renderFlow = () =>
    render(
      <PayrollAdminOnboardingFlow
        companyId='company-1'
        render={(props) => <SelectCountryWithModal {...props} />}
      />,
      { wrapper: TestProviders },
    );

  it('keeps the country options when the consumer re-renders after handleValidation', async () => {
    renderFlow();

    await screen.findByText('Countries: 4');

    screen.getByText('Review country').click();
    await screen.findByRole('dialog');

    expect(screen.getByText(/^Countries:/)).toHaveTextContent('Countries: 4');
  });

  it('offers the countries and creates the employment with the one picked', async () => {
    renderFlow();

    const select = await screen.findByTestId('country_code');
    await waitFor(() => {
      expect(
        within(select)
          .getAllByRole('option')
          .map((option) => option.textContent),
      ).toEqual(['Select an option', 'Portugal', 'Spain', 'Germany', 'France']);
    });

    await fillSelect('country_code', 'PRT');

    fireEvent.change(await screen.findByLabelText('Full name'), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.click(screen.getByText('Continue'));

    await screen.findByText('Step: contract_details');
    expect(employmentBody).toEqual({
      type: 'global_payroll_employee',
      country_code: 'PRT',
      engaged_by_entity_slug: 'le-1',
      basic_information: { name: 'Ada Lovelace' },
    });
  });
});
