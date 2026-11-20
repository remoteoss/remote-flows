import {
  DEFAULT_HIRING_MODEL_BY_COUNTRY,
  getHiringModelCountry,
} from '@/src/flows/Onboarding/hiringModels';

describe('DEFAULT_HIRING_MODEL_BY_COUNTRY', () => {
  it.each(Object.entries(DEFAULT_HIRING_MODEL_BY_COUNTRY))(
    'the %s default model belongs to that country',
    (country, model) => {
      expect(getHiringModelCountry(model)).toBe(country);
    },
  );
});
