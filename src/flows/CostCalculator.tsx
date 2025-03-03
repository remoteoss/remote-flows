import React, { useEffect } from 'react';
import { useClient } from '../RemoteFlowsProvider';
import { getIndexCountry, getShowCompany } from '../client/sdk.gen';
import type { GetIndexCountryResponse } from '../client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../components/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/select';
import { cn } from '../utils/classNames';
import { Input } from '../components/input';
import { Button } from '../components/button';

const formSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  currency: z.string().min(1, 'Currency is required'),
  salary: z.number().min(1, 'Amount must be greater than 0'),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  companyId: string;
};

export function CostCalculator({ companyId }: Props) {
  const { client } = useClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: '',
      currency: '',
      salary: undefined,
    },
    mode: 'onBlur',
  });
  const [countries, setCountries] = React.useState<
    GetIndexCountryResponse['data']
  >([]);

  const [currencies, setCurrencies] = React.useState<any>([]);

  useEffect(() => {
    if (client) {
      getIndexCountry({
        client: client,
        headers: {
          Authorization: ``,
        },
      })
        .then((res) => {
          if (res.data?.data) {
            setCountries(res.data?.data);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [client]);

  useEffect(() => {
    if (client && companyId) {
      getShowCompany({
        client: client,
        headers: {
          Authorization: ``,
        },
        path: {
          company_id: companyId,
        },
      })
        .then((res) => {
          if (res.data?.data.company.supported_currencies) {
            setCurrencies(res.data?.data.company.supported_currencies);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [companyId]);

  const handleSubmit = (values: FormValues) => {
    console.log({ values });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      'border-2',
                      form.formState.errors.country
                        ? 'border-red-500'
                        : 'border-gray-200',
                    )}
                  >
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries?.map((country) => (
                    <SelectItem
                      key={country.code}
                      value={country.code.toString()}
                    >
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      'border-2',
                      form.formState.errors.country
                        ? 'border-red-500'
                        : 'border-gray-200',
                    )}
                  >
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencies?.map((currency: string) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  {...field}
                  value={field.value === undefined ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(
                      value === '' ? undefined : Number.parseFloat(value),
                    );
                  }}
                  className={cn(
                    'border-2',
                    form.formState.errors.salary
                      ? 'border-red-500'
                      : 'border-gray-200',
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
        >
          Save
        </Button>
      </form>
    </Form>
  );
}
