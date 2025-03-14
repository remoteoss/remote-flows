import React from 'react';
import clsx from 'clsx';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/src/components/ui/drawer';
import { X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useCostCalculatorDisclaimer } from '@/src/flows/CostCalculator/hooks';

export const Disclaimer = () => {
  const { data: disclaimer } = useCostCalculatorDisclaimer();
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="link" size="link">
          Disclaimer
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
          <DrawerTitle>{disclaimer?.data.title}</DrawerTitle>
          <DrawerDescription>
            For more details read our{' '}
            <Button variant="link" size="link" asChild>
              <a
                href={disclaimer?.data.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Disclaimer
              </a>
            </Button>
          </DrawerDescription>
        </DrawerHeader>
        <div
          className={clsx('p-4 cost-calculator-disclaimer-drawer-body')}
          dangerouslySetInnerHTML={{ __html: disclaimer?.data.body ?? '' }}
        ></div>
      </DrawerContent>
    </Drawer>
  );
};
