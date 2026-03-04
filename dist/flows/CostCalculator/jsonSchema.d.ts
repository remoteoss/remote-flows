declare const jsonSchema: {
    data: {
        version: number;
        schema: {
            additionalProperties: boolean;
            properties: {
                country: {
                    title: string;
                    description: string;
                    type: string;
                    oneOf: never[];
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                region: {
                    title: string;
                    description: string;
                    type: string;
                    oneOf: never[];
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                currency: {
                    title: string;
                    description: string;
                    type: string;
                    oneOf: never[];
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                currency_statement: {
                    type: string;
                    title: string;
                    'x-jsf-presentation': {
                        inputType: string;
                        hidden: boolean;
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
                hiring_budget: {
                    title: string;
                    enum: string[];
                    type: string;
                    oneOf: {
                        title: string;
                        const: string;
                    }[];
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                salary: {
                    description: string;
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                estimation_title: {
                    title: string;
                    description: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                        hidden: boolean;
                    };
                };
                salary_conversion: {
                    description: string;
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                        hidden: boolean;
                    };
                };
                salary_converted: {
                    description: string;
                    title: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                        hidden: boolean;
                    };
                };
                management: {
                    title: string;
                    type: string;
                    properties: {
                        management_fee: {
                            title: string;
                            type: string;
                            'x-jsf-presentation': {
                                inputType: string;
                            };
                        };
                        _expanded: {
                            type: string;
                            default: boolean;
                            'x-jsf-presentation': {
                                inputType: string;
                                hidden: boolean;
                            };
                        };
                    };
                    'x-jsf-presentation': {
                        inputType: string;
                        hidden: boolean;
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
