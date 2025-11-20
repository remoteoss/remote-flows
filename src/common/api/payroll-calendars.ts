import { useQuery } from '@tanstack/react-query';
import { getIndexEorPayrollCalendar } from '@/src/client';
import { useClient } from '@/src/context';
import { Client } from '@hey-api/client-fetch';

export const usePayrollCalendars = ({
  query,
  options,
}: {
  query?: {
    year?: string;
    countryCode?: string;
  };
  options?: {
    enabled?: boolean;
  };
}) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['payroll-calendars'],
    queryFn: () =>
      getIndexEorPayrollCalendar({
        client: client as Client,
        query: {
          year: query?.year,
          country_code: query?.countryCode,
        },
      }),
    enabled: options?.enabled,
    select: (data) => data.data?.data,
  });
};
