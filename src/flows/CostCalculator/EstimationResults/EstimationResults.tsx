import { CostCalculatorEmployment } from '@/src/client';
import { Card } from '@/src/components/ui/card';

type EstimationResultsProps = {
  estimation: CostCalculatorEmployment;
};

export const EstimationResults = ({ estimation }: EstimationResultsProps) => {
  return (
    <Card className="RemoteFlows__EstimationResults__Card">
      <h2>Estimation Results</h2>
      {/* Render estimation results here */}
    </Card>
  );
};
