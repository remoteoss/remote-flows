import { cards } from '@/src/flows/Termination/components/AcknowledgeInformation/constants';
import { AcknowledgeInformationContainerRenderProps } from '@/src/flows/Termination/components/AcknowledgeInformation/types';

type AcknowledgeInformationContainerProps = {
  render: (
    props: AcknowledgeInformationContainerRenderProps,
  ) => React.ReactNode;
};

export const AcknowledgeInformationContainer = ({
  render,
}: AcknowledgeInformationContainerProps) => {
  return render({ cards: cards });
};
