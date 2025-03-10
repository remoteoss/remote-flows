import React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
// import { useClient } from '../RemoteFlowsProvider';
import { Form } from '../components/ui/form';
import { useForm } from 'react-hook-form';
import { SelectField } from '../components/form/fields/SelectField';
import { Button } from '../components/ui/button';
import { TextField } from '../components/form/fields/TextField';

import { RadioGroupField } from '../components/form/fields/RadioGroupField';
import { FieldSetField } from '../components/form/fields/FieldSetField';

const formSchema = z
  .object({
    country: z.string({ required_error: 'Required.' }).min(1),
    name: z.string({ required_error: 'Required.' }).min(1),
    benefits: z.object({
      slug: z.string({ required_error: 'Required.' }).min(1),
      name: z.string({ required_error: 'Required.' }).min(1),
    }),
  })
  .required();

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'jp', label: 'Japan' },
];

const lifeInsuranceOptions = [
  { value: 'us', label: 'Basic Life Insurance - $50k' },
  { value: 'ca', label: 'Basic Life Insurance - $100k' },
  { value: 'uk', label: 'Basic Life Insurance - $150k' },
  { value: 'au', label: 'Basic Life Insurance - $200k' },
];

export function CostCalculator() {
  // const value = useClient();
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: any) {
    console.log('Form values:', values);
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 flex flex-col gap-8"
        >
          <TextField
            type="text"
            name="name"
            label="Name"
            description="What is your name"
          />
          <SelectField
            label="Select a country"
            name="country"
            options={countryOptions}
          />
          <RadioGroupField
            label="Contract duration"
            name="duration"
            options={[
              { value: 'indefinite', label: 'Indefinite' },
              { value: 'fixed', label: 'Fixed Term' },
            ]}
          />
          <FieldSetField
            legend="Benefits"
            name="benefits"
            fields={[
              {
                label: 'Life Insurance',
                name: 'slug',
                type: 'select',
                description:
                  'Employers have the option to offer Life Insurance.',
                options: lifeInsuranceOptions,
              },
              {
                label: 'Life Insurance Name',
                name: 'name',
                type: 'text',
                description: 'What is the insurance name',
              },
            ]}
          />
          <Button type="submit" className="w-full my-4" variant={'secondary'}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
