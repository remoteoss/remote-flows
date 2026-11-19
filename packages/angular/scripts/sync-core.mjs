import { cpSync, rmSync } from 'node:fs';

const target = new URL('../src/vendor/core', import.meta.url);
rmSync(target, { recursive: true, force: true });
cpSync(new URL('../../core/src', import.meta.url), target, {
  recursive: true,
  filter: (source) => !/\.test\.tsx?$|\/tests?(\/|$)|\/__/.test(source),
});
