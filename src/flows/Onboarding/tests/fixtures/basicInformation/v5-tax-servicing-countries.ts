export const taxServicingCountriesOptionsV5 = [
  { label: 'Global', value: 'global-Global', $meta: { type: 'global' } },
  { label: 'Europe', value: 'region-Europe', $meta: { type: 'region' } },
  {
    label: 'Europe - Western Europe',
    value: 'subregion-Western Europe',
    $meta: { type: 'subregion', region: 'Europe' },
  },
  {
    label: 'France',
    value: 'France',
    $meta: { type: 'country', region: 'Europe', subregion: 'Western Europe' },
  },
  {
    label: 'Japan',
    value: 'Japan',
    $meta: { type: 'country', region: 'Asia', subregion: 'Eastern Asia' },
  },
];
