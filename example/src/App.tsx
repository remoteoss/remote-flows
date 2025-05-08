import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs';
import { Check, Copy, ChevronRight, ChevronDown } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './components/collapsible';
import { useState } from 'react';
import { Button } from './components/button';
import { cn } from './utils';
import React from 'react';
import './App.css';
import { $TSFixMe } from '@remoteoss/json-schema-form';
import { BasicCostCalculator } from './BasicCostCalculator';
import { BasicCostCalculatorWithDefaultValues } from './BasicCostCalculatorDefaultValues';
import { BasicCostCalculatorLabels } from './BasicCostCalculatorLabels';
import { CostCalculatorWithResults } from './CostCalculatorWithResults';
import { CostCalculatorWithExportPdf } from './CostCalculatorWithExportPdf';
import { CostCalculatorWithPremiumBenefits } from './CostCalculatorWithPremiumBenefits';

const sourceCode = {
  // Cost Calculator source codes
  basicCostCalculator: `
import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorDisclaimer,
} from '@remoteoss/remote-flows';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

const fetchToken = () => {
  return fetch('/api/token')
    .then((res) => res.json())
    .then((data) => ({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }))
    .catch((error) => {
      console.error({ error });
      throw error;
    });
};

export function BasicCostCalculator() {
  const onReset = () => {
    console.log('Reset button clicked');
    // Add your reset logic here
  };

  return (
    <RemoteFlows auth={fetchToken}>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => console.log({ response })}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton onClick={onReset}>
                Reset
              </CostCalculatorResetButton>
            </div>
          );
        }}
      />
      <CostCalculatorDisclaimer label="Disclaimer" />
    </RemoteFlows>
  );
}`,
  basicCostCalculatorWithDefaultValues: `
    import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorDisclaimer,
} from '@remoteoss/remote-flows';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function BasicCostCalculatorWithDefaultValues() {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        defaultValues={{
          countryRegionSlug: 'bf098ccf-7457-4556-b2a8-80c48f67cca4',
          currencySlug: 'eur-acf7d6b5-654a-449f-873f-aca61a280eba',
          salary: '50000',
        }}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => console.log({ response })}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      <CostCalculatorDisclaimer label="Disclaimer" />
    </RemoteFlows>
  );
}
  `,
  basicCostCalculatorLabels: `
    import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorDisclaimer,
} from '@remoteoss/remote-flows';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function BasicCostCalculatorLabels() {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => console.log({ response })}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
        options={{
          jsfModify: {
            fields: {
              country: {
                title: 'Select your country',
              },
              age: {
                title: 'Enter your age',
              },
            },
          },
        }}
      />
      <CostCalculatorDisclaimer label="Disclaimer" />
    </RemoteFlows>
  );
}
  `,
  costCalculatorWithResults: `
  import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorResults,
} from '@remoteoss/remote-flows';
import type { CostCalculatorEstimateResponse } from '@remoteoss/remote-flows';
import Flag from 'react-flagpack';
import 'react-flagpack/dist/style.css';
import { useState } from 'react';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function CostCalculatorWithResults() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => setEstimations(response)}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      {estimations && (
        <div className="mt-4 mb-2 flex gap-2">
          <Flag code={estimations.data.employments?.[0].country.alpha_2_code} />
          <label className="text-md font-bold">
            {estimations.data.employments?.[0].country.name}
          </label>
        </div>
      )}
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
    </RemoteFlows>
  );
}
`,
  costCalculatorWithExportPdf: `
  import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  useCostCalculatorEstimationPdf,
  buildCostCalculatorEstimationPayload,
} from '@remoteoss/remote-flows';
import type {
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationFormValues,
} from '@remoteoss/remote-flows';
import './App.css';
import { useState } from 'react';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

function CostCalculatorFormDemo() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationFormValues | null>(null);

  const exportPdfMutation = useCostCalculatorEstimationPdf();

  const handleExportPdf = () => {
    if (payload) {
      exportPdfMutation.mutate(buildCostCalculatorEstimationPayload(payload), {
        onSuccess: (response) => {
          if (response?.data?.data?.content !== undefined) {
            const a = document.createElement('a');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            a.href = response.data.data.content as any;
            a.download = 'estimation.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        },
        onError: (error) => {
          console.error({ error });
        },
      });
    }
  };
  return (
    <>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }

          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => setPayload(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => {
                  setEstimations(response);
                }}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      {estimations && <button onClick={handleExportPdf}>Export as PDF</button>}
    </>
  );
}

export function CostCalculatorWithExportPdf() {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <CostCalculatorFormDemo />
    </RemoteFlows>
  );
}

`,
  costCalculatorWithPremiumBenefits: `
  import type {
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationFormValues,
} from '@remoteoss/remote-flows';
import {
  buildCostCalculatorEstimationPayload,
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorResetButton,
  CostCalculatorResults,
  CostCalculatorSubmitButton,
  RemoteFlows,
  useCostCalculatorEstimationPdf,
} from '@remoteoss/remote-flows';
import { useState } from 'react';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
  includePremiumBenefits: true,
};

function CostCalculatorFormDemo() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationFormValues | null>(null);

  const exportPdfMutation = useCostCalculatorEstimationPdf();

  const handleExportPdf = () => {
    if (payload) {
      exportPdfMutation.mutate(buildCostCalculatorEstimationPayload(payload), {
        onSuccess: (response) => {
          if (response?.data?.data?.content !== undefined) {
            const a = document.createElement('a');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            a.href = response.data.data.content as any;
            a.download = 'estimation.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        },
        onError: (error) => {
          console.error({ error });
        },
      });
    }
  };
  return (
    <>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }

          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => setPayload(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => {
                  setEstimations(response);
                }}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
      {estimations && <button onClick={handleExportPdf}>Export as PDF</button>}
    </>
  );
}

export function CostCalculatorWithPremiumBenefits() {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <CostCalculatorFormDemo />
    </RemoteFlows>
  );
}

  `,

  // Termination Flow source code
  terminationFlow: `
import { SDK } from 'your-sdk';
import { ChevronRight } from 'lucide-react';

const TerminationFlow = () => {
  const termination = SDK.createTerminationFlow();
  
  // Initialize the termination flow
  termination.initialize({
    contractId: 'CONT-123',
    terminationReason: 'end-of-term'
  });
  
  // Get the current step in the flow
  const currentStep = termination.getCurrentStep();
  
  return (
    <div className="p-4 border rounded-md bg-slate-50">
      <h3 className="font-medium mb-2">Contract Termination Flow</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">1</div>
          <div className="flex-1 p-2 border rounded bg-white">Initiate Termination</div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">2</div>
          <div className="flex-1 p-2 border rounded bg-white">Review Terms</div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">3</div>
          <div className="flex-1 p-2 border rounded bg-white">Confirm Termination</div>
        </div>
      </div>
    </div>
  );
}`,

  // Contract Amendments source code
  contractAmendments: `
import { SDK } from 'your-sdk';
import { Button } from "@/components/ui/button";

const ContractAmendments = () => {
  const amendments = SDK.createAmendmentManager();
  
  // Load original contract
  const originalContract = amendments.getOriginalContract('CONT-123');
  
  // Create an amendment
  const amendment = amendments.createAmendment({
    field: 'duration',
    oldValue: '12 months',
    newValue: '18 months',
    reason: 'business needs'
  });
  
  const handleApplyAmendment = () => {
    // Apply the amendment to the contract
    amendments.applyAmendment(amendment);
  };
  
  return (
    <div className="p-4 border rounded-md bg-slate-50">
      <h3 className="font-medium mb-2">Contract Amendments</h3>
      <div className="space-y-4">
        <div className="p-3 border rounded bg-white">
          <div className="font-medium">Original Terms</div>
          <div className="text-sm text-muted-foreground">Duration: 12 months</div>
        </div>
        <div className="p-3 border rounded bg-white">
          <div className="font-medium">Amendment</div>
          <div className="text-sm text-muted-foreground">Duration: 18 months</div>
          <div className="mt-2 text-sm bg-yellow-50 p-1 rounded border border-yellow-200">
            Changed: Duration extended by 6 months
          </div>
        </div>
        <Button size="sm" onClick={handleApplyAmendment}>Apply Amendment</Button>
      </div>
    </div>
  );
}`,
};

const demoStructure = [
  {
    id: 'cost-calculator',
    title: 'Cost Calculator',
    description:
      'Calculate the total cost of your employee in different countries',
    children: [
      {
        id: 'cost-calculator/basic',
        title: 'Basic',
        description: 'The most basic cost calculator',
        component: BasicCostCalculator,
        sourceCode: sourceCode.basicCostCalculator,
      },
      {
        id: 'cost-calculator/with-default-values',
        title: 'Default Values',
        description: 'Cost Calculator with default values',
        component: BasicCostCalculatorWithDefaultValues,
        sourceCode: sourceCode.basicCostCalculatorWithDefaultValues,
      },
      {
        id: 'cost-calculator/with-custom-labels',
        title: 'Custom Fields Labels',
        description: 'Custom Field Labels in Cost Calculator',
        component: BasicCostCalculatorLabels,
        sourceCode: sourceCode.basicCostCalculatorLabels,
      },
      {
        id: 'cost-calculator/with-results',
        title: 'Estimation Results',
        description: 'Cost Calculator with an estimation component',
        component: CostCalculatorWithResults,
        sourceCode: sourceCode.costCalculatorWithResults,
      },
      {
        id: 'cost-calculator/with-export-pdf',
        title: 'Export PDF',
        description: 'Cost Calculator with an estimation component',
        component: CostCalculatorWithExportPdf,
        sourceCode: sourceCode.costCalculatorWithExportPdf,
      },
      {
        id: 'cost-calculator/with-premium-benefits',
        title: 'Premium Benefits',
        description: 'Cost Calculator with premium benefits',
        component: CostCalculatorWithPremiumBenefits,
        sourceCode: sourceCode.costCalculatorWithPremiumBenefits,
      },
    ],
  },
  {
    id: 'termination-flow',
    title: 'Termination Flow',
    description: 'Process for terminating contracts',
    component: () => <div>Termination Flow</div>,
    sourceCode: sourceCode.terminationFlow,
  },
  {
    id: 'contract-amendments',
    title: 'Contract Amendments',
    description: 'Manage changes to existing contracts',
    component: () => <div>Contract Amendments</div>,
    sourceCode: sourceCode.contractAmendments,
  },
];

const flattenedDemos = demoStructure.reduce(
  (acc, category) => {
    if (category.children) {
      // Add parent category
      acc[category.id] = {
        id: category.id,
        title: category.title,
        description: category.description,
        isParent: true,
      };

      // Add children
      category.children.forEach((child) => {
        acc[child.id] = {
          id: child.id,
          title: child.title,
          description: child.description,
          component: child.component,
          sourceCode: child.sourceCode,
          parentId: category.id,
        };
      });
    } else {
      // Add standalone item
      acc[category.id] = {
        id: category.id,
        title: category.title,
        description: category.description,
        component: category.component,
        sourceCode: category.sourceCode,
      };
    }
    return acc;
  },
  {} as Record<
    string,
    {
      id: string;
      title: string;
      description: string;
      isParent?: boolean;
      parentId?: string;
      component?: () => $TSFixMe;
      sourceCode?: string;
    }
  >,
);

function App() {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    'cost-calculator': true, // Start with Cost Calculator expanded
  });
  const [activeDemo, setActiveDemo] = useState('cost-calculator/basic'); // Default to first demo
  const [copied, setCopied] = useState<string | null>(null);

  const selectDemo = (demoId: string) => {
    setActiveDemo(demoId);

    // If this is a child demo, ensure its parent is expanded
    const demo = flattenedDemos[demoId];
    if (demo.parentId) {
      setExpandedCategories((prev) => ({
        ...prev,
        [demo.parentId as string]: true,
      }));
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentDemo = flattenedDemos[activeDemo];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">SDK Demos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Nested Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Demos</CardTitle>
              <CardDescription>Browse all available demos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                {demoStructure.map((category) => (
                  <div key={category.id} className="space-y-1">
                    {category.children ? (
                      // Category with children
                      <Collapsible
                        open={expandedCategories[category.id]}
                        onOpenChange={() => toggleCategory(category.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-between"
                          >
                            {category.title}
                            {expandedCategories[category.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-4 space-y-1 mt-1">
                            {category.children.map((child) => (
                              <Button
                                key={child.id}
                                variant={
                                  activeDemo === child.id ? 'accent' : 'ghost'
                                }
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => selectDemo(child.id)}
                              >
                                {child.title}
                              </Button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      // Standalone item
                      <Button
                        variant={
                          activeDemo === category.id ? 'accent' : 'ghost'
                        }
                        className="w-full justify-start"
                        onClick={() => selectDemo(category.id)}
                      >
                        {category.title}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{currentDemo.title}</CardTitle>
              <CardDescription>{currentDemo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="demo" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="demo">Demo</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                <TabsContent value="demo" className="mt-4">
                  {React.createElement(currentDemo.component as $TSFixMe)}
                </TabsContent>
                <TabsContent value="code" className="mt-4">
                  <div className="relative">
                    <pre className="p-4 rounded-md bg-slate-950 text-slate-50 overflow-x-auto text-sm">
                      <code>{currentDemo.sourceCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        'absolute top-2 right-2 h-8 w-8 p-0',
                        copied === currentDemo.id && 'text-green-500',
                      )}
                      onClick={() =>
                        copyToClipboard(
                          currentDemo.sourceCode as string,
                          currentDemo.id,
                        )
                      }
                    >
                      {copied === currentDemo.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy code</span>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
