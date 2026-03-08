import * as react from 'react';
import { AcknowledgeInformationContainerRenderProps } from './types.js';
import './constants.js';

type AcknowledgeInformationContainerProps = {
    render: (props: AcknowledgeInformationContainerRenderProps) => React.ReactNode;
};
declare const AcknowledgeInformationContainer: ({ render, }: AcknowledgeInformationContainerProps) => react.ReactNode;

export { AcknowledgeInformationContainer };
