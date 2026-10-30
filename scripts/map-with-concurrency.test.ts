import { mapWithConcurrency } from './map-with-concurrency';

describe('mapWithConcurrency', () => {
  it('keeps the input order and never runs more than the limit at once', async () => {
    let running = 0;
    let peak = 0;
    const results = await mapWithConcurrency(
      [30, 10, 20, 0, 5],
      2,
      async (delay) => {
        running++;
        peak = Math.max(peak, running);
        await new Promise((resolve) => setTimeout(resolve, delay));
        running--;
        return delay * 2;
      },
    );

    expect(results).toEqual([60, 20, 40, 0, 10]);
    expect(peak).toBe(2);
  });
});
