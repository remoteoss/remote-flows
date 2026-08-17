import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { invoiceScheduleSchema } from '../json-schemas/invoiceSchedule';

function fieldByName(fields: Record<string, unknown>[], name: string) {
  return fields.find((field) => field.name === name);
}

describe('invoiceScheduleSchema', () => {
  it('hides every detail field when the user chooses to skip', () => {
    const { fields } = createHeadlessForm(invoiceScheduleSchema, {
      invoice_schedule_preference: 'manual',
    });

    [
      'currency',
      'periodicity',
      'start_date',
      'item_1_description',
      'item_1_amount',
    ].forEach((name) => {
      const field = fieldByName(fields, name);
      expect(field?.isVisible).toBe(false);
      expect(field?.required).toBe(false);
    });
  });

  it('requires the first item slot once the user opts to create a schedule', () => {
    const { fields } = createHeadlessForm(invoiceScheduleSchema, {
      invoice_schedule_preference: 'schedule',
    });

    [
      'currency',
      'periodicity',
      'start_date',
      'item_1_description',
      'item_1_amount',
    ].forEach((name) => {
      const field = fieldByName(fields, name);
      expect(field?.isVisible).toBe(true);
      expect(field?.required).toBe(true);
    });

    const secondItemDescription = fieldByName(fields, 'item_2_description');
    expect(secondItemDescription?.isVisible).toBe(false);
  });

  it('reveals the next item slot only once the previous one is filled in', () => {
    const { fields } = createHeadlessForm(invoiceScheduleSchema, {
      invoice_schedule_preference: 'schedule',
      item_1_description: 'Consulting work',
      item_1_amount: 100_00,
    });

    expect(fieldByName(fields, 'item_2_description')?.isVisible).toBe(true);
    expect(fieldByName(fields, 'item_2_amount')?.isVisible).toBe(true);
    expect(fieldByName(fields, 'item_2_description')?.required).toBe(false);
    expect(fieldByName(fields, 'item_3_description')?.isVisible).toBe(false);
  });

  it('binds item amount fields to the currency computed from the currency field', () => {
    const { fields } = createHeadlessForm(invoiceScheduleSchema, {
      invoice_schedule_preference: 'schedule',
      currency: 'BRL',
    });

    const itemAmount = fieldByName(fields, 'item_1_amount');
    expect(itemAmount?.computedAttributes).toMatchObject({
      currency: 'currency_selected',
    });
  });
});
