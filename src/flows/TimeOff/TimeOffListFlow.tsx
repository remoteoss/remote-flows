import React from 'react';

export type TimeOffListFlowProps = {
  render: () => React.ReactNode;
};

export const TimeOffListFlow = ({ render }: TimeOffListFlowProps) => (
  <>{render()}</>
);
