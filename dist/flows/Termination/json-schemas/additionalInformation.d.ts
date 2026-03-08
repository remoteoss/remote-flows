declare const additionalInformationSchema: {
    data: {
        version: number;
        schema: {
            additionalProperties: boolean;
            allOf: never[];
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
            };
            required: string[];
            type: string;
            'x-jsf-order': string[];
        };
    };
};

export { additionalInformationSchema };
