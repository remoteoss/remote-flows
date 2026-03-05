/**
 * CostCalculatorEstimateCSVResponse
 */
type CostCalculatorEstimateCsvResponse = {
    data: {
        content: GenericFile;
    };
};
/**
 * DateTime
 *
 * UTC date time in YYYY-MM-DDTHH:mm:ss format
 */
type DateTime = string;
/**
 * MinimalRegion
 */
type MinimalRegion = {
    child_regions?: Array<MinimalRegion>;
    code?: string | null;
    name: string;
    slug: string;
    status?: RegionStatus;
};
/**
 * TerminationOffboarding
 */
type TerminationOffboarding = {
    additional_comments: string | null;
    agrees_to_pto_amount?: boolean;
    confidential: boolean;
    employee_awareness?: {
        date?: string | null;
        note?: string | null;
    };
    employment_id: string;
    id: string;
    /**
     * Remote will use this email address for post-termination communication.
     * If it is not provided, this field will be derived from the employment record. Therefore, it is important to ensure that it is not a company email.
     *
     */
    personal_email?: string;
    proposed_termination_date: string;
    reason_description: string;
    requested_by: string;
    risk_assessment_reasons: Array<'caring_responsibilities' | 'disabled_or_health_condition' | 'family_leave' | 'member_of_union_or_works_council' | 'none_of_these' | 'pregnant_or_breastfeeding' | 'reported_concerns_with_workplace' | 'requested_medical_or_family_leave' | 'sick_leave'>;
    status: 'submitted' | 'in_review' | 'done' | 'canceled';
    submitted_at: string;
    /**
     * Most updated termination date for the offboarding. This date is subject to change through the offboarding process even after it is finalized.
     */
    termination_date: string | null;
    termination_reason: 'cancellation_before_start_date' | 'compliance_issue' | 'conversion_to_contractor' | 'dissatisfaction_with_remote_service' | 'end_of_fixed_term_contract_compliance_issue' | 'end_of_fixed_term_contract_incapacity_to_perform_inherent_duties' | 'end_of_fixed_term_contract_local_regulations_max_term_reached' | 'end_of_fixed_term_contract_misconduct' | 'end_of_fixed_term_contract_operational_reasons' | 'end_of_fixed_term_contract_other' | 'end_of_fixed_term_contract_performance' | 'end_of_fixed_term_contract_redundancy' | 'end_of_fixed_term_contract_values' | 'gross_misconduct' | 'incapacity_to_perform_inherent_duties' | 'job_abandonment' | 'mutual_agreement' | 'other' | 'performance' | 'values' | 'workforce_reduction';
    type: 'termination';
    will_challenge_termination: boolean;
    will_challenge_termination_description?: string;
};
/**
 * Unified.Employment.UpsertBenefitOffersRequest
 *
 * Upsert benefit offers request. As its properties may vary depending on the employment,
 * you must query the [Show benefit offers schema](#tag/benefits/operation/get_show_benefit_offer) endpoint
 * passing the employment id
 */
type UnifiedEmploymentUpsertBenefitOffersRequest = {
    [key: string]: unknown;
};
/**
 * ConvertCurrency
 *
 * The response from the currency converter
 */
type ConvertCurrency = {
    /**
     * The exchange rate used to convert the amount
     */
    exchange_rate: number;
    /**
     * The amount in cents in the source currency
     */
    source_amount: number;
    source_currency: CurrencyDefinition;
    /**
     * The amount in cents in the target currency
     */
    target_amount: number;
    target_currency: CurrencyDefinition;
};
/**
 * ResignationOrTerminationOffboarding
 */
type ResignationOrTerminationOffboarding = ResignationOffboarding | TerminationOffboarding;
/**
 * CycleFrequency
 *
 * The frequency at which the payroll calendar is run.
 */
type CycleFrequency = 'monthly' | 'bi_monthly' | 'bi_weekly' | 'weekly';
/**
 * MinimalCountry
 */
type MinimalCountry = {
    alpha_2_code: string;
    code: string;
    features?: Array<string>;
    name: string;
    slug: string;
};
/**
 * Employment
 *
 * Complete information of an employment
 */
type Employment = {
    /**
     * Personal details information. Its properties may vary depending on the country.
     */
    personal_details: {
        [key: string]: unknown;
    };
    short_id?: ShortId;
    /**
     * Name of related department, if any. Otherwise, null.
     */
    department?: string | null;
    manager_email: string | null;
    provisional_start_date?: ProvisionalStartDate;
    /**
     * Home address information. Its properties may vary depending on the country.
     */
    address_details: {
        [key: string]: unknown;
    };
    pricing_plan_details: PricingPlanDetails;
    full_name: string;
    /**
     * For the employment types `contractor`, `global_payroll_employee` and `direct_employee`, only [List employments](#operation/get_index_employment) and
     * [Show employment](#operation/get_show_employment) operations are available.
     *
     */
    type: 'employee' | 'contractor' | 'direct_employee' | 'global_payroll_employee';
    /**
     * Contractor-specific settings. Only present for contractor employments.
     */
    contractor_settings?: {
        /**
         * Whether the contractor requires work confirmation before submitting invoices.
         */
        requires_work_confirmation?: boolean;
    } | null;
    employment_lifecycle_stage: EmploymentLifecycleStage;
    /**
     * Administrative information. Its properties may vary depending on the country.
     */
    administrative_details: {
        [key: string]: unknown;
    };
    /**
     * Type of contractor product. Only present for contractor employments. 'standard' for Contractor Standard, 'cor' for Contractor of Record, 'plus' for Contractor Plus.
     */
    contractor_type?: 'standard' | 'cor' | 'plus';
    /**
     * Contractor compensation rate details. Only present for contractor employments when rate is configured.
     */
    contractor_rate?: {
        amount?: {
            /**
             * Rate amount as decimal
             */
            amount?: number;
            currency?: {
                /**
                 * Currency code (e.g., USD, EUR)
                 */
                code?: string;
            };
        };
        /**
         * Payment frequency cadence
         */
        pay_frequency?: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
        /**
         * Unique identifier for the contractor rate
         */
        slug?: string;
        /**
         * Rate type indicating billing frequency
         */
        type?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'one_off';
    } | null;
    company_id: string;
    /**
     * Work address information. Its properties may vary depending on the country.
     */
    work_address_details: {
        [key: string]: unknown;
    };
    work_email: string;
    status: EmploymentStatus;
    updated_at: string;
    /**
     * Employment basic information. Its properties may vary depending on the country.
     *
     */
    basic_information?: {
        [key: string]: unknown;
    };
    job_title: string | null;
    id: string;
    probation_period_end_date?: string;
    /**
     * DepartmentID
     *
     * Unique ID of related department, if any. Otherwise, null.
     */
    department_id?: string | null;
    manager?: string;
    login_email: string;
    /**
     * A unique reference code for the employment record in a non-Remote system. While uniqueness is recommended, it is not strictly enforced within Remote's system.
     */
    external_id?: string;
    /**
     * For the employment models `peo` and `global_payroll`, only [List employments](#operation/get_index_employment) and
     * [Show employment](#operation/get_show_employment) operations are available.
     *
     */
    employment_model: 'global_payroll' | 'peo' | 'eor';
    personal_email: string;
    country: NullableCountry;
    user_status?: UserStatus;
    seniority_date?: EmploymentSeniorityDate;
    bank_account_details: Array<{
        [key: string]: unknown;
    }>;
    files: Array<File>;
    active_contract_id?: string;
    /**
     * Billing address information. Its properties may vary depending on the country.
     */
    billing_address_details: {
        [key: string]: unknown;
    };
    onboarding_tasks: OnboardingTasks;
    /**
     * Contract information. Its properties may vary depending on the country.
     */
    contract_details: {
        [key: string]: unknown;
    };
    /**
     * Emergency contact information. Its properties may vary depending on the country.
     */
    emergency_contact_details: {
        [key: string]: unknown;
    };
    eligible_for_onboarding_cancellation: boolean;
    manager_employment_id: string | null;
    created_at: string;
};
/**
 * CostCalculatorEstimatePDFResponse
 */
type CostCalculatorEstimatePdfResponse = {
    data: {
        content: GenericFile;
    };
};
/**
 * ActionError
 */
type ActionError = {
    /**
     * The action that lead to the error message.
     */
    action: string;
    /**
     * An error code that describes the nature of the error.
     */
    code: string;
    /**
     * A developer friendly error message that gives details on what the error was and how it may be remedied.
     */
    message: string;
};
/**
 * EmploymentShowResponse
 *
 * Complete information of an employment
 */
type EmploymentShowResponse = {
    data: {
        employment?: Employment & {
            /**
             * Most updated termination date for the offboarding. This date is subject to change through the offboarding process even after it is finalized.
             */
            termination_date?: string | null;
        };
    };
};
/**
 * ConflictErrorResponse
 */
type ConflictErrorResponse = ValidationError | MessageResponse;
/**
 * CostCalculatorDiscountResponse
 */
type CostCalculatorDiscountResponse = {
    annual_amount: number;
    monthly_amount: number;
    months: number;
    text: string;
};
/**
 * EmploymentBasicResponse
 *
 * Complete information of an employment
 */
type EmploymentBasicResponse = {
    /**
     * Employment basic information. As its properties may vary depending on the country,
     * you must query the [Show form schema](#tag/Countries/operation/get_show_form_country) endpoint
     * passing the country code and `basic_information` as path parameters.
     */
    basic_information?: {
        [key: string]: unknown;
    };
    company_id?: string;
    country_code?: string;
    created_at?: string;
    employment_lifecycle_stage?: EmploymentLifecycleStage;
    full_name?: string;
    id?: UuidSlug;
    job_title?: string | null;
    login_email?: string;
    personal_email?: string;
    /**
     * Required for employees, optional for contractors
     */
    provisional_start_date?: string;
    type?: 'employee' | 'contractor';
    updated_at?: string;
};
/**
 * NullableDateTime
 *
 * Optional UTC date time in YYYY-MM-DDTHH:mm:ss format
 */
type NullableDateTime = string | null;
/**
 * ClientCredentialsResponse
 */
type ClientCredentialsResponse = BaseTokenResponse;
/**
 * AuthorizationCodeResponse
 */
type AuthorizationCodeResponse = BaseTokenResponse & {
    /**
     * The ID of the connected company.
     */
    company_id?: string;
    /**
     * The refresh token. This token must be stored and used for issuing new access tokens for managing the company's resources.
     */
    refresh_token?: string;
    /**
     * The ID of the user who connected the company.
     */
    user_id?: string;
};
/**
 * CompanyAlreadyExistsErrorResponse
 *
 * Error returned when a company with matching criteria already exists
 */
type CompanyAlreadyExistsErrorResponse = {
    code?: string;
    message?: string;
    resource_id?: string;
    resource_type?: string;
};
/**
 * CostCalculatorEmploymentParam
 */
type CostCalculatorEmploymentParam = {
    age?: number;
    annual_gross_salary?: number;
    annual_gross_salary_in_employer_currency?: number;
    annual_total_cost?: number;
    annual_total_cost_in_employer_currency?: number;
    benefits?: Array<CostCalculatorBenefitParam>;
    discount?: CostCalculatorDiscount;
    employment_term?: EmploymentTermType;
    region_slug: string;
    regional_to_employer_exchange_rate?: string;
    title?: string;
};
/**
 * UnlimitedDaysandHoursResponse
 */
type UnlimitedDaysandHoursResponse = {
    type: 'unlimited';
};
/**
 * LimitedDaysandHoursResponse
 *
 * Includes requested timeoffs (not approved) in the past or in the future.
 */
type LimitedDaysandHoursResponse = {
    days: number;
    hours: number;
    type: 'limited';
};
/**
 * Country
 *
 * A supported country on Remote
 */
type Country = {
    alpha_2_code: string;
    code: string;
    /**
     * Contractor product names available for this country
     */
    contractor_products_available?: Array<'standard' | 'plus' | 'cor'>;
    country_subdivisions?: Array<CountrySubdivision> | null;
    eor_onboarding?: boolean;
    locked_benefits?: string;
    name: string;
    region?: string;
    subregion?: string | null;
    supported_json_schemas?: Array<string>;
};
/**
 * CreateOffboardingParams
 */
type CreateOffboardingParams = {
    employment_id: string;
    termination_details: TerminationDetailsParams;
    /**
     * The type of the offboarding request. For now, only `termination` is allowed.
     */
    type: 'termination';
};
/**
 * UserStatus
 *
 * The status of the user
 */
type UserStatus = 'active' | 'created' | 'initiated' | 'cancelled' | 'inactive' | 'deleted';
/**
 * CompanyCreationResponse
 */
type CompanyCreationResponse = {
    data?: CompanyResponse | CompanyWithTokensResponse;
};
/**
 * CostCalculatorEstimateParams
 */
type CostCalculatorEstimateParams = {
    /**
     * Company name
     */
    company_name?: string;
    /**
     * Currency Slug
     */
    employer_currency_slug: string;
    employments: Array<CostCalculatorEmploymentParam>;
    global_discount?: CostCalculatorDiscount;
    include_benefits?: boolean;
    include_cost_breakdowns?: boolean;
    include_management_fee?: boolean;
    include_premium_benefits?: boolean;
};
/**
 * Offboarding
 *
 * Offboarding
 */
type Offboarding = {
    offboarding?: ResignationOrTerminationOffboarding;
};
/**
 * NotFoundResponse
 */
type NotFoundResponse = {
    message?: string;
};
/**
 * CostCalculatorEstimateResponse
 */
type CostCalculatorEstimateResponse = {
    data: {
        employments?: Array<CostCalculatorEmployment>;
    };
};
/**
 * SubmitEligibilityQuestionnaireRequest
 *
 * Request body for submitting an eligibility questionnaire
 */
type SubmitEligibilityQuestionnaireRequest = {
    /**
     * The slug/ID of the employment
     */
    employment_slug: string;
    /**
     * Responses to the questionnaire questions
     */
    responses: {
        [key: string]: string;
    };
    type: 'contractor_of_record';
};
/**
 * Timezone
 *
 * [TZ identifier](https://www.iana.org/time-zones)
 */
type Timezone = string;
/**
 * ResignationOffboarding
 */
type ResignationOffboarding = {
    additional_comments?: string | null;
    agrees_to_pto_amount?: boolean;
    employer_awareness?: string;
    employment_id: string;
    id: string;
    proposed_last_working_day: string;
    reason_description?: string;
    requested_by: string;
    resignation_reason: 'cancellation_before_start_date' | 'company_culture_or_values' | 'conversion_to_contractor' | 'conversion_to_global_payroll' | 'conversion_to_peo' | 'dissatisfaction_with_remote_service' | 'incapacity_to_perform_inherent_duties' | 'infrastructure_challenges' | 'lack_of_recognition' | 'leadership' | 'mutual_agreement' | 'other' | 'other_job_opportunity' | 'personal_reasons' | 'position_does_not_meet_expectations' | 'relationship_with_coworkers' | 'relocation_from_entity_to_entity_by_employee' | 'relocation_leaving_remote' | 'remuneration_and_benefits' | 'retirement' | 'transfer_and_relocation_new_customer_and_new_country' | 'transfer_between_remote_customer' | 'transfer_from_remote_to_customer' | 'transfer_from_remote_to_other_eor';
    status: 'submitted' | 'in_review' | 'done' | 'canceled';
    submitted_at: string;
    /**
     * Most updated termination date for the offboarding. This date is subject to change through the offboarding process even after it is finalized.
     */
    termination_date: string | null;
    type: 'resignation';
};
/**
 * File
 *
 * A supported file
 */
type File = {
    id: string;
    inserted_at: DateTimeIso8601;
    name: string;
    sub_type?: string | null;
    type: string;
};
/**
 * OffboardingResponse
 *
 * Offboarding response
 */
type OffboardingResponse = {
    data?: Offboarding;
};
/**
 * ShortId
 *
 * Unique short identifier for the employment, automatically generated and visible in select areas of the Remote platform. Not intended as a replacement for the employment `id` field.
 */
type ShortId = string;
/**
 * NullableApproverId
 *
 * The field matches the `id` of a user in the
 * Remote Platform that has permission to approve time off
 * requests. [Available users][] can be found fetching
 * the [List Company Manager][] endpoint.
 *
 * [Available users]: https://support.remote.com/hc/en-us/articles/360054668651-Approving-Declining-time-off-requests#h_01G0014GZKZ3EMN6P7C99HAK55
 * [List Company Manager]: https://gateway.remote.com/v1/docs/openapi.html#tag/Company-Managers
 *
 */
type NullableApproverId = string | null;
/**
 * EmploymentFullParams
 *
 * Description of the basic required and onboarding tasks params to create an employment.
 * You do not need to include all onboarding tasks when creating or updating an employment.
 *
 */
type EmploymentFullParams = {
    /**
     * Home address information. As its properties may vary depending on the country,
     * you must query the [Show form schema](#tag/Countries/operation/get_show_form_country) endpoint
     * passing the country code and `address_details` as path parameters.
     */
    address_details?: {
        [key: string]: unknown;
    };
    /**
     * Administrative information. As its properties may vary depending on the country,
     * you must query the [Show form schema](#tag/Countries/operation/get_show_form_country) endpoint
     * passing the country code and `administrative_details` as path parameters.
     */
    administrative_details?: {
        [key: string]: unknown;
    };
    /**
     * Bank account information. As its properties may vary depending on the country,
     * you must query the [Show form schema](#tag/Countries/operation/get_show_form_country) endpoint
     * passing the country code and `bank_account_details` as path parameters.
     */
    bank_account_details?: {
        [key: string]: unknown;
    };
    /**
     * Employment basic information. As its properties may vary depending on the country,
     * you must query the [Show form schema](#tag/Countries/operation/get_show_form_country) endpoint
     * passing the country code and `employment_basic_information` as path parameters.
     */
    basic_information?: {
        [key: string]: unknown;
    };
    /**
     * Billing address information. As its properties may vary depending on the country,
     * you must query the [Show form schema](#tag/Countries/operation/get_show_form_country) endpoint
     * passing the country code and `billing_address_details` as path parameters.
     */
    billing_address_details?: {
        [key: string]: unknown;
    };
    company_id?: string;
    /**
     * Contract information. As its properties may vary depending on the country,
     * you must query the [Show form schema](#tag/Countries/operation/get_show_form_country) endpoint
     * passing the country code and `contract_details` as path parameters.
     */
    contract_details?: {
        [key: string]: unknown;
    };
    country?: Country;
    country_code?: string;
    /**
     * The department of the employment. The department must belong to the same company as the employment.
     * When set to `null`, the employment will be unassigned from a department.
     *
     */
    department_id?: string | null;
    /**
     * Emergency contact information. As its properties may vary depending on the country,
     * you must query the [Show form schema](#tag/Countries/operation/get_show_form_country) endpoint
     * passing the country code and `emergency_contact_details` as path parameters.
     */
    emergency_contact_details?: {
        [key: string]: unknown;
    };
    /**
     * A unique reference code for the employment record in a non-Remote system. This optional field links to external data sources. If not provided, it defaults to `null`. While uniqueness is recommended, it is not strictly enforced within Remote's system.
     */
    external_id?: string;
    /**
     * The user id of the manager, who should have an `admin`, `owner` or `people_manager` role.
     * You can find these users by querying the [Company Managers endpoint](#operation/get_index_company_manager).
     * **Update of this field is only available for active employments.**
     *
     */
    manager_id?: string;
    /**
     * Personal details information. As its properties may vary depending on the country,
     * you must query the [Show form schema](#tag/Countries/operation/get_show_form_country) endpoint
     * passing the country code and `personal_details` as path parameters.
     */
    personal_details?: {
        [key: string]: unknown;
    };
    /**
     * Pricing plan details information. As its properties may vary depending on the country,
     * you must query the [Show form schema](#tag/Countries/operation/get_show_form_country) endpoint
     * passing the country code and `pricing_plan_details` as path parameters.
     */
    pricing_plan_details?: {
        [key: string]: unknown;
    };
    /**
     * If not provided, it will default to `employee`.
     */
    type?: 'employee' | 'contractor';
    /**
     * The work email of the employment.
     */
    work_email?: string;
};
/**
 * OffboardingFile
 */
type OffboardingFile = {
    /**
     * The content in base64 encoding
     */
    content: Blob | File;
    /**
     * The file name
     */
    name: string;
};
/**
 * RefreshTokenResponse
 */
type RefreshTokenResponse = BaseTokenResponse & {
    /**
     * The refresh token
     */
    refresh_token?: string;
};
/**
 * UnprocessableEntityResponse
 */
type UnprocessableEntityResponse = {
    errors: {
        [key: string]: unknown;
    };
} | {
    message: string | ParameterError | Array<ParameterError> | ActionError | Array<ActionError>;
};
/**
 * EmploymentTermType
 */
type EmploymentTermType = 'fixed' | 'indefinite';
/**
 * Currency
 *
 * The type of money in general use in a particular country
 */
type Currency = {
    code: string;
    name?: string;
    slug: string;
    symbol: string;
};
/**
 * PayrollCalendarEOR
 */
type PayrollCalendarEor = {
    country: Country;
    cycle_frequency: CycleFrequency;
    cycles: Array<Cycle>;
    id: string;
};
/**
 * EmploymentSeniorityDate
 *
 * The date the employee first started working for your company. If you don’t include a seniority date,
 * the employee’s start date with Remote will be deemed as the start of the employee’s seniority.
 *
 * **Example**: Your employee started working for your company on Feb 1, 2022.
 * On Aug 1, 2022, you transferred the employee to Remote and started managing them on the platform.
 * Feb 1, 2022 would be their seniority date. Aug 1, 2022 would be their starting date.
 *
 */
type EmploymentSeniorityDate = string;
/**
 * RegionStatus
 */
type RegionStatus = 'active' | 'inactive';
/**
 * CostCalculatorCost
 */
type CostCalculatorCost = {
    amount: number;
    description: string | null;
    name: string;
    zendesk_article_id: string | null;
    zendesk_article_url: string | null;
};
/**
 * OAuth2Tokens
 */
type OAuth2Tokens = AuthorizationCodeResponse | ClientCredentialsResponse | RefreshTokenResponse;
/**
 * CostCalculatorCosts
 */
type CostCalculatorCosts = {
    /**
     * The list of all annual benefit costs
     */
    annual_benefits_breakdown?: Array<CostCalculatorCost>;
    /**
     * The annual benefits total that a company must pay for this employment
     */
    annual_benefits_total?: number;
    /**
     * The list of all annual employer contribution costs
     */
    annual_contributions_breakdown?: Array<CostCalculatorCost>;
    /**
     * The annual contributions that a company must pay for this employment
     */
    annual_contributions_total: number;
    /**
     * The annual gross salary that the employee is going to earn
     */
    annual_gross_salary: number;
    /**
     * The annual indirect tax that a company must pay for this employment
     */
    annual_indirect_tax?: number;
    /**
     * The annual management fees
     */
    annual_management_fee?: number;
    /**
     * The annual gross salary + annual contributions + annual fee (monthly fee * 12) + extra statutory payments if applicable
     */
    annual_total: number;
    currency: Currency;
    discount?: CostCalculatorDiscountResponse;
    /**
     * The list of all annual extra statutory payment costs
     */
    extra_statutory_payments_breakdown?: Array<CostCalculatorCost>;
    /**
     * 13th month salary, this happens for countries such as Philippines
     */
    extra_statutory_payments_total: number;
    /**
     * The list of all monthly benefit costs
     */
    monthly_benefits_breakdown?: Array<CostCalculatorCost>;
    /**
     * The benefits total that the company pays monthly
     */
    monthly_benefits_total?: number;
    /**
     * The list of all monthly employer contribution costs
     */
    monthly_contributions_breakdown?: Array<CostCalculatorCost>;
    /**
     * The contributions that the company pays monthly
     */
    monthly_contributions_total: number;
    /**
     * The gross monthly salary for the Employee
     */
    monthly_gross_salary: number;
    /**
     * The monthly indirect tax that a company must pay for this employment
     */
    monthly_indirect_tax?: number;
    /**
     * The monthly management fees
     */
    monthly_management_fee?: number;
    /**
     * Monthly gross salary + monthly contributions  (doesn't include fee)
     */
    monthly_tce: number;
    /**
     * Monthly gross salary + monthly contributions + monthly fee
     */
    monthly_total: number;
};
/**
 * Product
 *
 * Product
 */
type Product = {
    description?: string;
    features?: Array<string>;
    frequency: string;
    identifier?: string;
    name: string;
    short_name?: string;
    tier: string;
};
/**
 * CompanyResponse
 *
 * Shows a company
 */
type CompanyResponse = {
    data: {
        company?: Company;
    };
};
/**
 * CompanyWithTokensResponse
 *
 * Shows a company with its refresh and access tokens. Please contact Remote if you need the tokens when creating a company.
 */
type CompanyWithTokensResponse = {
    company?: Company;
    tokens?: OAuth2Tokens;
};
/**
 * ListLeavePoliciesSummaryResponse
 *
 * Response schema for listing leave policies summary
 */
type ListLeavePoliciesSummaryResponse = {
    data: Array<LeavePolicySummary>;
};
/**
 * RequestDetails
 *
 * The details of the requested changes for the contract amendment.
 */
type RequestDetails = {
    additional_comments?: string | null;
    effective_date?: string;
    reason_for_change?: 'annual_pay_adjustment' | 'country_rule_change' | 'error_correction' | 'job_change_reevaluation' | 'promotion' | 'other';
    /**
     * This is filled when the reason_for_change is 'other'.
     */
    reason_for_change_description?: string | null;
    salary_decrease_details?: SalaryDecreaseDetails;
};
/**
 * EligibilityQuestionnaireResponse
 */
type EligibilityQuestionnaireResponse = {
    data: EligibilityQuestionnaire;
};
/**
 * ConvertCurrencyParams
 *
 * The parameters for the currency conversion
 */
type ConvertCurrencyParams = {
    /**
     * The amount to convert in cents
     */
    amount: number;
    /**
     * The currency code to convert from
     */
    source_currency: string;
    /**
     * The currency code to convert to
     */
    target_currency: string;
};
/**
 * ProvisionalStartDate
 *
 * Indicates the expected start date of the employee or contractor.
 *
 * Required for employees, but optional for contractors. Date format is in ISO8601 without the time component.
 *
 * See the **Date and Time Format** documentation for more details on how the Remote API works with dates.
 *
 */
type ProvisionalStartDate = string;
/**
 * ContractAmendment
 *
 * Contract Amendment
 */
type ContractAmendment = {
    amendment_contract_id: string | null;
    /**
     * Describes all the changes requested for the contract and contract details with all their previous and current values.
     */
    changes: {
        [key: string]: unknown;
    };
    employment_id: string;
    id: string;
    request_details: RequestDetails;
    requested_by: string;
    status: ContractAmendmentStatus;
    submitted_at: string;
    zendesk_ticket_url: string | null;
};
/**
 * ContractDocumentItem
 *
 * Contract document item in list response
 */
type ContractDocumentItem = {
    /**
     * Contract document slug/ID
     */
    id: string;
    /**
     * Created timestamp
     */
    inserted_at: string;
    /**
     * Contract document name
     */
    name: string | null;
    /**
     * Contract document status
     */
    status: 'draft' | 'awaiting_signatures' | 'finished' | 'archived' | 'revised' | 'awaiting_customer_approval' | 'approved_by_customer' | 'rejected_by_customer';
    /**
     * Contract document type
     */
    type: string;
    /**
     * Last updated timestamp
     */
    updated_at: string | null;
};
/**
 * TaskDescription
 *
 * Description and status of an onboarding task.
 */
type TaskDescription = {
    description?: string;
    /**
     * TaskStatus
     *
     * The status of the task
     */
    status?: 'completed' | 'pending';
};
/**
 * CountrySubdivision
 *
 * A subdivision of a supported country on Remote
 */
type CountrySubdivision = {
    code?: string;
    name: string;
    subdivision_type?: string;
};
/**
 * ListTimeoffResponse
 *
 * Response schema listing many timeoffs
 */
type ListTimeoffResponse = {
    data?: {
        /**
         * The current page among all of the total_pages
         */
        current_page?: number;
        timeoffs?: Array<Timeoff>;
        /**
         * The total number of records in the result
         */
        total_count?: number;
        /**
         * The total number of pages the user can go through
         */
        total_pages?: number;
    };
};
/**
 * MagicLinkResponse
 */
type MagicLinkResponse = {
    data: {
        url: string;
    };
};
/**
 * EmploymentLifecycleStage
 *
 * The stage of employment lifecycle. When it's `onboarded` means the employee is ready to commence or has already commenced.
 */
type EmploymentLifecycleStage = 'employment_creation' | 'employee_self_enrollment' | 'right_to_work_check' | 'contract_signing' | 'remote_enrollment' | 'onboarded' | 'offboarded';
/**
 * CreateContractDocument
 *
 * Parameters for creating a contract document
 */
type CreateContractDocument = {
    /**
     *   Contract document parameters. Its properties may vary depending on the country.
     *
     */
    contract_document: {
        [key: string]: unknown;
    };
    /**
     * When true, skips AI-based compliance checks (e.g. services and deliverables classification). Defaults to false.
     */
    skip_ai_checks?: boolean;
};
/**
 * ValidationError
 */
type ValidationError = {
    errors: {
        [key: string]: unknown;
    };
};
/**
 * ContractAmendmentAutomatableResponse
 *
 * Contract Amendment Automatable response
 */
type ContractAmendmentAutomatableResponse = {
    data?: {
        /**
         * If true, it means that the contract amendment request is automatable.
         */
        automatable?: boolean;
        /**
         * The message to explain how the contract amendment request will be processed depending if it is automatable or not.
         */
        message?: string;
    };
};
/**
 * Signatory
 *
 * Contract document signatory with signature details
 */
type Signatory = {
    email: string | null;
    name: string | null;
    /**
     * Base64 encoded signature image
     */
    signature: string | null;
    signed_at: string | null;
    status: 'pending' | 'signed' | 'unassigned';
    type: 'company' | 'employee' | 'admin' | 'external' | 'unknown';
    user: {
        [key: string]: unknown;
    } | null;
};
/**
 * NullableCountry
 *
 * A supported country on Remote
 */
type NullableCountry = {
    alpha_2_code: string;
    code: string;
    /**
     * Contractor product names available for this country
     */
    contractor_products_available?: Array<'standard' | 'plus' | 'cor'>;
    country_subdivisions?: Array<CountrySubdivision> | null;
    eor_onboarding?: boolean;
    locked_benefits?: string;
    name: string;
    region?: string;
    subregion?: string | null;
    supported_json_schemas?: Array<string>;
} | null;
/**
 * OnboardingTasks
 *
 * All tasks that need to be completed before marking the employment as ready
 */
type OnboardingTasks = {
    address_details: TaskDescription;
    administrative_details: TaskDescription;
    bank_account_details: TaskDescription;
    billing_address_details: TaskDescription;
    contract_details: TaskDescription;
    emergency_contact_details: TaskDescription;
    employment_document_details: TaskDescription;
    personal_details: TaskDescription;
    pricing_plan_details: TaskDescription;
};
/**
 * FileParams
 *
 * Parameters to upload a file
 */
type FileParams = {
    employment_id: string;
    file: Blob | File;
    sub_type?: string;
    type?: string;
};
/**
 * LeavePolicySummary
 *
 * Leave Policy Summary
 */
type LeavePolicySummary = {
    /**
     * The annual balance represents the balance for the current entitlement period.
     * Unlike the regular balance, it does not account for accrued value and only considers the annual entitlement as the basis for calculations.
     *
     */
    annual_balance: UnlimitedDaysandHoursResponse | LimitedDaysandHoursResponse;
    /**
     * The annual entitlement represents what an employee is entitled to in the current entitlement period.
     * It does not account for any accrued value.
     *
     */
    annual_entitlement: UnlimitedDaysandHoursResponse | LimitedDaysandHoursResponse;
    /**
     * The balance is the entitlement minus the taken timeoff (i.e 10 entitlement - 3 taken = 7 balance)
     */
    balance: UnlimitedDaysandHoursResponse | LimitedDaysandHoursResponse;
    /**
     * LimitedDaysandHoursResponse
     *
     * Includes all upcoming requested time off.
     */
    booked: {
        days: number;
        hours: number;
        type: 'limited';
    };
    /**
     * The current entitlement is the accrued time entitled for the employee plus any other extra entitlements (such as carryover).
     */
    current_entitlement: UnlimitedDaysandHoursResponse | LimitedDaysandHoursResponse;
    leave_policy: EmployeeLeavePolicy;
    /**
     * LimitedDaysandHoursResponse
     *
     * Includes requested timeoffs (not approved) in the past or in the future.
     */
    pending_approval: {
        days: number;
        hours: number;
        type: 'limited';
    };
    /**
     * LimitedDaysandHoursResponse
     *
     * Includes all time off (past and future, pending or approved).
     */
    taken: {
        days: number;
        hours: number;
        type: 'limited';
    };
    /**
     * LimitedDaysandHoursResponse
     *
     * Includes all upcoming approved time off.
     */
    upcoming_approved: {
        days: number;
        hours: number;
        type: 'limited';
    };
    /**
     * LimitedDaysandHoursResponse
     *
     * Includes all upcoming requested time off.
     */
    upcoming_requested: {
        days: number;
        hours: number;
        type: 'limited';
    };
    /**
     * LimitedDaysandHoursResponse
     *
     * Includes only approved time off in the past.
     */
    used: {
        days: number;
        hours: number;
        type: 'limited';
    };
    working_hours_per_day: number;
};
/**
 * EmploymentCreationResponse
 */
type EmploymentCreationResponse = {
    data?: {
        employment?: EmploymentBasicResponse;
    };
};
/**
 * EmploymentStatus
 *
 * The status of employment
 */
type EmploymentStatus = 'active' | 'created' | 'pre_hire' | 'created_awaiting_reserve' | 'created_reserve_paid' | 'initiated' | 'invited' | 'pending' | 'review' | 'archived' | 'deleted';
/**
 * CostCalculatorEmployment
 */
type CostCalculatorEmployment = {
    country: MinimalCountry;
    country_benefits_details_url: string | null;
    country_guide_url: string | null;
    employer_currency_costs: CostCalculatorCosts;
    has_extra_statutory_payment: boolean;
    minimum_onboarding_time: number | null;
    region: MinimalRegion;
    regional_currency_costs: CostCalculatorCosts;
};
/**
 * CreateCompanyParams
 */
type CreateCompanyParams = {
    /**
     * Fields can vary depending on the country. Please, check the required fields structure using the [Show form schema endpoint](#operation/get_show_form_country).
     * Use the desired country and `address_details` as the form name for the placeholders.
     * The response complies with the [JSON Schema](https://developer.remote.com/docs/how-json-schemas-work) specification.
     *
     */
    address_details?: {
        [key: string]: unknown;
    };
    /**
     * Fields can vary depending on the country. Please, check the required fields structure using the [Show form schema endpoint](#operation/get_show_form_country).
     * Use the desired country and `bank_account_details` as the form name for the placeholders.
     * The response complies with the [JSON Schema](https://developer.remote.com/docs/how-json-schemas-work) specification.
     *
     */
    bank_account_details?: {
        [key: string]: unknown;
    };
    /**
     * The company owner email.
     *
     * This value cannot be changed once set.
     *
     */
    company_owner_email: string;
    /**
     * The company owner name.
     *
     * This value cannot be changed from the Remote API once set.
     *
     */
    company_owner_name: string;
    /**
     * 3-letter country code of the country the company address is located in.
     *
     * For a list of countries supported through the Remote API, make a call to the [list countries endpoint](#tag/Countries/operation/get_supported_country). This endpoint will also include the 3-letter country codes you can use for this field.
     *
     */
    country_code: string;
    /**
     * Desired currency for invoicing and displaying converted salaries in Remote UI regardless of the employee's country.
     */
    desired_currency: 'AUD' | 'CAD' | 'CHF' | 'DKK' | 'EUR' | 'GBP' | 'JPY' | 'NOK' | 'NZD' | 'SEK' | 'SGD' | 'USD';
    /**
     * The domain of the company. Use this field to specify the company domain name when it's different from the domain in the company owner's email.
     */
    email_domain?: string;
    /**
     * Id of the company as represented in the external partner system.
     */
    external_id?: string;
    /**
     * The company name
     */
    name: string;
    /**
     * A phone number the company can be contacted with.
     */
    phone_number?: string;
    /**
     * The company registration number. This field or `tax_number` (but not both) should be submitted.
     */
    registration_number?: string;
    /**
     * The tax identifier of the company. This field or `registration_number` (but not both) should be submitted.
     */
    tax_number?: string;
    /**
     * Date and time the Terms of Service were accepted. To ensure users read the most recent version of Remote's Terms of Service, their action cannot have been done more than fifteen minutes ago. The UTC offset must be included in the ISO 8601 format: `YYYY-MM-DD HOURS:MINUTES:SECONDSZ`
     */
    terms_of_service_accepted_at: string;
};
/**
 * UuidSlug
 */
type UuidSlug = string;
/**
 * BaseTokenResponse
 */
type BaseTokenResponse = {
    /**
     * A JWT token.
     */
    access_token?: string;
    /**
     * Number of seconds until token is expired.
     */
    expires_in?: number;
    /**
     * The type of the token. For now, always `Bearer`.
     */
    token_type?: string;
};
/**
 * SuccessResponse
 */
type SuccessResponse = {
    data: {
        status?: string;
    };
};
/**
 * ManageContractorPlusSubscriptionOperationsParams
 *
 * Defines the operation that must be executed: upgrade or downgrade
 */
type ManageContractorPlusSubscriptionOperationsParams = {
    operation: 'upgrade' | 'downgrade';
};
/**
 * EmployeeLeavePolicy
 *
 * Leave Policy abstraction representation for the employee
 */
type EmployeeLeavePolicy = {
    description: string | null;
    leave_type: TimeoffType;
    name: string;
    unit: 'days' | 'hours' | 'unlimited';
};
/**
 * MagicLinkParams
 *
 * Magic link params
 */
type MagicLinkParams = {
    /**
     * The path to which the user will be redirected to after login. This field has a max length of 2000 characters.
     *
     * If not specified, `/dashboard` will be used by default.
     *
     * Must begin with a forward slash (`/`) and, at least one path segment is required  (`/dashboard` e.g.).
     * An ending forward slash (`/`) is not allowed and path segments can only include alphanumeric characters, underscore (`_`) and hyphen (`-`).
     *
     * An optional query string can be specified too. If present, the query string must start with a question mark (`?`)
     * and must include at least one key value pair. Both, keys and values, can only include
     * alphanumeric characters, underscore (`_`), hyphen (`-`) or percent encoded values such as `%20` (space character).
     * Additional key value pairs are allowed using ampersand (`&`).
     *
     * Query keys require at least one alphanumeric, underscore (`_`), hyphen (`-`) or valid percent encoded.
     * Query values are optional, the actual value may be empty and the equals sign (`=`) may be missing too.
     *
     * Some **Valid** examples for `path`:
     * - o `/dashboard`
     * - o `/dashboard/people/new/full_time/663e0b79-c893-45ff-a1b2-f6dcabc098b5`
     * - o `/dashboard/people/hiring?filters%5B0%5D%5Bid%5D=exclude_linked_drafts&filters%5B0%5D%5Bvalue%5D=true`
     * - o `/dashboard?key=value&foo=bar`
     *
     * Some **Invalid** examples for `path`:
     * - x `missing_forward_slash`
     * - x `/invalid//path`
     * - x `//some`
     * - x `/?key=value`
     * - x `/some/i.n:valid*`
     * - x `/invalid/end/slash/`
     * - x `/some?malformed_percent_encoded_key%1=value`
     *
     */
    path?: string;
    user_id: UuidSlug;
} | {
    employment_id: UuidSlug;
    /**
     * The path to which the user will be redirected to after login. This field has a max length of 2000 characters.
     *
     * If not specified, `/dashboard` will be used by default.
     *
     * Must begin with a forward slash (`/`) and, at least one path segment is required  (`/dashboard` e.g.).
     * An ending forward slash (`/`) is not allowed and path segments can only include alphanumeric characters, underscore (`_`) and hyphen (`-`).
     *
     * An optional query string can be specified too. If present, the query string must start with a question mark (`?`)
     * and must include at least one key value pair. Both, keys and values, can only include
     * alphanumeric characters, underscore (`_`), hyphen (`-`) or percent encoded values such as `%20` (space character).
     * Additional key value pairs are allowed using ampersand (`&`).
     *
     * Query keys require at least one alphanumeric, underscore (`_`), hyphen (`-`) or valid percent encoded.
     * Query values are optional, the actual value may be empty and the equals sign (`=`) may be missing too.
     *
     * Some **Valid** examples for `path`:
     * - o `/dashboard`
     * - o `/dashboard/people/new/full_time/663e0b79-c893-45ff-a1b2-f6dcabc098b5`
     * - o `/dashboard/people/hiring?filters%5B0%5D%5Bid%5D=exclude_linked_drafts&filters%5B0%5D%5Bvalue%5D=true`
     * - o `/dashboard?key=value&foo=bar`
     *
     * Some **Invalid** examples for `path`:
     * - x `missing_forward_slash`
     * - x `/invalid//path`
     * - x `//some`
     * - x `/?key=value`
     * - x `/some/i.n:valid*`
     * - x `/invalid/end/slash/`
     * - x `/some?malformed_percent_encoded_key%1=value`
     *
     */
    path?: string;
};
/**
 * CostCalculatorDiscount
 *
 * Allows to apply discounts to estimates
 */
type CostCalculatorDiscount = {
    amount?: number;
    months?: number;
    percent?: number;
    quoted_amount?: number;
    text: string;
};
/**
 * LeavePolicy
 */
type LeavePolicy = {
    leave_policy_variant_slug: string;
    leave_type: TimeoffType;
    name: string;
};
/**
 * CompanyLegalEntity
 */
type CompanyLegalEntity = {
    /**
     * ISO 3166-1 alpha-3 country code (e.g., 'USA', 'GBR', 'DEU')
     */
    country_code?: string | null;
    global_payroll_enabled: boolean;
    /**
     * Company slug
     */
    id: string;
    /**
     * Indicates if this is the default legal entity for the company
     */
    is_default?: boolean;
    name: string;
};
/**
 * Company
 */
type Company = {
    /**
     * Fields can vary depending on the country. Please, check the required fields structure using the [Show form schema endpoint](#operation/get_show_form_country).
     * Use the desired country and `address_details` as the form name for the placeholders.
     * The response complies with the [JSON Schema](https://developer.remote.com/docs/how-json-schemas-work) specification.
     *
     */
    address_details: {
        [key: string]: unknown;
    };
    /**
     * Fields can vary depending on the country. Please, check the required fields structure using the [Show form schema endpoint](#operation/get_show_form_country).
     * Use the desired country and `bank_account_details` as the form name for the placeholders.
     * The response complies with the [JSON Schema](https://developer.remote.com/docs/how-json-schemas-work) specification.
     *
     */
    bank_account_details?: {
        [key: string]: unknown;
    };
    company_owner_email: string;
    company_owner_name?: string;
    company_owner_user_id: string;
    country_code: string;
    created_at: string;
    /**
     * The credit risk status of the company default legal entity.
     * - `not_started`: The credit risk assessment has not started yet.
     * - `ready`: The credit risk assessment is ready to be started.
     * - `in_progress`: The automated credit risk assessment is in progress.
     * - `referred`: The credit risk assessment has been referred to a human reviewer.
     * - `fail`: The credit risk assessment has failed and the company will be archived.
     * - `deposit_required`: The company default legal entity requires a deposit before onboarding new employees.
     * - `no_deposit_required`: The company default legal entity does not require a deposit before onboarding new employees.
     *
     */
    default_legal_entity_credit_risk_status: 'not_started' | 'ready' | 'in_progress' | 'referred' | 'fail' | 'deposit_required' | 'no_deposit_required';
    desired_currency: string;
    external_id?: string | null;
    id: string;
    name: string;
    phone_number?: string;
    registration_number?: string | null;
    /**
     * The company status determines what a company is allowed to do:
     * - `pending`: The company has been created and the company owner invited. Remote is waiting for the company owner to complete onboarding.
     * - `review`: The company is under review. In rare occasions, a company may not automatically get created in `active` status because Remote needs to
     * manually review the company that was created. The company will become `active` once the review is completed and no further action is necessary
     * through the Remote API.
     * - `active`: The company owner has completed onboarding and the company is ready to employ.
     * - `archived`: The company is no longer active on the Remote platform and no changes can be made to the company.
     *
     */
    status: 'pending' | 'review' | 'active' | 'archived';
    tax_number?: string | null;
    terms_of_service_accepted_at: string;
    updated_at: string;
};
/**
 * ContractorSubscriptions.Summary
 */
type ContractorSubscriptionsSummary = {
    company_product: {
        slug?: UuidSlug;
    };
    company_product_discount: {
        expiration_date?: _Date;
        percent?: Decimal;
    };
    currency: Currency;
    eligibility_questionnaire?: EligibilityQuestionnaire;
    is_termination_fees_enabled?: boolean;
    price: {
        amount?: number;
        /**
         * The price after applying the company discount, in cents
         */
        final_amount?: number;
    };
    product: Product;
    total_amount: number | null;
    total_discount?: number;
    total_in_advance?: number;
    total_prorated?: number;
};
/**
 * TooManyRequestsResponse
 */
type TooManyRequestsResponse = {
    message?: string;
};
/**
 * EligibilityQuestionnaire
 */
type EligibilityQuestionnaire = {
    /**
     * Whether the questionnaire blocks further progress if failed
     */
    is_blocking: boolean;
    /**
     * The questions in the questionnaire
     */
    questions: {
        [key: string]: unknown;
    };
    /**
     * The responses to the questionnaire
     */
    responses: {
        [key: string]: unknown;
    };
    slug: UuidSlug;
    submitted_at: DateTime;
    type: 'contractor_of_record';
};
/**
 * UploadFileResponse
 *
 * A supported file
 */
type UploadFileResponse = {
    data?: {
        file: File;
    };
};
/**
 * ConflictResponse
 */
type ConflictResponse = {
    message?: string;
};
/**
 * CurrencyDefinition
 *
 * Currency object without a UUID identifier
 */
type CurrencyDefinition = {
    code: string;
    name: string;
    symbol: string;
};
/**
 * TimeoffDay
 *
 * TimeoffDay schema
 */
type TimeoffDay = {
    day: _Date;
    hours: number;
};
/**
 * BadRequestResponse
 */
type BadRequestResponse = {
    message: string;
} | {
    message?: {
        code: string;
        message: string;
    };
};
/**
 * UnauthorizedResponse
 */
type UnauthorizedResponse = {
    message: string;
};
/**
 * PricingPlanDetails
 *
 * Selected type of payment.
 */
type PricingPlanDetails = {
    frequency: 'annually' | 'monthly';
};
/**
 * UpdateCompanyParams
 */
type UpdateCompanyParams = {
    /**
     * Fields can vary depending on the country. Please, check the required fields structure using the [Show form schema endpoint](#operation/get_show_form_country).
     * Use the desired country and `address_details` as the form name for the placeholders.
     * The response complies with the [JSON Schema](https://developer.remote.com/docs/how-json-schemas-work) specification.
     *
     */
    address_details?: {
        [key: string]: unknown;
    };
    /**
     * Fields can vary depending on the country. Please, check the required fields structure using the [Show form schema endpoint](#operation/get_show_form_country).
     * Use the desired country and `bank_account_details` as the form name for the placeholders.
     * The response complies with the [JSON Schema](https://developer.remote.com/docs/how-json-schemas-work) specification.
     *
     */
    bank_account_details?: {
        [key: string]: unknown;
    };
    /**
     * Country of company address
     */
    country_code?: string;
    /**
     * Desired currency for invoicing and displaying converted salaries in Remote UI regardless of the employee's country.
     *
     * This field is only accepted if company is in status `pending`. Please contact Remote if you wish to update it.
     *
     */
    desired_currency?: 'AUD' | 'CAD' | 'CHF' | 'DKK' | 'EUR' | 'GBP' | 'JPY' | 'NOK' | 'NZD' | 'SEK' | 'SGD' | 'USD';
    /**
     * This field is only accepted if company is in status `pending`. Please contact Remote if you wish to update it.
     *
     */
    name?: string;
    /**
     * A phone number the company can be contacted with.
     */
    phone_number?: string;
    /**
     * The company registration number. This field or tax_number (but not both) should be submitted.
     *
     * This field is only accepted if company is in status `pending`.
     *
     */
    registration_number?: string;
    /**
     *   The tax identifier of the company. This field or registration_number (but not both) should be submitted.
     *
     * This field is only accepted if company is in status `pending`.
     *
     */
    tax_number?: string;
};
/**
 * SignContractDocument
 *
 * SignContractDocument schema
 */
type SignContractDocument = {
    signature: string;
};
/**
 * ContractAmendmentStatus
 */
type ContractAmendmentStatus = 'submitted' | 'in_review' | 'done' | 'canceled' | 'deleted';
/**
 * DateTimeIso8601
 *
 * UTC date time in [ISO 8601][] format.
 *
 * [ISO 8601]: https://en.wikipedia.org/wiki/ISO_8601
 *
 */
type DateTimeIso8601 = string;
/**
 * CostCalculatorBenefitParam
 */
type CostCalculatorBenefitParam = {
    /**
     * Benefit Group Slug
     */
    benefit_group_slug: string;
    /**
     * Benefit Tier Slug
     */
    benefit_tier_slug: string;
};
/**
 * TerminationDetailsParams
 */
type TerminationDetailsParams = {
    acknowledge_termination_procedure?: boolean | null;
    /**
     * Additional details regarding the termination process.
     */
    additional_comments?: string | null;
    agrees_to_pto_amount?: boolean | null;
    agrees_to_pto_amount_notes?: string | null;
    /**
     * Confidential requests are visible for who authorized the token or integration. Non-confidential requests are visible to all admins in the company.
     */
    confidential: boolean;
    customer_informed_employee?: boolean | null;
    /**
     * Remote advises not to inform the employee of their termination until we review your request for legal risks. When we approve your request, you can inform the employee and we’ll take it from there. This field is only required if employee was informed before creating the offboarding request.
     */
    employee_awareness?: {
        /**
         * When the employee was told about the termination.
         */
        date?: string | null;
        /**
         * Notes describing how the termination was shared with the employee. Remote advises being as specific as possible, and include details about the employee’s response, if applicable.
         */
        note?: string | null;
    };
    /**
     * Remote will use this email address for post-termination communication.
     * If it is not provided, this field will be derived from the employment record. Therefore, it is important to ensure that it is not a company email.
     *
     */
    personal_email?: string;
    /**
     * In most cases, employee needs to be notified before termination. The required notice period depends on local labor laws, the employment agreement, and other factors. Remote will use those factors to determine the required notice period. Please note that we cannot commit to a termination date until we conduct a full review of the information you submit.
     */
    proposed_termination_date: string;
    /**
     * Description of the reason for termination
     */
    reason_description: string;
    /**
     * Possible reasons for offboarding risk assessment
     */
    risk_assessment_reasons: Array<'caring_responsibilities' | 'disabled_or_health_condition' | 'family_leave' | 'member_of_union_or_works_council' | 'none_of_these' | 'pregnant_or_breastfeeding' | 'reported_concerns_with_workplace' | 'requested_medical_or_family_leave' | 'sick_leave'>;
    /**
     * Choose an accurate termination reason to avoid unfair or unlawful dismissal claims.
     *
     * If the termination is created before the employee's start date, this field
     * will be set to `cancellation_before_start_date`.
     *
     */
    termination_reason: 'cancellation_before_start_date' | 'compliance_issue' | 'conversion_to_contractor' | 'dissatisfaction_with_remote_service' | 'end_of_fixed_term_contract_compliance_issue' | 'end_of_fixed_term_contract_incapacity_to_perform_inherent_duties' | 'end_of_fixed_term_contract_local_regulations_max_term_reached' | 'end_of_fixed_term_contract_misconduct' | 'end_of_fixed_term_contract_operational_reasons' | 'end_of_fixed_term_contract_other' | 'end_of_fixed_term_contract_performance' | 'end_of_fixed_term_contract_redundancy' | 'end_of_fixed_term_contract_values' | 'gross_misconduct' | 'incapacity_to_perform_inherent_duties' | 'job_abandonment' | 'mutual_agreement' | 'other' | 'performance' | 'values' | 'workforce_reduction';
    /**
     * Any supporting documents regarding the termination reason
     */
    termination_reason_files?: Array<OffboardingFile>;
    /**
     * Paid time off accuracy
     *
     * Typically, any vacation pay accrued and unpaid at the time
     * of termination must be paid out to the employee. To avoid overpaying or underpaying,
     * please make sure we have an accurate account of their paid time off by querying the
     * [Show Time Off Balance](#operation/get_show_timeoff_balance) endpoint,
     * filtering by the `employment_id`.
     * This optional document should be sent in case of any discrepancies.
     *
     */
    timesheet_file?: OffboardingFile;
    /**
     * Whether is it likely or not that the employee will challenge their termination
     */
    will_challenge_termination: boolean;
    /**
     * If it is likely that the employee will challenge their termination, please provide additional details explaining the risk
     */
    will_challenge_termination_description?: string;
};
/**
 * Date
 *
 * UTC date in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format
 */
type _Date = string;
/**
 * Cycle
 */
type Cycle = {
    employee_inclusion_cutoff_date?: string;
    end_date?: string;
    input_cutoff_date?: string;
    payment_date?: string;
    start_date?: string;
};
/**
 * ParameterError
 */
type ParameterError = {
    /**
     * An error code that describes the nature of the error.
     */
    code: string;
    /**
     * A developer friendly error message that gives details on what the error was and how it may be remedied.
     */
    message: string;
    /**
     * The parameter that lead to the error message.
     */
    param: string;
};
/**
 * GenericFile
 */
type GenericFile = Blob | File;
/**
 * CreateContractEligibilityParams
 */
type CreateContractEligibilityParams = {
    /**
     * type of employment eligibility to work in residing country
     */
    eligible_to_work_in_residing_country: 'citizen' | 'permanent_resident' | 'temporary_resident';
    /**
     * whether the employer or work restrictions apply
     */
    employer_or_work_restrictions: boolean;
};
/**
 * TimeoffType
 */
type TimeoffType = 'time_off' | 'sick_leave' | 'public_holiday' | 'unpaid_leave' | 'extended_leave' | 'in_lieu_time' | 'maternity_leave' | 'paternity_leave' | 'parental_leave' | 'bereavement' | 'military_leave' | 'other' | 'paid_time_off' | 'custom_company_leave' | 'rtt' | 'casual_leave' | 'rol' | 'ex_festivita';
/**
 * Decimal
 */
type Decimal = string;
/**
 * MessageResponse
 */
type MessageResponse = {
    message: string;
};
/**
 * CompanyNotEligibleForCreationErrorResponse
 *
 * Error returned when the company already have employees in countries supported by the integration.
 */
type CompanyNotEligibleForCreationErrorResponse = {
    code?: string;
    message?: string;
    resource_id?: string;
    resource_type?: string;
};
/**
 * SalaryDecreaseDetails
 *
 * The details of the salary decrease request if there is one
 */
type SalaryDecreaseDetails = {
    salary_decrease_reason?: 'change_in_working_hours' | 'trade_salary_for_equity' | 'error_in_initial_salary' | 'role_change_or_demotion' | 'compensation_restructure' | 'other';
    salary_decrease_reason_description?: string | null;
    was_employee_informed?: string;
} | null;
/**
 * ConvertCurrencyResponse
 *
 * The response from the currency converter
 */
type ConvertCurrencyResponse = {
    data: {
        conversion_data: ConvertCurrency;
    };
};
/**
 * RequestError
 */
type RequestError = {
    errors: {
        /**
         * An error code that describes the nature of the error.
         */
        code: string;
        /**
         * A developer friendly error message that gives details on what the error was and how it may be remedied.
         */
        message: string;
    };
};
/**
 * Timeoff
 */
type Timeoff = {
    approved_at?: string | null;
    approver_id?: NullableApproverId;
    automatic?: boolean;
    cancel_reason?: string | null;
    cancelled_at?: NullableDateTime;
    document?: File;
    employment_id: string;
    end_date: string;
    id: string;
    leave_policy: LeavePolicy;
    notes?: string | null;
    start_date: string;
    status: 'requested' | 'approved' | 'cancelled' | 'declined' | 'taken' | 'cancel_requested';
    timeoff_days: Array<TimeoffDay>;
    timeoff_type: TimeoffType;
    timezone: Timezone;
};
/**
 * EmploymentCreateParams
 *
 * Description of the basic required and onboarding tasks params to create an employment.
 * You do not need to include all onboarding tasks when creating or updating an employment.
 *
 */
type EmploymentCreateParams = {
    /**
     * Employment basic information. As its properties may vary depending on the country,
     * you must query the [Show form schema](#tag/Countries/operation/get_show_form_country) endpoint
     * passing the country code and `employment_basic_information` as path parameters.
     */
    basic_information: {
        [key: string]: unknown;
    };
    /**
     * This optional field is deprecated.
     */
    company_id?: string;
    country_code: string;
    /**
     * This field is required to create a global payroll employee.
     */
    engaged_by_entity_slug?: string;
    /**
     * A unique reference code for the employment record in a non-Remote system. This optional field links to external data sources. If not provided, it defaults to `null`. While uniqueness is recommended, it is not strictly enforced within Remote's system.
     */
    external_id?: string;
    /**
     * If not provided, it will default to `employee`.
     */
    type?: 'employee' | 'contractor' | 'global_payroll_employee' | 'hris';
};
/**
 * TimeoffStatus
 */
type TimeoffStatus = 'approved' | 'cancelled' | 'declined' | 'requested' | 'taken' | 'cancel_requested';
/**
 * ForbiddenResponse
 */
type ForbiddenResponse = {
    message: string;
};
/**
 * HelpCenterArticle
 *
 * Help Center Article
 */
type HelpCenterArticle = {
    /**
     * Body of the article
     */
    body: string;
    /**
     * HTML URL of the article
     */
    html_url: string;
    /**
     * Title of the article
     */
    title: string;
    /**
     * Zendesk ID of the article
     */
    zendesk_id: number;
};
/**
 * CompanyCreationConflictErrorResponse
 */
type CompanyCreationConflictErrorResponse = {
    message?: CompanyAlreadyExistsErrorResponse | CompanyNotEligibleForCreationErrorResponse;
};
/**
 * EmploymentResponse
 *
 * Complete information of an employment
 */
type EmploymentResponse = {
    data: {
        employment?: Employment;
    };
};
/**
 * ContractDocument
 *
 * ContractDocument schema
 */
type ContractDocument = {
    id: string;
    /**
     * Contract document status
     */
    status: 'draft' | 'awaiting_signatures' | 'finished' | 'archived' | 'revised' | 'awaiting_customer_approval' | 'approved_by_customer' | 'rejected_by_customer';
};
/**
 * ContractAmendmentResponse
 *
 * Contract Amendment response
 */
type ContractAmendmentResponse = {
    data?: {
        contract_amendment: ContractAmendment;
    };
};
/**
 * CreateContractDocumentResponse
 *
 * Contract document response
 */
type CreateContractDocumentResponse = {
    data: {
        contract_document: ContractDocument;
    };
};
type PostCreateEstimationErrors = {
    /**
     * Not Found
     */
    404: NotFoundResponse;
    /**
     * Unprocessable Entity
     */
    422: UnprocessableEntityResponse;
};
type PostCreateEstimationError = PostCreateEstimationErrors[keyof PostCreateEstimationErrors];
type PostCreateContractAmendmentErrors = {
    /**
     * Unauthorized
     */
    401: UnauthorizedResponse;
    /**
     * Not Found
     */
    404: NotFoundResponse;
    /**
     * Unprocessable Entity
     */
    422: UnprocessableEntityResponse;
};
type PostCreateContractAmendmentError = PostCreateContractAmendmentErrors[keyof PostCreateContractAmendmentErrors];
type GetShowEmploymentResponses = {
    /**
     * Success
     */
    200: EmploymentShowResponse;
};
type GetShowEmploymentResponse = GetShowEmploymentResponses[keyof GetShowEmploymentResponses];
type PostAutomatableContractAmendmentErrors = {
    /**
     * Unauthorized
     */
    401: UnauthorizedResponse;
    /**
     * Not Found
     */
    404: NotFoundResponse;
    /**
     * Unprocessable Entity
     */
    422: UnprocessableEntityResponse;
};
type PostAutomatableContractAmendmentError = PostAutomatableContractAmendmentErrors[keyof PostAutomatableContractAmendmentErrors];

export type { ConflictErrorResponse as $, CompanyResponse as A, BadRequestResponse as B, ContractAmendmentAutomatableResponse as C, UpdateCompanyParams as D, Employment as E, ForbiddenResponse as F, TerminationDetailsParams as G, UploadFileResponse as H, FileParams as I, SignContractDocument as J, ContractorSubscriptionsSummary as K, ManageContractorPlusSubscriptionOperationsParams as L, MinimalRegion as M, NotFoundResponse as N, OffboardingResponse as O, PostCreateContractAmendmentError as P, CreateContractDocument as Q, RequestError as R, SuccessResponse as S, TooManyRequestsResponse as T, UnprocessableEntityResponse as U, ValidationError as V, Country as W, File as X, DateTimeIso8601 as Y, ContractDocumentItem as Z, EligibilityQuestionnaireResponse as _, UnauthorizedResponse as a, SubmitEligibilityQuestionnaireRequest as a0, ListTimeoffResponse as a1, TimeoffStatus as a2, TimeoffType as a3, ListLeavePoliciesSummaryResponse as a4, CreateOffboardingParams as a5, MagicLinkResponse as a6, MagicLinkParams as a7, GetShowEmploymentResponse as a8, Currency as a9, HelpCenterArticle as aa, PayrollCalendarEor as ab, ContractAmendmentResponse as b, PostAutomatableContractAmendmentError as c, CostCalculatorEstimateResponse as d, CostCalculatorEstimatePdfResponse as e, CostCalculatorEstimateParams as f, CostCalculatorEstimateCsvResponse as g, EmploymentTermType as h, CostCalculatorEmployment as i, PostCreateEstimationError as j, EmploymentCreationResponse as k, EmploymentResponse as l, CreateContractDocumentResponse as m, Signatory as n, CompanyLegalEntity as o, Company as p, ConflictResponse as q, EmploymentCreateParams as r, EmploymentFullParams as s, UnifiedEmploymentUpsertBenefitOffersRequest as t, ConvertCurrencyResponse as u, ConvertCurrencyParams as v, CreateContractEligibilityParams as w, CompanyCreationResponse as x, CompanyCreationConflictErrorResponse as y, CreateCompanyParams as z };
