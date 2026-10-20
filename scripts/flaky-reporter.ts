import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Reporter, TestModule } from 'vitest/node';

export type FlakyEntry = {
  file: string;
  name: string;
  outcome: 'flaky' | 'failed';
  retries: number;
  error: string;
};

const OUTPUT = path.join('out', 'flaky-tests.json');

export default class FlakyReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>) {
    const entries: FlakyEntry[] = [];
    for (const module of testModules) {
      for (const test of module.children.allTests()) {
        const diagnostic = test.diagnostic();
        const result = test.result();
        const flaky = diagnostic?.flaky === true;
        if (!flaky && result.state !== 'failed') {
          continue;
        }
        entries.push({
          file: path.relative(process.cwd(), module.moduleId),
          name: test.fullName,
          outcome: flaky ? 'flaky' : 'failed',
          retries: diagnostic?.retryCount ?? 0,
          error: result.errors?.[0]?.message.split('\n')[0] ?? '',
        });
      }
    }
    mkdirSync(path.dirname(OUTPUT), { recursive: true });
    writeFileSync(OUTPUT, JSON.stringify(entries, null, 2));
  }
}
