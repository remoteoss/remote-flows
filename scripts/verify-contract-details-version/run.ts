import {
  fetchSandboxAuth,
  requiredSandboxCompanyId,
} from '@/scripts/verify-contract-details-version/auth';
import { seedEmploymentUpToContractDetails } from '@/scripts/verify-contract-details-version/seed';
import { runContractDetailsPass } from '@/scripts/verify-contract-details-version/harness';
import { FillPass } from '@/scripts/verify-contract-details-version/fill';
import { VerifyResult } from '@/scripts/verify-contract-details-version/report';

export type RunVerificationParams = {
  country: string;
  version: number;
  passes: FillPass[];
};

export async function runVerification({
  country,
  version,
  passes,
}: RunVerificationParams): Promise<VerifyResult[]> {
  const companyId = requiredSandboxCompanyId();
  const results: VerifyResult[] = [];

  for (const pass of passes) {
    const { employmentId } = await seedEmploymentUpToContractDetails(country);
    const result = await runContractDetailsPass({
      employmentId,
      countryCode: country,
      companyId,
      version,
      pass,
      auth: fetchSandboxAuth,
    });
    results.push(result);
  }

  return results;
}
