import { cards } from '@/src/flows/Termination/components/AcknowledgeInformation/constants';

export type AcknowledgeInformationContainerRenderProps = {
  /**
   * The cards to display in the acknowledge information component.
   * @see {@link cards}
   */
  cards: typeof cards;
};
