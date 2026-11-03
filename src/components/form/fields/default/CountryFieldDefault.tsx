import { useEffect, useState } from 'react';
import {
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';

import { FormItem } from '@/src/components/ui/form';
import { MultiSelect } from '@/src/components/ui/multi-select';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { CountryComponentProps, CountryOption } from '@/src/types/fields';
import { HelpCenter } from '@/src/components/shared/zendesk-drawer/HelpCenter';

const V5_CATEGORIES: Record<string, string> = {
  global: 'Global',
  region: 'Regions',
  subregion: 'Subregions',
  country: 'Countries',
};

const stripPrefix = (value: string) =>
  value.replace(/^(region|subregion)-/, '');

// Choosing Global replaces everything, choosing a region drops its own
// subregions and countries, and choosing anything narrower drops Global.
function applyGroupedSelectionRules(
  previous: CountryOption[],
  next: CountryOption[],
): CountryOption[] {
  const added = next.find(
    (option) => !previous.some((item) => item.value === option.value),
  );
  const type = added?.$meta?.type;
  if (!added || !type) return next;
  if (type === 'global') return [added];

  const withoutGlobal = next.filter((item) => item.$meta?.type !== 'global');
  if (type !== 'region') return withoutGlobal;

  const regionName = stripPrefix(added.value);
  return withoutGlobal.filter(
    (item) =>
      item === added ||
      !(
        (item.$meta?.type === 'subregion' || item.$meta?.type === 'country') &&
        item.$meta?.region === regionName
      ),
  );
}

export function CountryFieldDefault({
  field,
  fieldState,
  fieldData,
}: CountryComponentProps) {
  const [selected, setSelected] = useState<$TSFixMe[]>([]);
  const isMultiple =
    fieldData.multiple === true ||
    (Array.isArray(fieldData.jsonType)
      ? fieldData.jsonType.includes('array')
      : fieldData.jsonType === 'array');
  const isGrouped = Boolean(
    fieldData.options?.some((option) => option.$meta?.type),
  );
  const handleChange = (rawValues: $TSFixMe[]) => {
    const finalValues = isGrouped
      ? applyGroupedSelectionRules(selected, rawValues)
      : rawValues;
    const values = finalValues.map(({ value }) => value);
    field.onChange(isMultiple ? values : (values[0] ?? ''));
    setSelected(finalValues);
  };

  useEffect(() => {
    if (!fieldData.options) {
      return;
    }
    const values: $TSFixMe[] = Array.isArray(field.value)
      ? field.value
      : field.value
        ? [field.value]
        : [];
    // WE NEED TO FIX: react-hooks/set-state-in-effect - Calling setState synchronously within an effect can trigger cascading renders
    // oxlint-disable-next-line react-hooks/set-state-in-effect
    setSelected(
      values
        .map(
          (value) =>
            fieldData.options?.find((option) => option.value === value) ??
            // The API returns saved values as display labels
            (isGrouped
              ? fieldData.options?.find((option) => option.label === value)
              : undefined),
        )
        .filter(Boolean) as $TSFixMe[],
    );
  }, [field.value, fieldData.options, isGrouped]);

  const groupOptions =
    isMultiple && !isGrouped
      ? [
          ...Object.entries(fieldData.$meta?.regions || {}).map(
            ([key, value]) => ({
              value,
              label: key,
              category: 'Regions',
            }),
          ),
          ...Object.entries(fieldData.$meta?.subregions || {}).map(
            ([key, value]) => ({
              value,
              label: key,
              category: 'Subregions',
            }),
          ),
        ]
      : [];

  const countryOptions = [
    ...groupOptions,
    ...(fieldData.options?.map((option) => ({
      ...option,
      value: option.value,
      label: option.label,
      category: isGrouped
        ? V5_CATEGORIES[option.$meta?.type ?? 'country']
        : 'Countries',
    })) || []),
  ];
  return (
    <FormItem
      data-field={field.name}
      className={`RemoteFlows__CountryField__Item__${field.name}`}
    >
      <FormLabel className='RemoteFlows__CountryField__Label'>
        {fieldData.label}
      </FormLabel>
      <FormControl>
        <MultiSelect
          options={countryOptions}
          selected={selected}
          onChange={handleChange}
          multiple={isMultiple}
        />
      </FormControl>
      {fieldData.description && (
        <FormDescription>
          {fieldData.description}{' '}
          <HelpCenter helpCenter={fieldData.meta?.helpCenter} />
        </FormDescription>
      )}
      {fieldState.error && <FormMessage />}
    </FormItem>
  );
}
