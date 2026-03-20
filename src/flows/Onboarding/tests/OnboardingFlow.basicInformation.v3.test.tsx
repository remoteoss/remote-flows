import { server } from '@/src/tests/server';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  basicInformationSchemaV3Default,
  basicInformationSchemaV3Korea,
  basicInformationSchemaV3Argentina,
  companyResponse,
  employmentDefaultResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

describe('OnboardingFlow - Basic Information v3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json(companyResponse);
      }),
      http.get('*/v1/employments/:id', ({ params }) => {
        const employmentId = params?.id;
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
      }),
    );
  });

  describe('default countries (PRT, ESP)', () => {
    beforeEach(() => {
      server.use(
        http.get('*/v1/countries/PRT/employment_basic_information*', () => {
          return HttpResponse.json(basicInformationSchemaV3Default);
        }),
      );
    });

    it.todo('should render fieldsets correctly');
    it.todo('should submit nested fieldset data');
  });

  describe('Korea (no seniority field)', () => {
    beforeEach(() => {
      server.use(
        http.get('*/v1/countries/KOR/employment_basic_information*', () => {
          return HttpResponse.json(basicInformationSchemaV3Korea);
        }),
      );
    });

    it.todo('should not render seniority field for KOR');
  });

  describe('Argentina (with fieldsets)', () => {
    beforeEach(() => {
      server.use(
        http.get('*/v1/countries/ARG/employment_basic_information*', () => {
          return HttpResponse.json(basicInformationSchemaV3Argentina);
        }),
      );
    });

    it.todo('should render ARG-specific fieldsets');
  });
});
