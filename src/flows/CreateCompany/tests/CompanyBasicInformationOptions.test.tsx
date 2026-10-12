import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { CreateCompanyFlow } from '@/src/flows/CreateCompany/CreateCompany';
import {
  countriesResponse,
  currenciesResponse,
} from '@/src/flows/CreateCompany/tests/fixtures';
import { CreateCompanyRenderProps } from '@/src/flows/CreateCompany/types';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

function CompanyBasicInformationWithModal({
  createCompanyBag,
  components,
}: CreateCompanyRenderProps) {
  const { CompanyBasicInformationStep } = components;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const optionCount = (name: string) =>
    (
      createCompanyBag.fields.find((field) => field.name === name)?.options as
        | unknown[]
        | undefined
    )?.length;

  if (createCompanyBag.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <CompanyBasicInformationStep />
      <p>{`Countries: ${optionCount('country_code')}`}</p>
      <p>{`Currencies: ${optionCount('desired_currency')}`}</p>
      <button
        type='button'
        onClick={async () => {
          await createCompanyBag.handleValidation({});
          setIsModalOpen(true);
        }}
      >
        Review company
      </button>
      {isModalOpen && <div role='dialog'>Company review</div>}
    </>
  );
}

describe('CreateCompany basic information options', () => {
  beforeEach(() => {
    queryClient.clear();
    server.use(
      http.get('*/v1/countries', () =>
        HttpResponse.json(countriesResponse.data),
      ),
      http.get('*/v1/company-currencies', () =>
        HttpResponse.json(currenciesResponse.data),
      ),
    );
  });

  it('keeps the country and currency options when the consumer re-renders after handleValidation', async () => {
    render(
      <CreateCompanyFlow
        countryCode={undefined}
        options={{}}
        render={(props) => <CompanyBasicInformationWithModal {...props} />}
      />,
      { wrapper: TestProviders },
    );

    const countries = (await screen.findByText(/^Countries: [1-9]/))
      .textContent;
    const currencies = screen.getByText(/^Currencies: [1-9]/).textContent;

    screen.getByText('Review company').click();
    await screen.findByRole('dialog');

    expect(screen.getByText(/^Countries:/)).toHaveTextContent(countries!);
    expect(screen.getByText(/^Currencies:/)).toHaveTextContent(currencies!);
  });
});
