import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { END_TYPE_MULTIPLE } from '@/src/common/invoice-schedules/constants';
import { $TSFixMe } from '@/src/types/remoteFlows';

export function useDefaultOccurrences(form: UseFormReturn<$TSFixMe>) {
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name !== 'end_type' || values.end_type !== END_TYPE_MULTIPLE) {
        return;
      }

      if (!values.nr_occurrences) {
        form.setValue('nr_occurrences', 1);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);
}
