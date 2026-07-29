import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { usePayrollAdminOnboarding } from '@/src/flows/PayrollAdminOnboarding/hooks';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

const gpEnabledLegalEntity = {
  id: 'le-1',
  name: 'Acme GP Legal Entity',
  country_code: 'USA',
  is_default: true,
  global_payroll_enabled: true,
};

const legalEntitiesResponse = (legalEntities: Record<string, unknown>[]) => ({
  data: {
    legal_entities: legalEntities,
    current_page: 1,
    total_pages: 1,
    total_count: legalEntities.length,
  },
});

describe('usePayrollAdminOnboarding — legal entities', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('defaults legalEntityId to the first GP-enabled legal entity when none is provided', async () => {
    server.use(
      http.get('*/v1/companies/*/legal-entities', () =>
        HttpResponse.json(legalEntitiesResponse([gpEnabledLegalEntity])),
      ),
    );

    const { result } = renderHook(
      () => usePayrollAdminOnboarding({ companyId: 'company-1' }),
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(result.current.legalEntityId).toBe('le-1');
    });
    expect(result.current.legalEntities).toEqual([gpEnabledLegalEntity]);
  });

  it('exposes an empty legalEntities array and no legalEntityId when the company has no GP-enabled legal entity', async () => {
    server.use(
      http.get('*/v1/companies/*/legal-entities', () =>
        HttpResponse.json(
          legalEntitiesResponse([
            { ...gpEnabledLegalEntity, global_payroll_enabled: false },
          ]),
        ),
      ),
    );

    const { result } = renderHook(
      () => usePayrollAdminOnboarding({ companyId: 'company-1' }),
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.legalEntities).toEqual([]);
    expect(result.current.legalEntityId).toBeUndefined();
  });

  it('uses an explicitly provided legalEntityId as-is, while still exposing the fetched legalEntities', async () => {
    server.use(
      http.get('*/v1/companies/*/legal-entities', () =>
        HttpResponse.json(legalEntitiesResponse([gpEnabledLegalEntity])),
      ),
    );

    const { result } = renderHook(
      () =>
        usePayrollAdminOnboarding({
          companyId: 'company-1',
          legalEntityId: 'explicit-le',
        }),
      { wrapper: TestProviders },
    );

    expect(result.current.legalEntityId).toBe('explicit-le');

    // legalEntities is still fetched and populated — it must not read as
    // empty just because an explicit legalEntityId skipped derivation, or
    // callers following the "empty legalEntities means no GP legal entity"
    // contract would be misled.
    await waitFor(() => {
      expect(result.current.legalEntities).toEqual([gpEnabledLegalEntity]);
    });
  });

  it('exposes isErrorLegalEntities when the fetch fails, instead of reading as no GP-enabled legal entity', async () => {
    server.use(
      http.get('*/v1/companies/*/legal-entities', () =>
        HttpResponse.json(
          { message: 'Internal server error' },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHook(
      () => usePayrollAdminOnboarding({ companyId: 'company-1' }),
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(result.current.isErrorLegalEntities).toBe(true);
    });
    expect(result.current.legalEntities).toEqual([]);
    expect(result.current.legalEntityId).toBeUndefined();
  });
});
