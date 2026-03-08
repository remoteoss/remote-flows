import * as react_jsx_runtime from 'react/jsx-runtime';
import { CostCalculatorEstimation } from '../types.js';
import '../../../types.gen-CIMOKNAn.js';
import '../constants.js';
import '../../types.js';
import '../../../remoteFlows-BlCKwGdn.js';
import 'react';
import 'yup';
import '../../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '@remoteoss/remote-json-schema-form-kit';

type SummaryResultsProps = {
    /**
     * Array of employments to compare costs for.
     * 2 estimations required for the component to render
     */
    estimations: CostCalculatorEstimation[];
};
/**
 * Displays a summary comparison of costs across multiple estimations.
 * The component will return null if you pass less than 2 estimations.
 */
declare const SummaryResults: ({ estimations }: SummaryResultsProps) => react_jsx_runtime.JSX.Element | null;

export { SummaryResults };
