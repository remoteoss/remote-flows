import {
  buildSteps,
  getBasicInformationSchemaVersion,
  getBenefitOffersSchemaVersion,
  getContractDetailsSchemaVersion,
} from '../utils';

describe('getContractDetailsSchemaVersion', () => {
  it('should return version 1 for all countries', () => {
    const result = getContractDetailsSchemaVersion(undefined, 'PRT');

    expect(result).toEqual(1);
  });

  it('should override external jsonSchemaVersion with country-specific valid version', () => {
    const options = {
      jsonSchemaVersionByCountry: {
        DEU: {
          contract_details: 2,
        },
      },
    };

    const result = getContractDetailsSchemaVersion(options, 'DEU');

    expect(result).toEqual(2);
  });
});

describe('getBenefitOffersSchemaVersion', () => {
  it('should return version 1 for all countries', () => {
    const result = getBenefitOffersSchemaVersion(undefined);

    expect(result).toEqual(1);
  });

  it('should override external jsonSchemaVersion with version 2', () => {
    const options = {
      jsonSchemaVersion: {
        benefit_offers_form_schema: 2,
      },
    };

    const result = getBenefitOffersSchemaVersion(options);

    expect(result).toEqual(2);
  });
});

describe('getBasicInformationSchemaVersion', () => {
  it('should return version 1 for all countries', () => {
    const result = getBasicInformationSchemaVersion(undefined);

    expect(result).toEqual(1);
  });

  it('should override external jsonSchemaVersion with version 2', () => {
    const options = {
      jsonSchemaVersion: {
        employment_basic_information: 2,
      },
    };

    const result = getBasicInformationSchemaVersion(options);

    expect(result).toEqual(2);
  });
});

describe('buildSteps', () => {
  describe('legacy behavior (useDynamicSteps: false)', () => {
    it('should return sequential indices when select_country is included', () => {
      const { steps, stepsArray } = buildSteps({
        includeSelectCountry: true,
        useDynamicSteps: false,
      });

      // All visible steps should have sequential indices
      expect(stepsArray).toHaveLength(5);
      expect(stepsArray[0]).toMatchObject({
        name: 'select_country',
        index: 0,
        visible: true,
      });
      expect(stepsArray[1]).toMatchObject({
        name: 'basic_information',
        index: 1,
        visible: true,
      });
      expect(stepsArray[2]).toMatchObject({
        name: 'contract_details',
        index: 2,
        visible: true,
      });
      expect(stepsArray[3]).toMatchObject({
        name: 'benefits',
        index: 3,
        visible: true,
      });
      expect(stepsArray[4]).toMatchObject({
        name: 'review',
        index: 4,
        visible: true,
      });

      // Steps object should match
      expect(steps.select_country.index).toBe(0);
      expect(steps.basic_information.index).toBe(1);
      expect(steps.review.index).toBe(4);
    });

    it('should return sequential indices when select_country is excluded', () => {
      const { steps, stepsArray } = buildSteps({
        includeSelectCountry: false,
        useDynamicSteps: false,
      });

      // Only visible steps, with sequential indices starting at 0
      expect(stepsArray).toHaveLength(4);
      expect(stepsArray[0]).toMatchObject({
        name: 'basic_information',
        index: 0, // Sequential from 0
        visible: true,
      });
      expect(stepsArray[1]).toMatchObject({
        name: 'contract_details',
        index: 1,
        visible: true,
      });
      expect(stepsArray[2]).toMatchObject({
        name: 'benefits',
        index: 2,
        visible: true,
      });
      expect(stepsArray[3]).toMatchObject({
        name: 'review',
        index: 3,
        visible: true,
      });

      // Steps object should use sequential indices
      expect(steps.basic_information.index).toBe(0);
      expect(steps.contract_details.index).toBe(1);
      expect(steps.review.index).toBe(3);
    });
  });

  describe('new dynamic behavior (useDynamicSteps: true)', () => {
    it('should preserve original indices for all steps including hidden ones', () => {
      const { steps, stepsArray } = buildSteps({
        includeSelectCountry: false,
        useDynamicSteps: true,
      });

      // All steps should be present, including hidden ones
      expect(stepsArray).toHaveLength(6);

      // Hidden step should still be in the array with original index
      expect(stepsArray[0]).toMatchObject({
        name: 'select_country',
        index: 0, // Original index preserved
        visible: false,
      });

      // Visible steps keep their original indices
      expect(stepsArray[1]).toMatchObject({
        name: 'basic_information',
        index: 1, // Original index, not renumbered
        visible: true,
      });

      expect(stepsArray[2]).toMatchObject({
        name: 'engagement_agreement_details',
        index: 2,
        visible: false,
      });

      expect(stepsArray[3]).toMatchObject({
        name: 'contract_details',
        index: 3,
        visible: true,
      });

      // Steps object should preserve original indices
      expect(steps.select_country.index).toBe(0);
      expect(steps.basic_information.index).toBe(1);
      expect(steps.contract_details.index).toBe(3);
      expect(steps.review.index).toBe(5);
    });

    it('should include engagement_agreement_details when enabled', () => {
      const { stepsArray } = buildSteps({
        includeSelectCountry: true,
        includeEngagementAgreementDetails: true,
        useDynamicSteps: true,
      });

      expect(stepsArray).toHaveLength(6);
      expect(stepsArray[2]).toMatchObject({
        name: 'engagement_agreement_details',
        index: 2,
        visible: true,
      });
    });
  });

  describe('backwards compatibility', () => {
    it('should default to legacy behavior when useDynamicSteps is not specified', () => {
      const { stepsArray } = buildSteps({
        includeSelectCountry: false,
      });

      // Should filter out hidden steps and use sequential indices
      expect(stepsArray).toHaveLength(4);
      expect(stepsArray[0].name).toBe('basic_information');
      expect(stepsArray[0].index).toBe(0); // Sequential
    });

    it('should not break existing step index logic', () => {
      const { steps } = buildSteps({
        includeSelectCountry: true,
        useDynamicSteps: false,
      });

      // Simulate what existing code does: accessing steps by index
      const currentStepIndex = 2; // e.g., contract_details
      const stepAtIndex = Object.values(steps).find(
        (s) => s.index === currentStepIndex,
      );

      expect(stepAtIndex?.name).toBe('contract_details');
    });
  });
});
