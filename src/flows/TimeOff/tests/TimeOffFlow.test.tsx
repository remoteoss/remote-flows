import { render, screen } from '@testing-library/react';
import { TimeOffFlow } from '@/src/index';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

function renderFlow() {
  return render(
    <TimeOffFlow
      render={({ timeOffBag, components: { TimeOffStep } }) => (
        <>
          <h2>Time off</h2>
          <p>{timeOffBag.stepState.currentStep.name}</p>
          <TimeOffStep />
        </>
      )}
    />,
    { wrapper: TestProviders },
  );
}

describe('TimeOffFlow', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('renders the time-off step composed through the render prop', () => {
    const { container } = renderFlow();

    expect(
      screen.getByRole('heading', { name: 'Time off' }),
    ).toBeInTheDocument();
    expect(screen.getByText('time_off')).toBeInTheDocument();
    expect(
      container.querySelector('.RemoteFlows__TimeOffStep'),
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
      await screen.findByRole('heading', { name: 'Time off' }),
    ).toBeInTheDocument();

    server.events.removeListener('request:start', onRequest);
    expect(requests).toEqual([]);
  });
});
