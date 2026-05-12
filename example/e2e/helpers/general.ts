import { Page, Route } from '@playwright/test';

export async function setupVercelBypass(page: Page) {
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();

    // Only add Vercel bypass headers to requests to the Vercel deployment
    if (url.includes('vercel.app') || url.includes('localhost:3001')) {
      const headers = {
        ...route.request().headers(),
        'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_TOKEN || '',
        'x-vercel-set-bypass-cookie': 'true',
      };

      await route.continue({ headers });
    } else {
      // For external requests (like to gateway.remote.com), continue without the headers
      await route.continue();
    }
  });
}
