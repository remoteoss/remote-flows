import { Step } from '../useStepState.js';
import 'react';
import 'react-hook-form';

type StepKeys = 'company_basic_information' | 'address_details';
declare const STEPS: Record<StepKeys, Step<StepKeys>>;

export { STEPS };
