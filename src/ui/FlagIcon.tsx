import React from 'react';
import { SvgUse } from './SvgUse';

const territoryToCountry: Record<string, string> = {
  'French Guiana': 'France',
  'French Polynesia': 'France',
  Guadeloupe: 'France',
  Mayotte: 'France',
  'New Caledonia': 'France',
  Réunion: 'France',
  'Saint Pierre and Miquelon': 'France',
  'Wallis and Futuna Islands': 'France',
};

function getSvgFlagName(country: string | { name: string }) {
  if (!country) return null;

  const countryName = typeof country === 'string' ? country : country.name;
  const flagCountryName = territoryToCountry[countryName] || countryName;
  let name = flagCountryName.toLowerCase();
  name = name.replace(/ /g, '-').replace(/\./g, '');

  // Remove strings between (and including) brackets like: (UAE)
  if (name.indexOf('(') !== -1) {
    name = name.substring(0, name.indexOf('-('));
  }

  return name;
}

type FlagIconProps = {
  name: string;
  width?: number;
  height?: number;
};

export const FlagIcon = ({
  name,
  width = 20,
  height = 20,
  ...props
}: FlagIconProps) => {
  const href = `#${getSvgFlagName(name)}`;

  console.log('href', href);

  return (
    <SvgUse
      href={href}
      width={width}
      height={height}
      aria-hidden="true"
      {...props}
    />
  );
};
