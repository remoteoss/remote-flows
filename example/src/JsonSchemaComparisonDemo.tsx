import { JsonSchemaComparison } from '@remoteoss/remote-flows/internals';
import { RemoteFlows } from './RemoteFlows';

export const JsonSchemaComparisonDemo = () => {
  return (
    <RemoteFlows
      authType='company-manager'
      proxy={{ url: window.location.origin }}
    >
      <JsonSchemaComparison />
    </RemoteFlows>
  );
};
