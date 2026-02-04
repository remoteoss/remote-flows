import { http, HttpResponse } from 'msw';
import { identityMock } from '@/src/common/api/fixtures/identity';
import { legalEntitiesMock } from '@/src/common/api/fixtures/legal-entities';

const identityHandler = http.get('*/v1/identity/current', () => {
  return HttpResponse.json(identityMock);
});

const legalEntitiesHandler = http.get('*/v1/companies/*/legal-entities', () => {
  return HttpResponse.json(legalEntitiesMock);
});

export const defaultHandlers = [identityHandler, legalEntitiesHandler];
