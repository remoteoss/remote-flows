import { $TSFixMe, FieldComponentProps } from '@/src/types/remoteFlows';

export function WorkScheduleFieldDefault({ fieldData }: FieldComponentProps) {
  // WorkScheduleFieldDefault will receive pre-formatted data from the wrapper
  const { workHoursSummary, breakSummary, totalWorkHours, WorkScheduleForm } =
    fieldData as $TSFixMe;

  return (
    <div className={`flex flex-col gap-3 RemoteFlows__WorkScheduleField`}>
      <p className={`text-sm RemoteFlows__WorkScheduleField__Title`}>
        Work hours
      </p>
      <div className='flex flex-col gap-1 RemoteFlows__WorkScheduleField__Summary'>
        <p
          className='text-sm text-gray-500 RemoteFlows__WorkScheduleField__Summary__WorkHours'
          dangerouslySetInnerHTML={{
            __html: workHoursSummary?.join(', ') || '',
          }}
        />

        <p className='text-sm text-gray-500 RemoteFlows__WorkScheduleField__Summary__Break'>
          {breakSummary?.join() || ''}
        </p>
        <p className='text-sm text-gray-500 RemoteFlows__WorkScheduleField__Summary__Total'>
          Total of <span>{totalWorkHours}</span> hours per week
        </p>
        {WorkScheduleForm && <WorkScheduleForm />}
      </div>
    </div>
  );
}
