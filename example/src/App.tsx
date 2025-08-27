import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Button,
  cn,
} from '@remoteoss/remote-flows/internals';

import { Check, Copy, ChevronRight, ChevronDown } from 'lucide-react';

import { useState } from 'react';
import React from 'react';
import type { $TSFixMe } from '@remoteoss/remote-flows';
import { BasicCostCalculator } from './BasicCostCalculator';
import { BasicCostCalculatorWithDefaultValues } from './BasicCostCalculatorDefaultValues';
import { BasicCostCalculatorLabels } from './BasicCostCalculatorLabels';
import { CostCalculatorWithResults } from './CostCalculatorWithResults';
import { CostCalculatorWithExportPdf } from './CostCalculatorWithExportPdf';
import { CostCalculatorWithPremiumBenefits } from './CostCalculatorWithPremiumBenefits';
import { Termination } from './Termination';
import { ContractAmendment } from './ContractAmendment';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { OnboardingForm } from './Onboarding';
import { OnboardingForm as OnboardingFormWithoutSelectCountry } from './OnboardingWithoutSelectCountryStep';
import { OnboardingCustomBenefitsForm } from './OnboardingWithCustomBenefits';
import { CostCalculatorWithReplaceableComponents } from './CostCalculatorWithReplaceableComponents';
import BasicCostCalculatorCode from './BasicCostCalculator?raw';
import BasicCostCalculatorDefaultValuesCode from './BasicCostCalculatorDefaultValues?raw';
import BasicCostCalculatorLabelsCode from './BasicCostCalculatorLabels?raw';
import CostCalculatorWithResultsCode from './CostCalculatorWithResults?raw';
import CostCalculatorWithExportPdfCode from './CostCalculatorWithExportPdf?raw';
import CostCalculatorWithPremiumBenefitsCode from './CostCalculatorWithPremiumBenefits?raw';
import CostCalculatorWithReplaceableComponentsCode from './CostCalculatorWithReplaceableComponents?raw';
import TerminationCode from './Termination?raw';
import ContractAmendmentCode from './ContractAmendment?raw';

const costCalculatorDemos = [
  {
    id: 'basic-cost-calculator',
    title: 'Basic',
    description: 'The most basic cost calculator',
    component: BasicCostCalculator,
    sourceCode: BasicCostCalculatorCode,
  },
  {
    id: 'with-default-values-cost-calculator',
    title: 'Default Values',
    description: 'Cost Calculator with default values',
    component: BasicCostCalculatorWithDefaultValues,
    sourceCode: BasicCostCalculatorDefaultValuesCode,
  },
  {
    id: 'with-custom-labels-cost-calculator',
    title: 'Custom Fields Labels',
    description: 'Custom Field Labels in Cost Calculator',
    component: BasicCostCalculatorLabels,
    sourceCode: BasicCostCalculatorLabelsCode,
  },
  {
    id: 'with-results-cost-calculator',
    title: 'Estimation Results',
    description: 'Cost Calculator with an estimation component',
    component: CostCalculatorWithResults,
    sourceCode: CostCalculatorWithResultsCode,
  },
  {
    id: 'with-export-pdf-cost-calculator',
    title: 'Export PDF',
    description: 'Cost Calculator with an estimation component',
    component: CostCalculatorWithExportPdf,
    sourceCode: CostCalculatorWithExportPdfCode,
  },
  {
    id: 'with-premium-benefits-cost-calculator',
    title: 'Premium Benefits',
    description: 'Cost Calculator with premium benefits',
    component: CostCalculatorWithPremiumBenefits,
    sourceCode: CostCalculatorWithPremiumBenefitsCode,
  },
  {
    id: 'with-components-cost-calculator',
    title: 'Replacable components',
    description: 'Cost Calculator with replacable components',
    component: CostCalculatorWithReplaceableComponents,
    sourceCode: CostCalculatorWithReplaceableComponentsCode,
  },
];

const additionalDemos = [
  {
    id: 'termination',
    title: 'Termination Flow',
    description: 'Process for terminating employments',
    component: Termination,
    sourceCode: TerminationCode,
  },
  {
    id: 'contract-amendments',
    title: 'Contract Amendments',
    description: 'Manage changes to existing contracts',
    component: ContractAmendment,
    sourceCode: ContractAmendmentCode,
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    description: 'Onboarding flow of a new employee',
    children: [
      {
        id: 'onboarding-basic',
        title: 'Basic',
        description: 'Standard onboarding flow',
        component: OnboardingForm,
        sourceCode: '',
      },
      {
        id: 'onboarding-without-select-country',
        title: 'Without Select Country',
        description: 'Standard onboarding flow without select country step',
        component: OnboardingFormWithoutSelectCountry,
        sourceCode: '',
      },
      {
        id: 'onboarding-custom-benefits',
        title: 'Custom Benefits',
        description: 'Onboarding flow with custom benefits step UI',
        component: OnboardingCustomBenefitsForm,
        sourceCode: '',
      },
    ],
  },
];

const demoStructure = [
  {
    id: 'cost-calculator',
    title: 'Cost Calculator',
    description:
      'Calculate the total cost of your employee in different countries',
    children: costCalculatorDemos,
  },
  ...additionalDemos,
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

const defaultDemoId = 'basic-cost-calculator';

function App() {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    'cost-calculator': true, // Start with Cost Calculator expanded
  });
  const [activeDemo, setActiveDemo] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const demoId = urlParams.get('demo');
    return demoId && flattenedDemos[demoId] ? demoId : defaultDemoId;
  });
  const [copied, setCopied] = useState<string | null>(null);

  const selectDemo = (demoId: string) => {
    setActiveDemo(demoId);

    const url = new URL(window.location.href);
    url.searchParams.set('demo', demoId);
    window.history.pushState({}, '', url);

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
    <div className='container mx-auto py-8 px-4'>
      <h1 className='text-3xl font-bold mb-6'>SDK Demos</h1>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Nested Navigation Sidebar */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle>Demos</CardTitle>
              <CardDescription>Browse all available demos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col space-y-1'>
                {demoStructure.map((category) => (
                  <div key={category.id} className='space-y-1'>
                    {category.children ? (
                      // Category with children
                      <Collapsible
                        open={expandedCategories[category.id]}
                        onOpenChange={() => toggleCategory(category.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant='ghost'
                            className='w-full justify-between'
                          >
                            {category.title}
                            {expandedCategories[category.id] ? (
                              <ChevronDown className='h-4 w-4' />
                            ) : (
                              <ChevronRight className='h-4 w-4' />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className='pl-4 space-y-1 mt-1'>
                            {category.children.map((child) => (
                              <Button
                                key={child.id}
                                variant={
                                  activeDemo === child.id ? 'default' : 'ghost'
                                }
                                size='sm'
                                className='w-full justify-start'
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
                          activeDemo === category.id ? 'default' : 'ghost'
                        }
                        className='w-full justify-start'
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
        <div className='lg:col-span-3'>
          <Card>
            <CardHeader>
              <CardTitle>{currentDemo.title}</CardTitle>
              <CardDescription>{currentDemo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='demo' className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='demo'>Demo</TabsTrigger>
                  <TabsTrigger value='code'>Code</TabsTrigger>
                </TabsList>
                <TabsContent value='demo' className='mt-4'>
                  {React.createElement(currentDemo.component as $TSFixMe)}
                </TabsContent>
                <TabsContent value='code' className='mt-4'>
                  <div className='relative'>
                    <SyntaxHighlighter language='javascript' style={docco}>
                      {currentDemo.sourceCode as string}
                    </SyntaxHighlighter>
                    <Button
                      size='sm'
                      variant='ghost'
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
                        <Check className='h-4 w-4' />
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                      <span className='sr-only'>Copy code</span>
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
