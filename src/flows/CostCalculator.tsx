import React from 'react';
import { useClient } from '../RemoteFlowsProvider';

export function CostCalculator() {
  const value = useClient();
  console.log(value);
  return <div>CostCalculator</div>;
}
