export const zendeskArticles = {
  /**
   * Disclaimer for Cost Calculator
   * Access: Private (Need Remote account to access)
   * https://support.remote.com/hc/en-us/articles/4668194326797
   */
  disclaimerCostCalculator: 4668194326797,
  /**
   * Guide for engaging contractors
   * Access: private (Need Remote account to access)
   * https://support.remote.com/hc/en-us/articles/43161434169613
   */
  engagingContractors: 43161434169613,
  /**
   * Employee Onboarding Timeline
   * Access: Private (Need Remote account to access)
   * https://support.remote.com/hc/en-us/articles/4411262104589
   */
  employeeOnboardingTimeline: 4411262104589,
  /**
   * Extra Payments
   * Access: Public (Everyone can access)
   * https://support.remote.com/hc/en-us/articles/4466822781709
   */
  extraPayments: 4466822781709,
  /**
   * International Pricing
   * Access: Public (Everyone can access)
   * https://support.remote.com/hc/en-us/articles/4410698586893
   */
  internationalPricing: 4410698586893,
  /**
   * Pricing Plan Options
   * Access: Private (Need Remote account to access)
   * https://support.remote.com/hc/en-us/articles/43161720465421
   */
  pricingPlanOptions: 43161720465421,
  /**
   * IR35 Status
   * Access: Private (Need Remote account to access)
   * https://support.remote.com/hc/en-us/articles/42810224523917
   */
  ir35Status: 42810224523917,
  /**
   * Remote FX Rate
   * Access: Public (Everyone can access)
   * https://support.remote.com/hc/en-us/articles/33271144977421
   */
  remoteFxRate: 33271144977421,
  /**
   * Employee Communication for Terminations
   * Access: Public (Everyone can access)
   * https://support.remote.com/hc/en-us/articles/4411585179661
   */
  terminationEmployeeCommunication: 4411585179661,
  /**
   * Notice Period for Terminations by Country
   * Access: Public (Everyone can access)
   * https://support.remote.com/hc/en-us/articles/5831900985613
   */
  terminationNoticePeriods: 5831900985613,
  /**
   * Involuntary Offboarding Service Charge
   * Access: Private (Need Remote account to access)
   * https://support.remote.com/hc/en-us/articles/4406932229133
   */
  involuntaryOffboardingServiceCharge: 4406932229133,
  /**
   * Reconciliation Invoice
   * Access: Public (Everyone can access)
   * https://support.remote.com/hc/en-us/articles/17604014808589
   */
  reconciliationInvoice: 17604014808589,
};

export const buildZendeskURL = (zendeskId: number) => {
  return `https://support.remote.com/hc/en-us/articles/${zendeskId}`;
};
