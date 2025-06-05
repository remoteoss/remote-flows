import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs';
import { Check, Copy, ChevronRight, ChevronDown } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './components/collapsible';
import { useState } from 'react';
import { Button } from './components/button';
import { cn } from './utils';
import React from 'react';
import type { $TSFixMe } from '@remoteoss/remote-flows';
import { BasicCostCalculator } from './BasicCostCalculator';
import { BasicCostCalculatorWithDefaultValues } from './BasicCostCalculatorDefaultValues';
import { BasicCostCalculatorLabels } from './BasicCostCalculatorLabels';
import { CostCalculatorWithResults } from './CostCalculatorWithResults';
import { CostCalculatorWithExportPdf } from './CostCalculatorWithExportPdf';
import { CostCalculatorWithPremiumBenefits } from './CostCalculatorWithPremiumBenefits';
import { Termination } from './Termination';
import { ContractAmendment } from './ContractAmendment';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { OnboardingForm } from './Onboarding';
import { OnboardingForm as OnboardingFormWithoutSelectCountry } from './OnboardingWithoutSelectCountryStep';
import { OnboardingCustomBenefitsForm } from './OnboardingWithCustomBenefits';

const sourceCode = {
  // Cost Calculator source codes
  basicCostCalculator: `
import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorDisclaimer,
} from '@remoteoss/remote-flows';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

const fetchToken = () => {
  return fetch('/api/token')
    .then((res) => res.json())
    .then((data) => ({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }))
    .catch((error) => {
      console.error({ error });
      throw error;
    });
};

export function BasicCostCalculator() {
  const onReset = () => {
    console.log('Reset button clicked');
    // Add your reset logic here
  };

  return (
    <RemoteFlows auth={fetchToken}>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => console.log({ response })}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton onClick={onReset}>
                Reset
              </CostCalculatorResetButton>
            </div>
          );
        }}
      />
      <CostCalculatorDisclaimer label="Disclaimer" />
    </RemoteFlows>
  );
}`,
  basicCostCalculatorWithDefaultValues: `
    import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorDisclaimer,
} from '@remoteoss/remote-flows';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function BasicCostCalculatorWithDefaultValues() {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        defaultValues={{
          countryRegionSlug: 'bf098ccf-7457-4556-b2a8-80c48f67cca4',
          currencySlug: 'eur-acf7d6b5-654a-449f-873f-aca61a280eba',
          salary: '50000',
        }}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => console.log({ response })}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      <CostCalculatorDisclaimer label="Disclaimer" />
    </RemoteFlows>
  );
}
  `,
  basicCostCalculatorLabels: `
    import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorDisclaimer,
} from '@remoteoss/remote-flows';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function BasicCostCalculatorLabels() {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => console.log({ response })}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
        options={{
          jsfModify: {
            fields: {
              country: {
                title: 'Select your country',
              },
              age: {
                title: 'Enter your age',
              },
            },
          },
        }}
      />
      <CostCalculatorDisclaimer label="Disclaimer" />
    </RemoteFlows>
  );
}
  `,
  costCalculatorWithResults: `
  import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorResults,
} from '@remoteoss/remote-flows';
import type { CostCalculatorEstimateResponse } from '@remoteoss/remote-flows';
import Flag from 'react-flagpack';
import 'react-flagpack/dist/style.css';
import { useState } from 'react';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function CostCalculatorWithResults() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => setEstimations(response)}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      {estimations && (
        <div className="mt-4 mb-2 flex gap-2">
          <Flag code={estimations.data.employments?.[0].country.alpha_2_code} />
          <label className="text-md font-bold">
            {estimations.data.employments?.[0].country.name}
          </label>
        </div>
      )}
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
    </RemoteFlows>
  );
}
`,
  costCalculatorWithExportPdf: `
  import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  useCostCalculatorEstimationPdf,
  buildCostCalculatorEstimationPayload,
} from '@remoteoss/remote-flows';
import type {
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationSubmitValues,
} from '@remoteoss/remote-flows';
import './App.css';
import { useState } from 'react';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

function CostCalculatorFormDemo() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationSubmitValues | null>(null);

  const exportPdfMutation = useCostCalculatorEstimationPdf();

  const handleExportPdf = () => {
    if (payload) {
      exportPdfMutation.mutate(buildCostCalculatorEstimationPayload(payload), {
        onSuccess: (response) => {
          if (response?.data?.data?.content !== undefined) {
            const a = document.createElement('a');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            a.href = response.data.data.content as any;
            a.download = 'estimation.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        },
        onError: (error) => {
          console.error({ error });
        },
      });
    }
  };
  return (
    <>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }

          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => setPayload(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => {
                  setEstimations(response);
                }}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      {estimations && <button onClick={handleExportPdf}>Export as PDF</button>}
    </>
  );
}

export function CostCalculatorWithExportPdf() {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <CostCalculatorFormDemo />
    </RemoteFlows>
  );
}

`,
  costCalculatorWithPremiumBenefits: `
  import type {
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationSubmitValues,
} from '@remoteoss/remote-flows';
import {
  buildCostCalculatorEstimationPayload,
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorResetButton,
  CostCalculatorResults,
  CostCalculatorSubmitButton,
  RemoteFlows,
  useCostCalculatorEstimationPdf,
} from '@remoteoss/remote-flows';
import { useState } from 'react';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
  includePremiumBenefits: true,
};

function CostCalculatorFormDemo() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationSubmitValues | null>(null);

  const exportPdfMutation = useCostCalculatorEstimationPdf();

  const handleExportPdf = () => {
    if (payload) {
      exportPdfMutation.mutate(buildCostCalculatorEstimationPayload(payload), {
        onSuccess: (response) => {
          if (response?.data?.data?.content !== undefined) {
            const a = document.createElement('a');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            a.href = response.data.data.content as any;
            a.download = 'estimation.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        },
        onError: (error) => {
          console.error({ error });
        },
      });
    }
  };
  return (
    <>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }

          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => setPayload(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => {
                  setEstimations(response);
                }}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
      {estimations && <button onClick={handleExportPdf}>Export as PDF</button>}
    </>
  );
}

export function CostCalculatorWithPremiumBenefits() {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <CostCalculatorFormDemo />
    </RemoteFlows>
  );
}

  `,

  terminationFlow: `
import { TerminationFlow, RemoteFlows } from '@remoteoss/remote-flows';
import type {
  TerminationRenderProps,
  TerminationFormValues,
  OffboardingResponse,
} from '@remoteoss/remote-flows';
import './App.css';
import { useState } from 'react';
import { TerminationDialog } from './TerminationDialog';

const STEPS = [
  'Employee Communication',
  'Termination Details',
  'Paid Time Off',
  'Additional Information',
];

const TerminationReasonDetailsDescription = ({
  onClick,
}: {
  onClick: () => void;
}) => (
  <>
    Make sure you choose an accurate termination reason to avoid unfair or
    unlawful dismissal claims.{' '}
    <a onClick={onClick}>Learn more termination details</a>
  </>
);

const fetchToken = () => {
  return fetch('/api/token')
    .then((res) => res.json())
    .then((data) => ({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }))
    .catch((error) => {
      console.error({ error });
      throw error;
    });
};

type MultiStepFormProps = {
  terminationBag: TerminationRenderProps['terminationBag'];
  components: TerminationRenderProps['components'];
  onSubmitStep: (
    payload: TerminationFormValues,
    step: string,
  ) => void | Promise<void>;
  onSubmitForm: (payload: TerminationFormValues) => void | Promise<void>;
  onError: (error: Error) => void;
  onSuccess: (response: OffboardingResponse) => void;
};

const MultiStepForm = ({
  terminationBag,
  components,
  onSubmitStep,
  onSubmitForm,
  onError,
  onSuccess,
}: MultiStepFormProps) => {
  const {
    EmployeeComunicationStep,
    TerminationDetailsStep,
    PaidTimeOffStep,
    AdditionalDetailsStep,
    SubmitButton,
    Back,
    TimeOff,
  } = components;
  switch (terminationBag.stepState.currentStep.name) {
    case 'employee_communication':
      return (
        <>
          <div className="alert">
            <p>
              Please do not inform the employee of their termination until we
              review your request for legal risks. When we approve your request,
              you can inform the employee and we'll take it from there.
            </p>
          </div>
          <EmployeeComunicationStep
            onSubmit={(payload) =>
              onSubmitStep(payload, 'employee_communication')
            }
          />
          <SubmitButton>Next Step</SubmitButton>
        </>
      );
    case 'termination_details':
      return (
        <>
          <TerminationDetailsStep
            onSubmit={(payload) => onSubmitStep(payload, 'termination_details')}
          />
          <Back>Back</Back>
          <SubmitButton>Next Step</SubmitButton>
        </>
      );
    case 'paid_time_off':
      return (
        <>
          <TimeOff
            render={({ employment, timeoff }) => {
              const username = employment?.data?.employment?.basic_information
                ?.name as string;
              const days = timeoff?.data?.total_count || 0;

              // if days is 0 or > 1 'days' else 'day
              const daysLiteral = days > 1 || days === 0 ? 'days' : 'day';
              return (
                <>
                  <p>
                    We have recorded {days} {daysLiteral} of paid time off for{' '}
                    {username}
                  </p>
                  <a href="#">See {username}'s timeoff breakdown</a>
                </>
              );
            }}
          />
          <PaidTimeOffStep
            onSubmit={(payload) => onSubmitStep(payload, 'paid_time_off')}
          />
          <Back>Back</Back>
          <SubmitButton>Next Step</SubmitButton>
        </>
      );

    case 'additional_information':
      return (
        <>
          <AdditionalDetailsStep
            requesterName="ze"
            onSubmit={(payload) => onSubmitForm(payload)}
            onSuccess={onSuccess}
            onError={onError}
          />
          <Back>Back</Back>
          <SubmitButton>Submit</SubmitButton>
        </>
      );
  }
};

const TerminationForm = ({
  terminationBag,
  components,
}: TerminationRenderProps) => {
  const currentStepIndex = terminationBag.stepState.currentStep.index;

  const stepTitle = STEPS[currentStepIndex];

  if (terminationBag.isLoading) {
    return <div>Loading termination...</div>;
  }

  return (
    <>
      <div className="steps-navigation">
        <ul>
          {STEPS.map((step, index) => (
            <li
              key={index}
              className={'step-item' + (index === currentStepIndex ? ' active' : '')}
            >
              {step}
            </li>
          ))}
        </ul>
      </div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <h1 className="heading">{stepTitle}</h1>
        <MultiStepForm
          terminationBag={terminationBag}
          components={components}
          onSubmitStep={(payload, step) =>
            console.log('onSubmitStep', payload, step)
          }
          onSubmitForm={(payload) => console.log('onSubmitForm', payload)}
          onError={(error) => console.log('onError', error)}
          onSuccess={(response) => console.log('onSuccess', response)}
        />
      </div>
    </>
  );
};

export const Termination = () => {
  const [open, setOpen] = useState(false);
  return (
    <RemoteFlows auth={fetchToken}>
      <div className="cost-calculator__container">
        <TerminationFlow
          employmentId="7df92706-59ef-44a1-91f6-a275b9149994"
          render={TerminationForm}
          options={{
            jsfModify: {
              // fields for the termination flow are defined here https://github.com/remoteoss/remote-flows/blob/main/src/flows/Termination/json-schemas/jsonSchema.ts#L108
              fields: {
                confidential: {
                  'x-jsf-presentation': {
                    statement: null, // this removes potential fixed statements that come from the confidential field
                  },
                },
                termination_reason: {
                  description: () => (
                    <TerminationReasonDetailsDescription
                      onClick={() => setOpen(true)}
                    />
                  ),
                },
              },
            },
          }}
        />
      </div>
      <TerminationDialog open={open} setOpen={setOpen} />
    </RemoteFlows>
  );
};`,
  // Contract Amendments source code
  contractAmendments: `
import {
  ContractAmendmentAutomatableResponse,
  ContractAmendmentFlow,
  RemoteFlows,
  ContractAmendmentRenderProps,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import './App.css';

function AmendmentFlow({
  contractAmendmentBag,
  components,
}: ContractAmendmentRenderProps) {
  const { Form, SubmitButton, ConfirmationForm, BackButton } = components;

  const [automatable, setAutomatable] = useState<
    ContractAmendmentAutomatableResponse | undefined
  >();
  const [error, setError] = useState<string | null>(null);

  function handleSuccess(data: ContractAmendmentAutomatableResponse) {
    setAutomatable(data);
  }

  if (contractAmendmentBag.isLoading) {
    return <div>Loading employment...</div>;
  }

  switch (contractAmendmentBag.stepState.currentStep.name) {
    case 'form':
      return (
        <div className="amendment_form">
          <Form
            onSuccess={handleSuccess}
            onError={(err) => {
              if (
                'message' in err &&
                err.message === 'no_changes_detected_contract_details'
              ) {
                setError(err.message);
              }
            }}
          />
          {error && (
            <div className="amendment_form__error">
              <p className="amendment_form__error__title">
                Contract detail change required
              </p>
              <p>
                You haven't changed any contract detail value yet. Please change
                at least one value in order to be able to proceed with the
                request.
              </p>
            </div>
          )}
          <SubmitButton
            className="amendment_form__buttons__submit"
            disabled={contractAmendmentBag.isSubmitting}
          >
            Go to preview and confirm changes
          </SubmitButton>
        </div>
      );
    case 'confirmation_form':
      return (
        <div className="confirmation_form">
          <ConfirmationForm />
          <div>
            {Object.entries(
              contractAmendmentBag.stepState.values?.form || {},
            ).map(([key, value]) => {
              // @ts-expect-error error
              const initialValue = contractAmendmentBag.initialValues[key];
              if (initialValue !== value) {
                const label = contractAmendmentBag.fields.find(
                  (field) => field.name === key,
                )?.label as string;
                return (
                  <div className="confirmation_form__item" key={key}>
                    <p>{label}:</p>
                    {initialValue ? (
                      <div className="confirmation_form__item__value">
                        <span className="confirmation_form__item__value__initial">
                          {initialValue}
                        </span>
                        <span>&rarr;</span>
                        <span>{value as string}</span>
                      </div>
                    ) : (
                      <div className="confirmation_form__item__value">
                        <span>{value as string}</span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
          {automatable?.data?.automatable ? (
            <div>{automatable?.data?.message}</div>
          ) : null}
          <div className="confirmation_form__buttons">
            <SubmitButton
              disabled={contractAmendmentBag.isSubmitting}
              className="confirmation_form__buttons__submit"
            >
              Submit amendment request
            </SubmitButton>
            <BackButton className="confirmation_form__buttons__back">
              Back
            </BackButton>
          </div>
        </div>
      );
  }
}

export function ContractAmendment() {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows
      auth={() => fetchToken()}
      proxy={{ url: 'http://localhost:3001/' }}
    >
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        <ContractAmendmentFlow
          countryCode="PRT"
          employmentId="b98b7127-d90f-4f5b-b02d-457d65707d35"
          render={AmendmentFlow}
        />
      </div>
    </RemoteFlows>
  );
}
`,
};

const demoStructure = [
  {
    id: 'cost-calculator',
    title: 'Cost Calculator',
    description:
      'Calculate the total cost of your employee in different countries',
    children: [
      {
        id: 'basic-cost-calculator',
        title: 'Basic',
        description: 'The most basic cost calculator',
        component: BasicCostCalculator,
        sourceCode: sourceCode.basicCostCalculator,
      },
      {
        id: 'with-default-values-cost-calculator',
        title: 'Default Values',
        description: 'Cost Calculator with default values',
        component: BasicCostCalculatorWithDefaultValues,
        sourceCode: sourceCode.basicCostCalculatorWithDefaultValues,
      },
      {
        id: 'with-custom-labels-cost-calculator',
        title: 'Custom Fields Labels',
        description: 'Custom Field Labels in Cost Calculator',
        component: BasicCostCalculatorLabels,
        sourceCode: sourceCode.basicCostCalculatorLabels,
      },
      {
        id: 'with-results-cost-calculator',
        title: 'Estimation Results',
        description: 'Cost Calculator with an estimation component',
        component: CostCalculatorWithResults,
        sourceCode: sourceCode.costCalculatorWithResults,
      },
      {
        id: 'with-export-pdf-cost-calculator',
        title: 'Export PDF',
        description: 'Cost Calculator with an estimation component',
        component: CostCalculatorWithExportPdf,
        sourceCode: sourceCode.costCalculatorWithExportPdf,
      },
      {
        id: 'with-premium-benefits-cost-calculator',
        title: 'Premium Benefits',
        description: 'Cost Calculator with premium benefits',
        component: CostCalculatorWithPremiumBenefits,
        sourceCode: sourceCode.costCalculatorWithPremiumBenefits,
      },
    ],
  },
  {
    id: 'termination',
    title: 'Termination Flow',
    description: 'Process for terminating employments',
    component: Termination,
    sourceCode: sourceCode.terminationFlow,
  },
  {
    id: 'contract-amendments',
    title: 'Contract Amendments',
    description: 'Manage changes to existing contracts',
    component: ContractAmendment,
    sourceCode: sourceCode.contractAmendments,
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    description: 'Onboarding flow of a new employee',
    children: [
      {
        id: 'onboarding-basic',
        title: 'Basic',
        description: 'Standard onboarding flow',
        component: OnboardingForm,
        sourceCode: '',
      },
      {
        id: 'onboarding-without-select-country',
        title: 'Without Select Country',
        description: 'Standard onboarding flow without select country step',
        component: OnboardingFormWithoutSelectCountry,
        sourceCode: '',
      },
      {
        id: 'onboarding-custom-benefits',
        title: 'Custom Benefits',
        description: 'Onboarding flow with custom benefits step UI',
        component: OnboardingCustomBenefitsForm,
        sourceCode: '',
      },
    ],
  },
];

const flattenedDemos = demoStructure.reduce(
  (acc, category) => {
    if (category.children) {
      // Add parent category
      acc[category.id] = {
        id: category.id,
        title: category.title,
        description: category.description,
        isParent: true,
      };

      // Add children
      category.children.forEach((child) => {
        acc[child.id] = {
          id: child.id,
          title: child.title,
          description: child.description,
          component: child.component,
          sourceCode: child.sourceCode,
          parentId: category.id,
        };
      });
    } else {
      // Add standalone item
      acc[category.id] = {
        id: category.id,
        title: category.title,
        description: category.description,
        component: category.component,
        sourceCode: category.sourceCode,
      };
    }
    return acc;
  },
  {} as Record<
    string,
    {
      id: string;
      title: string;
      description: string;
      isParent?: boolean;
      parentId?: string;
      component?: () => $TSFixMe;
      sourceCode?: string;
    }
  >,
);

function App() {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    'cost-calculator': true, // Start with Cost Calculator expanded
  });
  const [activeDemo, setActiveDemo] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const demoId = urlParams.get('demo');
    return demoId && flattenedDemos[demoId] ? demoId : 'basic-cost-calculator';
  });
  const [copied, setCopied] = useState<string | null>(null);

  const selectDemo = (demoId: string) => {
    setActiveDemo(demoId);

    const url = new URL(window.location.href);
    url.searchParams.set('demo', demoId);
    window.history.pushState({}, '', url);

    // If this is a child demo, ensure its parent is expanded
    const demo = flattenedDemos[demoId];
    if (demo.parentId) {
      setExpandedCategories((prev) => ({
        ...prev,
        [demo.parentId as string]: true,
      }));
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentDemo = flattenedDemos[activeDemo];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">SDK Demos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Nested Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Demos</CardTitle>
              <CardDescription>Browse all available demos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                {demoStructure.map((category) => (
                  <div key={category.id} className="space-y-1">
                    {category.children ? (
                      // Category with children
                      <Collapsible
                        open={expandedCategories[category.id]}
                        onOpenChange={() => toggleCategory(category.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-between"
                          >
                            {category.title}
                            {expandedCategories[category.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-4 space-y-1 mt-1">
                            {category.children.map((child) => (
                              <Button
                                key={child.id}
                                variant={
                                  activeDemo === child.id ? 'accent' : 'ghost'
                                }
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => selectDemo(child.id)}
                              >
                                {child.title}
                              </Button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      // Standalone item
                      <Button
                        variant={
                          activeDemo === category.id ? 'accent' : 'ghost'
                        }
                        className="w-full justify-start"
                        onClick={() => selectDemo(category.id)}
                      >
                        {category.title}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{currentDemo.title}</CardTitle>
              <CardDescription>{currentDemo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="demo" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="demo">Demo</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                <TabsContent value="demo" className="mt-4">
                  {React.createElement(currentDemo.component as $TSFixMe)}
                </TabsContent>
                <TabsContent value="code" className="mt-4">
                  <div className="relative">
                    <SyntaxHighlighter language="javascript" style={docco}>
                      {currentDemo.sourceCode as string}
                    </SyntaxHighlighter>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        'absolute top-2 right-2 h-8 w-8 p-0',
                        copied === currentDemo.id && 'text-green-500',
                      )}
                      onClick={() =>
                        copyToClipboard(
                          currentDemo.sourceCode as string,
                          currentDemo.id,
                        )
                      }
                    >
                      {copied === currentDemo.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy code</span>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
