declare const employeeComunicationSchema: {
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
            })[];
            properties: {
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

export { employeeComunicationSchema };
