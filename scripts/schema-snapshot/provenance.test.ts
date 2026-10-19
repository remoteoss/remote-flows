import { describeProvenanceDrift, hashSchema, Provenance } from './provenance';

const provenance: Provenance = {
  recordedAt: '2026-10-16T08:01:58.000Z',
  remoteFlowsSha: 'abc1234',
  formKitVersion: '1.1.4',
  jsonSchemaFormVersion: '1.2.19',
  schemaHash: 'aaaa',
  basicInformation: { has_seniority_date: 'no', name: 'Ada' },
};

describe('schema snapshot provenance', () => {
  it('hashes a schema the same way regardless of key order', () => {
    expect(hashSchema({ a: 1, b: { c: 2, d: [3, { f: 1, e: 2 }] } })).toBe(
      hashSchema({ b: { d: [3, { e: 2, f: 1 }], c: 2 }, a: 1 }),
    );
    expect(hashSchema({ a: 1 })).not.toBe(hashSchema({ a: 2 }));
  });

  it('reports that a baseline without provenance cannot be compared', () => {
    expect(describeProvenanceDrift(undefined, provenance)).toEqual([
      'The baseline has no provenance, so the runs cannot be compared.',
    ]);
  });

  it('blames the engine or the seed when the served schema is identical', () => {
    expect(
      describeProvenanceDrift(provenance, {
        ...provenance,
        formKitVersion: '1.2.0',
        basicInformation: { has_seniority_date: 'yes', name: 'Ada' },
      }),
    ).toEqual([
      "The served schema is identical to the baseline's (hash aaaa), so the difference comes from the engine or the seeded employment.",
      'remote-json-schema-form-kit: 1.1.4 -> 1.2.0.',
      'Seeded basic information differs on: has_seniority_date.',
    ]);
  });

  it('ignores the start date, which differs on every run', () => {
    expect(
      describeProvenanceDrift(
        {
          ...provenance,
          basicInformation: { provisional_start_date: '2026-10-01' },
        },
        {
          ...provenance,
          basicInformation: { provisional_start_date: '2026-11-02' },
        },
      ),
    ).toEqual([
      "The served schema is identical to the baseline's (hash aaaa), so the difference comes from the engine or the seeded employment.",
    ]);
  });

  it('reports a changed served schema with the baseline run it is compared to', () => {
    expect(
      describeProvenanceDrift(provenance, {
        ...provenance,
        schemaHash: 'bbbb',
      }),
    ).toEqual([
      'The served schema changed (hash aaaa -> bbbb) (baseline recorded 2026-10-16T08:01:58.000Z at abc1234).',
    ]);
  });
});
