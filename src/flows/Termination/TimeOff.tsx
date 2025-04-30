import { EmploymentShowResponse, ListTimeoffResponse } from '@/src/client';
import { useEmploymentQuery, useTimeOffQuery } from '@/src/common/hooks';
import { useTerminationContext } from '@/src/flows/Termination/context';
import React from 'react';

export const TimeOff = ({
  render,
}: {
  render: (props: {
    employment: EmploymentShowResponse | undefined;
    timeoff: ListTimeoffResponse | undefined;
  }) => React.ReactNode;
}) => {
  const { terminationBag } = useTerminationContext();
  const { data: employment } = useEmploymentQuery({
    employmentId: terminationBag.employmentId,
  });

  const { data: timeoff } = useTimeOffQuery({
    employmentId: terminationBag.employmentId,
    status: 'taken',
  });

  return render({ employment, timeoff });
};
