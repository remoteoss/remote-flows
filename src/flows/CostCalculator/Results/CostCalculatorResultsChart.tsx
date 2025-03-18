import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { formatCurrency } from '@/src/lib/utils';

type VisualBreakDownProps = {
  chartData: { name: string; value: number | undefined; color: string }[];
  currency: string;
};

export default function CostCalculatorResultsChart({
  chartData,
  currency,
}: VisualBreakDownProps) {
  return (
    <Card className="rounded-lg RemoteFlows__CostCalculatorResults_CostDistribution">
      <CardHeader className="pb-2">
        <CardTitle>Cost Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: 'monthly' | 'annual') =>
                  formatCurrency(Number(value), currency)
                }
                contentStyle={{
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--text-xs)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
