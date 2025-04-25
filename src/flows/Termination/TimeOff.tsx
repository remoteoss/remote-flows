import { useEmploymentQuery, useTimeOffQuery } from '@/src/data/hooks';
import { useTerminationContext } from '@/src/flows/Termination/context';
import React from 'react';

export const TimeOff = ({
  children,
}: {
  children?: (props: { username: string }) => React.ReactNode;
}) => {
  const { terminationBag } = useTerminationContext();
  const employment = useEmploymentQuery({
    employmentId: terminationBag.employmentId,
  });

  const timeoffQuery = useTimeOffQuery({
    employmentId: terminationBag.employmentId,
    status: 'taken',
  });

  const username: string = employment.data?.data.employment?.basic_information
    ?.name as string;
  const days = timeoffQuery.data?.data?.total_count || 0;

  // if days is 0 or > 1 'days' else 'day
  const daysLiteral = days > 1 || days === 0 ? 'days' : 'day';

  return (
    <div className="RemoteFlows__TimeOff">
      <p className="RemoteFlows__TimeOff__Title">
        We have recorded {days} {daysLiteral} of paid time off for {username}
      </p>
      {children?.({ username })}
    </div>
  );
};
