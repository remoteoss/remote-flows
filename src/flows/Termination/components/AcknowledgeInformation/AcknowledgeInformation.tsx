import { Card } from '@/src/components/ui/card';
import { AcknowledgeInformationContainerRenderProps } from '@/src/flows/Termination/components/AcknowledgeInformation/types';

export type AcknowledgeInformationProps =
  AcknowledgeInformationContainerRenderProps;

export const AcknowledgeInformation = ({
  cards,
}: AcknowledgeInformationProps) => {
  return (
    <div className='RemoteFlows__AcknowledgeInformation'>
      <Card className='mb-6'>
        <h2 className='RemoteFlows__AcknowledgeInformation__Title color-[#000] font-medium'>
          {cards.remoteDoesNext.title}
        </h2>
        <p className='RemoteFlows__AcknowledgeInformation__Description color-[#71717A] text-xs'>
          {cards.remoteDoesNext.description}
        </p>
      </Card>

      <Card className='mb-6'>
        <h2 className='RemoteFlows__AcknowledgeInformation__Title color-[#000] font-medium'>
          {cards.whatYouNeedToDo.title}
        </h2>
        <ul className='RemoteFlows__AcknowledgeInformation__List list-disc pl-5 text-xs text-[#71717A]'>
          {cards.whatYouNeedToDo.list.map((item) => (
            <li
              key={item}
              className='RemoteFlows__AcknowledgeInformation__ListItem mb-2'
            >
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
