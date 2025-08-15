import { CostCalculatorEmployment } from '@/src/client';
import { ActionsDropdown } from '@/src/components/shared/actions-dropdown/ActionsDropdown';
import { Card } from '@/src/components/ui/card';
import { User } from 'lucide-react';

const EstimationResultsHeader = ({
  title,
  country,
}: {
  title: string;
  country: string;
}) => {
  return (
    <div className="RemoteFlows__EstimationResults__Header flex justify-between">
      <div className="flex flex-row items-center gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F4F4F5]">
          <User className="h-6 w-6 text-[#000000]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium leading-none text-[#181818]">
            {title}
          </h2>
          <p className="text-xs text-[#71717A]">{country}</p>
        </div>
      </div>
      <ActionsDropdown actions={[]} label="File Options" />
    </div>
  );
};

type EstimationResultsProps = {
  estimation: CostCalculatorEmployment;
};

export const EstimationResults = ({ estimation }: EstimationResultsProps) => {
  return (
    <Card className="RemoteFlows__EstimationResults__Card p-10">
      <EstimationResultsHeader title="Estimate #01" country="France" />
    </Card>
  );
};
