import { EmploymentShowResponse, ListTimeoffResponse } from '@/src/client';
import { useEmploymentQuery, useTimeOffQuery } from '@/src/common/hooks';
import { useTerminationContext } from '@/src/flows/Termination/context';
import { UseQueryResult } from '@tanstack/react-query';
import React from 'react';

export const TimeOff = ({
  render,
}: {
  render?: (props: {
    employment: UseQueryResult<EmploymentShowResponse | undefined, Error>;
    timeoff: UseQueryResult<ListTimeoffResponse | undefined, Error>;
  }) => React.ReactNode;
}) => {
  const { terminationBag } = useTerminationContext();
  const employmentQuery = useEmploymentQuery({
    employmentId: terminationBag.employmentId,
  });

  const timeoffQuery = useTimeOffQuery({
    employmentId: terminationBag.employmentId,
    status: 'taken',
  });

  return render?.({ employment: employmentQuery, timeoff: timeoffQuery });
};
