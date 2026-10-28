import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeOffFlow } from '@/src/index';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

function renderFlow(timeOffId?: string) {
  return render(
    <TimeOffFlow
      timeOffId={timeOffId}
      render={({
        timeOffBag,
        components: { RequestIdStep, NextButton, TimeOffStep },
      }) => (
        <>
          <h2>Time off</h2>
          {timeOffBag.stepState.currentStep.name === 'request_id' && (
            <>
              <RequestIdStep />
              <NextButton>Next</NextButton>
            </>
          )}
          {timeOffBag.stepState.currentStep.name === 'time_off' && (
            <>
              <p>Reviewing {timeOffBag.timeOffId}</p>
              <TimeOffStep />
            </>
          )}
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

  it('keeps Next disabled until a non-blank request ID is entered', async () => {
    renderFlow();

    const input = await screen.findByLabelText('Time off request ID');
    const next = screen.getByRole('button', { name: 'Next' });
    expect(next).toBeDisabled();

    await userEvent.type(input, '   ');
    expect(next).toBeDisabled();

    await userEvent.type(input, 'timeoff-123');
    expect(next).toBeEnabled();
  });

  it('stores the entered request ID and moves on without requesting anything', async () => {
    const requests: string[] = [];
    const onRequest = ({ request }: { request: Request }) => {
      requests.push(request.url);
    };
    server.events.on('request:start', onRequest);

    const { container } = renderFlow();

    await userEvent.type(
      await screen.findByLabelText('Time off request ID'),
      'timeoff-123',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      await screen.findByText('Reviewing timeoff-123'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.RemoteFlows__TimeOffStep'),
    ).toBeInTheDocument();

    server.events.removeListener('request:start', onRequest);
    expect(requests).toEqual([]);
  });

  it('starts the request ID step with the ID supplied by the host', async () => {
    renderFlow('timeoff-456');

    expect(await screen.findByLabelText('Time off request ID')).toHaveValue(
      'timeoff-456',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      await screen.findByText('Reviewing timeoff-456'),
    ).toBeInTheDocument();
  });
});
