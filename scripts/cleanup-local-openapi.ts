import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Removes /api/eor prefix from generated OpenAPI client files
 * This is needed when generating from local OpenAPI spec that includes the prefix
 */
function cleanupApiEorPrefix() {
  const files = [
    resolve(process.cwd(), 'src/client/sdk.gen.ts'),
    resolve(process.cwd(), 'src/client/types.gen.ts'),
  ];

  let totalReplacements = 0;

  for (const filePath of files) {
    try {
      let content = readFileSync(filePath, 'utf-8');
      const originalContent = content;

      // Replace /api/eor/v1/ with /v1/
      content = content.replace(/url: '\/api\/eor\/v1\//g, "url: '/v1/");

      // Replace /api/eor/v2/ with /v2/
      content = content.replace(/url: '\/api\/eor\/v2\//g, "url: '/v2/");

      if (content !== originalContent) {
        writeFileSync(filePath, content, 'utf-8');
        const fileName = filePath.split('/').pop();
        const replacements = (originalContent.match(/\/api\/eor\//g) || [])
          .length;
        console.log(`✓ Cleaned ${replacements} URLs in ${fileName}`);
        totalReplacements += replacements;
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
      process.exit(1);
    }
  }

  if (totalReplacements > 0) {
    console.log(
      `\n✓ Successfully removed /api/eor prefix from ${totalReplacements} URLs`,
    );
  } else {
    console.log('\n✓ No /api/eor prefixes found');
  }
}

cleanupApiEorPrefix();
