import { ContractDocumentFlow } from '@remoteoss/remote-flows';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

export function ContractDocument() {
  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        <ContractDocumentFlow
          render={() => (
            <div className='onboarding-form-container'>
              <h2>Create contract document</h2>
              <p>To be continued…</p>
            </div>
          )}
        />
      </div>
    </RemoteFlows>
  );
}
