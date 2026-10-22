import { render, screen } from '@testing-library/react';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { buildHeadlessForm } from '@/src/common/headlessForm';
import { InvoiceScheduleFlow } from '@/src/flows/InvoiceSchedule/InvoiceScheduleFlow';
import { InvoiceScheduleForm } from '@/src/flows/InvoiceSchedule/InvoiceScheduleForm';

vi.mock('@/src/common/headlessForm', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/src/common/headlessForm')>();
  return { ...actual, buildHeadlessForm: vi.fn(actual.buildHeadlessForm) };
});

describe('InvoiceScheduleFlow form building', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.mocked(buildHeadlessForm).mockClear();
  });

  it('builds the form through useHeadlessForm with the buildOnce strategy', async () => {
    render(
      <InvoiceScheduleFlow
        employmentId='employment-grace'
        render={() => <InvoiceScheduleForm />}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByLabelText(/Invoice currency/i);

    const strategies = vi
      .mocked(buildHeadlessForm)
      .mock.calls.map(([, strategy]) => strategy);

    expect(strategies.length).toBeGreaterThan(0);
    expect(new Set(strategies)).toEqual(new Set(['buildOnce']));
  });
});
