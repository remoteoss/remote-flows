export const basicInformationSchema = {
  data: {
    additionalProperties: false,
    allOf: [
      {
        else: {
          properties: {
            seniority_date: false,
          },
        },
        if: {
          properties: {
            has_seniority_date: {
              const: 'yes',
            },
          },
          required: ['has_seniority_date'],
        },
        then: {
          required: ['seniority_date'],
        },
      },
    ],
    properties: {
      department: {
        properties: {
          id: {
            description: '(Optional) Select a department or create one.',
            oneOf: [
              {
                const: '4b771740-2db0-4e7d-a32f-78afd42c2b3a',
                title: 'Cdena',
              },
              {
                const: 'f0cd40da-8b2d-44ab-a470-fe36edbd4099',
                title: 'Cenas',
              },
              {
                const: 'c1b7df63-c93f-49f7-9d7f-b3a229e4bfb0',
                title: 'Cenasas',
              },
              {
                const: 'e854eec0-d748-45a1-9261-5836209e0413',
                title: 'Cneasa',
              },
              {
                const: '5376d164-8611-48f5-9999-26be6c3b0b8b',
                title: 'Hey',
              },
              {
                const: 'de200de4-949e-4f77-8830-b684bfb1efda',
                title: 'Joao',
              },
              {
                const: '7df585c4-ef3a-4d0d-a128-1d295fcfe9c0',
                title: 'Porto',
              },
              {
                const: '0c6792c0-9247-4123-ae32-95047f87a10a',
                title: 'Whatever',
              },
              {
                const: 'c7fc0bd2-cc07-46cb-b626-19b3a30cdb28',
                title: 'ceaas',
              },
              {
                const: '6fc72e1d-83ea-4b87-8f49-0f229df4a012',
                title: 'cenas cenas',
              },
              {
                const: '77d237ea-ad43-4f19-8993-b4ae9a973fe4',
                title: 'cesdf',
              },
              {
                const: '0e560251-8d98-4f0a-b82c-82319a757123',
                title: 'cewf',
              },
              {
                const: '9e000c9e-68f3-4d86-862c-54503973117e',
                title: 'sdf',
              },
              {
                const: 'b4fcc6e4-f77c-4ce1-847d-4c6351ca862b',
                title: 'sdg',
              },
              {
                const: 'c05ce0e2-e97f-443f-a2b6-d2eef504ae55',
                title: 'siodugnb',
              },
              {
                const: null,
              },
            ],
            title: 'Department',
            type: ['string', 'null'],
            'x-jsf-presentation': {
              creatableOn: 'name',
              inputType: 'select',
              meta: 'departments',
              placeholder: 'Search or create a department...',
            },
          },
          name: {
            description:
              'Name of the department to be created if none is selected',
            maxLength: 255,
            title: 'Department name',
            type: ['string', 'null'],
            'x-jsf-presentation': {
              inputType: 'text',
            },
          },
        },
        title: 'Department',
        type: ['object', 'null'],
        'x-jsf-order': ['id', 'name'],
        'x-jsf-presentation': {
          inputType: 'fieldset',
        },
      },
      email: {
        description: 'This is how the employee will access their account.',
        format: 'email',
        maxLength: 255,
        title: 'Personal email',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'email',
        },
      },
      has_seniority_date: {
        description:
          'If the employee started working for your company before being added to Remote, then select Yes.',
        oneOf: [
          {
            const: 'yes',
            title: 'Yes',
          },
          {
            const: 'no',
            title: 'No',
          },
        ],
        title: 'Does the employee have a seniority date?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
      job_title: {
        description:
          'We can hire most roles but there are some we cannot support. This includes licensed roles, blue collar workers, and employees with certain C-level job titles.',
        maxLength: 255,
        pattern: '\\S',
        title: 'Job title',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'text',
        },
      },
      manager: {
        properties: {
          id: {
            description:
              '(Optional) The person who will manage this employee day-to-day on the Remote platform.',
            oneOf: [
              {
                const: 'a8a99466-a159-4bef-a9e1-0cb6939542e1',
                title: 'Michelll sdassPustomer',
                'x-jsf-presentation': {
                  meta: {
                    assigned_roles: [
                      {
                        data_scope: 'all',
                        name: 'Owner',
                        slug: 'c982f8f7-373e-4825-bdbe-c13cb086e64f',
                        type: 'owner',
                      },
                    ],
                  },
                },
              },
              {
                const: '538a0939-112c-43e8-9a3e-e20d0cd1e7de',
                title: 'dgsdg',
                'x-jsf-presentation': {
                  meta: {
                    assigned_roles: [
                      {
                        data_scope: 'direct_reports',
                        name: 'People Manager',
                        slug: '63833283-1da7-4cac-b3dd-45ae64387655',
                        type: 'people_manager',
                      },
                    ],
                  },
                },
              },
              {
                const: '3c0ae46b-3cdb-4d54-9488-3d86f61add4a',
                title: 'gabriel',
                'x-jsf-presentation': {
                  meta: {
                    assigned_roles: [
                      {
                        data_scope: 'all',
                        name: 'Super Admin',
                        slug: '9d987fce-1797-4f1c-b0a2-ef290d1dc1bb',
                        type: 'template',
                      },
                    ],
                  },
                },
              },
              {
                const: null,
              },
            ],
            title: 'Manager',
            type: ['string', 'null'],
            'x-jsf-presentation': {
              inputType: 'select',
              meta: 'team_members',
              placeholder: 'Select a manager',
            },
          },
        },
        title: 'Manager',
        type: ['object', 'null'],
        'x-jsf-order': ['id'],
        'x-jsf-presentation': {
          inputType: 'fieldset',
        },
      },
      name: {
        description:
          'Full employee name as it appears on identification document.',
        maxLength: 255,
        pattern: '\\S',
        title: 'Full name',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'text',
        },
      },
      provisional_start_date: {
        description:
          'The minimum onboarding time for Portugal is 5 working days. We will confirm the start date once you invite the employee to do the self-enrollment. We strongly recommend a later start date if you plan to conduct background checks and want to lower termination risks and costs due to unsatisfactory results.',
        format: 'date',
        maxLength: 255,
        title: 'Provisional start date',
        type: 'string',
        'x-jsf-logic-validations': ['blocked_date_validation'],
        'x-jsf-presentation': {
          blockedDates: [],
          inputType: 'date',
          meta: {
            mot: 0,
          },
          minDate: '2025-05-01',
          softBlockedDates: [],
        },
      },
      seniority_date: {
        description: 'Please indicate if different from contract start date',
        format: 'date',
        title: 'Seniority date',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'date',
        },
      },
      tax_job_category: {
        oneOf: [
          {
            const: 'operations',
            title: 'Operations',
          },
          {
            const: 'finance',
            title: 'Finance',
          },
          {
            const: 'legal',
            title: 'Legal/Paralegal',
          },
          {
            const: 'engineering_it',
            title: 'Engineering/IT',
          },
          {
            const: 'growth_marketing',
            title: 'Growth & Marketing',
          },
          {
            const: 'sales',
            title: 'Sales',
          },
          {
            const: 'customer_experience_support',
            title: 'Customer Experience/Support',
          },
          {
            const: 'people_mobility',
            title: 'People and mobility',
          },
          {
            const: 'techops_supply_chain',
            title: 'Techops/Supply Chain',
          },
          {
            const: 'business_process_improvement_product_management',
            title: 'Business Process Improvement / Product Management',
          },
          {
            const: 'research_development',
            title: 'Research & Development',
          },
          {
            const: 'onboarding_payroll',
            title: 'Onboarding & Payroll',
          },
        ],
        title: 'What is the main job category that the employee performs?',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      tax_servicing_countries: {
        items: {
          enum: [
            null,
            'Åland Islands',
            'Zimbabwe',
            'Zambia',
            'Yemen',
            'Western Sahara',
            'Wallis and Futuna Islands',
            'Vietnam',
            'Venezuela',
            'Vatican City (Holy See)',
            'Vanuatu',
            'Uzbekistan',
            'Uruguay',
            'United States Minor Outlying Islands',
            'United States',
            'United Kingdom (UK)',
            'United Arab Emirates (UAE)',
            'Ukraine',
            'Uganda',
            'U.S. Virgin Islands',
            'Tuvalu',
            'Turks and Caicos Islands',
            'Turkmenistan',
            'Turkey',
            'Tunisia',
            'Trinidad and Tobago',
            'Tonga',
            'Tokelau',
            'Togo',
            'Timor-Leste',
            'Thailand',
            'Tanzania',
            'Tajikistan',
            'Taiwan',
            'Syrian Arab Republic',
            'Switzerland',
            'Sweden',
            'Swaziland',
            'Svalbard and Jan Mayen',
            'Suriname',
            'Sudan',
            'Sri Lanka',
            'Spain',
            'South Sudan',
            'South Korea',
            'South Georgia and the South Sandwich Islands',
            'South Africa',
            'Somalia',
            'Solomon Islands',
            'Slovenia',
            'Slovakia',
            'Sint Maarten (Dutch part)',
            'Singapore',
            'Sierra Leone',
            'Seychelles',
            'Serbia',
            'Senegal',
            'Saudi Arabia',
            'Sao Tome and Principe',
            'San Marino',
            'Samoa',
            'Saint Vincent and the Grenadines',
            'Saint Pierre and Miquelon',
            'Saint Martin (French part)',
            'Saint Lucia',
            'Saint Kitts and Nevis',
            'Saint Helena',
            'Saint Barthélemy',
            'Réunion',
            'Rwanda',
            'Russia',
            'Romania',
            'Republic of the Congo',
            'Qatar',
            'Puerto Rico',
            'Portugal',
            'Poland',
            'Pitcairn',
            'Philippines',
            'Peru',
            'Paraguay',
            'Papua New Guinea',
            'Panama',
            'Palestine',
            'Palau',
            'Pakistan',
            'Oman',
            'Norway',
            'Northern Mariana Islands',
            'North Macedonia',
            'Norfolk Island',
            'Niue',
            'Nigeria',
            'Niger',
            'Nicaragua',
            'New Zealand',
            'New Caledonia',
            'Netherlands',
            'Nepal',
            'Nauru',
            'Namibia',
            'Myanmar (Burma)',
            'Mozambique',
            'Morocco',
            'Montserrat',
            'Montenegro',
            'Mongolia',
            'Monaco',
            'Moldova',
            'Micronesia',
            'Mexico',
            'Mayotte',
            'Mauritius',
            'Mauritania',
            'Martinique',
            'Marshall Islands',
            'Malta',
            'Mali',
            'Maldives',
            'Malaysia',
            'Malawi',
            'Madagascar',
            'Macao',
            'Luxembourg',
            'Lithuania',
            'Liechtenstein',
            'Libya',
            'Liberia',
            'Lesotho',
            'Lebanon',
            'Latvia',
            'Laos',
            'Kyrgyzstan',
            'Kuwait',
            'Kosovo',
            "Korea, Democratic People's Republic of",
            'Kiribati',
            'Kenya',
            'Kazakhstan',
            'Jordan',
            'Jersey',
            'Japan',
            'Jamaica',
            'Italy',
            'Israel',
            'Isle of Man',
            'Ireland',
            'Iraq',
            'Iran, Islamic Republic of',
            'Indonesia',
            'India',
            'Iceland',
            'Hungary',
            'Hong Kong',
            'Honduras',
            'Heard Island and McDonald Islands',
            'Haiti',
            'Guyana',
            'Guinea-Bissau',
            'Guinea',
            'Guernsey',
            'Guatemala',
            'Guam',
            'Guadeloupe',
            'Grenada',
            'Greenland',
            'Greece',
            'Gibraltar',
            'Ghana',
            'Germany',
            'Georgia',
            'Gambia',
            'Gabon',
            'French Southern Territories',
            'French Polynesia',
            'French Guiana',
            'France',
            'Finland',
            'Fiji',
            'Faroe Islands',
            'Falkland Islands (Malvinas)',
            'Ethiopia',
            'Estonia',
            'Eritrea',
            'Equatorial Guinea',
            'El Salvador',
            'Egypt',
            'Ecuador',
            'Dominican Republic',
            'Dominica',
            'Djibouti',
            'Denmark',
            'Democratic Republic of the Congo',
            'Czech Republic',
            'Cyprus',
            'Curacao',
            'Cuba',
            'Croatia',
            "Cote d'Ivoire",
            'Costa Rica',
            'Cook Islands',
            'Comoros',
            'Colombia',
            'Cocos (Keeling) Islands',
            'Christmas Island',
            'China',
            'Chile',
            'Chad',
            'Central African Republic (CAR)',
            'Cayman Islands',
            'Canada',
            'Cameroon',
            'Cambodia',
            'Cabo Verde',
            'Burundi',
            'Burkina Faso',
            'Bulgaria',
            'Brunei',
            'British Virgin Islands',
            'British Indian Ocean Territory',
            'Brazil',
            'Bouvet Island',
            'Botswana',
            'Bosnia and Herzegovina',
            'Bonaire, Sint Eustatius and Saba',
            'Bolivia',
            'Bhutan',
            'Bermuda',
            'Benin',
            'Belize',
            'Belgium',
            'Belarus',
            'Barbados',
            'Bangladesh',
            'Bahrain',
            'Bahamas',
            'Azerbaijan',
            'Austria',
            'Australia',
            'Aruba',
            'Armenia',
            'Argentina',
            'Antigua and Barbuda',
            'Antarctica',
            'Anguilla',
            'Angola',
            'Andorra',
            'American Samoa',
            'Algeria',
            'Albania',
            'Afghanistan',
          ],
        },
        title: 'What region(s) is the employee working for?',
        type: ['array', 'null'],
        uniqueItems: true,
        'x-jsf-presentation': {
          $meta: {
            regions: {
              Africa: [
                'Algeria',
                'Angola',
                'Benin',
                'Botswana',
                'British Indian Ocean Territory',
                'Burkina Faso',
                'Burundi',
                'Cabo Verde',
                'Cameroon',
                'Central African Republic (CAR)',
                'Chad',
                'Comoros',
                "Cote d'Ivoire",
                'Democratic Republic of the Congo',
                'Djibouti',
                'Egypt',
                'Equatorial Guinea',
                'Eritrea',
                'Ethiopia',
                'French Southern Territories',
                'Gabon',
                'Gambia',
                'Ghana',
                'Guinea',
                'Guinea-Bissau',
                'Kenya',
                'Lesotho',
                'Liberia',
                'Libya',
                'Madagascar',
                'Malawi',
                'Mali',
                'Mauritania',
                'Mauritius',
                'Mayotte',
                'Morocco',
                'Mozambique',
                'Namibia',
                'Niger',
                'Nigeria',
                'Republic of the Congo',
                'Rwanda',
                'Réunion',
                'Saint Helena',
                'Sao Tome and Principe',
                'Senegal',
                'Seychelles',
                'Sierra Leone',
                'Somalia',
                'South Africa',
                'South Sudan',
                'Sudan',
                'Swaziland',
                'Tanzania',
                'Togo',
                'Tunisia',
                'Uganda',
                'Western Sahara',
                'Zambia',
                'Zimbabwe',
              ],
              Americas: [
                'Anguilla',
                'Antigua and Barbuda',
                'Argentina',
                'Aruba',
                'Bahamas',
                'Barbados',
                'Belize',
                'Bermuda',
                'Bolivia',
                'Bonaire, Sint Eustatius and Saba',
                'Bouvet Island',
                'Brazil',
                'British Virgin Islands',
                'Canada',
                'Cayman Islands',
                'Chile',
                'Colombia',
                'Costa Rica',
                'Cuba',
                'Curacao',
                'Dominica',
                'Dominican Republic',
                'Ecuador',
                'El Salvador',
                'Falkland Islands (Malvinas)',
                'French Guiana',
                'Greenland',
                'Grenada',
                'Guadeloupe',
                'Guatemala',
                'Guyana',
                'Haiti',
                'Honduras',
                'Jamaica',
                'Martinique',
                'Mexico',
                'Montserrat',
                'Nicaragua',
                'Panama',
                'Paraguay',
                'Peru',
                'Puerto Rico',
                'Saint Barthélemy',
                'Saint Kitts and Nevis',
                'Saint Lucia',
                'Saint Martin (French part)',
                'Saint Pierre and Miquelon',
                'Saint Vincent and the Grenadines',
                'Sint Maarten (Dutch part)',
                'South Georgia and the South Sandwich Islands',
                'Suriname',
                'Trinidad and Tobago',
                'Turks and Caicos Islands',
                'U.S. Virgin Islands',
                'United States',
                'Uruguay',
                'Venezuela',
              ],
              Antarctica: ['Antarctica'],
              Asia: [
                'Afghanistan',
                'Armenia',
                'Azerbaijan',
                'Bahrain',
                'Bangladesh',
                'Bhutan',
                'Brunei',
                'Cambodia',
                'China',
                'Cyprus',
                'Georgia',
                'Hong Kong',
                'India',
                'Indonesia',
                'Iran, Islamic Republic of',
                'Iraq',
                'Israel',
                'Japan',
                'Jordan',
                'Kazakhstan',
                "Korea, Democratic People's Republic of",
                'Kuwait',
                'Kyrgyzstan',
                'Laos',
                'Lebanon',
                'Macao',
                'Malaysia',
                'Maldives',
                'Mongolia',
                'Myanmar (Burma)',
                'Nepal',
                'Oman',
                'Pakistan',
                'Palestine',
                'Philippines',
                'Qatar',
                'Saudi Arabia',
                'Singapore',
                'South Korea',
                'Sri Lanka',
                'Syrian Arab Republic',
                'Taiwan',
                'Tajikistan',
                'Thailand',
                'Timor-Leste',
                'Turkey',
                'Turkmenistan',
                'United Arab Emirates (UAE)',
                'Uzbekistan',
                'Vietnam',
                'Yemen',
              ],
              Europe: [
                'Albania',
                'Andorra',
                'Austria',
                'Belarus',
                'Belgium',
                'Bosnia and Herzegovina',
                'Bulgaria',
                'Croatia',
                'Czech Republic',
                'Denmark',
                'Estonia',
                'Faroe Islands',
                'Finland',
                'France',
                'Germany',
                'Gibraltar',
                'Greece',
                'Guernsey',
                'Hungary',
                'Iceland',
                'Ireland',
                'Isle of Man',
                'Italy',
                'Jersey',
                'Kosovo',
                'Latvia',
                'Liechtenstein',
                'Lithuania',
                'Luxembourg',
                'Malta',
                'Moldova',
                'Monaco',
                'Montenegro',
                'Netherlands',
                'North Macedonia',
                'Norway',
                'Poland',
                'Portugal',
                'Romania',
                'Russia',
                'San Marino',
                'Serbia',
                'Slovakia',
                'Slovenia',
                'Spain',
                'Svalbard and Jan Mayen',
                'Sweden',
                'Switzerland',
                'Ukraine',
                'United Kingdom (UK)',
                'Vatican City (Holy See)',
                'Åland Islands',
              ],
              Oceania: [
                'American Samoa',
                'Australia',
                'Christmas Island',
                'Cocos (Keeling) Islands',
                'Cook Islands',
                'Fiji',
                'French Polynesia',
                'Guam',
                'Heard Island and McDonald Islands',
                'Kiribati',
                'Marshall Islands',
                'Micronesia',
                'Nauru',
                'New Caledonia',
                'New Zealand',
                'Niue',
                'Norfolk Island',
                'Northern Mariana Islands',
                'Palau',
                'Papua New Guinea',
                'Pitcairn',
                'Samoa',
                'Solomon Islands',
                'Tokelau',
                'Tonga',
                'Tuvalu',
                'United States Minor Outlying Islands',
                'Vanuatu',
                'Wallis and Futuna Islands',
              ],
            },
            subregions: {
              Antarctica: ['Antarctica'],
              'Australia and New Zealand': [
                'Australia',
                'Christmas Island',
                'Cocos (Keeling) Islands',
                'Heard Island and McDonald Islands',
                'New Zealand',
                'Norfolk Island',
              ],
              Caribbean: [
                'Anguilla',
                'Antigua and Barbuda',
                'Bahamas',
                'Barbados',
                'Bonaire, Sint Eustatius and Saba',
                'Bouvet Island',
                'British Virgin Islands',
                'Cayman Islands',
                'Curacao',
                'Dominica',
                'Grenada',
                'Guadeloupe',
                'Jamaica',
                'Martinique',
                'Montserrat',
                'Puerto Rico',
                'Saint Barthélemy',
                'Saint Kitts and Nevis',
                'Saint Lucia',
                'Saint Martin (French part)',
                'Saint Vincent and the Grenadines',
                'Sint Maarten (Dutch part)',
                'Turks and Caicos Islands',
                'U.S. Virgin Islands',
              ],
              'Central Asia': [
                'Kazakhstan',
                'Kyrgyzstan',
                'Tajikistan',
                'Turkmenistan',
                'Uzbekistan',
              ],
              'Eastern Asia': [
                'China',
                'Hong Kong',
                'Japan',
                "Korea, Democratic People's Republic of",
                'Macao',
                'Mongolia',
                'South Korea',
                'Taiwan',
              ],
              'Eastern Europe': [
                'Belarus',
                'Bulgaria',
                'Czech Republic',
                'Hungary',
                'Moldova',
                'Poland',
                'Romania',
                'Russia',
                'Slovakia',
                'Ukraine',
              ],
              'Latin America': [
                'Argentina',
                'Aruba',
                'Belize',
                'Bolivia',
                'Brazil',
                'Chile',
                'Colombia',
                'Costa Rica',
                'Cuba',
                'Dominican Republic',
                'Ecuador',
                'El Salvador',
                'Falkland Islands (Malvinas)',
                'French Guiana',
                'Guatemala',
                'Guyana',
                'Haiti',
                'Honduras',
                'Mexico',
                'Nicaragua',
                'Panama',
                'Paraguay',
                'Peru',
                'South Georgia and the South Sandwich Islands',
                'Suriname',
                'Trinidad and Tobago',
                'Uruguay',
                'Venezuela',
              ],
              Melanesia: [
                'Fiji',
                'New Caledonia',
                'Papua New Guinea',
                'Solomon Islands',
                'Vanuatu',
              ],
              Micronesia: [
                'Guam',
                'Kiribati',
                'Marshall Islands',
                'Micronesia',
                'Nauru',
                'Northern Mariana Islands',
                'Palau',
                'United States Minor Outlying Islands',
              ],
              'Northern Africa': [
                'Algeria',
                'Egypt',
                'Libya',
                'Morocco',
                'Sudan',
                'Tunisia',
                'Western Sahara',
              ],
              'Northern America': [
                'Bermuda',
                'Canada',
                'Greenland',
                'Saint Pierre and Miquelon',
                'United States',
              ],
              'Northern Europe': [
                'Denmark',
                'Estonia',
                'Faroe Islands',
                'Finland',
                'Guernsey',
                'Iceland',
                'Ireland',
                'Isle of Man',
                'Jersey',
                'Latvia',
                'Lithuania',
                'Norway',
                'Svalbard and Jan Mayen',
                'Sweden',
                'United Kingdom (UK)',
                'Åland Islands',
              ],
              Polynesia: [
                'American Samoa',
                'Cook Islands',
                'French Polynesia',
                'Niue',
                'Pitcairn',
                'Samoa',
                'Tokelau',
                'Tonga',
                'Tuvalu',
                'Wallis and Futuna Islands',
              ],
              'South-eastern Asia': [
                'Brunei',
                'Cambodia',
                'Indonesia',
                'Laos',
                'Malaysia',
                'Myanmar (Burma)',
                'Philippines',
                'Singapore',
                'Thailand',
                'Timor-Leste',
                'Vietnam',
              ],
              'Southern Asia': [
                'Afghanistan',
                'Bangladesh',
                'Bhutan',
                'India',
                'Iran, Islamic Republic of',
                'Maldives',
                'Nepal',
                'Pakistan',
                'Sri Lanka',
              ],
              'Southern Europe': [
                'Albania',
                'Andorra',
                'Bosnia and Herzegovina',
                'Croatia',
                'Gibraltar',
                'Greece',
                'Italy',
                'Malta',
                'Montenegro',
                'North Macedonia',
                'Portugal',
                'San Marino',
                'Serbia',
                'Slovenia',
                'Spain',
                'Vatican City (Holy See)',
              ],
              'Sub-Saharan Africa': [
                'Angola',
                'Benin',
                'Botswana',
                'British Indian Ocean Territory',
                'Burkina Faso',
                'Burundi',
                'Cabo Verde',
                'Cameroon',
                'Central African Republic (CAR)',
                'Chad',
                'Comoros',
                "Cote d'Ivoire",
                'Democratic Republic of the Congo',
                'Djibouti',
                'Equatorial Guinea',
                'Eritrea',
                'Ethiopia',
                'French Southern Territories',
                'Gabon',
                'Gambia',
                'Ghana',
                'Guinea',
                'Guinea-Bissau',
                'Kenya',
                'Lesotho',
                'Liberia',
                'Madagascar',
                'Malawi',
                'Mali',
                'Mauritania',
                'Mauritius',
                'Mayotte',
                'Mozambique',
                'Namibia',
                'Niger',
                'Nigeria',
                'Republic of the Congo',
                'Rwanda',
                'Réunion',
                'Saint Helena',
                'Sao Tome and Principe',
                'Senegal',
                'Seychelles',
                'Sierra Leone',
                'Somalia',
                'South Africa',
                'South Sudan',
                'Swaziland',
                'Tanzania',
                'Togo',
                'Uganda',
                'Zambia',
                'Zimbabwe',
              ],
              'Western Asia': [
                'Armenia',
                'Azerbaijan',
                'Bahrain',
                'Cyprus',
                'Georgia',
                'Iraq',
                'Israel',
                'Jordan',
                'Kuwait',
                'Lebanon',
                'Oman',
                'Palestine',
                'Qatar',
                'Saudi Arabia',
                'Syrian Arab Republic',
                'Turkey',
                'United Arab Emirates (UAE)',
                'Yemen',
              ],
              'Western Europe': [
                'Austria',
                'Belgium',
                'France',
                'Germany',
                'Liechtenstein',
                'Luxembourg',
                'Monaco',
                'Netherlands',
                'Switzerland',
              ],
            },
          },
          inputType: 'countries',
          options: [
            {
              $meta: {
                region: 'Asia',
                subregion: 'Southern Asia',
              },
              label: 'Afghanistan',
              value: 'Afghanistan',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Albania',
              value: 'Albania',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Northern Africa',
              },
              label: 'Algeria',
              value: 'Algeria',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Polynesia',
              },
              label: 'American Samoa',
              value: 'American Samoa',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Andorra',
              value: 'Andorra',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Angola',
              value: 'Angola',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Anguilla',
              value: 'Anguilla',
            },
            {
              $meta: {
                region: 'Antarctica',
                subregion: 'Antarctica',
              },
              label: 'Antarctica',
              value: 'Antarctica',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Antigua and Barbuda',
              value: 'Antigua and Barbuda',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Argentina',
              value: 'Argentina',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Armenia',
              value: 'Armenia',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Aruba',
              value: 'Aruba',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Australia and New Zealand',
              },
              label: 'Australia',
              value: 'Australia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Western Europe',
              },
              label: 'Austria',
              value: 'Austria',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Azerbaijan',
              value: 'Azerbaijan',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Bahamas',
              value: 'Bahamas',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Bahrain',
              value: 'Bahrain',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Southern Asia',
              },
              label: 'Bangladesh',
              value: 'Bangladesh',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Barbados',
              value: 'Barbados',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Eastern Europe',
              },
              label: 'Belarus',
              value: 'Belarus',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Western Europe',
              },
              label: 'Belgium',
              value: 'Belgium',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Belize',
              value: 'Belize',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Benin',
              value: 'Benin',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Northern America',
              },
              label: 'Bermuda',
              value: 'Bermuda',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Southern Asia',
              },
              label: 'Bhutan',
              value: 'Bhutan',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Bolivia',
              value: 'Bolivia',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Bonaire, Sint Eustatius and Saba',
              value: 'Bonaire, Sint Eustatius and Saba',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Bosnia and Herzegovina',
              value: 'Bosnia and Herzegovina',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Botswana',
              value: 'Botswana',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Bouvet Island',
              value: 'Bouvet Island',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Brazil',
              value: 'Brazil',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'British Indian Ocean Territory',
              value: 'British Indian Ocean Territory',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'British Virgin Islands',
              value: 'British Virgin Islands',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'South-eastern Asia',
              },
              label: 'Brunei',
              value: 'Brunei',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Eastern Europe',
              },
              label: 'Bulgaria',
              value: 'Bulgaria',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Burkina Faso',
              value: 'Burkina Faso',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Burundi',
              value: 'Burundi',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Cabo Verde',
              value: 'Cabo Verde',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'South-eastern Asia',
              },
              label: 'Cambodia',
              value: 'Cambodia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Cameroon',
              value: 'Cameroon',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Northern America',
              },
              label: 'Canada',
              value: 'Canada',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Cayman Islands',
              value: 'Cayman Islands',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Central African Republic (CAR)',
              value: 'Central African Republic (CAR)',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Chad',
              value: 'Chad',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Chile',
              value: 'Chile',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Eastern Asia',
              },
              label: 'China',
              value: 'China',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Australia and New Zealand',
              },
              label: 'Christmas Island',
              value: 'Christmas Island',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Australia and New Zealand',
              },
              label: 'Cocos (Keeling) Islands',
              value: 'Cocos (Keeling) Islands',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Colombia',
              value: 'Colombia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Comoros',
              value: 'Comoros',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Polynesia',
              },
              label: 'Cook Islands',
              value: 'Cook Islands',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Costa Rica',
              value: 'Costa Rica',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: "Cote d'Ivoire",
              value: "Cote d'Ivoire",
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Croatia',
              value: 'Croatia',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Cuba',
              value: 'Cuba',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Curacao',
              value: 'Curacao',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Cyprus',
              value: 'Cyprus',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Eastern Europe',
              },
              label: 'Czech Republic',
              value: 'Czech Republic',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Democratic Republic of the Congo',
              value: 'Democratic Republic of the Congo',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Denmark',
              value: 'Denmark',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Djibouti',
              value: 'Djibouti',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Dominica',
              value: 'Dominica',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Dominican Republic',
              value: 'Dominican Republic',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Ecuador',
              value: 'Ecuador',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Northern Africa',
              },
              label: 'Egypt',
              value: 'Egypt',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'El Salvador',
              value: 'El Salvador',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Equatorial Guinea',
              value: 'Equatorial Guinea',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Eritrea',
              value: 'Eritrea',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Estonia',
              value: 'Estonia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Ethiopia',
              value: 'Ethiopia',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Falkland Islands (Malvinas)',
              value: 'Falkland Islands (Malvinas)',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Faroe Islands',
              value: 'Faroe Islands',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Melanesia',
              },
              label: 'Fiji',
              value: 'Fiji',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Finland',
              value: 'Finland',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Western Europe',
              },
              label: 'France',
              value: 'France',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'French Guiana',
              value: 'French Guiana',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Polynesia',
              },
              label: 'French Polynesia',
              value: 'French Polynesia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'French Southern Territories',
              value: 'French Southern Territories',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Gabon',
              value: 'Gabon',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Gambia',
              value: 'Gambia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Georgia',
              value: 'Georgia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Western Europe',
              },
              label: 'Germany',
              value: 'Germany',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Ghana',
              value: 'Ghana',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Gibraltar',
              value: 'Gibraltar',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Greece',
              value: 'Greece',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Northern America',
              },
              label: 'Greenland',
              value: 'Greenland',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Grenada',
              value: 'Grenada',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Guadeloupe',
              value: 'Guadeloupe',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Micronesia',
              },
              label: 'Guam',
              value: 'Guam',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Guatemala',
              value: 'Guatemala',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Guernsey',
              value: 'Guernsey',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Guinea',
              value: 'Guinea',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Guinea-Bissau',
              value: 'Guinea-Bissau',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Guyana',
              value: 'Guyana',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Haiti',
              value: 'Haiti',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Australia and New Zealand',
              },
              label: 'Heard Island and McDonald Islands',
              value: 'Heard Island and McDonald Islands',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Honduras',
              value: 'Honduras',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Eastern Asia',
              },
              label: 'Hong Kong',
              value: 'Hong Kong',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Eastern Europe',
              },
              label: 'Hungary',
              value: 'Hungary',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Iceland',
              value: 'Iceland',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Southern Asia',
              },
              label: 'India',
              value: 'India',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'South-eastern Asia',
              },
              label: 'Indonesia',
              value: 'Indonesia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Southern Asia',
              },
              label: 'Iran, Islamic Republic of',
              value: 'Iran, Islamic Republic of',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Iraq',
              value: 'Iraq',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Ireland',
              value: 'Ireland',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Isle of Man',
              value: 'Isle of Man',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Israel',
              value: 'Israel',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Italy',
              value: 'Italy',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Jamaica',
              value: 'Jamaica',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Eastern Asia',
              },
              label: 'Japan',
              value: 'Japan',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Jersey',
              value: 'Jersey',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Jordan',
              value: 'Jordan',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Central Asia',
              },
              label: 'Kazakhstan',
              value: 'Kazakhstan',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Kenya',
              value: 'Kenya',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Micronesia',
              },
              label: 'Kiribati',
              value: 'Kiribati',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Eastern Asia',
              },
              label: "Korea, Democratic People's Republic of",
              value: "Korea, Democratic People's Republic of",
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Kosovo',
              value: 'Kosovo',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Kuwait',
              value: 'Kuwait',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Central Asia',
              },
              label: 'Kyrgyzstan',
              value: 'Kyrgyzstan',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'South-eastern Asia',
              },
              label: 'Laos',
              value: 'Laos',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Latvia',
              value: 'Latvia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Lebanon',
              value: 'Lebanon',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Lesotho',
              value: 'Lesotho',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Liberia',
              value: 'Liberia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Northern Africa',
              },
              label: 'Libya',
              value: 'Libya',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Western Europe',
              },
              label: 'Liechtenstein',
              value: 'Liechtenstein',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Lithuania',
              value: 'Lithuania',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Western Europe',
              },
              label: 'Luxembourg',
              value: 'Luxembourg',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Eastern Asia',
              },
              label: 'Macao',
              value: 'Macao',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Madagascar',
              value: 'Madagascar',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Malawi',
              value: 'Malawi',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'South-eastern Asia',
              },
              label: 'Malaysia',
              value: 'Malaysia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Southern Asia',
              },
              label: 'Maldives',
              value: 'Maldives',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Mali',
              value: 'Mali',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Malta',
              value: 'Malta',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Micronesia',
              },
              label: 'Marshall Islands',
              value: 'Marshall Islands',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Martinique',
              value: 'Martinique',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Mauritania',
              value: 'Mauritania',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Mauritius',
              value: 'Mauritius',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Mayotte',
              value: 'Mayotte',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Mexico',
              value: 'Mexico',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Micronesia',
              },
              label: 'Micronesia',
              value: 'Micronesia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Eastern Europe',
              },
              label: 'Moldova',
              value: 'Moldova',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Western Europe',
              },
              label: 'Monaco',
              value: 'Monaco',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Eastern Asia',
              },
              label: 'Mongolia',
              value: 'Mongolia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Montenegro',
              value: 'Montenegro',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Montserrat',
              value: 'Montserrat',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Northern Africa',
              },
              label: 'Morocco',
              value: 'Morocco',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Mozambique',
              value: 'Mozambique',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'South-eastern Asia',
              },
              label: 'Myanmar (Burma)',
              value: 'Myanmar (Burma)',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Namibia',
              value: 'Namibia',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Micronesia',
              },
              label: 'Nauru',
              value: 'Nauru',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Southern Asia',
              },
              label: 'Nepal',
              value: 'Nepal',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Western Europe',
              },
              label: 'Netherlands',
              value: 'Netherlands',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Melanesia',
              },
              label: 'New Caledonia',
              value: 'New Caledonia',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Australia and New Zealand',
              },
              label: 'New Zealand',
              value: 'New Zealand',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Nicaragua',
              value: 'Nicaragua',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Niger',
              value: 'Niger',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Nigeria',
              value: 'Nigeria',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Polynesia',
              },
              label: 'Niue',
              value: 'Niue',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Australia and New Zealand',
              },
              label: 'Norfolk Island',
              value: 'Norfolk Island',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'North Macedonia',
              value: 'North Macedonia',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Micronesia',
              },
              label: 'Northern Mariana Islands',
              value: 'Northern Mariana Islands',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Norway',
              value: 'Norway',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Oman',
              value: 'Oman',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Southern Asia',
              },
              label: 'Pakistan',
              value: 'Pakistan',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Micronesia',
              },
              label: 'Palau',
              value: 'Palau',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Palestine',
              value: 'Palestine',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Panama',
              value: 'Panama',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Melanesia',
              },
              label: 'Papua New Guinea',
              value: 'Papua New Guinea',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Paraguay',
              value: 'Paraguay',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Peru',
              value: 'Peru',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'South-eastern Asia',
              },
              label: 'Philippines',
              value: 'Philippines',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Polynesia',
              },
              label: 'Pitcairn',
              value: 'Pitcairn',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Eastern Europe',
              },
              label: 'Poland',
              value: 'Poland',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Portugal',
              value: 'Portugal',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Puerto Rico',
              value: 'Puerto Rico',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Qatar',
              value: 'Qatar',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Republic of the Congo',
              value: 'Republic of the Congo',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Eastern Europe',
              },
              label: 'Romania',
              value: 'Romania',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Eastern Europe',
              },
              label: 'Russia',
              value: 'Russia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Rwanda',
              value: 'Rwanda',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Réunion',
              value: 'Réunion',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Saint Barthélemy',
              value: 'Saint Barthélemy',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Saint Helena',
              value: 'Saint Helena',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Saint Kitts and Nevis',
              value: 'Saint Kitts and Nevis',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Saint Lucia',
              value: 'Saint Lucia',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Saint Martin (French part)',
              value: 'Saint Martin (French part)',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Northern America',
              },
              label: 'Saint Pierre and Miquelon',
              value: 'Saint Pierre and Miquelon',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Saint Vincent and the Grenadines',
              value: 'Saint Vincent and the Grenadines',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Polynesia',
              },
              label: 'Samoa',
              value: 'Samoa',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'San Marino',
              value: 'San Marino',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Sao Tome and Principe',
              value: 'Sao Tome and Principe',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Saudi Arabia',
              value: 'Saudi Arabia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Senegal',
              value: 'Senegal',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Serbia',
              value: 'Serbia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Seychelles',
              value: 'Seychelles',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Sierra Leone',
              value: 'Sierra Leone',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'South-eastern Asia',
              },
              label: 'Singapore',
              value: 'Singapore',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Sint Maarten (Dutch part)',
              value: 'Sint Maarten (Dutch part)',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Eastern Europe',
              },
              label: 'Slovakia',
              value: 'Slovakia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Slovenia',
              value: 'Slovenia',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Melanesia',
              },
              label: 'Solomon Islands',
              value: 'Solomon Islands',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Somalia',
              value: 'Somalia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'South Africa',
              value: 'South Africa',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'South Georgia and the South Sandwich Islands',
              value: 'South Georgia and the South Sandwich Islands',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Eastern Asia',
              },
              label: 'South Korea',
              value: 'South Korea',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'South Sudan',
              value: 'South Sudan',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Spain',
              value: 'Spain',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Southern Asia',
              },
              label: 'Sri Lanka',
              value: 'Sri Lanka',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Northern Africa',
              },
              label: 'Sudan',
              value: 'Sudan',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Suriname',
              value: 'Suriname',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Svalbard and Jan Mayen',
              value: 'Svalbard and Jan Mayen',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Swaziland',
              value: 'Swaziland',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Sweden',
              value: 'Sweden',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Western Europe',
              },
              label: 'Switzerland',
              value: 'Switzerland',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Syrian Arab Republic',
              value: 'Syrian Arab Republic',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Eastern Asia',
              },
              label: 'Taiwan',
              value: 'Taiwan',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Central Asia',
              },
              label: 'Tajikistan',
              value: 'Tajikistan',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Tanzania',
              value: 'Tanzania',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'South-eastern Asia',
              },
              label: 'Thailand',
              value: 'Thailand',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'South-eastern Asia',
              },
              label: 'Timor-Leste',
              value: 'Timor-Leste',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Togo',
              value: 'Togo',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Polynesia',
              },
              label: 'Tokelau',
              value: 'Tokelau',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Polynesia',
              },
              label: 'Tonga',
              value: 'Tonga',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Trinidad and Tobago',
              value: 'Trinidad and Tobago',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Northern Africa',
              },
              label: 'Tunisia',
              value: 'Tunisia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Turkey',
              value: 'Turkey',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Central Asia',
              },
              label: 'Turkmenistan',
              value: 'Turkmenistan',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'Turks and Caicos Islands',
              value: 'Turks and Caicos Islands',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Polynesia',
              },
              label: 'Tuvalu',
              value: 'Tuvalu',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Caribbean',
              },
              label: 'U.S. Virgin Islands',
              value: 'U.S. Virgin Islands',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Uganda',
              value: 'Uganda',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Eastern Europe',
              },
              label: 'Ukraine',
              value: 'Ukraine',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'United Arab Emirates (UAE)',
              value: 'United Arab Emirates (UAE)',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'United Kingdom (UK)',
              value: 'United Kingdom (UK)',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Northern America',
              },
              label: 'United States',
              value: 'United States',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Micronesia',
              },
              label: 'United States Minor Outlying Islands',
              value: 'United States Minor Outlying Islands',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Uruguay',
              value: 'Uruguay',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Central Asia',
              },
              label: 'Uzbekistan',
              value: 'Uzbekistan',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Melanesia',
              },
              label: 'Vanuatu',
              value: 'Vanuatu',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Southern Europe',
              },
              label: 'Vatican City (Holy See)',
              value: 'Vatican City (Holy See)',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: 'Latin America',
              },
              label: 'Venezuela',
              value: 'Venezuela',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'South-eastern Asia',
              },
              label: 'Vietnam',
              value: 'Vietnam',
            },
            {
              $meta: {
                region: 'Oceania',
                subregion: 'Polynesia',
              },
              label: 'Wallis and Futuna Islands',
              value: 'Wallis and Futuna Islands',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Northern Africa',
              },
              label: 'Western Sahara',
              value: 'Western Sahara',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: 'Western Asia',
              },
              label: 'Yemen',
              value: 'Yemen',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Zambia',
              value: 'Zambia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: 'Sub-Saharan Africa',
              },
              label: 'Zimbabwe',
              value: 'Zimbabwe',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: 'Northern Europe',
              },
              label: 'Åland Islands',
              value: 'Åland Islands',
            },
          ],
          placeholder: 'Country',
        },
      },
      work_email: {
        description:
          "The employee's company email. For example, jane@company.com.",
        format: 'email',
        maxLength: 255,
        title: 'Work email',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'email',
        },
      },
    },
    required: [
      'name',
      'email',
      'job_title',
      'provisional_start_date',
      'has_seniority_date',
    ],
    type: 'object',
    'x-jsf-logic': {
      validations: {
        blocked_date_validation: {
          errorMessage:
            'Date is blocked due to the holiday season, and the limited availability of internal/external providers to process onboarding, payroll and benefits enrollments',
          rule: {
            '!': {
              in: [
                {
                  var: 'provisional_start_date',
                },
                [],
              ],
            },
          },
        },
      },
    },
    'x-jsf-order': [
      'name',
      'email',
      'work_email',
      'job_title',
      'tax_servicing_countries',
      'tax_job_category',
      'department',
      'provisional_start_date',
      'has_seniority_date',
      'seniority_date',
      'manager',
    ],
  },
};

export const contractDetailsSchema = {
  data: {
    additionalProperties: false,
    allOf: [
      {
        if: {
          properties: {
            work_schedule: {
              const: 'full_time',
            },
          },
          required: ['work_schedule'],
        },
        then: {
          properties: {
            annual_gross_salary: {
              minimum: 1218000,
              'x-jsf-errorMessage': {
                minimum:
                  'In Portugal, full-time employees are entitled to a minimum annual salary of €12,180.00.',
              },
            },
          },
        },
      },
      {
        else: {
          else: {
            properties: {
              work_hours_per_week: false,
            },
          },
          if: {
            properties: {
              work_schedule: {
                const: 'full_time',
              },
            },
            required: ['work_schedule'],
          },
          properties: {
            part_time_salary_confirmation: false,
          },
          then: {
            properties: {
              work_hours_per_week: {
                const: 40,
                default: 40,
                description:
                  'All employees in Portugal are required to work 40 hours in a full-time position.',
                'x-jsf-presentation': {
                  statement: {
                    title: 'Total of <b>40 hours</b> per week.',
                  },
                },
              },
            },
            required: ['work_hours_per_week'],
          },
        },
        if: {
          properties: {
            work_schedule: {
              const: 'part_time',
            },
          },
          required: ['work_schedule'],
        },
        then: {
          properties: {
            part_time_salary_confirmation: {
              const: 'acknowledged',
            },
            work_hours_per_week: {
              maximum: 39,
              minimum: 1,
            },
          },
          required: ['part_time_salary_confirmation', 'work_hours_per_week'],
        },
      },
      {
        else: {
          properties: {
            maximum_working_hours_regime: false,
          },
        },
        if: {
          properties: {
            working_hours_exemption: {
              const: 'yes',
            },
          },
          required: ['working_hours_exemption'],
        },
        then: {
          required: ['maximum_working_hours_regime'],
        },
      },
      {
        else: {
          properties: {
            working_hours_exemption_allowance: false,
          },
        },
        if: {
          properties: {
            annual_gross_salary: {
              minimum: 1,
            },
            maximum_working_hours_regime: {
              enum: ['yes', 'no'],
            },
            work_hours_per_week: {
              minimum: 1,
            },
            working_hours_exemption: {
              const: 'yes',
            },
          },
          required: [
            'working_hours_exemption',
            'maximum_working_hours_regime',
            'work_hours_per_week',
          ],
        },
        then: {
          else: {
            properties: {
              working_hours_exemption_allowance: {
                'x-jsf-logic-computedAttrs': {
                  const:
                    'working_hours_exemption_allowance_no_max_hours_value_in_cents',
                  default:
                    'working_hours_exemption_allowance_no_max_hours_value_in_cents',
                  'x-jsf-presentation': {
                    statement: {
                      description:
                        'As this employee will need to work outside regular hours, you’ll need to pay them an <strong>additional {{working_hours_exemption_allowance_no_max_hours_value}} EUR monthly</strong>, on top of their salary.',
                      severity: 'info',
                      title:
                        'You’ll need to pay an extended work hours allowance',
                    },
                  },
                },
              },
            },
            required: ['working_hours_exemption_allowance'],
          },
          if: {
            properties: {
              maximum_working_hours_regime: {
                const: 'yes',
              },
            },
            required: ['maximum_working_hours_regime'],
          },
          then: {
            properties: {
              working_hours_exemption_allowance: {
                'x-jsf-logic-computedAttrs': {
                  const:
                    'working_hours_exemption_allowance_with_max_hours_value_in_cents',
                  default:
                    'working_hours_exemption_allowance_with_max_hours_value_in_cents',
                  'x-jsf-presentation': {
                    statement: {
                      description:
                        'As this employee will need to work outside regular hours and for more than 8 hours a day, you’ll need to pay them an <strong>additional {{working_hours_exemption_allowance_with_max_hours_value}} EUR monthly</strong>, on top of their salary.',
                      severity: 'info',
                      title:
                        'You’ll need to pay an extended work hours allowance',
                    },
                  },
                },
              },
            },
            required: ['working_hours_exemption_allowance'],
          },
        },
      },
      {
        else: {
          properties: {
            signing_bonus_amount: false,
            signing_bonus_clawback: false,
          },
        },
        if: {
          properties: {
            has_signing_bonus: {
              const: 'yes',
            },
          },
          required: ['has_signing_bonus'],
        },
        then: {
          required: ['signing_bonus_amount', 'signing_bonus_clawback'],
        },
      },
      {
        else: {
          else: {
            properties: {
              available_pto: {
                minimum: 22,
              },
            },
          },
          if: {
            properties: {
              work_schedule: {
                const: 'part_time',
              },
            },
            required: ['work_schedule'],
          },
          then: {
            properties: {
              available_pto: {
                minimum: 0,
              },
            },
          },
        },
        if: {
          properties: {
            available_pto_type: {
              const: 'unlimited',
            },
          },
          required: ['available_pto_type'],
        },
        then: {
          properties: {
            available_pto: {
              const: 22,
              default: 22,
              title: 'Minimum paid time off days',
              'x-jsf-presentation': {
                statement: {
                  description:
                    'In Portugal, employees are entitled to a minimum of 22 paid time off days per year. Please note that Statutory, Bank Holidays and Public Holidays are excluded from the above.',
                  title:
                    'Minimum of <strong>22 days</strong> of paid time off.',
                },
              },
            },
          },
        },
      },
      {
        else: {
          properties: {
            bonus_amount: false,
            bonus_details: false,
          },
        },
        if: {
          properties: {
            has_bonus: {
              const: 'yes',
            },
          },
          required: ['has_bonus'],
        },
        then: {
          properties: {
            bonus_details: {
              type: ['string'],
            },
          },
          required: ['bonus_details'],
        },
      },
      {
        else: {
          properties: {
            commissions_ack: false,
            commissions_details: false,
          },
        },
        if: {
          properties: {
            has_commissions: {
              const: 'yes',
            },
          },
          required: ['has_commissions'],
        },
        then: {
          properties: {
            commissions_ack: {
              type: ['string'],
            },
            commissions_details: {
              type: ['string'],
            },
          },
          required: ['commissions_details', 'commissions_ack'],
        },
      },
      {
        if: {
          properties: {
            probation_length_days: {
              const: 0,
            },
          },
          required: ['probation_length_days'],
        },
        then: {
          properties: {
            probation_length_days: {
              'x-jsf-presentation': {
                statement: {
                  description:
                    'Waiving the probation period is possible but discouraged',
                  severity: 'warning',
                },
              },
            },
          },
        },
      },
    ],
    anyOf: [
      {
        required: ['probation_length_days'],
      },
      {
        required: ['probation_length'],
      },
    ],
    properties: {
      annual_gross_salary: {
        description:
          "The minimum annual salary is calculated based on the country's applicable laws.",
        title: 'Annual gross salary',
        type: 'integer',
        'x-jsf-errorMessage': {
          type: 'Please, use US standard currency format. Ex: 1024.12',
        },
        'x-jsf-presentation': {
          currency: 'EUR',
          inputType: 'money',
        },
      },
      annual_training_hours_ack: {
        const: 'acknowledged',
        description:
          "In Portugal, employees with indefinite contracts must complete 40 hours of training annually during work hours. If training hours aren't met, employees get paid for unused hours at offboarding.",
        title: "I acknowledge Portugal's annual training requirement",
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 18006437022605,
              title: 'Help center unavailable',
            },
          },
        },
      },
      available_pto: {
        description:
          'In Portugal, employees are entitled to a minimum of 22 paid time off days per year. Please pro-rate for part-time employment. Please note that Statutory, Bank Holidays and Public Holidays are excluded from the above.',
        title: 'Number of paid time off days',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      available_pto_type: {
        description:
          'For personal time off. Also called vacation or annual leave.',
        oneOf: [
          {
            const: 'unlimited',
            description:
              'Gives the employee an uncapped number of paid time off days per year. The number below is the mandatory minimum number of days they must take.',
            title: 'Unlimited paid time off',
          },
          {
            const: 'fixed',
            description:
              'The employee gets a set number of paid time off days per year that you establish.',
            title: 'Fixed paid time off',
          },
        ],
        title: 'Paid time off policy',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'column',
          inputType: 'radio',
        },
      },
      bonus_amount: {
        deprecated: true,
        readOnly: true,
        title: 'Bonus amount (deprecated)',
        type: ['integer', 'null'],
        'x-jsf-errorMessage': {
          type: 'Please, use US standard currency format. Ex: 1024.12',
        },
        'x-jsf-presentation': {
          currency: 'EUR',
          deprecated: {
            description:
              "Deprecated in favor of 'Bonus Details'. Please, try to leave this field empty.",
          },
          inputType: 'money',
        },
      },
      bonus_details: {
        description: 'Bonus type, payment frequency, and more.',
        maxLength: 1000,
        title: 'Other bonus details',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
      commissions_ack: {
        const: 'acknowledged',
        description:
          'I understand that I am required to provide written details of the commission plan to this employee, and upload this document on the platform for record keeping purposes. I acknowledge that Remote will not liable for any claims or losses associated with the commission or bonus plan.',
        title: 'Confirm commission plan details',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: '(i) Guidance on drafting a commission plan here.',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 17932049668109,
              title: 'Help center unavailable',
            },
          },
        },
      },
      commissions_details: {
        description: 'Payment amount, frequency, and more.',
        maxLength: 1000,
        title: 'Commission details',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
      contract_duration: {
        deprecated: true,
        description:
          "Indefinite or fixed-term contract. If the latter, please state duration and if there's possibility for renewal.",
        maxLength: 255,
        readOnly: true,
        title: 'Contract duration (deprecated)',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          deprecated: {
            description:
              "Deprecated field in favor of 'contract_duration_type'.",
          },
          inputType: 'text',
        },
      },
      contract_duration_type: {
        const: 'indefinite',
        description:
          'I acknowledge that only Indefinite-term Contracts are available. Remote does not support Fixed-term Contracts in Portugal.',
        title: 'Contract duration',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: 'Learn about contract duration',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 4410443814157,
              title: 'Help center unavailable',
            },
          },
        },
      },
      contract_end_date: {
        deprecated: true,
        format: 'date',
        maxLength: 255,
        readOnly: true,
        title: 'Contract End Date (deprecated)',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          deprecated: {
            description:
              "Deprecated because Contract Duration can only be 'indefinite'.",
          },
          inputType: 'date',
        },
      },
      equity_compensation: {
        additionalProperties: false,
        allOf: [
          {
            else: {
              properties: {
                equity_cliff: false,
                equity_description: false,
                equity_vesting_period: false,
                number_of_stock_options: false,
              },
            },
            if: {
              properties: {
                offer_equity_compensation: {
                  const: 'yes',
                },
              },
              required: ['offer_equity_compensation'],
            },
            then: {
              properties: {
                equity_description: {
                  type: ['string'],
                },
              },
              required: ['equity_description'],
            },
          },
        ],
        properties: {
          equity_cliff: {
            deprecated: true,
            description:
              'When the first portion of the stock option grant will vest.',
            maximum: 100,
            minimum: 0,
            readOnly: true,
            title: 'Cliff (in months)',
            type: ['number', 'null'],
            'x-jsf-presentation': {
              deprecated: {
                description: 'Deprecated in favour of equity_description',
              },
              inputType: 'number',
            },
          },
          equity_description: {
            description:
              'Please share any information related to the upcoming equity grant.',
            maxLength: 1000,
            title:
              'Number of options, RSUs (or other equity types), vesting schedule, strike price, etc.',
            type: ['string', 'null'],
            'x-jsf-presentation': {
              inputType: 'textarea',
            },
          },
          equity_vesting_period: {
            deprecated: true,
            description:
              'The number of years it will take for the employee to vest all their options.',
            maximum: 100,
            minimum: 0,
            readOnly: true,
            title: 'Vesting period (in years)',
            type: ['number', 'null'],
            'x-jsf-presentation': {
              deprecated: {
                description: 'Deprecated in favour of equity_description',
              },
              inputType: 'number',
            },
          },
          number_of_stock_options: {
            deprecated: true,
            description: "Tell us the type of equity you're granting as well.",
            maxLength: 255,
            readOnly: true,
            title: 'Number of options, RSUs, or other equity granted',
            type: ['string', 'null'],
            'x-jsf-presentation': {
              deprecated: {
                description: 'Deprecated in favour of equity_description',
              },
              inputType: 'text',
            },
          },
          offer_equity_compensation: {
            description:
              "Granting equity to your team generally triggers tax and legal obligations. In order for you to stay compliant, it's important to declare any equity grants.",
            oneOf: [
              {
                const: 'yes',
                title: 'Yes',
              },
              {
                const: 'no',
                title: 'No',
              },
            ],
            title: 'Will this employee receive equity?',
            type: 'string',
            'x-jsf-presentation': {
              direction: 'row',
              inputType: 'radio',
            },
          },
        },
        required: ['offer_equity_compensation'],
        title: 'Equity management',
        type: 'object',
        'x-jsf-order': [
          'offer_equity_compensation',
          'number_of_stock_options',
          'equity_cliff',
          'equity_vesting_period',
          'equity_description',
        ],
        'x-jsf-presentation': {
          inputType: 'fieldset',
          meta: {
            helpCenter: {
              callToAction: 'Learn more about equity management at Remote',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 18019182760333,
              title: 'Help center unavailable',
            },
          },
        },
      },
      experience_level: {
        description:
          'Please select the experience level that aligns with this role based on the job description (not the employees overall experience).',
        oneOf: [
          {
            const:
              'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
            description:
              'Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
            title: 'Level 2 - Entry Level',
          },
          {
            const:
              'Level 3 - Associate - Employees who perform independently tasks and/or with coordination and control functions',
            description:
              'Employees who perform independently tasks and/or with coordination and control functions',
            title: 'Level 3 - Associate',
          },
          {
            const:
              'Level 4 - Mid-Senior level - Employees with high professional functions, executive management responsibilities, who supervise the production with an initiative and operational autonomy within the responsibilities delegated to them',
            description:
              'Employees with high professional functions, executive management responsibilities, who supervise the production with an initiative and operational autonomy within the responsibilities delegated to them',
            title: 'Level 4 - Mid-Senior level',
          },
          {
            const:
              "Level 5 - Director - Directors perform functions of an ongoing nature that are of significant importance for the development and implementation of the company's objectives",
            description:
              "Directors perform functions of an ongoing nature that are of significant importance for the development and implementation of the company's objectives",
            title: 'Level 5 - Director',
          },
          {
            const:
              'Level 6 - Executive - An Executive is responsible for running an organization. They create plans to help their organizations grow',
            description:
              'An Executive is responsible for running an organization. They create plans to help their organizations grow',
            title: 'Level 6 - Executive',
          },
        ],
        title: 'Experience level',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'radio',
        },
      },
      has_bonus: {
        description:
          'These can include things like performance-related bonuses.',
        oneOf: [
          {
            const: 'yes',
            title: 'Yes',
          },
          {
            const: 'no',
            title: 'No',
          },
        ],
        title: 'Offer other bonuses?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 18019142406029,
              title: 'Help center unavailable',
            },
          },
        },
      },
      has_commissions: {
        description:
          'You can outline your policy and pay commission to the employee on the platform. However, commission will not appear in the employment agreement. Please send full policy details directly to the employee.',
        oneOf: [
          {
            const: 'yes',
            title: 'Yes',
          },
          {
            const: 'no',
            title: 'No',
          },
        ],
        title: 'Offer commission?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
      has_signing_bonus: {
        description:
          'This is a one-time payment the employee receives when they join your team.',
        oneOf: [
          {
            const: 'yes',
            title: 'Yes',
          },
          {
            const: 'no',
            title: 'No',
          },
        ],
        title: 'Offer a signing bonus?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
      maximum_working_hours_regime: {
        oneOf: [
          {
            const: 'yes',
            title: 'Yes',
          },
          {
            const: 'no',
            title: 'No',
          },
        ],
        title: 'Will this employee need to work more than 8 hours a day?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
      part_time_salary_confirmation: {
        const: 'acknowledged',
        description:
          "We'll include the salary in the employment agreement, so please double-check that it's correct.",
        title:
          'I confirm that this amount is the full annual salary for this part-time employee.',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'checkbox',
        },
      },
      probation_length: {
        deprecated: true,
        description:
          'Please enter a value between 0 and 6 months (legal maximum). Not electing a probationary period will adversely impact other employment actions including background checks.',
        maximum: 6,
        minimum: 0,
        readOnly: true,
        title: 'Probation period (in months) (deprecated)',
        type: ['number', 'null'],
        'x-jsf-presentation': {
          deprecated: {
            description: "Deprecated in favor of 'Probation period (in days)'.",
          },
          inputType: 'number',
          statement: {
            description:
              'If you need Remote to terminate a post-probation employee in Portugal because of your company’s economic or organizational circumstances, a mutual termination agreement must be entered into with the employee.\n\nPerformance-related terminations must meet a high threshold of compliance.\n\nIt is common for employees in Remote to bring claims and employers to pay settlements or to opt for termination by mutual agreement.\n\nDuring probation, you have some more flexibility on termination; for example, when the termination reason is the employee’s performance. For this reason, we recommend setting the probation period to the maximum allowed.',
            severity: 'info',
            title: 'Information on termination - probation',
          },
        },
      },
      probation_length_days: {
        description:
          'Please enter a value between 15 and 240 days (legal maximum).',
        maximum: 240,
        minimum: 15,
        title: 'Probation period, in days',
        type: 'number',
        'x-jsf-errorMessage': {
          maximum: 'Probation must be at most 240 days',
          minimum: 'Probation must be at least 15 days',
        },
        'x-jsf-presentation': {
          inputType: 'number',
          meta: {
            helpCenter: {
              callToAction: 'Learn about probation period',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 9013034328205,
              title: 'Help center unavailable',
            },
          },
          statement: {
            description:
              'If you need Remote to terminate a post-probation employee in Portugal because of your company’s economic or organizational circumstances, a mutual termination agreement must be entered into with the employee.\n\nPerformance-related terminations must meet a high threshold of compliance.\n\nIt is common for employees in Remote to bring claims and employers to pay settlements or to opt for termination by mutual agreement.\n\nDuring probation, you have some more flexibility on termination; for example, when the termination reason is the employee’s performance. For this reason, we recommend setting the probation period to the maximum allowed.',
            severity: 'info',
            title: 'Information on termination - probation',
          },
        },
      },
      role_description: {
        description:
          'Please add at least 3 responsibilities, at least 100 characters in total.',
        maxLength: 10000,
        minLength: 100,
        title: 'Role description',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'textarea',
          meta: {
            helpCenter: {
              callToAction: 'Why do I need to do this?',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 18019255579405,
              title: 'Help center unavailable',
            },
          },
        },
      },
      salary_installments_confirmation: {
        const: 'acknowledged',
        description:
          "In Portugal, employees receive 13th and 14th month salaries (usually called vacation and Christmas allowances) as part of their annual gross salary. The 13th and 14th salary amounts are based on an employee's regular salary and aren't affected by bonuses or commissions.",
        title:
          'I confirm the annual gross salary includes 13th and 14th salaries',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: 'Learn more about bonus salaries',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 21980576563725,
              title: 'Help center unavailable',
            },
          },
        },
      },
      signing_bonus_amount: {
        title: 'Signing bonus amount',
        type: ['integer', 'null'],
        'x-jsf-errorMessage': {
          type: 'Please, use US standard currency format. Ex: 1024.12',
        },
        'x-jsf-presentation': {
          currency: 'EUR',
          inputType: 'money',
        },
      },
      signing_bonus_clawback: {
        description:
          'This would require the employee to return the bonus if they leave your company before the first year.',
        oneOf: [
          {
            const: 'yes',
            title: 'Yes',
          },
          {
            const: 'no',
            title: 'No',
          },
        ],
        title: 'Apply a signing bonus clawback?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
      work_address: {
        allOf: [
          {
            else: {
              properties: {
                address: false,
                address_line_2: false,
                city: false,
                postal_code: false,
                work_in_person_days_per_week: false,
              },
            },
            if: {
              properties: {
                is_home_address: {
                  const: 'no',
                },
              },
              required: ['is_home_address'],
            },
            then: {
              required: [
                'address',
                'city',
                'postal_code',
                'work_in_person_days_per_week',
              ],
            },
          },
        ],
        properties: {
          address: {
            description: 'Address number and street name.',
            maxLength: 255,
            title: 'Work address line 1',
            type: 'string',
            'x-jsf-presentation': {
              inputType: 'text',
            },
          },
          address_line_2: {
            description: 'Apartment number or building number if applicable.',
            maxLength: 255,
            title: 'Work address line 2 (optional)',
            type: ['string', 'null'],
            'x-jsf-presentation': {
              inputType: 'text',
            },
          },
          city: {
            maxLength: 255,
            title: 'City',
            type: 'string',
            'x-jsf-presentation': {
              inputType: 'text',
            },
          },
          is_home_address: {
            enum: ['yes', 'no'],
            title: 'Local',
            type: 'string',
            'x-jsf-presentation': {
              direction: 'column',
              inputType: 'radio',
              options: [
                {
                  description:
                    'Select this option if the employee is fully remote.',
                  label: "Same as the employee's residential address",
                  value: 'yes',
                },
                {
                  description:
                    'Select this option if the employee is under a hybrid work regime.',
                  label: "Different than the employee's residential address",
                  value: 'no',
                },
              ],
            },
          },
          postal_code: {
            maxLength: 255,
            title: 'Postal code',
            type: 'string',
            'x-jsf-presentation': {
              inputType: 'text',
            },
          },
          work_in_person_days_per_week: {
            description:
              'The number of days per week the employee will work from this location.',
            maximum: 7,
            minimum: 1,
            title: 'Number of days per week',
            type: 'number',
            'x-jsf-presentation': {
              inputType: 'number',
            },
          },
        },
        required: ['is_home_address'],
        title: 'Work Address',
        type: 'object',
        'x-jsf-order': [
          'is_home_address',
          'address',
          'address_line_2',
          'city',
          'postal_code',
          'work_in_person_days_per_week',
        ],
        'x-jsf-presentation': {
          inputType: 'fieldset',
        },
      },
      work_from_home_allowance: {
        deprecated: true,
        description:
          "This helps employees cover additional work-from-home expenses. We recommend EUR 50 based on Portugal's practices.",
        minimum: 5000,
        readOnly: true,
        title: 'Monthly work-from-home allowance',
        type: ['integer', 'null'],
        'x-jsf-errorMessage': {
          minimum: 'Must be greater or equal to 50 EUR.',
          type: 'Please, use US standard currency format. Ex: 1024.12',
        },
        'x-jsf-presentation': {
          currency: 'EUR',
          deprecated: {
            description:
              "Deprecated because of the new 'I acknowledge Portugal's work-from-home allowance' field. No longer available to customers.",
          },
          inputType: 'money',
        },
      },
      work_from_home_allowance_ack: {
        const: 'acknowledged',
        description:
          'In Portugal, this allowance is required by law. However, the allowance amount is based on a few different factors.',
        title: "I acknowledge Portugal's work-from-home allowance",
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 20498497190285,
              title: 'Help center unavailable',
            },
          },
        },
      },
      work_hours_per_week: {
        description:
          'Please indicate the number of hours the employee will work per week.',
        title: 'Work hours per week',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      work_schedule: {
        oneOf: [
          {
            const: 'full_time',
            title: 'Full-time',
          },
          {
            const: 'part_time',
            title: 'Part-time',
          },
        ],
        title: 'Type of employee',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
      working_hours_exemption: {
        oneOf: [
          {
            const: 'yes',
            title: 'Yes',
          },
          {
            const: 'no',
            title: 'No',
          },
        ],
        title: 'Will this employee need to work outside regular work hours?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content:
                '<h1 data-component="HeadingIcon">What do I need to know?</h1><p>Portuguese law allows 3 types of employees to work outside legally defined regular work hours:</p><ul><li>Those on company boards or in senior management.</li><li>Those whose work by nature has to take place outside regular work hours.</li><li>Those who do remote work.</li></ul><p>Employers must pay every employee who works outside regular work hours a monthly allowance. The value of this allowance depends on which days and what time an employee works outside work hour.</p><p>If you have an employee in Portugal who will work outside regular work hours, we\'ll calculate their allowance for you and you\'ll pay it on top of their salary.</p>',
              title: 'Working hours exemption',
            },
          },
        },
      },
      working_hours_exemption_allowance: {
        description: '',
        title: 'Extended work hours allowance',
        type: 'integer',
        'x-jsf-errorMessage': {
          type: 'Please, use US standard currency format. Ex: 1024.12',
        },
        'x-jsf-presentation': {
          currency: 'EUR',
          inputType: 'money',
          statement: {
            severity: 'info',
            title: 'You’ll need to pay an extended work hours allowance',
          },
        },
      },
    },
    required: [
      'annual_gross_salary',
      'contract_duration_type',
      'work_schedule',
      'work_from_home_allowance_ack',
      'annual_training_hours_ack',
      'salary_installments_confirmation',
      'has_signing_bonus',
      'has_bonus',
      'has_commissions',
      'equity_compensation',
      'available_pto',
      'available_pto_type',
      'role_description',
      'experience_level',
      'work_address',
      'working_hours_exemption',
    ],
    type: 'object',
    'x-jsf-fieldsets': {
      annual_gross_salary_fieldset: {
        propertiesByName: [
          'annual_gross_salary',
          'salary_installments_confirmation',
        ],
        title: 'Annual gross salary',
      },
      extended_work_hours: {
        propertiesByName: [
          'working_hours_exemption',
          'maximum_working_hours_regime',
          'working_hours_exemption_allowance',
        ],
        title: 'Extended work hours',
      },
    },
    'x-jsf-logic': {
      computedValues: {
        working_hours_exemption_allowance_no_max_hours_value: {
          rule: {
            if: [
              {
                and: [
                  {
                    var: 'annual_gross_salary',
                  },
                  {
                    var: 'work_hours_per_week',
                  },
                ],
              },
              {
                '/': [
                  {
                    '-': [
                      {
                        '/': [
                          {
                            '*': [
                              {
                                var: 'annual_gross_salary',
                              },
                              12,
                              1.25,
                              2,
                              4,
                            ],
                          },
                          {
                            '*': [
                              {
                                var: 'work_hours_per_week',
                              },
                              52,
                              14,
                            ],
                          },
                        ],
                      },
                      {
                        '%': [
                          {
                            '/': [
                              {
                                '*': [
                                  {
                                    var: 'annual_gross_salary',
                                  },
                                  12,
                                  1.25,
                                  2,
                                  4,
                                ],
                              },
                              {
                                '*': [
                                  {
                                    var: 'work_hours_per_week',
                                  },
                                  52,
                                  14,
                                ],
                              },
                            ],
                          },
                          1,
                        ],
                      },
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
        working_hours_exemption_allowance_no_max_hours_value_in_cents: {
          rule: {
            if: [
              {
                and: [
                  {
                    var: 'annual_gross_salary',
                  },
                  {
                    var: 'work_hours_per_week',
                  },
                ],
              },
              {
                '-': [
                  {
                    '/': [
                      {
                        '*': [
                          {
                            var: 'annual_gross_salary',
                          },
                          12,
                          1.25,
                          2,
                          4,
                        ],
                      },
                      {
                        '*': [
                          {
                            var: 'work_hours_per_week',
                          },
                          52,
                          14,
                        ],
                      },
                    ],
                  },
                  {
                    '%': [
                      {
                        '/': [
                          {
                            '*': [
                              {
                                var: 'annual_gross_salary',
                              },
                              12,
                              1.25,
                              2,
                              4,
                            ],
                          },
                          {
                            '*': [
                              {
                                var: 'work_hours_per_week',
                              },
                              52,
                              14,
                            ],
                          },
                        ],
                      },
                      1,
                    ],
                  },
                ],
              },
              0,
            ],
          },
        },
        working_hours_exemption_allowance_with_max_hours_value: {
          rule: {
            if: [
              {
                and: [
                  {
                    var: 'annual_gross_salary',
                  },
                  {
                    var: 'work_hours_per_week',
                  },
                ],
              },
              {
                '/': [
                  {
                    '-': [
                      {
                        '/': [
                          {
                            '*': [
                              {
                                var: 'annual_gross_salary',
                              },
                              12,
                              1.25,
                              22,
                            ],
                          },
                          {
                            '*': [
                              {
                                var: 'work_hours_per_week',
                              },
                              52,
                              14,
                            ],
                          },
                        ],
                      },
                      {
                        '%': [
                          {
                            '/': [
                              {
                                '*': [
                                  {
                                    var: 'annual_gross_salary',
                                  },
                                  12,
                                  1.25,
                                  22,
                                ],
                              },
                              {
                                '*': [
                                  {
                                    var: 'work_hours_per_week',
                                  },
                                  52,
                                  14,
                                ],
                              },
                            ],
                          },
                          1,
                        ],
                      },
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
        working_hours_exemption_allowance_with_max_hours_value_in_cents: {
          rule: {
            if: [
              {
                and: [
                  {
                    var: 'annual_gross_salary',
                  },
                  {
                    var: 'work_hours_per_week',
                  },
                ],
              },
              {
                '-': [
                  {
                    '/': [
                      {
                        '*': [
                          {
                            var: 'annual_gross_salary',
                          },
                          12,
                          1.25,
                          22,
                        ],
                      },
                      {
                        '*': [
                          {
                            var: 'work_hours_per_week',
                          },
                          52,
                          14,
                        ],
                      },
                    ],
                  },
                  {
                    '%': [
                      {
                        '/': [
                          {
                            '*': [
                              {
                                var: 'annual_gross_salary',
                              },
                              12,
                              1.25,
                              22,
                            ],
                          },
                          {
                            '*': [
                              {
                                var: 'work_hours_per_week',
                              },
                              52,
                              14,
                            ],
                          },
                        ],
                      },
                      1,
                    ],
                  },
                ],
              },
              0,
            ],
          },
        },
      },
    },
    'x-jsf-order': [
      'contract_duration',
      'contract_duration_type',
      'contract_end_date',
      'work_schedule',
      'work_hours_per_week',
      'probation_length',
      'probation_length_days',
      'available_pto_type',
      'available_pto',
      'role_description',
      'experience_level',
      'work_address',
      'annual_gross_salary',
      'part_time_salary_confirmation',
      'salary_installments_confirmation',
      'work_from_home_allowance_ack',
      'annual_training_hours_ack',
      'work_from_home_allowance',
      'working_hours_exemption',
      'maximum_working_hours_regime',
      'working_hours_exemption_allowance',
      'has_signing_bonus',
      'signing_bonus_amount',
      'signing_bonus_clawback',
      'has_bonus',
      'bonus_amount',
      'bonus_details',
      'has_commissions',
      'commissions_details',
      'commissions_ack',
      'equity_compensation',
    ],
  },
};

export const benefitOffersSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      properties: {
        '072e0edb-bfca-46e8-a449-9eed5cbaba33': {
          allOf: [
            {
              if: {
                properties: {
                  filter: {
                    const: '73a134db-4743-4d81-a1ec-1887f2240c5c',
                  },
                },
              },
              then: {
                properties: {
                  value: {
                    oneOf: [
                      {
                        const: '0b097ff7-8b59-49dc-9cba-16543bd6a44c',
                        title: 'Life Insurance 50K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $50,000. This means that regardless of an employee's salary, the payout will not exceed $50,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-plan-50k',
                            display_cost: '5.64 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '425df8c9-7832-412a-afbb-afae3ef32db6',
                        title: 'Life Insurance - $100K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $100,000. This means that regardless of an employee's salary, the payout will not exceed $100,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-100k',
                            display_cost: '11.28 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '0b925f7a-8e3d-4936-a3d9-8003b2636937',
                        title: 'Life Insurance - $200K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $200,000. This means that regardless of an employee's salary, the payout will not exceed $200,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-200k',
                            display_cost: '22.56 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'e6e05143-4e81-4981-9e86-288ef4eb1a4c',
                        title: 'Life Insurance - $400K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $400,000. This means that regardless of an employee's salary, the payout will not exceed $400,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-400k',
                            display_cost: '45.12 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '6fb56cc8-f6be-4525-a467-2fa6698e78c4',
                        title: 'Life Insurance - $500K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $500,000. This means that regardless of an employee's salary, the payout will not exceed $500,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-500k',
                            display_cost: '56.40 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '5d190d1e-3627-480b-9c8c-b9767b2100a0',
                        title: 'Life Insurance - $600K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $600,000. This means that regardless of an employee's salary, the payout will not exceed $600,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-600k',
                            display_cost: '67.68 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'no',
                        title: "I don't want to offer this benefit.",
                      },
                    ],
                    'x-jsf-errorMessage': {
                      required: 'Please select at least one option.',
                    },
                  },
                },
                required: ['value'],
              },
            },
            {
              if: {
                properties: {
                  filter: {
                    const: '3a038ee7-5eda-42d5-8113-35336c0a4b52',
                  },
                },
              },
              then: {
                properties: {
                  value: {
                    oneOf: [
                      {
                        const: '50d0d279-00eb-42be-94a3-d533c512f6a2',
                        title:
                          'Life, Accidental Death & Permanent Disability - $50k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. \nIn the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $50,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $50,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $50,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-50k',
                            display_cost: '12.04 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '9dfaf128-fecb-4022-8436-7db2620c65f0',
                        title:
                          'Life, Accidental Death & Permanent Disability - $100k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $100,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $100,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $100,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-100k',
                            display_cost: '24.08 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '48dedc51-a717-437e-88ac-8e76e9e684fb',
                        title:
                          'Life, Accidental Death & Permanent Disability - $200k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. \n In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $200,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $200,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $200,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-200k',
                            display_cost: '48.14 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'ca518425-2a77-4ef1-aaad-37d21504d5e0',
                        title:
                          'Life, Accidental Death & Permanent Disability - $400k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. \n In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $400,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $400,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $400,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-400k',
                            display_cost: '96.28 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'ff367cab-d9cb-4aa9-adea-13562a151d7f',
                        title:
                          'Life, Accidental Death & Permanent Disability - $500k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. \n In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $500,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $500,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $500,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-500k',
                            display_cost: '120.36 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '8ede3bc9-83ec-439d-b141-f75005781976',
                        title:
                          'Life, Accidental Death & Permanent Disability - $600k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. \n In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $600,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $600,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $600,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-600k',
                            display_cost: '144.43 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'no',
                        title: "I don't want to offer this benefit.",
                      },
                    ],
                    'x-jsf-errorMessage': {
                      required: 'Please select at least one option.',
                    },
                  },
                },
                required: ['value'],
              },
            },
          ],
          properties: {
            filter: {
              default: '73a134db-4743-4d81-a1ec-1887f2240c5c',
              oneOf: [
                {
                  const: '73a134db-4743-4d81-a1ec-1887f2240c5c',
                  title: 'Basic',
                },
                {
                  const: '3a038ee7-5eda-42d5-8113-35336c0a4b52',
                  title: 'Comprehensive',
                },
              ],
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'radio',
              },
            },
            value: {
              type: 'string',
              'x-jsf-errorMessage': {
                required: 'Please select at least one option.',
              },
              'x-jsf-presentation': {
                inputType: 'radio',
              },
            },
          },
          required: ['value'],
          title: 'Life Insurance 2.0',
          type: 'object',
          'x-jsf-order': ['filter', 'value'],
          'x-jsf-presentation': {
            inputType: 'fieldset',
            meta: {
              family: 'life',
            },
          },
        },
        '0e0293ae-eec6-4d0e-9176-51c46eed435e': {
          properties: {
            value: {
              oneOf: [
                {
                  const: '2ad419c1-7f65-4be0-bcb8-94468d01fe6d',
                  title: 'Meal Allowance Standard 2025',
                  'x-jsf-presentation': {
                    description:
                      '100% Employer paid Meal Allowance (4,77 EUR per working day)\nPaid on the payslip together with the salary',
                    meta: {
                      details_url:
                        'https://remote.com/benefits-guide/employee-benefits-portugal-meal-allowance',
                      display_cost: '~100 EUR/mo',
                      display_cost_disclaimer: null,
                    },
                  },
                },
                {
                  const: '4b4514ad-689a-4600-94f1-1ca7be871d2b',
                  title: 'Meal Allowance Premium 2025',
                  'x-jsf-presentation': {
                    description:
                      '100% Employer-Paid Meal Allowance with Maximum Exempt Amount: Currently costing €6.00 EUR per worked day.\n\nPaid on the payslip together with the salary',
                    meta: {
                      details_url:
                        'https://remote.com/benefits-guide/employee-benefits-portugal-meal-allowance-premium',
                      display_cost: '~126 EUR/mo',
                      display_cost_disclaimer: null,
                    },
                  },
                },
                {
                  const: '601d28b6-efde-4b8f-b9e2-e394792fc594',
                  title: 'Meal Card Standard 2025',
                  'x-jsf-presentation': {
                    description:
                      '100% Employer paid – Meal Card (7,63 EUR per working day)\nPaid through Coverflex',
                    meta: {
                      details_url:
                        'https://remote.com/benefits-guide/employee-benefits-portugal-meal-card',
                      display_cost: '~160 EUR/mo',
                      display_cost_disclaimer: null,
                    },
                  },
                },
                {
                  const: '9d053f8b-e2c2-4aa3-878d-8af9f3e4e842',
                  title: 'Meal Card Premium 2025',
                  'x-jsf-presentation': {
                    description:
                      '100% Employer-Paid Meal Card with Maximum Exempt Amount: Currently costing €10.20 EUR per worked day.\n\nPaid through Coverflex',
                    meta: {
                      details_url:
                        'https://remote.com/benefits-guide/employee-benefits-portugal-meal-card-premium',
                      display_cost: '~212 EUR/mo',
                      display_cost_disclaimer: null,
                    },
                  },
                },
              ],
              type: 'string',
              'x-jsf-errorMessage': {
                required: 'Please select at least one option.',
              },
              'x-jsf-presentation': {
                inputType: 'radio',
              },
            },
          },
          required: ['value'],
          title: 'Meal Benefit',
          type: 'object',
          'x-jsf-order': ['value'],
          'x-jsf-presentation': {
            inputType: 'fieldset',
            meta: {
              family: 'meal',
            },
          },
        },
        'baa1ce1d-39ea-4eec-acf0-88fc8a357f54': {
          allOf: [
            {
              if: {
                properties: {
                  filter: {
                    const: '866c0615-a810-429b-b480-3a4f6ca6157d',
                  },
                },
              },
              then: {
                properties: {
                  value: {
                    oneOf: [
                      {
                        const: '45e47ffd-e1d9-4c5f-b367-ad717c30801b',
                        title: 'Basic Health Plan 2025',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee only for hospitalization, childbirth, outpatient services, and dental care. Employee covers 20% for dental; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-basic',
                            display_cost: '45.40 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '5c0c0abf-ab5c-44dd-b462-183bd306a1ed',
                        title: 'Standard Health Plan 2025 (Single)',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee only for hospitalization, childbirth, outpatient services, dental care, and vision. Employee covers 20% for dental and vision; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-standard',
                            display_cost: '51.81 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '09a2a692-c12c-4b42-8f73-6af44e5573e3',
                        title: 'Premium Health Plan 2025 (Single)',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee only for hospitalization, childbirth, outpatient services, dental, vision, medications and serious illness. Employee covers 20% for dental, vision, and medications; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-health-premium',
                            display_cost: '76.33 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                    ],
                    'x-jsf-errorMessage': {
                      required: 'Please select at least one option.',
                    },
                  },
                },
                required: ['value'],
              },
            },
            {
              if: {
                properties: {
                  filter: {
                    const: '5fd6b1a5-e453-4d9d-bdcc-ccf7fcb19b2d',
                  },
                },
              },
              then: {
                properties: {
                  value: {
                    oneOf: [
                      {
                        const: 'b31a505f-22cc-4bcc-8f18-101490934495',
                        title: 'Basic Health Plan 2025 (Family)',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee and dependents for hospitalization, childbirth, outpatient services, and dental care. Employee covers 20% for dental; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-basic-family',
                            display_cost: '~162.74 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'bccffede-49fc-47cf-a2b9-ad0defddbc79',
                        title: 'Standard Health Plan 2025 (Family)',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee and dependents for hospitalization, childbirth, outpatient services, dental care, and vision. Employee covers 20% for dental and vision; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-standard-family',
                            display_cost: '~187.14 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '37ef429d-05cc-47b9-993d-280d3dd30bef',
                        title: 'Premium Health Plan 2025 (Family)',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee and dependents for hospitalization, childbirth, outpatient services, dental, vision, medications and serious illness. Employee covers 20% for dental, vision, and medications; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-premium-family',
                            display_cost: '~276.82 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                    ],
                    'x-jsf-errorMessage': {
                      required: 'Please select at least one option.',
                    },
                  },
                },
                required: ['value'],
              },
            },
          ],
          properties: {
            filter: {
              default: '866c0615-a810-429b-b480-3a4f6ca6157d',
              oneOf: [
                {
                  const: '866c0615-a810-429b-b480-3a4f6ca6157d',
                  title: 'Single',
                },
                {
                  const: '5fd6b1a5-e453-4d9d-bdcc-ccf7fcb19b2d',
                  title: 'Family',
                },
              ],
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'radio',
              },
            },
            value: {
              type: 'string',
              'x-jsf-errorMessage': {
                required: 'Please select at least one option.',
              },
              'x-jsf-presentation': {
                inputType: 'radio',
              },
            },
          },
          required: ['value'],
          title: 'Health Insurance 2025',
          type: 'object',
          'x-jsf-order': ['filter', 'value'],
          'x-jsf-presentation': {
            inputType: 'fieldset',
            meta: {
              family: 'health',
            },
          },
        },
      },
      required: [
        '0e0293ae-eec6-4d0e-9176-51c46eed435e',
        'baa1ce1d-39ea-4eec-acf0-88fc8a357f54',
        '072e0edb-bfca-46e8-a449-9eed5cbaba33',
      ],
      type: 'object',
      'x-jsf-order': [
        '0e0293ae-eec6-4d0e-9176-51c46eed435e',
        'baa1ce1d-39ea-4eec-acf0-88fc8a357f54',
        '072e0edb-bfca-46e8-a449-9eed5cbaba33',
      ],
      'x-jsf-presentation': {
        benefits_service_fee: {
          amount: 15.0,
          currency: 'USD',
        },
        description:
          'We offer our employees supplemental benefits - Meal and Health Insurance (In partnership with Advance Care/Tranquilidade and Coverflex)',
        fine_print:
          'New: Health Insurance is now optional for new hires in Portugal.\r\nPlease note that all local payroll deductions for required coverages are included in the TCE.\r\nAny pricing changes will be communicated in advance of updated billing.',
        url: 'https://remote.com/benefits-guide/portugal',
      },
    },
  },
};

export const employmentCreatedResponse = {
  data: {
    employment: {
      id: 'f3b9ee0a-b50c-4a20-8c5e-9303781479a1',
      type: 'employee',
      country_code: 'PRT',
      updated_at: '2025-05-20T08:20:04',
      external_id: null,
      created_at: '2025-05-20T08:20:02',
      full_name: 'John Doe',
      company_id: 'c3c22940-e118-425c-9e31-f2fd4d43c6d8',
      provisional_start_date: '2025-05-29',
      job_title: 'Software Engineer',
      manager_id: null,
      department_id: null,
      user_status: 'created',
      basic_information: {
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        provisional_start_date: '2025-05-29',
        job_title: 'Software Engineer',
        tax_servicing_countries: [],
        work_email: 'john.doe@remote.com',
        has_seniority_date: 'no',
        tax_job_category: 'operations',
      },
      seniority_date: null,
      personal_email: 'john.doe@gmail.com',
      employment_lifecycle_stage: 'employment_creation',
      short_id: 'D02YZR',
      eligible_for_onboarding_cancellation: true,
      probation_period_end_date: null,
      active_contract_id: '126758da-5e2a-4032-b05e-6ff62832b08c',
    },
  },
};

export const employmentUpdatedResponse = {
  data: {
    employment: {
      files: [],
      manager_id: null,
      termination_date: null,
      administrative_details: null,
      job_title: 'pm',
      user_status: 'created',
      employment_lifecycle_stage: 'employment_creation',
      billing_address_details: null,
      eligible_for_onboarding_cancellation: true,
      user_id: '26bc68f3-c767-4e1f-84a9-e871fb736d96',
      emergency_contact_details: null,
      company_id: 'c3c22940-e118-425c-9e31-f2fd4d43c6d8',
      status: 'created',
      manager: null,
      contract_details: {
        annual_gross_salary: 2000000,
        annual_training_hours_ack: 'acknowledged',
        available_pto: 22,
        available_pto_type: 'unlimited',
        bonus_amount: null,
        bonus_details: null,
        commissions_ack: null,
        commissions_details: null,
        contract_duration_type: 'indefinite',
        contract_end_date: null,
        equity_compensation: {
          offer_equity_compensation: 'no',
        },
        experience_level:
          'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
        has_bonus: 'no',
        has_commissions: 'no',
        has_signing_bonus: 'no',
        maximum_working_hours_regime: null,
        part_time_salary_confirmation: null,
        probation_length: null,
        probation_length_days: 30,
        role_description:
          'dskdsffalljkfdssfdjkajdfsajkdflkfdlajksfddafdasdfsfdafdfdfddsafdkfdlkfdkjakldfjfkdlkdfjlkfdljfdljkajldfkajldfkjkafdjkla',
        salary_installments_confirmation: 'acknowledged',
        signing_bonus_amount: null,
        signing_bonus_clawback: null,
        work_address: {
          is_home_address: 'yes',
        },
        work_from_home_allowance: null,
        work_from_home_allowance_ack: 'acknowledged',
        work_hours_per_week: 40,
        work_schedule: 'full_time',
        working_hours_exemption: 'no',
        working_hours_exemption_allowance: null,
      },
      seniority_date: null,
      basic_information: {
        name: 'gabriel',
        email: 'ggarciaseco@gmail.com',
        job_title: 'pm',
        provisional_start_date: '2025-05-30',
        tax_servicing_countries: [],
        work_email: 'gabriel.garcia@remote.com',
        has_seniority_date: 'no',
        tax_job_category: 'operations',
      },
      full_name: 'gabriel',
      manager_email: null,
      probation_period_end_date: '2025-06-28',
      updated_at: '2025-05-20T14:26:58',
      provisional_start_date: '2025-05-30',
      address_details: null,
      pricing_plan_details: null,
      work_email: 'gabriel.garcia@remote.com',
      bank_account_details: [],
      short_id: 'R1XTJD',
      external_id: null,
      id: '4e9ee7a3-5f54-480b-a390-49a0a2d31dcb',
      country: {
        code: 'PRT',
        name: 'Portugal',
        alpha_2_code: 'PT',
        supported_json_schemas: [
          'additional_documents',
          'administrative_details',
          'contract_details',
          'employment_basic_information',
          'emergency_contact',
          'address_details',
        ],
      },
      manager_employment_id: null,
      department_id: null,
      type: 'employee',
      onboarding_tasks: {
        bank_account_details: {
          status: 'pending',
          description: 'Bank account used for receiving salary payments.',
        },
        administrative_details: {
          status: 'pending',
          description: 'Information we need for tax purposes.',
        },
        address_details: {
          status: 'pending',
          description: 'Primary residence.',
        },
        contract_details: {
          status: 'completed',
          description:
            'Employee-specific details for their employment agreement.',
        },
        personal_details: {
          status: 'pending',
          description: 'Personal details, such as name and date of birth.',
        },
        emergency_contact_details: {
          status: 'pending',
          description: 'Who should be called in an emergency.',
        },
        pricing_plan_details: {
          status: 'pending',
          description:
            'How often Remote will bill employers for management fees.',
        },
        billing_address_details: {
          status: 'pending',
          description: "Address associated with the employee's bank account.",
        },
        employment_document_details: {
          status: 'pending',
          description: 'We need some additional documents.',
        },
        employment_eligibility: {
          status: 'pending',
          description:
            'We’ll make sure you can work in the country where you live.',
        },
      },
      personal_details: null,
      created_at: '2025-05-20T14:17:29',
      personal_email: 'ggarciaseco@gmail.com',
      active_contract_id: '54e4e0e0-6c73-405f-8a91-f4b98065b65b',
      department: null,
    },
  },
};

export const benefitOffersUpdatedResponse = { data: { status: 'ok' } };

export const inviteResponse = { data: { status: 'ok' } };

export const benefitOffersResponse = {
  data: [
    {
      benefit_group: {
        name: 'Meal Benefit',
        filter: null,
        slug: '0e0293ae-eec6-4d0e-9176-51c46eed435e',
      },
      benefit_tier: {
        name: 'Meal Card Standard 2025',
        slug: '601d28b6-efde-4b8f-b9e2-e394792fc594',
        display_cost: '~160 EUR/mo',
      },
    },
    {
      benefit_group: {
        name: 'Health Insurance 2025',
        filter: {
          name: 'Single',
          slug: '866c0615-a810-429b-b480-3a4f6ca6157d',
        },
        slug: 'baa1ce1d-39ea-4eec-acf0-88fc8a357f54',
      },
      benefit_tier: {
        name: 'Basic Health Plan 2025 (Single)',
        slug: '45e47ffd-e1d9-4c5f-b367-ad717c30801b',
        display_cost: '45.40 EUR/mo',
      },
    },
    {
      benefit_group: {
        name: 'Life Insurance 2.0',
        filter: {
          name: 'Basic',
          slug: '73a134db-4743-4d81-a1ec-1887f2240c5c',
        },
        slug: '072e0edb-bfca-46e8-a449-9eed5cbaba33',
      },
      benefit_tier: {
        name: 'Life Insurance - $50K',
        slug: '0b097ff7-8b59-49dc-9cba-16543bd6a44c',
        display_cost: '5.64 USD/mo',
      },
    },
  ],
};

export const employmentResponse = {
  data: {
    employment: {
      company_id: 'c3c22940-e118-425c-9e31-f2fd4d43c6d8',
      personal_details: null,
      contract_details: {
        annual_gross_salary: 2000000,
        annual_training_hours_ack: 'acknowledged',
        available_pto: 22,
        available_pto_type: 'unlimited',
        benefits: {
          health_insurance_2025:
            'Basic Health Plan 2025 (Single) (Advance Care/ Tranquilidade - Basic Health Plan 2025 (Single))',
          life_insurance_2_0:
            'Life Insurance - $100K (Allianz Life - Global Life - Life 100k)',
          meal_benefit:
            'Meal Card Standard 2025 (Coverflex - Meal Card Standard 2025)',
        },
        bonus_amount: null,
        bonus_details: null,
        commissions_ack: null,
        commissions_details: null,
        contract_duration_type: 'indefinite',
        contract_end_date: null,
        equity_compensation: {
          offer_equity_compensation: 'no',
        },
        experience_level:
          'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
        has_bonus: 'no',
        has_commissions: 'no',
        has_signing_bonus: 'no',
        maximum_working_hours_regime: null,
        part_time_salary_confirmation: null,
        probation_length: null,
        probation_length_days: 40,
        role_description:
          'A Product Manager is responsible for guiding the development and success of a product from concept to launch. They act as the bridge between business, design, and engineering teams, ensuring alignment with user needs and company goals. Product Managers conduct market research, define product requirements, prioritize features, and manage the product roadmap. They communicate clearly with stakeholders, analyze performance data, and make decisions to optimize user experience and business outcomes. Strategic thinking, problem-solving, and leadership are key traits. A Product Manager must balance customer desires, technical feasibility, and business viability to deliver valuable, innovative products in a competitive market.',
        salary_installments_confirmation: 'acknowledged',
        signing_bonus_amount: null,
        signing_bonus_clawback: null,
        work_address: {
          is_home_address: 'yes',
        },
        work_from_home_allowance: null,
        work_from_home_allowance_ack: 'acknowledged',
        work_hours_per_week: 40,
        work_schedule: 'full_time',
        working_hours_exemption: 'no',
        working_hours_exemption_allowance: null,
      },
      external_id: null,
      onboarding_tasks: {
        bank_account_details: {
          status: 'pending',
          description: 'Bank account used for receiving salary payments.',
        },
        administrative_details: {
          status: 'pending',
          description: 'Information we need for tax purposes.',
        },
        address_details: {
          status: 'pending',
          description: 'Primary residence.',
        },
        contract_details: {
          status: 'completed',
          description:
            'Employee-specific details for their employment agreement.',
        },
        personal_details: {
          status: 'pending',
          description: 'Personal details, such as name and date of birth.',
        },
        emergency_contact_details: {
          status: 'pending',
          description: 'Who should be called in an emergency.',
        },
        pricing_plan_details: {
          status: 'pending',
          description:
            'How often Remote will bill employers for management fees.',
        },
        billing_address_details: {
          status: 'pending',
          description: "Address associated with the employee's bank account.",
        },
        employment_document_details: {
          status: 'pending',
          description: 'We need some additional documents.',
        },
        employment_eligibility: {
          status: 'pending',
          description:
            'We’ll make sure you can work in the country where you live.',
        },
      },
      job_title: 'pm',
      manager_employment_id: null,
      manager_id: null,
      work_email: 'gabriel.garcia@remote.com',
      pricing_plan_details: null,
      personal_email: 'ggarciaseco@gmail.com',
      billing_address_details: null,
      full_name: 'Gabriel',
      basic_information: {
        name: 'Gabriel',
        email: 'ggarciaseco@gmail.com',
        provisional_start_date: '2025-05-29',
        job_title: 'pm',
        tax_servicing_countries: ['Belarus'],
        work_email: 'gabriel.garcia@remote.com',
        has_seniority_date: 'no',
        tax_job_category: 'engineering_it',
      },
      status: 'created',
      manager: null,
      provisional_start_date: '2025-05-29',
      probation_period_end_date: '2025-07-07',
      created_at: '2025-05-19T08:12:18',
      manager_email: null,
      user_status: 'created',
      country: {
        code: 'PRT',
        name: 'Portugal',
        alpha_2_code: 'PT',
        supported_json_schemas: [
          'additional_documents',
          'administrative_details',
          'contract_details',
          'employment_basic_information',
          'emergency_contact',
          'address_details',
        ],
      },
      seniority_date: null,
      user_id: '36081a5d-4e4a-492b-afcd-6d859a98ea9e',
      short_id: 'DWS1T3',
      department_id: null,
      active_contract_id: 'a52001cb-05fa-4b63-b80a-7830c0c664e3',
      bank_account_details: [],
      department: null,
      employment_lifecycle_stage: 'employment_creation',
      files: [],
      emergency_contact_details: null,
      eligible_for_onboarding_cancellation: true,
      id: '38d8bb00-3d78-4dd7-98f8-bd735e68d9a9',
      administrative_details: null,
      updated_at: '2025-05-20T15:44:02',
      type: 'employee',
      termination_date: null,
      address_details: null,
    },
  },
};

export const companyResponse = {
  data: {
    company: {
      id: 'c3c22940-e118-425c-9e31-f2fd4d43c6d8',
      name: 'vadance',
      status: 'active',
      country_code: 'GBR',
      updated_at: '2025-05-30T11:34:39',
      external_id: null,
      created_at: '2024-08-27T22:45:26',
      phone_number: '+12403606587',
      bank_account_details: null,
      tax_number: '7984469',
      registration_number: null,
      terms_of_service_accepted_at: '2024-08-27T22:45:26Z',
      desired_currency: 'USD',
      company_owner_email: 'mohit.mahindroo+vadance@remote.com',
      company_owner_name: 'Michelll sdassPustomer',
      address_details: {
        address: '1509 Broderick St',
        address_line_2: 'Flat number 123',
        city: 'London',
        postal_code: 'SW79 8SY',
      },
      default_legal_entity_credit_risk_status: 'not_started',
      company_owner_user_id: 'a8a99466-a159-4bef-a9e1-0cb6939542e1',
    },
  },
};

export const conversionFromUSDToEUR = {
  data: {
    conversion_data: {
      exchange_rate: '0.85',
      target_currency: {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
      },
      source_currency: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
      },
      source_amount: 1000,
      target_amount: 850,
    },
  },
};

export const conversionFromEURToUSD = {
  data: {
    conversion_data: {
      exchange_rate: '1.17647',
      target_currency: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
      },
      source_currency: {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
      },
      source_amount: 1000,
      target_amount: 1176.47,
    },
  },
};
