declare const jsonSchema: {
    data: {
        version: number;
        schema: {
            additionalProperties: boolean;
            allOf: ({
                if: {
                    properties: {
                        personal_email: {
                            pattern: string;
                        };
                        customer_informed_employee?: undefined;
                    };
                    required?: undefined;
                };
                then: {
                    properties: {
                        personal_email: {
                            'x-jsf-presentation': {
                                statement: {
                                    title: string;
                                    inputType: string;
                                    severity: string;
                                };
                            };
                        };
                        customer_informed_employee_date?: undefined;
                        customer_informed_employee_description?: undefined;
                    };
                    required?: undefined;
                };
                else?: undefined;
            } | {
                if: {
                    properties: {
                        customer_informed_employee: {
                            const: string;
                        };
                        personal_email?: undefined;
                    };
                    required: string[];
                };
                then: {
                    properties: {
                        customer_informed_employee_date: {
                            type: string;
                        };
                        customer_informed_employee_description: {
                            type: string;
                        };
                        personal_email?: undefined;
                    };
                    required: string[];
                };
                else: {
                    properties: {
                        customer_informed_employee_date: boolean;
                        customer_informed_employee_description: boolean;
                    };
                };
            } | {
                if: {
                    properties: {
                        agrees_to_pto_amount: {
                            const: string;
                        };
                    };
                    required: string[];
                };
                then: {
                    properties: {
                        agrees_to_pto_amount_notes: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                else: {
                    properties: {
                        agrees_to_pto_amount_notes: boolean;
                        timesheet_file: boolean;
                    };
                };
            } | {
                if: {
                    properties: {
                        will_challenge_termination: {
                            const: string;
                        };
                    };
                    required: string[];
                };
                then: {
                    properties: {
                        will_challenge_termination_description: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                else: {
                    properties: {
                        will_challenge_termination_description: boolean;
                    };
                };
            })[];
            properties: {
                acknowledge_termination_procedure_info: {
                    type: string;
                    title: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                    meta: {
                        ignoreValue: boolean;
                    };
                };
                acknowledge_termination_procedure: {
                    description: string;
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        direction: string;
                        inputType: string;
                    };
                };
                acknowledge_termination_procedure_fees_info: {
                    type: string;
                    title: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                timeoff_statement: {
                    type: string;
                    title: string;
                    'x-jsf-presentation': {
                        inputType: string;
                        statement: {
                            title: string;
                            description: string;
                            inputType: string;
                            severity: string;
                        };
                        meta: {
                            ignoreValue: boolean;
                        };
                    };
                };
                paid_time_off_info: {
                    type: string;
                    title: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                    meta: {
                        ignoreValue: boolean;
                    };
                };
                agrees_to_pto_amount: {
                    description: string;
                    oneOf: {
                        const: string;
                        description: string;
                        title: string;
                    }[];
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        direction: string;
                        inputType: string;
                    };
                };
                agrees_to_pto_amount_notes: {
                    description: string;
                    maxLength: number;
                    title: string;
                    type: string[];
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                timesheet_file: {
                    description: string;
                    title: string;
                    type: string[];
                    'x-jsf-presentation': {
                        inputType: string;
                        accept: string;
                        maxSize: number;
                    };
                };
                termination_reason: {
                    title: string;
                    description: string;
                    type: string;
                    oneOf: {
                        const: string;
                        title: string;
                    }[];
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                reason_description: {
                    description: string;
                    maxLength: number;
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                additional_comments: {
                    description: string;
                    maxLength: number;
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                termination_reason_files: {
                    description: string;
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                        accept: string;
                        multiple: boolean;
                        maxSize: number;
                    };
                };
                risk_assesment_info: {
                    description: string;
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                risk_assessment_reasons: {
                    description: string;
                    title: string;
                    type: string;
                    items: {
                        anyOf: {
                            const: string;
                            title: string;
                        }[];
                    };
                    'x-jsf-presentation': {
                        inputType: string;
                        direction: string;
                    };
                };
                will_challenge_termination: {
                    description: string;
                    oneOf: {
                        const: string;
                        description: string;
                        title: string;
                    }[];
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        direction: string;
                        inputType: string;
                    };
                };
                will_challenge_termination_description: {
                    description: string;
                    maxLength: number;
                    title: string;
                    type: string[];
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                proposed_termination_date_info: {
                    description: string;
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                proposed_termination_date: {
                    description: string;
                    format: string;
                    maxLength: number;
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                confidential: {
                    description: string;
                    oneOf: {
                        const: string;
                        description: string;
                        title: string;
                    }[];
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        direction: string;
                        inputType: string;
                        statement: {
                            title: string;
                            description: string;
                            inputType: string;
                            severity: string;
                        };
                    };
                };
                customer_informed_employee: {
                    description: string;
                    oneOf: {
                        const: string;
                        description: string;
                        title: string;
                    }[];
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        direction: string;
                        inputType: string;
                    };
                };
                customer_informed_employee_date: {
                    description: string;
                    format: string;
                    maxLength: number;
                    title: string;
                    type: string[];
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                customer_informed_employee_description: {
                    description: string;
                    maxLength: number;
                    title: string;
                    type: string[];
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                personal_email: {
                    description: string;
                    maxLength: number;
                    title: string;
                    format: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
            };
            required: string[];
            type: string;
            'x-jsf-order': string[];
        };
    };
};

export { jsonSchema };
