declare const signatureSchema: {
    type: string;
    properties: {
        contract_preview_header: {
            type: string;
            title: string;
            description: string;
            'x-jsf-presentation': {
                inputType: string;
                meta: {
                    ignoreValue: boolean;
                };
            };
        };
        contract_preview_statement: {
            type: string;
            title: string;
            description: string;
            'x-jsf-presentation': {
                inputType: string;
                meta: {
                    ignoreValue: boolean;
                };
            };
        };
        review_completed: {
            type: string;
            'x-jsf-presentation': {
                inputType: string;
            };
            default: boolean;
        };
        signature: {
            type: string;
            'x-jsf-presentation': {
                inputType: string;
            };
            title: string;
            description: string;
        };
    };
    required: string[];
};

export { signatureSchema };
