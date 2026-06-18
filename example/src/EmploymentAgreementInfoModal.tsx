import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@remoteoss/remote-flows/internals';
import { EmploymentAgreementInfoContent } from '@remoteoss/remote-flows';

interface EmploymentAgreementInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmploymentAgreementInfoModal: React.FC<
  EmploymentAgreementInfoModalProps
> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Employment agreement preview</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 text-sm text-gray-700'>
          <EmploymentAgreementInfoContent />
        </div>
      </DialogContent>
    </Dialog>
  );
};
