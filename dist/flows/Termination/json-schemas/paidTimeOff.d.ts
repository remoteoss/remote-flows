declare const paidTimeOffSchema: {
    data: {
        version: number;
        schema: {
            additionalProperties: boolean;
            allOf: {
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
            }[];
            properties: {
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
            };
            required: string[];
            type: string;
            'x-jsf-order': string[];
        };
    };
};

export { paidTimeOffSchema };
