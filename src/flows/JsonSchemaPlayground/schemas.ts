export const SAMPLE_SCHEMAS = {
  'france-wage-portage': {
    name: 'France Wage Portage Schema',
    description: 'Complex schema for France wage portage employment with conditional logic',
    schema: {
        "additionalProperties": false,
        "allOf": [
            {
                "else": {
                    "properties": {
                        "non_compete_clause_compensation_amount": false,
                        "non_compete_restricted_activities": false
                    }
                },
                "if": {
                    "properties": {
                        "annual_gross_salary": {
                            "type": "integer"
                        },
                        "non_compete_clause_apply": {
                            "const": "yes"
                        }
                    },
                    "required": [
                        "non_compete_clause_apply",
                        "annual_gross_salary"
                    ]
                },
                "then": {
                    "properties": {
                        "non_compete_clause_compensation_amount": {
                            "x-jsf-logic-computedAttrs": {
                                "const": "computed_non_compete_clause_compensation_amount_in_cents",
                                "default": "computed_non_compete_clause_compensation_amount_in_cents",
                                "x-jsf-presentation": {
                                    "statement": {
                                        "description": "The employee will receive this monthly compensation after termination for the entire non-compete period.",
                                        "title": "{{computed_non_compete_clause_compensation_amount}} XXX non-compete compensation amount"
                                    }
                                }
                            }
                        }
                    },
                    "required": [
                        "non_compete_clause_compensation_amount",
                        "non_compete_restricted_activities"
                    ]
                }
            },
            {
                "else": {
                    "properties": {
                        "non_compete_clause_compensation_amount": false,
                        "non_compete_clause_halt_period_months": false,
                        "non_compete_compensation_salary_percentage": false,
                        "non_compete_restricted_activities": false
                    }
                },
                "if": {
                    "properties": {
                        "non_compete_clause_apply": {
                            "const": "yes"
                        }
                    },
                    "required": [
                        "non_compete_clause_apply"
                    ]
                },
                "then": {
                    "required": [
                        "non_compete_compensation_salary_percentage",
                        "non_compete_clause_halt_period_months"
                    ]
                }
            },
            {
                "else": {
                    "properties": {
                        "mission_duration": false
                    }
                },
                "if": {
                    "properties": {
                        "contract_duration_type": {
                            "const": "indefinite"
                        }
                    },
                    "required": [
                        "contract_duration_type"
                    ]
                },
                "then": {
                    "required": [
                        "mission_duration"
                    ]
                }
            },
            {
                "if": {
                    "properties": {
                        "contract_duration_type": {
                            "const": "indefinite"
                        }
                    },
                    "required": [
                        "contract_duration_type"
                    ]
                },
                "then": {
                    "properties": {
                        "contract_duration_type": {
                            "oneOf": [
                                {
                                    "const": "indefinite",
                                    "description": "After this period, the engagement must end unless it qualifies as a new assignment with a different scope.",
                                    "title": "Indefinite contract with <strong>36 months max duration</strong> for France."
                                },
                                {
                                    "const": "fixed_term",
                                    "nested_fields": [
                                        "contract_end_date"
                                    ],
                                    "title": "Fixed-term contract"
                                }
                            ]
                        }
                    }
                }
            },
            {
                "else": {
                    "properties": {
                        "contract_end_date": false
                    }
                },
                "if": {
                    "properties": {
                        "contract_duration_type": {
                            "const": "fixed_term"
                        }
                    },
                    "required": [
                        "contract_duration_type"
                    ]
                },
                "then": {
                    "properties": {
                        "contract_end_date": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "contract_end_date"
                    ]
                }
            },
            {
                "else": {
                    "else": {
                        "properties": {
                            "business_allowance_ack": false,
                            "business_allowances_statement": false,
                            "home_office_allowance": false
                        }
                    },
                    "if": {
                        "properties": {
                            "contract_duration_type": {
                                "const": "fixed_term"
                            }
                        },
                        "required": [
                            "contract_duration_type"
                        ]
                    },
                    "then": {
                        "properties": {
                            "business_allowance_ack": {
                                "title": "I understand the 5% allowance applies each month and a 10% indemnity is paid in addition to the employee's total earnings at the end of their contract."
                            },
                            "business_allowances_statement": {
                                "x-jsf-logic-computedAttrs": {
                                    "x-jsf-presentation": {
                                        "statement": {
                                            "description": "<strong>Mandatory allowances</strong><br /><br />Under French Wage Portage regulations, the following amounts are required by law. We automatically applied them based on the employee's gross salary.<br /><ul><li>Mandatory 5% allowance: {{computed_business_allowance_display}} EUR</li><li>Mandatory 10% Indemnity (end of contract): {{computed_financial_reserve_display}} EUR</li><li>Annual gross salary: {{computed_annual_gross_salary_display}} EUR</li><li><strong>Total annual gross salary and mandatory allowance:</strong> {{computed_total_with_allowance_display}} EUR</li></ul>"
                                        }
                                    }
                                }
                            }
                        },
                        "required": [
                            "business_allowance_ack",
                            "home_office_allowance"
                        ]
                    }
                },
                "if": {
                    "properties": {
                        "contract_duration_type": {
                            "const": "indefinite"
                        }
                    },
                    "required": [
                        "contract_duration_type"
                    ]
                },
                "then": {
                    "required": [
                        "business_allowance_ack",
                        "home_office_allowance"
                    ]
                }
            },
            {
                "else": {
                    "properties": {
                        "business_allowance_ack": false,
                        "business_allowances_statement": false,
                        "home_office_allowance": false
                    }
                },
                "if": {
                    "properties": {
                        "annual_gross_salary": {
                            "type": "integer"
                        }
                    },
                    "required": [
                        "annual_gross_salary"
                    ]
                },
                "then": {}
            },
            {
                "else": {
                    "properties": {
                        "business_allowance_amount": false,
                        "financial_reserve_amount": false
                    }
                },
                "if": {
                    "properties": {
                        "annual_gross_salary": {
                            "type": "integer"
                        }
                    },
                    "required": [
                        "annual_gross_salary"
                    ]
                },
                "then": {
                    "properties": {
                        "business_allowance_amount": {
                            "x-jsf-logic-computedAttrs": {
                                "const": "computed_business_allowance_amount",
                                "default": "computed_business_allowance_amount"
                            }
                        },
                        "financial_reserve_amount": {
                            "x-jsf-logic-computedAttrs": {
                                "const": "computed_financial_reserve_amount",
                                "default": "computed_financial_reserve_amount"
                            }
                        }
                    }
                }
            }
        ],
        "properties": {
            "non_compete_clause_apply": {
                "description": "Prevents the employee from joining or starting a competing business. Not allowed during employment under French Wage Portage law. Post-termination only, with limits and required compensation.",
                "oneOf": [
                    {
                        "const": "yes",
                        "title": "Yes"
                    },
                    {
                        "const": "no",
                        "title": "No"
                    }
                ],
                "title": "Do you want to apply post-termination restrictions (non-compete)?",
                "type": "string",
                "x-jsf-presentation": {
                    "direction": "row",
                    "inputType": "radio"
                }
            },
            "contract_duration_type": {
                "description": "Under French Wage Portage regulations, assignments with the same client are limited to 18 months for fixed-term contracts and 36 months for indefinite contracts.",
                "oneOf": [
                    {
                        "const": "indefinite",
                        "title": "Indefinite contract with <strong>36 months max duration</strong> for France."
                    },
                    {
                        "const": "fixed_term",
                        "nested_fields": [
                            "contract_end_date"
                        ],
                        "title": "Fixed-term contract"
                    }
                ],
                "title": "Contract duration",
                "type": "string",
                "x-jsf-presentation": {
                    "direction": "column",
                    "inputType": "radio"
                }
            },
            "contract_end_date": {
                "description": "Fixed-term contracts are limited to a maximum duration of 18 months.",
                "format": "date",
                "maxLength": 255,
                "title": "Contract end date",
                "type": [
                    "string",
                    "null"
                ],
                "x-jsf-presentation": {
                    "inputType": "date",
                    "maxDate": "2028-03-02",
                    "minDate": "2026-09-03"
                }
            },
            "annual_gross_salary": {
                "description": "Enter the employee's annual gross base salary. This amount is used to calculate payroll and must meet the legal minimum in France.",
                "title": "Annual gross salary",
                "type": "integer",
                "x-jsf-errorMessage": {
                    "type": "Please, use US standard currency format. Ex: 1024.12"
                },
                "x-jsf-presentation": {
                    "currency": "EUR",
                    "inputType": "money"
                }
            },
            "business_allowance_ack": {
                "const": "acknowledged",
                "title": "I understand that the 5% allowance applies automatically. A mandatory, non-waivable 10% financial reserve is withheld from the employees monthly base salary during assignments.",
                "type": "string",
                "x-jsf-presentation": {
                    "inputType": "checkbox"
                }
            },
            "home_office_allowance": {
                "description": "Covers the employee's fixed home-office expenses (such as rent, utilities, or insurance). Minimum is 25 EUR per month. This allowance is paid on top of their gross salary.",
                "minimum": 2500,
                "title": "Home office allowance (Forfait télétravail)",
                "type": "integer",
                "x-jsf-errorMessage": {
                    "minimum": "Must be at least €25.00.",
                    "type": "Please, use US standard currency format. Ex: 1024.12"
                },
                "x-jsf-presentation": {
                    "currency": "EUR",
                    "inputType": "money"
                }
            },
            "mission_duration": {
                "description": "The minimum expected duration of the mission. Missions can have a maximum duration of 36 months for employees.",
                "maximum": 36,
                "minimum": 1,
                "title": "Mission duration (months)",
                "type": "number",
                "x-jsf-presentation": {
                    "inputType": "number"
                }
            },
            "non_compete_clause_halt_period_months": {
                "description": "Non-compete clauses in France can last between 1 and 12 months. The clause begins after the termination of the employment agreement.",
                "maximum": 12,
                "minimum": 1,
                "title": "Duration in months",
                "type": "number",
                "x-jsf-presentation": {
                    "inputType": "number"
                }
            },
            "non_compete_compensation_salary_percentage": {
                "default": 30,
                "description": "In France, non-compete pay must be 30% of monthly base salary throughout the post termination restrictions.",
                "readOnly": true,
                "title": "Non-compete salary percentage",
                "type": "number",
                "x-jsf-presentation": {
                    "inputType": "number",
                    "percentage": true,
                    "readOnly": true,
                    "value": 30
                }
            },
            "non_compete_clause_compensation_amount": {
                "description": "The employee will receive this monthly compensation after termination for the entire non-compete period.",
                "title": "Non-compete compensation amount",
                "type": "integer",
                "x-jsf-errorMessage": {
                    "type": "Please, use US standard currency format. Ex: 1024.12"
                },
                "x-jsf-presentation": {
                    "currency": "EUR",
                    "inputType": "money"
                }
            },
            "non_compete_restricted_activities": {
                "description": "Please define the specific professional activities the employee is prohibited from engaging in after leaving the company.",
                "maxLength": 5000,
                "minLength": 20,
                "title": "Restricted activities",
                "type": "string",
                "x-jsf-presentation": {
                    "inputType": "textarea"
                }
            },
            "business_allowance_amount": {
                "title": "Business allowance amount",
                "type": "integer",
                "x-jsf-errorMessage": {
                    "type": "Please, use US standard currency format. Ex: 1024.12"
                },
                "x-jsf-presentation": {
                    "currency": "EUR",
                    "inputType": "money"
                }
            },
            "financial_reserve_amount": {
                "title": "Financial reserve amount",
                "type": "integer",
                "x-jsf-errorMessage": {
                    "type": "Please, use US standard currency format. Ex: 1024.12"
                },
                "x-jsf-presentation": {
                    "currency": "EUR",
                    "inputType": "money"
                }
            },
            "business_allowances_statement": {
                "title": "Mandatory allowances",
                "type": "null",
                "x-jsf-logic-computedAttrs": {
                    "x-jsf-presentation": {
                        "statement": {
                            "description": "<strong>Mandatory allowances</strong><br /><br />Under French Wage Portage regulations, the following amounts are required by law."
                        }
                    }
                },
                "x-jsf-presentation": {
                    "inputType": "hidden",
                    "statement": {
                        "inputType": "statement",
                        "severity": "info"
                    }
                }
            }
        },
        "required": [
            "contract_duration_type",
            "annual_gross_salary"
        ],
        "type": "object",
        "x-jsf-logic": {
            "computedValues": {
                "computed_business_allowance_amount": {
                    "rule": {
                        "if": [
                            {
                                "var": "annual_gross_salary"
                            },
                            {
                                "-": [
                                    {
                                        "*": [
                                            {
                                                "var": "annual_gross_salary"
                                            },
                                            {
                                                "/": [
                                                    5,
                                                    100
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "%": [
                                            {
                                                "*": [
                                                    {
                                                        "var": "annual_gross_salary"
                                                    },
                                                    {
                                                        "/": [
                                                            5,
                                                            100
                                                        ]
                                                    }
                                                ]
                                            },
                                            1
                                        ]
                                    }
                                ]
                            },
                            null
                        ]
                    }
                },
                "computed_financial_reserve_amount": {
                    "rule": {
                        "if": [
                            {
                                "var": "annual_gross_salary"
                            },
                            {
                                "-": [
                                    {
                                        "*": [
                                            {
                                                "var": "annual_gross_salary"
                                            },
                                            {
                                                "/": [
                                                    10,
                                                    100
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "%": [
                                            {
                                                "*": [
                                                    {
                                                        "var": "annual_gross_salary"
                                                    },
                                                    {
                                                        "/": [
                                                            10,
                                                            100
                                                        ]
                                                    }
                                                ]
                                            },
                                            1
                                        ]
                                    }
                                ]
                            },
                            null
                        ]
                    }
                }
            }
        },
        "x-rmt-meta": {
            "jsfVersion": "1"
        }
    }
  },
  'simple-user-profile': {
    name: 'Simple User Profile Schema',
    description: 'A basic user profile form for testing basic field types',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        firstName: {
          type: 'string',
          title: 'First Name',
          minLength: 2,
          maxLength: 50,
          'x-jsf-presentation': {
            inputType: 'text'
          }
        },
        lastName: {
          type: 'string',
          title: 'Last Name',
          minLength: 2,
          maxLength: 50,
          'x-jsf-presentation': {
            inputType: 'text'
          }
        },
        email: {
          type: 'string',
          title: 'Email Address',
          format: 'email',
          'x-jsf-presentation': {
            inputType: 'email'
          }
        },
        age: {
          type: 'number',
          title: 'Age',
          minimum: 18,
          maximum: 120,
          'x-jsf-presentation': {
            inputType: 'number'
          }
        },
        country: {
          type: 'string',
          title: 'Country',
          oneOf: [
            { const: 'US', title: 'United States' },
            { const: 'CA', title: 'Canada' },
            { const: 'UK', title: 'United Kingdom' },
            { const: 'DE', title: 'Germany' },
            { const: 'FR', title: 'France' }
          ],
          'x-jsf-presentation': {
            inputType: 'select'
          }
        },
        subscribe: {
          type: 'boolean',
          title: 'Subscribe to newsletter',
          'x-jsf-presentation': {
            inputType: 'checkbox'
          }
        }
      },
      required: ['firstName', 'lastName', 'email', 'country'],
      'x-rmt-meta': {
        jsfVersion: '1'
      }
    }
  }
} as const;

export type SchemaKey = keyof typeof SAMPLE_SCHEMAS;