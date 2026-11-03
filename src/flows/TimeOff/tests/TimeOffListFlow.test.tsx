import { render, screen } from '@testing-library/react';
import { TimeOffListFlow } from '@/src/index';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

function renderFlow() {
  return render(<TimeOffListFlow render={() => <h2>Time-off requests</h2>} />, {
    wrapper: TestProviders,
  });
}

describe('TimeOffListFlow', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('renders what the render prop returns', () => {
    renderFlow();

    expect(
      screen.getByRole('heading', { name: 'Time-off requests' }),
    ).toBeInTheDocument();
  });

  it('does not request anything', async () => {
    const requests: string[] = [];
    const onRequest = ({ request }: { request: Request }) => {
      requests.push(request.url);
    };
    server.events.on('request:start', onRequest);

    renderFlow();
    expect(
      await screen.findByRole('heading', { name: 'Time-off requests' }),
    ).toBeInTheDocument();

    server.events.removeListener('request:start', onRequest);
    expect(requests).toEqual([]);
  });
});
