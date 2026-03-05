declare const selectCountryStepSchema: {
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
            };
            required: string[];
            type: string;
            'x-jsf-order': string[];
        };
    };
};

export { selectCountryStepSchema };
