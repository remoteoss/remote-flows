import React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
// import { useClient } from '../RemoteFlowsProvider';
import { Form } from '../components/ui/form';
import { useForm } from 'react-hook-form';
import { SelectField } from '../components/form/fields/SelectField';
import { Button } from '../components/ui/button';

const formSchema = z
  .object({
    country: z.string({ required_error: 'Is required.' }).min(1),
  })
  .required();

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'jp', label: 'Japan' },
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SelectField
          label="Select a country"
          name="country"
          options={countryOptions}
        />
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
