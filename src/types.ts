export interface Currency {
  code: string;
  name: string;
  symbol: string;
  slug: string;
}

export interface Country {
  code: string;
  name: string;
  slug: string;
  alpha_2_code: string;
  currency?: Currency;
}

export interface Region {
  code: string;
  name: string;
  status: string;
  country: Country;
  slug: string;
  child_regions: any[];
  parent_region: null;
}

export interface CostItem {
  name: string;
  description: string;
  amount: number;
  zendesk_article_url: string | null;
}

export interface CurrencyCosts {
  currency: Currency;
  annual_gross_salary: number;
  annual_benefits_breakdown: CostItem[];
  annual_benefits_total: number;
  annual_contributions_breakdown: CostItem[];
  annual_contributions_total: number;
  annual_total: number;
  extra_statutory_payments_breakdown: any[];
  extra_statutory_payments_total: number;
  monthly_benefits_breakdown: CostItem[];
  monthly_benefits_total: number;
  monthly_contributions_breakdown: CostItem[];
  monthly_contributions_total: number;
  monthly_gross_salary: number;
  monthly_tce: number;
  monthly_total: number;
}

export interface Employment {
  country: Country;
  region: Region;
  employer_currency_costs: CurrencyCosts;
  has_extra_statutory_payment: boolean;
  regional_currency_costs: CurrencyCosts;
}

export interface EmploymentData {
  employments: Employment[];
}
