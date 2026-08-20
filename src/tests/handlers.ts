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
import {
  mockContractorBasicInformationSchema,
  mockContractorCurrenciesResponse,
} from '@/src/common/api/fixtures/contractors';
import {
  mockCompanyPricingPlansResponse,
  mockCompanyResponse,
} from '@/src/common/api/fixtures/companies';
import { mockBaseResponse } from '@/src/common/api/fixtures/base';
import {
  mockBasicInformationResponse,
  mockBenefitOffersResponse,
  mockBenefitOffersSchema,
  mockOnboardingReservesStatusResponse,
} from '@/src/common/api/fixtures/employments';
import {
  employmentDefaultResponse,
  employmentCreatedResponse,
  employmentUpdatedResponse,
  benefitOffersUpdatedResponse,
  conversionFromEURToUSD,
} from '@/src/flows/Onboarding/tests/fixtures';
import {
  preOnboardingRequirementsMock,
  generatedDocumentMock,
  documentDetailsMock,
  signDocumentResponseMock,
} from '@/src/common/api/fixtures/pre-onboarding-requirements';

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

const countriesHandler = http.get('*/v1/countries', () => {
  return HttpResponse.json(countriesMock);
});

const contractorCORSubscriptionHandler = http.post(
  '*/v1/contractors/employments/*/contractor-cor-subscription',
  async () => {
    return HttpResponse.json(mockBaseResponse);
  },
);

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

const employmentOnboardingReservesStatus = http.get(
  '*/v1/companies/:companyId/employments/:employmentId/onboarding-reserves-status',
  () => {
    return HttpResponse.json(mockOnboardingReservesStatusResponse);
  },
);

const companyHandler = http.get('*/v1/companies/:companyId', () => {
  return HttpResponse.json(mockCompanyResponse);
});

const benefitOffersHandler = http.get(
  '*/v1/employments/*/benefit-offers',
  () => {
    return HttpResponse.json(mockBenefitOffersResponse);
  },
);

const benefitOffersSchemaHandler = http.get(
  '*/v1/employments/*/benefit-offers/schema',
  () => {
    return HttpResponse.json(mockBenefitOffersSchema);
  },
);

const preOnboardingRequirementsHandler = http.get(
  '*/v1/onboarding/employments/:employmentId/pre-onboarding-requirements',
  () => {
    return HttpResponse.json(preOnboardingRequirementsMock);
  },
);

const createPreOnboardingDocumentHandler = http.post(
  '*/v1/onboarding/employments/:employmentId/pre-onboarding-requirements/:requirementSlug/documents',
  () => {
    return HttpResponse.json(generatedDocumentMock);
  },
);

const getPreOnboardingDocumentHandler = http.get(
  '*/v1/onboarding/employments/:employmentId/pre-onboarding-documents/:documentId',
  () => {
    return HttpResponse.json(documentDetailsMock);
  },
);

const signPreOnboardingDocumentHandler = http.post(
  '*/v1/onboarding/employments/:employmentId/pre-onboarding-documents/:documentId/sign',
  () => {
    return HttpResponse.json(signDocumentResponseMock);
  },
);

const contractEligibilityHandler = http.post(
  '*/v1/employments/*/contract-eligibility',
  () => {
    return HttpResponse.json(mockBaseResponse);
  },
);

const employmentHandler = http.get('*/v1/employments/:id', ({ params }) => {
  const employmentId = params?.id;

  if (!employmentId) {
    return HttpResponse.json(
      { error: 'Employment not found' },
      { status: 404 },
    );
  }

  return HttpResponse.json({
    ...employmentDefaultResponse,
    data: {
      ...employmentDefaultResponse.data,
      employment: {
        ...employmentDefaultResponse.data.employment,
        id: employmentId,
      },
    },
  });
});

const createEmploymentHandler = http.post('*/v1/employments', () => {
  return HttpResponse.json(employmentCreatedResponse);
});

const basicInformationHandler = http.get(
  '*/v2/employments/:id/basic-information',
  ({ params }) => {
    const employmentId = params?.id;

    return HttpResponse.json({
      ...mockBasicInformationResponse,
      data: {
        ...mockBasicInformationResponse.data,
        employment: {
          ...mockBasicInformationResponse.data.employment,
          id: employmentId,
        },
      },
    });
  },
);

const setContractOriginHandler = http.post(
  '*/v1/employments/*/contract-origin',
  async ({ request }) => {
    const body = (await request.json()) as { contract_origin: string };

    return HttpResponse.json({
      data: { contract_origin: body.contract_origin },
    });
  },
);

const updateEmploymentHandler = http.patch('*/v1/employments/*', () => {
  return HttpResponse.json(employmentUpdatedResponse);
});

const updateBenefitOffersHandler = http.put(
  '*/v1/employments/*/benefit-offers',
  () => {
    return HttpResponse.json(benefitOffersUpdatedResponse);
  },
);

const currencyConverterHandler = http.post(
  '*/v1/currency-converter/effective',
  () => {
    return HttpResponse.json(conversionFromEURToUSD);
  },
);

const contractorInvoiceSchedulesHandler = http.get(
  '*/v1/contractor-invoice-schedules',
  () => {
    return HttpResponse.json({
      data: {
        total_count: 0,
        current_page: 1,
        per_page: 10,
        total_pages: 0,
        contractor_invoice_schedules: [],
      },
    });
  },
);

const contractOriginHandler = http.post(
  '*/v1/employments/*/contract-origin',
  async ({ request }) => {
    const requestBody = await request.json();
    return HttpResponse.json({
      data: requestBody,
    });
  },
);

const createContractorInvoiceScheduleHandler = http.post(
  '*/v1/contractor-invoice-schedules',
  async ({ request }) => {
    const requestBody = await request.json();
    return HttpResponse.json({
      data: requestBody,
    });
  },
);

const updateContractorInvoiceScheduleHandler = http.patch(
  '*/v1/contractor-invoice-schedules/*',
  async ({ request, params }) => {
    const requestBody = (await request.json()) as Record<string, unknown>;
    const scheduleId = Array.isArray(params[0]) ? params[0][0] : params[0];

    return HttpResponse.json({
      data: {
        total_count: 1,
        current_page: 1,
        total_pages: 1,
        contractor_invoice_schedules: [
          {
            id: scheduleId,
            status: 'pending_contractor_action',
            ...requestBody,
          },
        ],
      },
    });
  },
);

export const defaultHandlers = [
  identityHandler,
  legalEntitiesHandler,
  eligibilityQuestionnaireHandler,
  eligibilityQuestionnaireResponseHandler,
  contractorSubscriptionHandler,
  contractorCORSubscriptionHandler,
  employmentOnboardingReservesStatus,
  manageSubscriptionHandler,
  countriesHandler,
  contractorCurrenciesHandler,
  companyPricingPlansHandler,
  contractorBasicInformationHandler,
  companyHandler,
  benefitOffersHandler,
  benefitOffersSchemaHandler,
  preOnboardingRequirementsHandler,
  createPreOnboardingDocumentHandler,
  getPreOnboardingDocumentHandler,
  signPreOnboardingDocumentHandler,
  contractEligibilityHandler,
  employmentHandler,
  createEmploymentHandler,
  basicInformationHandler,
  setContractOriginHandler,
  updateEmploymentHandler,
  updateBenefitOffersHandler,
  currencyConverterHandler,
  contractorInvoiceSchedulesHandler,
  contractOriginHandler,
  createContractorInvoiceScheduleHandler,
  updateContractorInvoiceScheduleHandler,
];
