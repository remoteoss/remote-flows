import { E as Employment } from '../../types.gen-C6jD_TP6.js';
import { J as JSFFields } from '../../remoteFlows-DL-yjkRb.js';
import { Step } from '../useStepState.js';
import 'react';
import 'yup';
import '../../types-ZWIpiFgj.js';
import 'react-hook-form';

type StepKeys = 'form' | 'confirmation_form';
declare const STEPS: Record<StepKeys, Step<StepKeys>>;
declare function buildInitialValues(employment: Employment | undefined, fields?: JSFFields | undefined): {};

export { STEPS, buildInitialValues };
