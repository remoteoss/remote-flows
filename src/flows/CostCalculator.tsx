import React, { useEffect, useState } from 'react';
import { useClient } from '../RemoteFlowsProvider';
import {
  getIndexCountry,
  getShowCompany,
  getShowRegionField,
} from '../client/sdk.gen';
import type { GetIndexCountryResponse, MinimalRegion } from '../client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHeadlessForm } from '@remoteoss/json-schema-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import { Client } from '@hey-api/client-fetch';
import { JSONSchemaFormFields } from '../components/json-schema-form';
import { RadioGroup, RadioGroupItem } from '../components/radio';

const formSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  currency: z.string().min(1, 'Currency is required'),
  region: z.string().optional(),
  salary: z.number().min(1, 'Amount must be greater than 0'),
  type: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  companyId: string;
};

export function CostCalculator({ companyId }: Props) {
  const { client } = useClient();
  const [jsonForm, setJsonForm] = useState<any>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: '',
      currency: '',
      region: '',
      salary: undefined,
      type: '',
    },
    mode: 'onBlur',
  });
  const selectedCountry = form.watch('country');
  const [countries, setCountries] = React.useState<
    GetIndexCountryResponse['data']
  >([]);

  const [regions, setRegions] = useState<MinimalRegion[]>([]);

  const [currencies, setCurrencies] = React.useState<any>([]);

  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  async function loadJsonForm(regionSlug: string) {
    try {
      setJsonForm(null);
      setIsLoadingSchema(true);

      const res = await getShowRegionField({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { slug: regionSlug },
      });

      setJsonForm(
        createHeadlessForm(res?.data?.data?.schema || {}, {
          strictInputType: false,
        }),
      );
    } catch (e) {
      console.error(e);
      setJsonForm(null);
    } finally {
      setIsLoadingSchema(false);
    }
  }

  useEffect(() => {
    if (selectedCountry) {
      const country = countries.find((c) => c.code === selectedCountry);
      if (country?.child_regions.length !== 0) {
        setRegions(country ? country.child_regions : []);
      }

      if (
        country?.child_regions.length === 0 &&
        country.has_additional_fields
      ) {
        // test this with italy
        loadJsonForm(country.region_slug);
      }
    }
  }, [selectedCountry, countries]);

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
        {regions.length > 0 && (
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        'border-2',
                        form.formState.errors.region
                          ? 'border-red-500'
                          : 'border-gray-200',
                      )}
                    >
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {regions?.map((region) => (
                      <SelectItem
                        key={region.slug}
                        value={region.slug.toString()}
                      >
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Notification Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="all" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      All notifications
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="mentions" />
                    </FormControl>
                    <FormLabel className="font-normal">Mentions only</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="none" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      No notifications
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
              <FormDescription>
                Select the types of notifications you'd like to receive.
              </FormDescription>
            </FormItem>
          )}
        />

        {jsonForm && <JSONSchemaFormFields fields={jsonForm.fields} />}

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
