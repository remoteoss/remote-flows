import { EorHiringModel } from '@/src/client/types.gen';

const HIRING_MODEL_COUNTRY: Record<EorHiringModel, string> = {
  cze_consulting: 'CZE',
  cze_tea: 'CZE',
  deu_aug: 'DEU',
  deu_aug_de3: 'DEU',
  deu_solutions: 'DEU',
  deu_solutions_legacy: 'DEU',
  fra_wage_portage: 'FRA',
  fra_consulting: 'FRA',
  ita_apl: 'ITA',
  ita_consulting: 'ITA',
};

export const DEFAULT_HIRING_MODEL_BY_COUNTRY: Record<string, EorHiringModel> = {
  CZE: 'cze_consulting',
  DEU: 'deu_aug',
  FRA: 'fra_wage_portage',
  ITA: 'ita_apl',
};

export const getDefaultHiringModel = (
  countryCode: string,
): EorHiringModel | undefined => DEFAULT_HIRING_MODEL_BY_COUNTRY[countryCode];

export const isKnownHiringModel = (model: string): model is EorHiringModel =>
  model in HIRING_MODEL_COUNTRY;

export const getHiringModelCountry = (model: EorHiringModel): string =>
  HIRING_MODEL_COUNTRY[model];
