import { CostCalculatorEstimateParams } from '@/src/client';
import { useCostCalculatorEstimationPdf } from '@/src/flows/CostCalculator/hooks';
import { $TSFixMe } from '@remoteoss/json-schema-form';
import { useCallback } from 'react';

export const useExportAsPdf = () => {
  const exportAsPDFMutation = useCostCalculatorEstimationPdf();

  const { mutate } = exportAsPDFMutation;

  return useCallback(
    (data: CostCalculatorEstimateParams) => {
      return new Promise<string>((resolve, reject) => {
        mutate(data, {
          onSuccess: (data) => {
            if (data.data?.data.content !== undefined) {
              resolve(data.data?.data.content as $TSFixMe);
            }
          },
          onError: (error) => {
            reject(error);
          },
        });
      });
    },
    [mutate],
  );
};
