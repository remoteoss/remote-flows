#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { globSync } from 'glob';
import chalk from 'chalk';

const SPACING_UTILITY = /\bspace-[xy]-/;

function checkSpacingUtilities(): void {
  const sources = globSync('src/{flows,common}/**/*.{ts,tsx}');

  const matches = sources.flatMap((source) =>
    readFileSync(source, 'utf-8')
      .split('\n')
      .flatMap((line, index) =>
        SPACING_UTILITY.test(line)
          ? [`${source}:${index + 1}: ${line.trim()}`]
          : [],
      ),
  );

  if (matches.length > 0) {
    console.error(
      chalk.red.bold(
        `❌ ${matches.length} space-x/space-y utility class(es) in src/flows or src/common. Spacing is the host's job: leave the RemoteFlows__* class and style it from example/src/css/main.css.\n`,
      ),
    );
    matches.forEach((match) => console.error(chalk.red(`  ${match}`)));
    process.exit(1);
  }

  console.log(
    chalk.green(
      `✅ No space-x/space-y utility classes in ${sources.length} flow and common files\n`,
    ),
  );
}

checkSpacingUtilities();
