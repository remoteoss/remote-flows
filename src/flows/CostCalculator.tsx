import React from 'react';
import { useRemoteFlowsSDK } from '../RemoteFlowsProvider';

export function CostCalculator() {
  const values = useRemoteFlowsSDK();

  return (
    <div>
      CostCalculator {values.clientID} {values.clientSecret}
    </div>
  );
}
