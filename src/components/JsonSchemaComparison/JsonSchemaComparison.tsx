import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { useJSONSchemaForm } from '@/src/flows/Onboarding/api';
import { SchemaFormComparison } from './SchemaFormComparison';
import {
  BASIC_INFO_VERSIONS,
  COUNTRY_CONTRACT_VERSIONS,
  COUNTRY_CONTRACT_VERSIONS_WITH_MULTIPLE_VERSIONS,
  FORM_TYPES,
  type FormType,
  type SchemaVersion,
} from './schemaVersions';
import { countriesOptions } from '@/src/common/api/countries';
import { useClient } from '@/src/context';
import type { Client } from '@/src/client/client';
import { JSFField } from '@/src/types/remoteFlows';

export const JsonSchemaComparison = () => {
  const [formType, setFormType] = useState<FormType>(
    'employment_basic_information',
  );
  const [topVersion, setTopVersion] = useState<SchemaVersion>(1);
  const [bottomVersion, setBottomVersion] = useState<SchemaVersion>(1);
  const [countryCode, setCountryCode] = useState<string>('ARE');

  const { client } = useClient();

  const { data: countriesData } = useQuery({
    ...countriesOptions(client as Client, 'schema-comparison'),
    select: (response) =>
      response.data?.data
        ?.filter(
          (country: { eor_onboarding?: boolean }) => country.eor_onboarding,
        )
        .filter((country: { code: string }) =>
          Object.keys(
            COUNTRY_CONTRACT_VERSIONS_WITH_MULTIPLE_VERSIONS,
          ).includes(country.code),
        )
        .map((country: { name: string; code: string }) => ({
          label: country.name,
          value: country.code,
        })) || [],
  });

  const isContractDetails = formType === 'contract_details';

  const { data: topSchema, isLoading: isLoadingTop } = useJSONSchemaForm({
    countryCode: countryCode,
    form: formType,
    fieldValues: {},
    jsonSchemaVersion: topVersion,
    options: {
      queryOptions: {
        enabled: true,
      },
    },
  });

  const { data: bottomSchema, isLoading: isLoadingBottom } = useJSONSchemaForm({
    countryCode: countryCode,
    form: formType,
    fieldValues: {},
    jsonSchemaVersion: bottomVersion,
    options: {
      queryOptions: {
        enabled: true,
      },
    },
  });

  const isLoading = isLoadingTop || isLoadingBottom;

  const countryVersions = COUNTRY_CONTRACT_VERSIONS[countryCode];
  const hasCountryMapping = countryVersions !== undefined;

  const versionOptions = useMemo(() => {
    return formType === 'employment_basic_information'
      ? BASIC_INFO_VERSIONS
      : countryVersions || [{ value: 'latest', label: 'Latest' }];
  }, [formType, countryVersions]);

  useEffect(() => {
    const availableVersionValues = versionOptions.map((v) => v.value);

    if (!availableVersionValues.includes(topVersion)) {
      // WE NEED TO FIX: react-hooks/set-state-in-effect - Calling setState synchronously within an effect can trigger cascading renders
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTopVersion(versionOptions[0].value);
    }
    if (!availableVersionValues.includes(bottomVersion)) {
      setBottomVersion(versionOptions[0].value);
    }
  }, [formType, countryCode, versionOptions, topVersion, bottomVersion]);

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label className='mb-2 block'>Form Type</Label>
            <Tabs
              value={formType}
              onValueChange={(value) => setFormType(value as FormType)}
            >
              <TabsList className='grid w-full grid-cols-2'>
                {FORM_TYPES.map((type) => (
                  <TabsTrigger key={type.value} value={type.value}>
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {isContractDetails && !hasCountryMapping && (
            <div className='rounded-md bg-yellow-50 p-4 border border-yellow-200'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-yellow-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-yellow-800'>
                    Version mappings not found
                  </h3>
                  <div className='mt-2 text-sm text-yellow-700'>
                    <p>
                      Country{' '}
                      <span className='font-semibold'>{countryCode}</span> is
                      not configured in COUNTRY_CONTRACT_VERSIONS. Using default
                      (latest only).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isContractDetails && (
            <div>
              <Label htmlFor='country-select' className='mb-2 block'>
                Country
              </Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger id='country-select'>
                  <SelectValue placeholder='Select a country' />
                </SelectTrigger>
                <SelectContent>
                  {countriesData?.map(
                    (country: { label: string; value: string }) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='top-version' className='mb-2 block'>
                Left Version
              </Label>
              <Select
                value={String(topVersion)}
                onValueChange={(value) =>
                  setTopVersion(value === 'latest' ? 'latest' : Number(value))
                }
              >
                <SelectTrigger id='top-version'>
                  <SelectValue placeholder='Select version' />
                </SelectTrigger>
                <SelectContent>
                  {versionOptions.map((version) => (
                    <SelectItem
                      key={String(version.value)}
                      value={String(version.value)}
                    >
                      {version.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='bottom-version' className='mb-2 block'>
                Right Version
              </Label>
              <Select
                value={String(bottomVersion)}
                onValueChange={(value) =>
                  setBottomVersion(
                    value === 'latest' ? 'latest' : Number(value),
                  )
                }
              >
                <SelectTrigger id='bottom-version'>
                  <SelectValue placeholder='Select version' />
                </SelectTrigger>
                <SelectContent>
                  {versionOptions.map((version) => (
                    <SelectItem
                      key={String(version.value)}
                      value={String(version.value)}
                    >
                      {version.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <SchemaFormComparison
        topVersion={topVersion}
        bottomVersion={bottomVersion}
        topFields={(topSchema?.fields as JSFField[]) || []}
        bottomFields={(bottomSchema?.fields as JSFField[]) || []}
        topFieldsets={topSchema?.meta?.['x-jsf-fieldsets']}
        bottomFieldsets={bottomSchema?.meta?.['x-jsf-fieldsets']}
        isLoading={isLoading}
      />
    </div>
  );
};
