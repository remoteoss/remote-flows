declare const terminationDetailsSchema: {
    data: {
        version: number;
        schema: {
            additionalProperties: boolean;
            allOf: {
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
            }[];
            properties: {
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
            };
            required: string[];
            type: string;
            'x-jsf-order': string[];
        };
    };
};

export { terminationDetailsSchema };
