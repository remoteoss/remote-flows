import { Page, Route } from '@playwright/test';

interface FillEstimationFormOptions {
  country: string;
  currency: string;
  salary: string;
  management_fee: string;
}

export async function fillEstimationForm(
  page: Page,
  options: Partial<FillEstimationFormOptions>,
) {
  if (options.country) {
    await page.selectOption('#country', options.country);
  }
  if (options.currency) {
    await page.selectOption('#currency', options.currency);
  }
  if (options.salary) {
    await page.fill('#salary_conversion', options.salary);
  }
  if (options.management_fee) {
    await page.getByRole('button', { name: 'Show Management fee' }).click();
    await page.fill('#management\\.management_fee', options.management_fee);
  }
  await page.click('.submit-button');
}

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
