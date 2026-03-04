import * as react_jsx_runtime from 'react/jsx-runtime';
import { r as MinimalCountry, M as MinimalRegion } from '../../../types.gen-CtACO7H3.js';
import { CostCalculatorEstimation } from '../types.js';
import '../constants.js';
import '../../types.js';
import '../../../remoteFlows-D7HHZxko.js';
import 'react';
import 'yup';
import '../../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '@remoteoss/remote-json-schema-form-kit';

interface OnboardingTimelineStep {
    title: string;
    description: string;
    id: string;
}
interface OnboardingTimelineData {
    steps: OnboardingTimelineStep[];
    helpText: string;
    zendeskArticleId?: number;
}
type EstimationResultsComponents = {
    HiringSection?: React.ComponentType<{
        country: MinimalCountry;
        countryBenefitsUrl: string;
        countryGuideUrl: string;
    }>;
    OnboardingTimeline?: React.ComponentType<{
        minimumOnboardingDays: number | null;
        data: OnboardingTimelineData;
    }>;
    Header?: React.ComponentType<{
        title: string;
        region?: MinimalRegion;
        country: MinimalCountry;
        onDelete: () => void;
        onExportPdf: () => void;
    }>;
    Footer?: React.ComponentType;
};
type EstimationResultsProps = {
    estimation: CostCalculatorEstimation;
    title: string;
    components?: EstimationResultsComponents;
    onDelete: () => void;
    onExportPdf: () => void;
    onEdit: () => void;
};
declare const EstimationResults: ({ estimation, title, components, onDelete, onExportPdf, onEdit, }: EstimationResultsProps) => react_jsx_runtime.JSX.Element;

export { EstimationResults };
