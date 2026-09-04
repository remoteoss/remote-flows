import { buildCreateInvoiceScheduleSchema } from '@/src/common/invoice-schedules';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { $TSFixMe } from '@/src/types/remoteFlows';

/**
 * Slot 2 is meant to appear once slot 1 has both a description and an amount. The reveal
 * condition types the amount as `integer`, so these tests pin down whether the raw form
 * value (what a money input actually holds) satisfies it.
 */
const visibleFieldNames = (values: Record<string, unknown>) => {
  const form = createHeadlessForm(
    buildCreateInvoiceScheduleSchema({ currencies: ['EUR'] }) as $TSFixMe,
    values,
  );
  return (form.fields as { name: string; isVisible?: boolean }[])
    .filter((f) => f.isVisible !== false)
    .map((f) => f.name);
};

describe('invoice item slot reveal', () => {
  it('hides slot 2 when nothing is filled in', () => {
    expect(visibleFieldNames({})).not.toContain('item_2_description');
  });

  it('hides slot 2 when only the description is filled in', () => {
    expect(
      visibleFieldNames({ item_1_description: 'Design work' }),
    ).not.toContain('item_2_description');
  });

  it('reveals slot 2 once slot 1 has a description and a numeric amount', () => {
    expect(
      visibleFieldNames({
        item_1_description: 'Design work',
        item_1_amount: 250000,
      }),
    ).toContain('item_2_description');
  });

  it('reveals slot 2 when the amount arrives as a string, as money inputs hold it', () => {
    expect(
      visibleFieldNames({
        item_1_description: 'Design work',
        item_1_amount: '250000',
      }),
    ).toContain('item_2_description');
  });
});
