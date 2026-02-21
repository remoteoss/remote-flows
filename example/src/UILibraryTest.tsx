/**
 * Test file for the new standalone UI library
 * This demonstrates that the UI library is properly linked and working
 */

import { Button } from '@remoteoss/remote-flows-ui';
import '@remoteoss/remote-flows-ui/styles.css';

export function UILibraryTest() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <h1>UI Library Test</h1>
      <p>Testing the new standalone UI library components:</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <h3 style={{ width: '100%' }}>Button Variants</h3>
        <Button variant="primary" onClick={() => alert('Primary clicked!')}>
          Primary Button
        </Button>
        <Button variant="secondary" onClick={() => alert('Secondary clicked!')}>
          Secondary Button
        </Button>
        <Button variant="outline" onClick={() => alert('Outline clicked!')}>
          Outline Button
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <h3 style={{ width: '100%' }}>Button Sizes</h3>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <h3 style={{ width: '100%' }}>Disabled State</h3>
        <Button variant="primary" disabled>Disabled Primary</Button>
        <Button variant="secondary" disabled>Disabled Secondary</Button>
        <Button variant="outline" disabled>Disabled Outline</Button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h4>✅ UI Library Status</h4>
        <p>
          If you can see styled buttons above, the UI library is properly linked and working!
        </p>
        <p>
          <strong>Package:</strong> @remoteoss/remote-flows-ui<br />
          <strong>Version:</strong> 0.1.0 (prototype)
        </p>
      </div>
    </div>
  );
}
