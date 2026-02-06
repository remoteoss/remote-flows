import { useCreateCompany } from '@/src/flows/CreateCompany/hooks';
import { SelectCountryStep } from '@/src/flows/CreateCompany/components/SelectCountryStep';
import { AddressDetailsStep } from '@/src/flows/CreateCompany/components/AddressDetailsStep';
import { FlowOptions, JSFModify } from '@/src/flows/types';
import { CreateCompanySubmit } from '@/src/flows/CreateCompany/components/CreateCompanySubmit';

type countryFormFields = {
  countryCode: string;
  companyOwnerEmail: string;
  companyOwnerName: string;
  desiredCurrency: string;
  phoneNumber: string;
  taxNumber: string;
  taxJobCategory: string;
}

export type CompanyBasicInfoFormPayload = countryFormFields;

export type CompanyBasicInfoSuccess = countryFormFields;

export type CompanyAddressDetailsFormPayload = Record<string, unknown>;

export type CompanyAddressDetailsSuccess = Record<string, unknown>;

export type CreateCompanyRenderProps = {
  /**
   * The create company bag returned by the useCreateCompany hook.
   * This bag contains all the methods and properties needed to handle the create company flow.
   * @see {@link useCreateCompany}
   */
  createCompanyBag: ReturnType<typeof useCreateCompany>;
  /**
   * The components used in the create company flow.
   * @see {@link SelectCountryStep}
   * @see {@link AddressDetailsStep}
   */
  components: {
    SelectCountryStep: typeof SelectCountryStep;
    AddressDetailsStep: typeof AddressDetailsStep;
    SubmitButton: typeof CreateCompanySubmit;

  };
};

export type CreateCompanyFlowProps = {
  /**
   * The country code to use for the onboarding.
   */
  countryCode?: string;


  /**
   * The render prop function with the params passed by the useCreateCompany hook and the components available to use for this flow
   */
  render: ({
    createCompanyBag,
    components,
  }: CreateCompanyRenderProps) => React.ReactNode;
  /**
   * The options for the create company flow.
   */
  options?: Omit<FlowOptions, 'jsfModify'> & {
    jsfModify?: {
      select_country?: JSFModify;
      address_details?: JSFModify;
    };
  };

  /**
   * Initial values to pre-populate the form fields.
   * These are flat field values that will be automatically mapped to the correct step.
   * Server data will override these values. This happens when you pass employmentId and the server returns an employment object.
   */
  initialValues?: Record<string, unknown>;
};


export type BasicInformationFormPayload = {
  company_owner_email: string;
  company_owner_name: string;
  country_code: string;
  desired_currency: string;
  name: string;
  phone_number: string;
  tax_number: string;
  tax_job_category: string;
  tax_servicing_countries: string[];
};

