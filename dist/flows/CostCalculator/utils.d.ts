import { k as CostCalculatorEstimateParams } from '../../types.gen-C7DkFdEI.js';
import { $ as $TSFixMe } from '../../remoteFlows-c5WoOLBg.js';
import { AnyObjectSchema } from 'yup';
import { CostCalculatorVersion } from './hooks.js';
import { CostCalculatorEstimationSubmitValues, CostCalculatorEstimationOptions } from './types.js';
import 'react';
import '../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '../../mutations-DRPi1_As.js';
import './constants.js';
import '../types.js';
import '@remoteoss/remote-json-schema-form-kit';

/**
 * Build the validation schema for the form.
 * @returns
 */
declare function buildValidationSchema(fields: $TSFixMe[], employerBillingCurrency: string, includeEstimationTitle?: boolean): AnyObjectSchema;
/**
 * Build the payload for the cost calculator estimation.
 * @param values
 * @param estimationOptions
 * @returns
 */
declare function buildPayload(values: CostCalculatorEstimationSubmitValues | CostCalculatorEstimationSubmitValues[], estimationOptions?: CostCalculatorEstimationOptions, version?: CostCalculatorVersion): CostCalculatorEstimateParams;

export { buildPayload, buildValidationSchema };
