import { JsonSchemaComparison } from '@remoteoss/remote-flows/internals';
import { RemoteFlows } from './RemoteFlows';

export const JsonSchemaComparisonDemo = () => {
  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <JsonSchemaComparison />
    </RemoteFlows>
  );
};
