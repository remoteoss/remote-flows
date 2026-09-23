import { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RemoteFlows } from '@/src/RemoteFlowsProvider';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import {
  describeSubmitError,
  flattenFormErrors,
  VerifyResult,
} from '@/scripts/verify-contract-details-version/report';
import {
  fillVisibleFields,
  FillPass,
} from '@/scripts/verify-contract-details-version/fill';
import { loadOverride } from '@/scripts/verify-contract-details-version/overrides';
import { SandboxAuthResponse } from '@/scripts/verify-contract-details-version/auth';
import { $TSFixMe } from '@/src/types/remoteFlows';

const MAX_FILL_ROUNDS = 10;
const WAIT_TIMEOUT_MS = 30_000;

export type RunContractDetailsPassParams = {
  employmentId: string;
  countryCode: string;
  companyId: string;
  version: number;
  pass: FillPass;
  auth: () => Promise<SandboxAuthResponse>;
};

export async function runContractDetailsPass({
  employmentId,
  countryCode,
  companyId,
  version,
  pass,
  auth,
}: RunContractDetailsPassParams): Promise<VerifyResult> {
  const wrapper = ({ children }: PropsWithChildren) => (
    <RemoteFlows auth={auth} environment='sandbox'>
      {children}
    </RemoteFlows>
  );

  const { result } = renderHook(
    () =>
      useOnboarding({
        employmentId,
        companyId,
        countryCode,
        skipSteps: ['select_country'],
        options: {
          jsonSchemaVersionByCountry: {
            [countryCode]: { contract_details: version },
          },
        },
      }),
    { wrapper },
  );

  act(() => {
    result.current.goTo('contract_details');
  });

  await waitFor(
    () => {
      if (result.current.fields.length === 0) {
        throw new Error(
          `contract_details fields for ${countryCode} v${version} never loaded`,
        );
      }
    },
    { timeout: WAIT_TIMEOUT_MS },
  );

  const override = await loadOverride(countryCode);
  const values: Record<string, unknown> = { ...override };
  const skipped: string[] = [];

  for (let round = 0; round < MAX_FILL_ROUNDS; round++) {
    const changed = fillVisibleFields(
      result.current.fields as $TSFixMe,
      values,
      pass,
      skipped,
    );
    if (!changed) break;

    await act(async () => {
      await result.current.checkFieldUpdates(values);
    });

    await waitFor(
      () => {
        if (result.current.isLoading) {
          throw new Error('still loading after checkFieldUpdates');
        }
      },
      { timeout: WAIT_TIMEOUT_MS },
    );
  }

  const validation = await result.current.handleValidation(values);
  const validationErrors = flattenFormErrors(
    validation?.formErrors as $TSFixMe,
  );
  if (validationErrors.length > 0) {
    return {
      country: countryCode,
      version,
      pass,
      status: 'failed',
      errors: validationErrors,
      skipped,
    };
  }

  try {
    await result.current.onSubmit(values);
  } catch (error) {
    return {
      country: countryCode,
      version,
      pass,
      status: 'failed',
      errors: describeSubmitError(error),
      skipped,
    };
  }

  return {
    country: countryCode,
    version,
    pass,
    status: 'passed',
    errors: [],
    skipped,
  };
}
