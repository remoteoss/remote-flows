declare const companyBasicInformationStepSchema: {
    data: {
        version: number;
        schema: {
            additionalProperties: boolean;
            properties: {
                country_code: {
                    title: string;
                    description: string;
                    type: string;
                    oneOf: never[];
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                company_owner_email: {
                    title: string;
                    description: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                company_owner_name: {
                    title: string;
                    description: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                desired_currency: {
                    title: string;
                    description: string;
                    type: string;
                    oneOf: never[];
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                name: {
                    title: string;
                    description: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                phone_number: {
                    title: string;
                    description: string;
                    type: string;
                    'x-jsf-presentation': {
                        inputType: string;
                    };
                };
                tax_number: {
                    title: string;
                    description: string;
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

export { companyBasicInformationStepSchema };
