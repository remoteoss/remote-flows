import { runVerification } from '@/scripts/verify-contract-details-version/run';
import {
  formatResultsTable,
  hasFailures,
} from '@/scripts/verify-contract-details-version/report';
import { FillPass } from '@/scripts/verify-contract-details-version/fill';

const country = process.env.VERIFY_COUNTRY;
const version = Number(process.env.VERIFY_VERSION);
const passArg = process.env.VERIFY_PASS || 'both';

if (!country || !version || Number.isNaN(version)) {
  throw new Error(
    'VERIFY_COUNTRY and VERIFY_VERSION must be set. Run this via `npm run verify:contract-details -- --country=<ISO3> --version=<n>`.',
  );
}

if (passArg !== 'required' && passArg !== 'full' && passArg !== 'both') {
  throw new Error(`Unknown --pass value: ${passArg}`);
}

const passes: FillPass[] =
  passArg === 'both' ? ['required', 'full'] : [passArg];

describe(`contract_details version bump check: ${country} v${version}`, () => {
  it.each(passes)(
    '%s pass submits successfully',
    async (pass) => {
      const [result] = await runVerification({
        country,
        version,
        passes: [pass],
      });
      console.log(formatResultsTable([result]));
      if (result.skipped.length > 0) {
        console.log(
          `Skipped fields (no fake value strategy): ${result.skipped.join(', ')}`,
        );
      }
      if (hasFailures([result])) {
        throw new Error(result.errors.join('\n'));
      }
    },
    120_000,
  );
});
