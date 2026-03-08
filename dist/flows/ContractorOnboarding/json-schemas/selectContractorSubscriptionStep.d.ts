declare const selectContractorSubscriptionStepSchema: {
    data: {
        version: number;
        schema: {
            additionalProperties: boolean;
            properties: {
                subscription: {
                    title: string;
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

export { selectContractorSubscriptionStepSchema };
