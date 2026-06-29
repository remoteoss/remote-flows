import { useState } from 'react';
import {
  CreditRiskStatus,
  OnboardingRenderProps,
  OnboardingInviteProps,
  Employment,
  CreditRiskState,
  NormalizedFieldError,
  MetaValues,
  NestedMeta,
  PreOnboardingRequirementsBag,
} from '@remoteoss/remote-flows';
import { CheckedState } from '@radix-ui/react-checkbox';
import {
  FullScreenDialog,
  FullScreenDialogContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Checkbox,
  Label,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  BasicTooltip,
} from '@remoteoss/remote-flows/internals';
import { AlertError } from './AlertError';
import { OnboardingAlertStatuses } from './OnboardingAlertStatuses';
import { transformHtmlToComponents } from './utils/transformHtml';

export const InviteSection = ({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <div className='rmt-invitation-section'>
      <h2 className='rmt-invitation-title'>{title}</h2>
      <p className='rmt-invitation-description'>{description}</p>
      {children}
    </div>
  );
};

const CreditRiskSections = ({
  creditRiskState,
  creditRiskStatus,
  employment,
}: {
  creditRiskState: CreditRiskState;
  creditRiskStatus?: CreditRiskStatus;
  employment?: Employment;
}) => {
  switch (creditRiskState) {
    case 'referred':
      return (
        <InviteSection
          title={`Confirm ${employment?.basic_information?.name} Profile`}
          description='Once your account is approved, you can invite your employees to Remote.'
        >
          <OnboardingAlertStatuses creditRiskStatus={creditRiskStatus} />
        </InviteSection>
      );
    case 'deposit_required':
      return (
        <InviteSection
          title='Confirm Details && Continue'
          description="If the employee's details look good, click Continue to check if your reserve invoice is ready for payment. After we receive payment, you'll be able to invite the employee to onboard to Remote."
        >
          <OnboardingAlertStatuses creditRiskStatus={creditRiskStatus} />
          <a href='https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment'>
            What is a reserve payment
          </a>
        </InviteSection>
      );
    case 'deposit_required_successful':
      return (
        <div className='reserve-invoice'>
          <h2>You’ll receive a reserve invoice soon</h2>
          <p>
            We saved {employment?.basic_information?.name as string} details as
            a draft. You’ll be able to invite them to Remote after you complete
            the reserve payment.
          </p>
          <div>
            <button type='submit'>Go to dashboard</button>

            <br />

            <a href='https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment'>
              What is a reserve payment
            </a>
          </div>
        </div>
      );
    case 'invite':
      return (
        <InviteSection
          title={`Ready to invite ${employment?.basic_information?.name} to Remote?`}
          description="If you're ready to invite this employee to onboard with Remote, click the button below."
        />
      );
    case 'invite_successful':
      return (
        <div className='invite-successful'>
          <h2>You’re all set!</h2>
          <p>
            {employment?.basic_information?.name as string} at{' '}
            {employment?.basic_information?.personal_email as string} has been
            invited to Remote. We’ll let you know once they complete their
            onboarding process
          </p>
          <div>
            <button type='submit'>Go to dashboard</button>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export function ReviewMeta({
  meta,
  isNested = false,
}: {
  meta: NestedMeta;
  isNested?: boolean;
}) {
  if (!meta) return null;

  return (
    <div className={isNested ? 'onboarding-values' : 'onboarding-values pl-3'}>
      {Object.entries(meta).map(([key, value]) => {
        if (!value) return null;

        const isLeafNode =
          typeof value === 'object' &&
          ('label' in value || 'prettyValue' in value || 'inputType' in value);

        if (isLeafNode) {
          const metaValue = value as MetaValues;
          const label = metaValue.label;
          const prettyValue = metaValue.prettyValue;

          if (label && prettyValue !== undefined && prettyValue !== '') {
            let displayValue;

            if (metaValue.inputType === 'file' && Array.isArray(prettyValue)) {
              displayValue = prettyValue
                .map((file: File) => file.name)
                .join(', ');
            } else if (typeof prettyValue === 'boolean') {
              displayValue = prettyValue ? 'Yes' : 'No';
            } else {
              displayValue = prettyValue;
            }

            return (
              <pre key={key}>
                {label}: {displayValue}
              </pre>
            );
          }
        } else if (typeof value === 'object') {
          return (
            <div key={key}>
              <ReviewMeta meta={value as NestedMeta} isNested />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export const MyOnboardingInviteButton = ({
  creditRiskStatus,
  Component,
  setErrors,
}: {
  creditRiskStatus?: CreditRiskStatus;
  Component: React.ComponentType<OnboardingInviteProps>;
  setErrors: (errors: {
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }) => void;
}) => {
  if (creditRiskStatus !== 'referred') {
    return (
      <Component
        className='submit-button'
        onSuccess={() => {
          console.log(
            'after inviting or creating a reserve navigate to whatever place you want',
          );
        }}
        render={({
          employmentStatus,
        }: {
          employmentStatus: 'invited' | 'created_awaiting_reserve';
        }) => {
          return employmentStatus === 'created_awaiting_reserve'
            ? 'Create Reserve'
            : 'Invite Employee';
        }}
        onError={({ error }: { error: Error }) => {
          setErrors({
            apiError: error.message,
            fieldErrors: [],
          });
        }}
        type='submit'
      />
    );
  }
  return null;
};

const SignatureDialog = ({
  requirementName,
  isOpen,
  onClose,
  onSign,
  isSigning,
}: {
  requirementName: string;
  isOpen: boolean;
  onClose: () => void;
  onSign: (signature: string) => Promise<void>;
  isSigning: boolean;
}) => {
  const [signature, setSignature] = useState('');

  const handleSign = async () => {
    if (!signature.trim()) return;
    await onSign(signature);
    setSignature('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && signature.trim() && !isSigning) {
      e.preventDefault();
      handleSign();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign {requirementName}</DialogTitle>
        </DialogHeader>

        <div className='py-4'>
          <p className='text-sm text-muted-foreground mb-4'>
            By typing your full name below, you agree to the terms and
            conditions outlined in this document.
          </p>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='signature'>Your full name (signature)</Label>
            <Input
              id='signature'
              type='text'
              placeholder='Type your full name'
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSigning}
              autoComplete='name'
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isSigning}>
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={!signature.trim() || isSigning}
          >
            {isSigning ? 'Signing...' : 'Sign Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DocumentPreviewModal = ({
  isOpen,
  onClose,
  documentPreview,
  onSignDocument,
  isSigning,
  requirementName,
}: {
  isOpen: boolean;
  onClose: () => void;
  documentPreview: PreOnboardingRequirementsBag['documentPreview'];
  onSignDocument: PreOnboardingRequirementsBag['onSignDocument'];
  isSigning: PreOnboardingRequirementsBag['isSigning'];
  requirementName: string;
}) => {
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);

  const handleSignClick = () => {
    setShowSignatureDialog(true);
  };

  const handleSign = async (signature: string) => {
    await onSignDocument(signature);
    setShowSignatureDialog(false);
    onClose();
  };

  const basePdfUrl = documentPreview?.pre_onboarding_document?.content;
  const pdfUrl = basePdfUrl ? `${basePdfUrl}#view=FitV&toolbar=0` : undefined;

  return (
    <>
      <FullScreenDialog open={isOpen} onOpenChange={onClose}>
        <FullScreenDialogContent>
          {/* Header with Sign button */}
          <div className='flex items-center justify-between px-6 py-4 border-b bg-white'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={onClose}
                disabled={isSigning}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M19 12H5M12 19l-7-7 7-7' />
                </svg>
              </Button>
              <h2 className='text-lg font-semibold'>{requirementName}</h2>
            </div>
            <Button onClick={handleSignClick} disabled={isSigning}>
              Sign Document
            </Button>
          </div>

          {/* Full screen PDF viewer */}
          <div className='flex-1 relative bg-gray-50 overflow-hidden'>
            {isPdfLoading && (
              <div className='absolute inset-0 flex items-center justify-center bg-white z-10'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2'></div>
                  <p className='text-sm text-gray-600'>Loading document...</p>
                </div>
              </div>
            )}
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                className='w-full h-full border-0'
                title='Document Preview'
                onLoad={() => setIsPdfLoading(false)}
              />
            )}
          </div>
        </FullScreenDialogContent>
      </FullScreenDialog>

      <SignatureDialog
        requirementName={requirementName}
        isOpen={showSignatureDialog}
        onClose={() => setShowSignatureDialog(false)}
        onSign={handleSign}
        isSigning={isSigning}
      />
    </>
  );
};

const DocumentRequirement = ({
  requirement,
  onCreateDocument,
  onSignDocument,
  documentPreview,
  isCreatingDocument,
  isSigning,
  activeRequirementSlug,
  isLoadingDocumentPreview,
  employeeCountry,
}: {
  requirement: NonNullable<
    PreOnboardingRequirementsBag['requirements']
  >[number];
  onCreateDocument: PreOnboardingRequirementsBag['onCreateDocument'];
  onSignDocument: PreOnboardingRequirementsBag['onSignDocument'];
  documentPreview: PreOnboardingRequirementsBag['documentPreview'];
  isCreatingDocument: PreOnboardingRequirementsBag['isCreatingDocument'];
  isSigning: PreOnboardingRequirementsBag['isSigning'];
  activeRequirementSlug: PreOnboardingRequirementsBag['activeRequirementSlug'];
  isLoadingDocumentPreview: PreOnboardingRequirementsBag['isLoadingDocumentPreview'];
  employeeCountry?: string;
}) => {
  const [constraintsAckAt, setConstraintsAckAt] = useState<string | null>(
    requirement.document_constraints_ack_at ?? null,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsConstraintsAck =
    requirement.needs_constraints_ack && !constraintsAckAt;

  const isRequirementLoading =
    activeRequirementSlug === requirement.slug &&
    (isCreatingDocument || isLoadingDocumentPreview);

  const handleReviewDocument = async () => {
    try {
      setError(null);
      await onCreateDocument(requirement.slug, constraintsAckAt || undefined);
      setIsModalOpen(true);
    } catch {
      setError('Failed to create document');
    }
  };

  const renderButton = () => {
    if (requirement.status === 'blocked') {
      return (
        <BasicTooltip
          content={`${requirement.depends_on_requirement?.name} must be signed first.`}
        >
          <Button variant='outline' disabled>
            Review document
          </Button>
        </BasicTooltip>
      );
    }

    return (
      <Button
        onClick={handleReviewDocument}
        disabled={
          needsConstraintsAck ||
          isRequirementLoading ||
          requirement.status === 'finished'
        }
      >
        {requirement.status === 'finished'
          ? 'Signed'
          : isRequirementLoading
            ? 'Loading...'
            : 'Review document'}
      </Button>
    );
  };

  return (
    <div className='flex flex-col gap-4'>
      {requirement.needs_constraints_ack && (
        <div className='flex items-start gap-2'>
          <Checkbox
            id={`ack-${requirement.slug}`}
            disabled={
              requirement.status === 'finished' ||
              requirement.status === 'blocked'
            }
            checked={!!constraintsAckAt || requirement.status === 'finished'}
            onCheckedChange={(checked: CheckedState) =>
              checked
                ? setConstraintsAckAt(new Date().toISOString())
                : setConstraintsAckAt(null)
            }
          />
          <Label
            htmlFor={`ack-${requirement.slug}`}
            className='text-sm cursor-pointer'
          >
            I acknowledge that I've understood information about hiring in{' '}
            {employeeCountry ?? 'this country'}, and that these new hire details
            can't be changed once they're submitted.
          </Label>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{requirement.name}</CardTitle>
          <CardDescription>{requirement.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderButton()}
          {error && (
            <p className='text-sm text-red-600 mt-2' role='alert'>
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <DocumentPreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        documentPreview={documentPreview}
        onSignDocument={onSignDocument}
        isSigning={isSigning}
        requirementName={requirement.name}
      />
    </div>
  );
};

function BlockedDependencyTooltip({
  dependsOnRequirement,
  children,
}: {
  dependsOnRequirement: NonNullable<
    PreOnboardingRequirementsBag['requirements']['depends_on_requirement']
  >[number];
  children: React.ReactElement;
}) {
  const action =
    dependsOnRequirement.type === 'document' ? 'signed' : 'completed';
  return (
    <BasicTooltip
      content={`${dependsOnRequirement.name} must be ${action} first.`}
    >
      {children}
    </BasicTooltip>
  );
}

const AckRequirement = ({
  requirement,
  isLocked,
}: {
  requirement: NonNullable<
    PreOnboardingRequirementsBag['requirements']
  >[number];
  isLocked: boolean;
}) => {
  // for the isLocked we need to check the code in Dragon...

  /*  const dependentBySlug = new Map<string, PreOnboardingRequirement>();
  for (const req of preOnboardingRequirements) {
    if (req.dependsOnRequirement) {
      dependentBySlug.set(req.dependsOnRequirement.slug, req);
    }
  } */

  const handleChange = (checked: CheckedState) => {
    console.log('handleChange', checked);
  };

  const isChecked = requirement.status === 'finished';
  const isBlocked = requirement.status === 'blocked';

  const isDisabled = isBlocked || isLocked;

  console.log('isDisabled', isDisabled);
  console.log('isChecked', isChecked);
  console.log('isBlocked', isBlocked);
  console.log('isLocked', isLocked);

  const checkbox = (
    <Checkbox
      id={`acknowledgement-checkbox-${requirement.slug}`}
      data-testid={`acknowledgement-checkbox-${requirement.slug}`}
      checked={isChecked}
      disabled={isDisabled}
      onCheckedChange={handleChange}
    />
  );

  return (
    <div className='flex items-start gap-2'>
      {isBlocked ? (
        <BlockedDependencyTooltip
          dependsOnRequirement={requirement.depends_on_requirement}
        >
          {checkbox}
        </BlockedDependencyTooltip>
      ) : (
        checkbox
      )}
      <Label htmlFor={`acknowledgement-checkbox-${requirement.slug}`}>
        {/** transformHtmlToComponents is a function that
         * transforms the description to a React component
         * but this makes partners able to implement this functionality...
         * another problem is that the link is private and we need to make it public,
         * if they don't let you a different approach must be taken...,
         * ZendeskTriggerButton, ZendeskDialog approach but they cannot send you the link as an anchor the they need to be able to send you the link as a string...   */}
        <span>{transformHtmlToComponents(requirement.description)}</span>
      </Label>
    </div>
  );
};

export const ReviewOnboardingStep = ({
  onboardingBag,
  components,
  errors,
  setErrors,
}: {
  components: OnboardingRenderProps['components'];
  onboardingBag: OnboardingRenderProps['onboardingBag'];
  errors: {
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  };
  setErrors: (errors: {
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }) => void;
}) => {
  const {
    OnboardingInvite,
    BackButton,
    ReviewStep: ReviewStepCreditRisk,
    PreOnboardingRequirements,
  } = components;

  return (
    <div className='onboarding-review'>
      <h2 className='title'>Basic Information</h2>
      <ReviewMeta meta={onboardingBag.meta.fields.basic_information} />
      <button
        className='back-button'
        onClick={() => onboardingBag.goTo('basic_information')}
        disabled={onboardingBag.isEmploymentReadOnly}
      >
        Edit Basic Information
      </button>
      {Object.keys(onboardingBag.meta.fields.engagement_agreement_details)
        .length > 0 && (
        <>
          <h2 className='title'>Engagement Agreement Details</h2>
          <ReviewMeta
            meta={onboardingBag.meta.fields.engagement_agreement_details}
          />
          <button
            className='back-button'
            onClick={() => onboardingBag.goTo('engagement_agreement_details')}
            disabled={onboardingBag.isEmploymentReadOnly}
          >
            Edit Engagement Agreement Details
          </button>
        </>
      )}

      <h2 className='title'>Contract Details</h2>
      <ReviewMeta meta={onboardingBag.meta.fields.contract_details} />
      <button
        className='back-button'
        onClick={() => onboardingBag.goTo('contract_details')}
        disabled={onboardingBag.isEmploymentReadOnly}
      >
        Edit Contract Details
      </button>
      <h2 className='title'>Benefits</h2>
      <ReviewMeta meta={onboardingBag.meta.fields.benefits} />

      <button
        className='back-button'
        onClick={() => onboardingBag.goTo('benefits')}
        disabled={onboardingBag.isEmploymentReadOnly}
      >
        Edit Benefits
      </button>

      <PreOnboardingRequirements
        render={({
          requirements,
          documentPreview,
          onCreateDocument,
          onSignDocument,
          isCreatingDocument,
          isSigning,
          activeRequirementSlug,
          isLoadingDocumentPreview,
        }) => {
          return (
            <>
              {requirements && requirements?.length > 0 && (
                <>
                  <h2 className='title'>Pre-Onboarding Requirements</h2>
                  <div className='flex flex-col gap-4'>
                    {requirements?.map((req) =>
                      req.type === 'acknowledgement' ? (
                        <AckRequirement
                          key={req.slug}
                          requirement={req}
                          isLocked={false}
                        />
                      ) : (
                        <DocumentRequirement
                          key={req.slug}
                          requirement={req}
                          onCreateDocument={onCreateDocument}
                          onSignDocument={onSignDocument}
                          documentPreview={documentPreview}
                          isCreatingDocument={isCreatingDocument}
                          isSigning={isSigning}
                          activeRequirementSlug={activeRequirementSlug}
                          isLoadingDocumentPreview={isLoadingDocumentPreview}
                          employeeCountry={
                            (
                              onboardingBag.employment?.basic_information
                                ?.country as { name: string }
                            )?.name ?? undefined
                          }
                        />
                      ),
                    )}
                  </div>
                </>
              )}
            </>
          );
        }}
      />

      <h2 className='title'>Review</h2>
      <ReviewStepCreditRisk
        render={({
          creditRiskState,
          creditRiskStatus,
        }: {
          creditRiskState: CreditRiskState;
          creditRiskStatus?: CreditRiskStatus;
        }) => {
          return (
            <>
              <CreditRiskSections
                creditRiskState={creditRiskState}
                creditRiskStatus={creditRiskStatus}
                employment={onboardingBag.employment}
              />
              <div className='buttons-container'>
                <BackButton
                  className='back-button'
                  disabled={onboardingBag.isEmploymentReadOnly}
                >
                  Back
                </BackButton>
                <MyOnboardingInviteButton
                  creditRiskStatus={creditRiskStatus}
                  Component={OnboardingInvite}
                  setErrors={setErrors}
                />
              </div>
              <AlertError errors={errors} />
            </>
          );
        }}
      />
    </div>
  );
};
