import { EorHiringModel } from '@/src/client/types.gen';

type CountryOfModel<M> = M extends `${infer Prefix}_${string}`
  ? Uppercase<Prefix>
  : never;

type HiringModelCountry = CountryOfModel<EorHiringModel>;

type ModelOfCountry<C extends string> = Extract<
  EorHiringModel,
  `${Lowercase<C>}_${string}`
>;

type CountryHiringModels<C extends HiringModelCountry = HiringModelCountry> = {
  default: ModelOfCountry<C>;
  others: readonly ModelOfCountry<C>[];
};

type HiringModelTable = {
  [C in HiringModelCountry]: CountryHiringModels<C>;
};

type ListedModels<T extends HiringModelTable> = {
  [C in keyof T]: T[C] extends {
    default: infer Default;
    others: readonly (infer Other)[];
  }
    ? Default | Other
    : never;
}[keyof T];

type UnlistedModels<T extends HiringModelTable> = Exclude<
  EorHiringModel,
  ListedModels<T>
>;

const defineHiringModels = <const T extends HiringModelTable>(
  table: T &
    ([UnlistedModels<T>] extends [never]
      ? unknown
      : { unlistedModels: UnlistedModels<T> }),
): T => table;

export const HIRING_MODELS_BY_COUNTRY = defineHiringModels({
  CZE: { default: 'cze_consulting', others: ['cze_tea'] },
  DEU: {
    default: 'deu_aug',
    others: ['deu_aug_de3', 'deu_solutions', 'deu_solutions_legacy'],
  },
  FRA: { default: 'fra_wage_portage', others: ['fra_consulting'] },
  ITA: { default: 'ita_apl', others: ['ita_consulting'] },
});

export const getCountryHiringModels = (
  countryCode: string,
): CountryHiringModels | undefined =>
  (HIRING_MODELS_BY_COUNTRY as Partial<Record<string, CountryHiringModels>>)[
    countryCode
  ];

const KNOWN_HIRING_MODELS = new Set<string>(
  Object.values(HIRING_MODELS_BY_COUNTRY).flatMap(
    (models: CountryHiringModels) => [models.default, ...models.others],
  ),
);

export const isKnownHiringModel = (model: string): model is EorHiringModel =>
  KNOWN_HIRING_MODELS.has(model);
