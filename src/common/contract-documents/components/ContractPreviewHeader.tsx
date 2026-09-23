import { JSFCustomComponentProps } from '@/src/types/remoteFlows';

export const ContractPreviewHeader = (props: JSFCustomComponentProps) => {
  return (
    <div className='text-center space-y-2 mb-6'>
      <h2 className='text-2xl font-bold'>{props.label}</h2>
      <p className='text-gray-600'>{props.description}</p>
    </div>
  );
};
