import { TimeOffListFlow } from '@remoteoss/remote-flows';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

export function TimeOffList() {
  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        <TimeOffListFlow
          render={() => (
            <div className='onboarding-form-container'>
              <h2 className='text-lg font-semibold mb-4'>Time-off requests</h2>
            </div>
          )}
        />
      </div>
    </RemoteFlows>
  );
}
