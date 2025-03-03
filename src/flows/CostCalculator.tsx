import React, { useEffect } from 'react';
import { useClient } from '../RemoteFlowsProvider';
import { getIndexCountry } from '../client/sdk.gen';
import { GetIndexCountryResponse } from '../client';
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

const formSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  currency: z.string().min(1, 'Currency is required'),
  salary: z.number().min(1, 'Amount must be greater than 0'),
});

type FormValues = z.infer<typeof formSchema>;

export function CostCalculator() {
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

  console.log({ countries });
  useEffect(() => {
    if (client) {
      getIndexCountry({
        client: client,
        headers: {
          Authorization: ``,
        },
      })
        .then((res) => {
          console.log(res);
          if (res.data?.data) {
            setCountries(res.data?.data);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [client]);

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
      </form>
    </Form>
  );
}
