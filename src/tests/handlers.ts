import { http, HttpResponse } from 'msw';
import { identityMock } from '@/src/common/api/fixtures/identity';
import { legalEntitiesMock } from '@/src/common/api/fixtures/legal-entities';
import {
  mockEligibilityQuestionnaireResponse,
  mockEligibilityQuestionnaireSchema,
} from '@/src/common/api/fixtures/eligibility-questionnaire';
import {
  mockContractorSubscriptionResponse,
  mockManageSubscriptionResponse,
} from '@/src/common/api/fixtures/contractors-subscriptions';
import { countriesMock } from '@/src/common/api/fixtures/countries';
import { mockContractorCurrenciesResponse } from '@/src/common/api/fixtures/contractors';
import { mockCompanyPricingPlansResponse } from '@/src/common/api/fixtures/companies';
import { mockBaseResponse } from '@/src/common/api/fixtures/base';

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

const eligibilityQuestionnaireResponseHandler = http.post(
  '*/v1/contractors/eligibility-questionnaire',
  async () => {
    return HttpResponse.json(mockEligibilityQuestionnaireResponse);
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

const contractorCORSubscriptionHandler = http.post(
  '*/v1/contractors/employments/*/contractor-cor-subscription',
  async () => {
    return HttpResponse.json(mockBaseResponse);
  },
);

export const countriesHandler = http.get('*/v1/countries', () => {
  return HttpResponse.json(countriesMock);
});

const contractorCurrenciesHandler = http.get(
  '*/v1/contractors/employments/*/contractor-currencies',
  () => {
    return HttpResponse.json(mockContractorCurrenciesResponse);
  },
);

export const companyPricingPlansHandler = http.get(
  '*/v1/companies/*/pricing-plans',
  () => {
    return HttpResponse.json(mockCompanyPricingPlansResponse);
  },
);

export const defaultHandlers = [
  identityHandler,
  legalEntitiesHandler,
  eligibilityQuestionnaireHandler,
  eligibilityQuestionnaireResponseHandler,
  contractorSubscriptionHandler,
  contractorCORSubscriptionHandler,
  manageSubscriptionHandler,
  countriesHandler,
  contractorCurrenciesHandler,
  companyPricingPlansHandler,
];
