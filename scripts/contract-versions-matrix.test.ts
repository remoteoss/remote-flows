import { updateVersionMatrix } from './contract-versions-matrix';

const header = [
  '| Country | Code | Contract Details | Remote platform | Up to date | Last Updated |',
  '| ------- | ---- | ---------------- | --------------- | ---------- | ------------ |',
];

function matrix(...rows: string[]) {
  return [...header, ...rows, ''].join('\n');
}

describe('updateVersionMatrix', () => {
  it('raises the platform version and flips Up to date to No when the pin is behind', () => {
    const readme = matrix(
      '| Albania | ALB  | v4               | v4              | Yes        | October 2026 |',
    );

    const { content, unreadableRows } = updateVersionMatrix(readme, { ALB: 5 });

    expect(content).toBe(
      matrix(
        '| Albania | ALB  | v4               | v5              | No         | October 2026 |',
      ),
    );
    expect(unreadableRows).toEqual([]);
  });

  it('marks a country Yes when the pin is at or above the platform version', () => {
    const readme = matrix(
      '| Albania | ALB  | v5               | v4              | No         | -            |',
    );

    const { content } = updateVersionMatrix(readme, { ALB: 5 });

    expect(content).toBe(
      matrix(
        '| Albania | ALB  | v5               | v5              | Yes        | -            |',
      ),
    );
  });

  it('reads the platform version for FRA and ITA from their backend codes', () => {
    const readme = matrix(
      '| Italy   | ITA  | v2               | v2              | Yes        | -            |',
    );

    const { content } = updateVersionMatrix(readme, { ITA: 5, ITA_APL: 3 });

    expect(content).toBe(
      matrix(
        '| Italy   | ITA  | v2               | v3              | No         | -            |',
      ),
    );
  });

  it('updates the platform version for France but keeps its documented Up to date', () => {
    const readme = matrix(
      '| France  | FRA  | v1               | v2              | Yes        | -            |',
    );

    const { content } = updateVersionMatrix(readme, { FRA: 6, FRA_SAS: 3 });

    expect(content).toBe(
      matrix(
        '| France  | FRA  | v1               | v3              | Yes        | -            |',
      ),
    );
  });

  it('leaves countries without a backend version and non-table lines alone', () => {
    const readme = `Intro line\n${matrix(
      '| Albania | ALB  | v4               | v4              | Yes        | -            |',
    )}`;

    const { content } = updateVersionMatrix(readme, { ZZZ: 3 });

    expect(content).toBe(readme);
  });

  it('reports a row whose Contract Details cell is not a plain version', () => {
    const row =
      '| Albania | ALB  | v4 (beta)        | v4              | Yes        | -            |';

    const { content, unreadableRows } = updateVersionMatrix(matrix(row), {
      ALB: 5,
    });

    expect(content).toBe(matrix(row));
    expect(unreadableRows).toEqual([row]);
  });
});
