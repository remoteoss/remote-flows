export const mockContractorCurrenciesResponse = {
  data: [
    {
      code: 'USD',
      source: 'default_payment_currency',
    },
    {
      code: 'EUR',
      source: 'contract_country_currency',
    },
    {
      code: 'AED',
      source: 'all_currencies',
    },
    {
      code: 'ARS',
      source: 'all_currencies',
    },
  ],
};

export const mockContractorBasicInformationSchema = {
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
            description: 'Select a department or create one.',
            oneOf: [
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
              'The person who will manage this employee day-to-day on the Remote platform.',
            oneOf: [
              {
                const: 'f2568e99-b32f-4b5c-b008-2d09e427f2a5',
                title:
                  'gabriel.garcia+yhl3qae5cwgtm286-company-owner-email-FRA@remote.com',
                'x-jsf-presentation': {
                  meta: {
                    assigned_roles: [
                      {
                        data_scope: 'all',
                        name: 'Owner',
                        slug: '28bdb519-cb06-4ee3-aac7-b176f6bd6bb9',
                        type: 'owner',
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
          'The minimum onboarding time for Spain is 20 working days. We will confirm the start date once you invite the employee to do the self-enrollment. We strongly recommend a later start date if you plan to conduct background checks and want to lower termination risks and costs due to unsatisfactory results.',
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
            const: 'engineering_it',
            title: 'Engineering/IT',
          },
          {
            const: 'legal',
            title: 'Legal/Paralegal',
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
            'Zimbabwe',
            'Zambia',
            'Yemen',
            'Wallis and Futuna Islands',
            'Vietnam',
            'Venezuela',
            'Vatican City (Holy See)',
            'Vanuatu',
            'Uzbekistan',
            'Uruguay',
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
            'Togo',
            'Timor-Leste',
            'Thailand',
            'Tanzania',
            'Tajikistan',
            'Taiwan',
            'Syria',
            'Switzerland',
            'Sweden',
            'Swaziland',
            'Suriname',
            'Sudan',
            'Sri Lanka',
            'Spain',
            'South Sudan',
            'South Korea',
            'South Africa',
            'Somalia',
            'Solomon Islands',
            'Slovenia',
            'Slovakia',
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
            'Saint Lucia',
            'Saint Kitts and Nevis',
            'Saint Helena',
            'Réunion',
            'Rwanda',
            'Russia',
            'Romania',
            'Republic of the Congo',
            'Qatar',
            'Puerto Rico',
            'Portugal',
            'Poland',
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
            'North Korea',
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
            'Iran',
            'Indonesia',
            'India',
            'Iceland',
            'Hungary',
            'Hong Kong',
            'Honduras',
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
            'Brazil',
            'Botswana',
            'Bosnia and Herzegovina',
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
                'Gabon',
                'Gambia',
                'Ghana',
                'Guinea',
                'Guinea-Bissau',
                'Guyana',
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
                'Palestine',
                'Qatar',
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
                'Syria',
                'Tanzania',
                'Togo',
                'Tunisia',
                'Uganda',
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
                'Saint Kitts and Nevis',
                'Saint Lucia',
                'Saint Pierre and Miquelon',
                'Saint Vincent and the Grenadines',
                'Suriname',
                'Trinidad and Tobago',
                'Turks and Caicos Islands',
                'U.S. Virgin Islands',
                'United States',
                'Uruguay',
                'Venezuela',
              ],
              Asia: [
                'Afghanistan',
                'American Samoa',
                'Australia',
                'Azerbaijan',
                'Bahrain',
                'Bangladesh',
                'Bhutan',
                'Brunei',
                'Burkina Faso',
                'Cambodia',
                'China',
                'Christmas Island',
                'Cocos (Keeling) Islands',
                'Cook Islands',
                'Fiji',
                'French Polynesia',
                'Guam',
                'Hong Kong',
                'India',
                'Indonesia',
                'Iran',
                'Iraq',
                'Israel',
                'Japan',
                'Jordan',
                'Kazakhstan',
                'Kiribati',
                'Kuwait',
                'Kyrgyzstan',
                'Laos',
                'Lebanon',
                'Macao',
                'Malaysia',
                'Maldives',
                'Marshall Islands',
                'Micronesia',
                'Mongolia',
                'Myanmar (Burma)',
                'Nauru',
                'Nepal',
                'New Caledonia',
                'New Zealand',
                'Niue',
                'Norfolk Island',
                'North Korea',
                'Northern Mariana Islands',
                'Oman',
                'Pakistan',
                'Palau',
                'Papua New Guinea',
                'Philippines',
                'Samoa',
                'Saudi Arabia',
                'Singapore',
                'Solomon Islands',
                'South Korea',
                'Sri Lanka',
                'Taiwan',
                'Tajikistan',
                'Thailand',
                'Timor-Leste',
                'Tonga',
                'Turkey',
                'Turkmenistan',
                'Tuvalu',
                'United Arab Emirates (UAE)',
                'Uzbekistan',
                'Vanuatu',
                'Vietnam',
                'Wallis and Futuna Islands',
                'Yemen',
              ],
              Europe: [
                'Albania',
                'Andorra',
                'Armenia',
                'Austria',
                'Belarus',
                'Belgium',
                'Bosnia and Herzegovina',
                'Bulgaria',
                'Croatia',
                'Cyprus',
                'Czech Republic',
                'Denmark',
                'Estonia',
                'Faroe Islands',
                'Finland',
                'France',
                'Georgia',
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
                'Sweden',
                'Switzerland',
                'Ukraine',
                'United Kingdom (UK)',
                'Vatican City (Holy See)',
              ],
            },
            subregions: {},
          },
          inputType: 'countries',
          options: [
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Afghanistan',
              value: 'Afghanistan',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Albania',
              value: 'Albania',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Algeria',
              value: 'Algeria',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'American Samoa',
              value: 'American Samoa',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Andorra',
              value: 'Andorra',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Angola',
              value: 'Angola',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Anguilla',
              value: 'Anguilla',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Antigua and Barbuda',
              value: 'Antigua and Barbuda',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Argentina',
              value: 'Argentina',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Armenia',
              value: 'Armenia',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Aruba',
              value: 'Aruba',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Australia',
              value: 'Australia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Austria',
              value: 'Austria',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Azerbaijan',
              value: 'Azerbaijan',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Bahamas',
              value: 'Bahamas',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Bahrain',
              value: 'Bahrain',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Bangladesh',
              value: 'Bangladesh',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Barbados',
              value: 'Barbados',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Belarus',
              value: 'Belarus',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Belgium',
              value: 'Belgium',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Belize',
              value: 'Belize',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Benin',
              value: 'Benin',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Bermuda',
              value: 'Bermuda',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Bhutan',
              value: 'Bhutan',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Bolivia',
              value: 'Bolivia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Bosnia and Herzegovina',
              value: 'Bosnia and Herzegovina',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Botswana',
              value: 'Botswana',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Brazil',
              value: 'Brazil',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'British Virgin Islands',
              value: 'British Virgin Islands',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Brunei',
              value: 'Brunei',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Bulgaria',
              value: 'Bulgaria',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Burkina Faso',
              value: 'Burkina Faso',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Burundi',
              value: 'Burundi',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Cabo Verde',
              value: 'Cabo Verde',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Cambodia',
              value: 'Cambodia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Cameroon',
              value: 'Cameroon',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Canada',
              value: 'Canada',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Cayman Islands',
              value: 'Cayman Islands',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Central African Republic (CAR)',
              value: 'Central African Republic (CAR)',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Chad',
              value: 'Chad',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Chile',
              value: 'Chile',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'China',
              value: 'China',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Christmas Island',
              value: 'Christmas Island',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Cocos (Keeling) Islands',
              value: 'Cocos (Keeling) Islands',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Colombia',
              value: 'Colombia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Comoros',
              value: 'Comoros',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Cook Islands',
              value: 'Cook Islands',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Costa Rica',
              value: 'Costa Rica',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: "Cote d'Ivoire",
              value: "Cote d'Ivoire",
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Croatia',
              value: 'Croatia',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Cuba',
              value: 'Cuba',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Curacao',
              value: 'Curacao',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Cyprus',
              value: 'Cyprus',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Czech Republic',
              value: 'Czech Republic',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Democratic Republic of the Congo',
              value: 'Democratic Republic of the Congo',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Denmark',
              value: 'Denmark',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Djibouti',
              value: 'Djibouti',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Dominica',
              value: 'Dominica',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Dominican Republic',
              value: 'Dominican Republic',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Ecuador',
              value: 'Ecuador',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Egypt',
              value: 'Egypt',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'El Salvador',
              value: 'El Salvador',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Equatorial Guinea',
              value: 'Equatorial Guinea',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Eritrea',
              value: 'Eritrea',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Estonia',
              value: 'Estonia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Ethiopia',
              value: 'Ethiopia',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Falkland Islands (Malvinas)',
              value: 'Falkland Islands (Malvinas)',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Faroe Islands',
              value: 'Faroe Islands',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Fiji',
              value: 'Fiji',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Finland',
              value: 'Finland',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'France',
              value: 'France',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'French Guiana',
              value: 'French Guiana',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'French Polynesia',
              value: 'French Polynesia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Gabon',
              value: 'Gabon',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Gambia',
              value: 'Gambia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Georgia',
              value: 'Georgia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Germany',
              value: 'Germany',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Ghana',
              value: 'Ghana',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Gibraltar',
              value: 'Gibraltar',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Greece',
              value: 'Greece',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Greenland',
              value: 'Greenland',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Grenada',
              value: 'Grenada',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Guadeloupe',
              value: 'Guadeloupe',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Guam',
              value: 'Guam',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Guatemala',
              value: 'Guatemala',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Guernsey',
              value: 'Guernsey',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Guinea',
              value: 'Guinea',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Guinea-Bissau',
              value: 'Guinea-Bissau',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Guyana',
              value: 'Guyana',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Haiti',
              value: 'Haiti',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Honduras',
              value: 'Honduras',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Hong Kong',
              value: 'Hong Kong',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Hungary',
              value: 'Hungary',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Iceland',
              value: 'Iceland',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'India',
              value: 'India',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Indonesia',
              value: 'Indonesia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Iran',
              value: 'Iran',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Iraq',
              value: 'Iraq',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Ireland',
              value: 'Ireland',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Isle of Man',
              value: 'Isle of Man',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Israel',
              value: 'Israel',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Italy',
              value: 'Italy',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Jamaica',
              value: 'Jamaica',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Japan',
              value: 'Japan',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Jersey',
              value: 'Jersey',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Jordan',
              value: 'Jordan',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Kazakhstan',
              value: 'Kazakhstan',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Kenya',
              value: 'Kenya',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Kiribati',
              value: 'Kiribati',
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
                subregion: null,
              },
              label: 'Kuwait',
              value: 'Kuwait',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Kyrgyzstan',
              value: 'Kyrgyzstan',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Laos',
              value: 'Laos',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Latvia',
              value: 'Latvia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Lebanon',
              value: 'Lebanon',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Lesotho',
              value: 'Lesotho',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Liberia',
              value: 'Liberia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Libya',
              value: 'Libya',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Liechtenstein',
              value: 'Liechtenstein',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Lithuania',
              value: 'Lithuania',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Luxembourg',
              value: 'Luxembourg',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Macao',
              value: 'Macao',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Madagascar',
              value: 'Madagascar',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Malawi',
              value: 'Malawi',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Malaysia',
              value: 'Malaysia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Maldives',
              value: 'Maldives',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Mali',
              value: 'Mali',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Malta',
              value: 'Malta',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Marshall Islands',
              value: 'Marshall Islands',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Martinique',
              value: 'Martinique',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Mauritania',
              value: 'Mauritania',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Mauritius',
              value: 'Mauritius',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Mayotte',
              value: 'Mayotte',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Mexico',
              value: 'Mexico',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Micronesia',
              value: 'Micronesia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Moldova',
              value: 'Moldova',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Monaco',
              value: 'Monaco',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Mongolia',
              value: 'Mongolia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Montenegro',
              value: 'Montenegro',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Montserrat',
              value: 'Montserrat',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Morocco',
              value: 'Morocco',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Mozambique',
              value: 'Mozambique',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Myanmar (Burma)',
              value: 'Myanmar (Burma)',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Namibia',
              value: 'Namibia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Nauru',
              value: 'Nauru',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Nepal',
              value: 'Nepal',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Netherlands',
              value: 'Netherlands',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'New Caledonia',
              value: 'New Caledonia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'New Zealand',
              value: 'New Zealand',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Nicaragua',
              value: 'Nicaragua',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Niger',
              value: 'Niger',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Nigeria',
              value: 'Nigeria',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Niue',
              value: 'Niue',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Norfolk Island',
              value: 'Norfolk Island',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'North Korea',
              value: 'North Korea',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'North Macedonia',
              value: 'North Macedonia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Northern Mariana Islands',
              value: 'Northern Mariana Islands',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Norway',
              value: 'Norway',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Oman',
              value: 'Oman',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Pakistan',
              value: 'Pakistan',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Palau',
              value: 'Palau',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Palestine',
              value: 'Palestine',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Panama',
              value: 'Panama',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Papua New Guinea',
              value: 'Papua New Guinea',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Paraguay',
              value: 'Paraguay',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Peru',
              value: 'Peru',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Philippines',
              value: 'Philippines',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Poland',
              value: 'Poland',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Portugal',
              value: 'Portugal',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Puerto Rico',
              value: 'Puerto Rico',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Qatar',
              value: 'Qatar',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Republic of the Congo',
              value: 'Republic of the Congo',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Romania',
              value: 'Romania',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Russia',
              value: 'Russia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Rwanda',
              value: 'Rwanda',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Réunion',
              value: 'Réunion',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Saint Helena',
              value: 'Saint Helena',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Saint Kitts and Nevis',
              value: 'Saint Kitts and Nevis',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Saint Lucia',
              value: 'Saint Lucia',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Saint Pierre and Miquelon',
              value: 'Saint Pierre and Miquelon',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Saint Vincent and the Grenadines',
              value: 'Saint Vincent and the Grenadines',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Samoa',
              value: 'Samoa',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'San Marino',
              value: 'San Marino',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Sao Tome and Principe',
              value: 'Sao Tome and Principe',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Saudi Arabia',
              value: 'Saudi Arabia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Senegal',
              value: 'Senegal',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Serbia',
              value: 'Serbia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Seychelles',
              value: 'Seychelles',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Sierra Leone',
              value: 'Sierra Leone',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Singapore',
              value: 'Singapore',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Slovakia',
              value: 'Slovakia',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Slovenia',
              value: 'Slovenia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Solomon Islands',
              value: 'Solomon Islands',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Somalia',
              value: 'Somalia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'South Africa',
              value: 'South Africa',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'South Korea',
              value: 'South Korea',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'South Sudan',
              value: 'South Sudan',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Spain',
              value: 'Spain',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Sri Lanka',
              value: 'Sri Lanka',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Sudan',
              value: 'Sudan',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Suriname',
              value: 'Suriname',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Swaziland',
              value: 'Swaziland',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Sweden',
              value: 'Sweden',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Switzerland',
              value: 'Switzerland',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Syria',
              value: 'Syria',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Taiwan',
              value: 'Taiwan',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Tajikistan',
              value: 'Tajikistan',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Tanzania',
              value: 'Tanzania',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Thailand',
              value: 'Thailand',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Timor-Leste',
              value: 'Timor-Leste',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Togo',
              value: 'Togo',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Tonga',
              value: 'Tonga',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Trinidad and Tobago',
              value: 'Trinidad and Tobago',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Tunisia',
              value: 'Tunisia',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Turkey',
              value: 'Turkey',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Turkmenistan',
              value: 'Turkmenistan',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Turks and Caicos Islands',
              value: 'Turks and Caicos Islands',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Tuvalu',
              value: 'Tuvalu',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'U.S. Virgin Islands',
              value: 'U.S. Virgin Islands',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Uganda',
              value: 'Uganda',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Ukraine',
              value: 'Ukraine',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'United Arab Emirates (UAE)',
              value: 'United Arab Emirates (UAE)',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'United Kingdom (UK)',
              value: 'United Kingdom (UK)',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'United States',
              value: 'United States',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Uruguay',
              value: 'Uruguay',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Uzbekistan',
              value: 'Uzbekistan',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Vanuatu',
              value: 'Vanuatu',
            },
            {
              $meta: {
                region: 'Europe',
                subregion: null,
              },
              label: 'Vatican City (Holy See)',
              value: 'Vatican City (Holy See)',
            },
            {
              $meta: {
                region: 'Americas',
                subregion: null,
              },
              label: 'Venezuela',
              value: 'Venezuela',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Vietnam',
              value: 'Vietnam',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Wallis and Futuna Islands',
              value: 'Wallis and Futuna Islands',
            },
            {
              $meta: {
                region: 'Asia',
                subregion: null,
              },
              label: 'Yemen',
              value: 'Yemen',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Zambia',
              value: 'Zambia',
            },
            {
              $meta: {
                region: 'Africa',
                subregion: null,
              },
              label: 'Zimbabwe',
              value: 'Zimbabwe',
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
