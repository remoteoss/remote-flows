import { buildCreateInvoiceScheduleSchema } from '@/src/common/invoice-schedules';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { $TSFixMe } from '@/src/types/remoteFlows';

/**
 * Slot 2 is meant to appear once slot 1 has both a description and an amount. The reveal
 * condition types the amount as `integer`, which only holds because `createHeadlessForm`
 * converts money fields to cents first — so these tests pin down whether the raw form value
 * (what a money input actually holds: major units, decimal once there are cents) gets there.
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

  // The reveal condition used to require an integer, which no amount with cents can be:
  // money inputs hold major units, and only `parseJSFToValidate` turns them into integer
  // cents, long after the conditionals are evaluated. Every such amount froze the form at
  // one item.
  it('reveals slot 2 when the amount has cents', () => {
    expect(
      visibleFieldNames({
        item_1_description: 'Design work',
        item_1_amount: 2500.5,
      }),
    ).toContain('item_2_description');
  });

  it('reveals slot 2 when an amount with cents arrives as a string', () => {
    expect(
      visibleFieldNames({
        item_1_description: 'Design work',
        item_1_amount: '2500.50',
      }),
    ).toContain('item_2_description');
  });

  it('keeps slot 2 hidden for a zero amount', () => {
    expect(
      visibleFieldNames({
        item_1_description: 'Design work',
        item_1_amount: 0,
      }),
    ).not.toContain('item_2_description');
  });
});
