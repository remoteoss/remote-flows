import { http, HttpResponse } from 'msw';
import { identityMock } from '@/src/common/api/fixtures/identity';
import { legalEntitiesMock } from '@/src/common/api/fixtures/legal-entities';
import { mockEligibilityQuestionnaireSchema } from '@/src/common/api/fixtures/eligibility-questionnaire';
import {
  mockContractorSubscriptionResponse,
  mockManageSubscriptionResponse,
} from '@/src/common/api/fixtures/contractors-subscriptions';
import { countriesMock } from '@/src/common/api/fixtures/countries';
import {
  mockContractorBasicInformationSchema,
  mockContractorCurrenciesResponse,
} from '@/src/common/api/fixtures/contractors';
import { mockCompanyPricingPlansResponse } from '@/src/common/api/fixtures/companies';

const identityHandler = http.get('*/v1/identity/current', () => {
  return HttpResponse.json(identityMock);
});

const legalEntitiesHandler = http.get('*/v1/companies/*/legal-entities', () => {
  return HttpResponse.json(legalEntitiesMock);
});

const eligibilityQuestionnaireHandler = http.get(
  '*/v1/contractors/schemas/eligibility-questionnaire',
  async () => {
    return HttpResponse.json(mockEligibilityQuestionnaireSchema);
  },
);

const contractorSubscriptionHandler = http.get(
  '*/v1/contractors/employments/*/contractor-subscriptions',
  async () => {
    return HttpResponse.json(mockContractorSubscriptionResponse);
  },
);

const manageSubscriptionHandler = http.post(
  '*/v1/contractors/employments/*/contractor-plus-subscription',
  () => {
    return HttpResponse.json(mockManageSubscriptionResponse);
  },
);

const countriesHandler = http.get('*/v1/countries', () => {
  return HttpResponse.json(countriesMock);
});

const contractorCurrenciesHandler = http.get(
  '*/v1/contractors/employments/*/contractor-currencies',
  () => {
    return HttpResponse.json(mockContractorCurrenciesResponse);
  },
);

const companyPricingPlansHandler = http.get(
  '*/v1/companies/*/pricing-plans',
  () => {
    return HttpResponse.json(mockCompanyPricingPlansResponse);
  },
);

const contractorBasicInformationHandler = http.get(
  '*/v1/countries/*/contractor_basic_information*',
  () => {
    return HttpResponse.json(mockContractorBasicInformationSchema);
  },
);

export const defaultHandlers = [
  identityHandler,
  legalEntitiesHandler,
  eligibilityQuestionnaireHandler,
  contractorSubscriptionHandler,
  manageSubscriptionHandler,
  countriesHandler,
  contractorCurrenciesHandler,
  companyPricingPlansHandler,
  contractorBasicInformationHandler,
];
