export const mockBasicInformationSchema = {
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

export const mockContractorEmploymentResponse = {
  data: {
    employment: {
      short_id: 'VJ5JWS',
      seniority_date: null,
      company_id: 'f751a113-fcac-467e-aa42-70f163eae9e2',
      personal_email: 'ggarciaseco@gmail.com',
      files: [],
      personal_details: null,
      pricing_plan_details: {
        frequency: 'monthly',
      },
      updated_at: '2025-10-22T17:57:22',
      manager_email: null,
      billing_address_details: null,
      emergency_contact_details: null,
      created_at: '2025-10-22T17:57:21',
      provisional_start_date: '2025-11-26',
      eligible_for_onboarding_cancellation: true,
      work_email: 'gabriel.garcia@remote.com',
      user_id: '8e323d4c-0e1a-441a-8a66-b337a1ec5409',
      job_title: 'pm',
      active_contract_id: '8e703546-8c09-43d0-9d34-285260cbb329',
      manager: null,
      full_name: 'Gabriel',
      onboarding_tasks: {
        administrative_details: {
          status: 'pending',
          description: 'Information we need for tax purposes.',
        },
        personal_details: {
          status: 'pending',
          description: 'Personal details, such as name and date of birth.',
        },
        contract_details: {
          status: 'pending',
          description:
            'Employee-specific details for their employment agreement.',
        },
        address_details: {
          status: 'pending',
          description: 'Primary residence.',
        },
        emergency_contact_details: {
          status: 'pending',
          description: 'Who should be called in an emergency.',
        },
        pricing_plan_details: {
          status: 'completed',
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
      },
      employment_model: 'contractor',
      status: 'created',
      manager_employment_id: null,
      department: null,
      bank_account_details: [],
      basic_information: {
        name: 'Gabriel',
        manager: null,
        email: 'ggarciaseco@gmail.com',
        job_title: 'pm',
        provisional_start_date: '2025-11-26',
        has_seniority_date: 'no',
        tax_job_category: 'operations',
        tax_servicing_countries: ['Turkey'],
        work_email: 'gabriel.garcia@remote.com',
      },
      department_id: null,
      id: 'fb33c6c7-941c-4316-a9ba-e12dfef05daa',
      employment_lifecycle_stage: 'employment_creation',
      work_address_details: {},
      administrative_details: null,
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
      contract_details: null,
      external_id: null,
      type: 'contractor',
      user_status: 'created',
      address_details: null,
      termination_date: null,
      probation_period_end_date: null,
      manager_id: null,
    },
  },
};

export const mockContractorContractDetailsSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      properties: {
        payment_terms: {
          allOf: [
            {
              else: {
                properties: {
                  invoicing_frequency: false,
                  period_unit: false,
                },
              },
              if: {
                properties: {
                  payment_terms_type: {
                    const: 'pay_period',
                  },
                },
                required: ['payment_terms_type'],
              },
              then: {
                required: ['period_unit', 'invoicing_frequency'],
              },
            },
          ],
          properties: {
            compensation_currency_code: {
              description: 'What currency will the compensation be in',
              oneOf: [
                {
                  const: 'AFN',
                  title: 'Afghanistani Afghani (AFN)',
                },
                {
                  const: 'ALL',
                  title: 'Albanian Lek (ALL)',
                },
                {
                  const: 'DZD',
                  title: 'Algerian Dinar (DZD)',
                },
                {
                  const: 'AOA',
                  title: 'Angolan Kwanza (AOA)',
                },
                {
                  const: 'ARS',
                  title: 'Argentine Peso (ARS)',
                },
                {
                  const: 'AMD',
                  title: 'Armenian Dram (AMD)',
                },
                {
                  const: 'AWG',
                  title: 'Aruban Florin (AWG)',
                },
                {
                  const: 'AUD',
                  title: 'Australian Dollar (AUD)',
                },
                {
                  const: 'AZN',
                  title: 'Azerbaijani Manat (AZN)',
                },
                {
                  const: 'BSD',
                  title: 'Bahamian Dollar (BSD)',
                },
                {
                  const: 'BHD',
                  title: 'Bahraini Dinar (BHD)',
                },
                {
                  const: 'BDT',
                  title: 'Bangladeshi Taka (BDT)',
                },
                {
                  const: 'BBD',
                  title: 'Barbados Dollar (BBD)',
                },
                {
                  const: 'BYN',
                  title: 'Belarusian Ruble (BYN)',
                },
                {
                  const: 'BZD',
                  title: 'Belize Dollar (BZD)',
                },
                {
                  const: 'BMD',
                  title: 'Bermudian Dollar (BMD)',
                },
                {
                  const: 'BTN',
                  title: 'Bhutanese Ngultrum (BTN)',
                },
                {
                  const: 'BOB',
                  title: 'Bolivian Boliviano (BOB)',
                },
                {
                  const: 'BAM',
                  title: 'Bosnia-Herzegovina Convertible Mark (BAM)',
                },
                {
                  const: 'BWP',
                  title: 'Botswana Pula (BWP)',
                },
                {
                  const: 'BRL',
                  title: 'Brazilian Real (BRL)',
                },
                {
                  const: 'BND',
                  title: 'Brunei Dollar (BND)',
                },
                {
                  const: 'BGN',
                  title: 'Bulgarian Lev (BGN)',
                },
                {
                  const: 'BIF',
                  title: 'Burundian Franc (BIF)',
                },
                {
                  const: 'XPF',
                  title: 'CFP Franc (XPF)',
                },
                {
                  const: 'KHR',
                  title: 'Cambodian Riel (KHR)',
                },
                {
                  const: 'CAD',
                  title: 'Canadian Dollar (CAD)',
                },
                {
                  const: 'CVE',
                  title: 'Cape Verde Escudo (CVE)',
                },
                {
                  const: 'KYD',
                  title: 'Cayman Islands Dollar (KYD)',
                },
                {
                  const: 'XAF',
                  title: 'Central African CFA (XAF)',
                },
                {
                  const: 'CLP',
                  title: 'Chilean Peso (CLP)',
                },
                {
                  const: 'CNY',
                  title: 'Chinese Yuan Renminbi (CNY)',
                },
                {
                  const: 'COP',
                  title: 'Colombian Peso (COP)',
                },
                {
                  const: 'KMF',
                  title: 'Comorian Franc (KMF)',
                },
                {
                  const: 'CDF',
                  title: 'Congolese franc (CDF)',
                },
                {
                  const: 'CRC',
                  title: 'Costa Rican Colon (CRC)',
                },
                {
                  const: 'CUC',
                  title: 'Cuban Convertible Peso (CUC)',
                },
                {
                  const: 'CZK',
                  title: 'Czech Koruna (CZK)',
                },
                {
                  const: 'DKK',
                  title: 'Danish Krone (DKK)',
                },
                {
                  const: 'DJF',
                  title: 'Djiboutian Franc (DJF)',
                },
                {
                  const: 'DOP',
                  title: 'Dominican Peso (DOP)',
                },
                {
                  const: 'XCD',
                  title: 'East Caribbean Dollar (XCD)',
                },
                {
                  const: 'EGP',
                  title: 'Egyptian Pound (EGP)',
                },
                {
                  const: 'ERN',
                  title: 'Eritrean Nakfa (ERN)',
                },
                {
                  const: 'ETB',
                  title: 'Ethiopian Birr (ETB)',
                },
                {
                  const: 'EUR',
                  title: 'European Euro (EUR)',
                },
                {
                  const: 'FKP',
                  title: 'Falkland Islands Pound (FKP)',
                },
                {
                  const: 'FJD',
                  title: 'Fiji Dollar (FJD)',
                },
                {
                  const: 'GMD',
                  title: 'Gambian Dalasi (GMD)',
                },
                {
                  const: 'GEL',
                  title: 'Georgian Lari (GEL)',
                },
                {
                  const: 'GHS',
                  title: 'Ghanaian Cedi (GHS)',
                },
                {
                  const: 'GIP',
                  title: 'Gibraltar Pound (GIP)',
                },
                {
                  const: 'GTQ',
                  title: 'Guatemalan Quetzal (GTQ)',
                },
                {
                  const: 'GNF',
                  title: 'Guinean Franc (GNF)',
                },
                {
                  const: 'GYD',
                  title: 'Guyanese Dollar (GYD)',
                },
                {
                  const: 'HTG',
                  title: 'Haitian Gourde (HTG)',
                },
                {
                  const: 'HNL',
                  title: 'Honduran Lempira (HNL)',
                },
                {
                  const: 'HKD',
                  title: 'Hong Kong Dollar (HKD)',
                },
                {
                  const: 'HUF',
                  title: 'Hungarian Forint (HUF)',
                },
                {
                  const: 'ISK',
                  title: 'Icelandic Krona (ISK)',
                },
                {
                  const: 'INR',
                  title: 'Indian Rupee (INR)',
                },
                {
                  const: 'IDR',
                  title: 'Indonesian Rupiah (IDR)',
                },
                {
                  const: 'IRR',
                  title: 'Iranian Rial (IRR)',
                },
                {
                  const: 'IQD',
                  title: 'Iraqi Dinar (IQD)',
                },
                {
                  const: 'ILS',
                  title: 'Israeli New Sheqel (ILS)',
                },
                {
                  const: 'JMD',
                  title: 'Jamaican Dollar (JMD)',
                },
                {
                  const: 'JPY',
                  title: 'Japanese Yen (JPY)',
                },
                {
                  const: 'JOD',
                  title: 'Jordanian Dinar (JOD)',
                },
                {
                  const: 'KZT',
                  title: 'Kazakhstani Tenge (KZT)',
                },
                {
                  const: 'KES',
                  title: 'Kenyan Shilling (KES)',
                },
                {
                  const: 'KWD',
                  title: 'Kuwaiti Dinar (KWD)',
                },
                {
                  const: 'KGS',
                  title: 'Kyrgyzstani Som (KGS)',
                },
                {
                  const: 'LAK',
                  title: 'Lao Kip (LAK)',
                },
                {
                  const: 'LBP',
                  title: 'Lebanese Pound (LBP)',
                },
                {
                  const: 'LSL',
                  title: 'Lesotho Loti (LSL)',
                },
                {
                  const: 'LRD',
                  title: 'Liberian Dollar (LRD)',
                },
                {
                  const: 'LYD',
                  title: 'Libyan Dinar (LYD)',
                },
                {
                  const: 'MOP',
                  title: 'Macanese Pataca (MOP)',
                },
                {
                  const: 'MKD',
                  title: 'Macedonian Denar (MKD)',
                },
                {
                  const: 'MGA',
                  title: 'Malagasy Ariary (MGA)',
                },
                {
                  const: 'MWK',
                  title: 'Malawian Kwacha (MWK)',
                },
                {
                  const: 'MYR',
                  title: 'Malaysian Ringgit (MYR)',
                },
                {
                  const: 'MVR',
                  title: 'Maldives Rufiyaa (MVR)',
                },
                {
                  const: 'MRU',
                  title: 'Mauritanian Ouguiya (MRU)',
                },
                {
                  const: 'MUR',
                  title: 'Mauritian Rupee (MUR)',
                },
                {
                  const: 'MXN',
                  title: 'Mexican Peso (MXN)',
                },
                {
                  const: 'MDL',
                  title: 'Moldovan Leu (MDL)',
                },
                {
                  const: 'MNT',
                  title: 'Mongolian Tugrik (MNT)',
                },
                {
                  const: 'MAD',
                  title: 'Moroccan Dirham (MAD)',
                },
                {
                  const: 'MZN',
                  title: 'Mozambican Metical (MZN)',
                },
                {
                  const: 'MMK',
                  title: 'Myanmar Kyat (MMK)',
                },
                {
                  const: 'NAD',
                  title: 'Namibian Dollar (NAD)',
                },
                {
                  const: 'NPR',
                  title: 'Nepalese Rupee (NPR)',
                },
                {
                  const: 'ANG',
                  title: 'Netherlands Antillean Guilder (ANG)',
                },
                {
                  const: 'TWD',
                  title: 'New Taiwan Dollar (TWD)',
                },
                {
                  const: 'NZD',
                  title: 'New Zealand Dollar (NZD)',
                },
                {
                  const: 'NIO',
                  title: 'Nicaraguan Córdoba (NIO)',
                },
                {
                  const: 'NGN',
                  title: 'Nigerian Naira (NGN)',
                },
                {
                  const: 'KPW',
                  title: 'North Korean Won (KPW)',
                },
                {
                  const: 'NOK',
                  title: 'Norwegian Krone (NOK)',
                },
                {
                  const: 'OMR',
                  title: 'Omani Rial (OMR)',
                },
                {
                  const: 'PKR',
                  title: 'Pakistan Rupee (PKR)',
                },
                {
                  const: 'PAB',
                  title: 'Panamanian Balboa (PAB)',
                },
                {
                  const: 'PGK',
                  title: 'Papua New Guinea Kina (PGK)',
                },
                {
                  const: 'PYG',
                  title: 'Paraguay Guarani (PYG)',
                },
                {
                  const: 'PEN',
                  title: 'Peruvian Sol (PEN)',
                },
                {
                  const: 'PHP',
                  title: 'Philippine Peso (PHP)',
                },
                {
                  const: 'PLN',
                  title: 'Polish Zloty (PLN)',
                },
                {
                  const: 'QAR',
                  title: 'Qatari Riyal (QAR)',
                },
                {
                  const: 'RON',
                  title: 'Romanian Leu (RON)',
                },
                {
                  const: 'RUB',
                  title: 'Russian Ruble (RUB)',
                },
                {
                  const: 'RWF',
                  title: 'Rwandan Franc (RWF)',
                },
                {
                  const: 'SHP',
                  title: 'Saint Helena Pound (SHP)',
                },
                {
                  const: 'WST',
                  title: 'Samoan Tala (WST)',
                },
                {
                  const: 'STN',
                  title: 'Sao Tome Dobra (STN)',
                },
                {
                  const: 'SAR',
                  title: 'Saudi Arabian Riyal (SAR)',
                },
                {
                  const: 'RSD',
                  title: 'Serbian Dinar (RSD)',
                },
                {
                  const: 'SCR',
                  title: 'Seychelles Rupee (SCR)',
                },
                {
                  const: 'SLL',
                  title: 'Sierra Leonean Leone (SLL)',
                },
                {
                  const: 'SGD',
                  title: 'Singapore Dollar (SGD)',
                },
                {
                  const: 'SBD',
                  title: 'Solomon Islands Dollar (SBD)',
                },
                {
                  const: 'SOS',
                  title: 'Somali Shilling (SOS)',
                },
                {
                  const: 'ZAR',
                  title: 'South African Rand (ZAR)',
                },
                {
                  const: 'KRW',
                  title: 'South Korean Won (KRW)',
                },
                {
                  const: 'SSP',
                  title: 'South Sudanese pound (SSP)',
                },
                {
                  const: 'LKR',
                  title: 'Sri Lankan Rupee (LKR)',
                },
                {
                  const: 'SDG',
                  title: 'Sudanese pound (SDG)',
                },
                {
                  const: 'SRD',
                  title: 'Suriname Dollar (SRD)',
                },
                {
                  const: 'SZL',
                  title: 'Swazi Lilangeni (SZL)',
                },
                {
                  const: 'SEK',
                  title: 'Swedish Krona (SEK)',
                },
                {
                  const: 'CHF',
                  title: 'Swiss Franc (CHF)',
                },
                {
                  const: 'SYP',
                  title: 'Syrian Pound (SYP)',
                },
                {
                  const: 'TJS',
                  title: 'Tajikistan Somoni (TJS)',
                },
                {
                  const: 'TZS',
                  title: 'Tanzanian Shilling (TZS)',
                },
                {
                  const: 'THB',
                  title: 'Thai Baht (THB)',
                },
                {
                  const: 'TOP',
                  title: "Tongan Pa'Anga (TOP)",
                },
                {
                  const: 'TTD',
                  title: 'Trinidad and Tobago Dollar (TTD)',
                },
                {
                  const: 'TND',
                  title: 'Tunisian Dinar (TND)',
                },
                {
                  const: 'TRY',
                  title: 'Turkish New Lira (TRY)',
                },
                {
                  const: 'TMT',
                  title: 'Turkmenistani Manat (TMT)',
                },
                {
                  const: 'UGX',
                  title: 'Ugandan Shilling (UGX)',
                },
                {
                  const: 'UAH',
                  title: 'Ukrainian Hryvnia (UAH)',
                },
                {
                  const: 'AED',
                  title: 'United Arab Emirates Dirham (AED)',
                },
                {
                  const: 'GBP',
                  title: 'United Kingdom Pound Sterling (GBP)',
                },
                {
                  const: 'USD',
                  title: 'United States Dollar (USD)',
                },
                {
                  const: 'UYU',
                  title: 'Uruguayan peso (UYU)',
                },
                {
                  const: 'UZS',
                  title: 'Uzbekistani Som (UZS)',
                },
                {
                  const: 'VUV',
                  title: 'Vanuatu Vatu (VUV)',
                },
                {
                  const: 'VEF',
                  title: 'Venezuelan Bolivar (VEF)',
                },
                {
                  const: 'VND',
                  title: 'Viet Nam Dong (VND)',
                },
                {
                  const: 'XOF',
                  title: 'West African CFA (XOF)',
                },
                {
                  const: 'YER',
                  title: 'Yemeni Rial (YER)',
                },
                {
                  const: 'ZMW',
                  title: 'Zambian Kwacha (ZMW)',
                },
              ],
              title: 'Gross compensation currency',
              type: 'string',
              uniqueItems: true,
              'x-jsf-presentation': {
                inputType: 'select',
                placeholder: 'Contract currency',
              },
            },
            compensation_gross_amount: {
              description: 'How much you like to pay this contractor',
              minimum: 1,
              title: 'Gross compensation amount',
              type: 'integer',
              'x-jsf-errorMessage': {
                type: 'Please, use US standard currency format. Ex: 1024.12',
              },
              'x-jsf-presentation': {
                currency: '---',
                inputType: 'money',
              },
            },
            invoicing_frequency: {
              description: 'How frequently you want to pay this contractor.',
              oneOf: [
                {
                  const: 'weekly',
                  title: 'Weekly',
                },
                {
                  const: 'bi_weekly',
                  title: 'Bi-weekly',
                },
                {
                  const: 'semi_monthly',
                  title: 'Semi-monthly',
                },
                {
                  const: 'monthly',
                  title: 'Monthly',
                },
              ],
              title: 'Contractor Invoicing Frequency',
              type: 'string',
              'x-jsf-presentation': {
                description:
                  'How frequently you want to pay this contractor. <a href="https://support.remote.com/hc/en-us/articles/13291069350413-What-are-the-frequency-options-when-scheduling-a-contractor-s-invoice">Learn more about invoicing frequencies.</a>',
                inputType: 'select',
              },
            },
            payment_terms_type: {
              default: 'pay_period',
              oneOf: [
                {
                  const: 'pay_period',
                  title: 'Per pay period',
                },
                {
                  const: 'completion_of_services',
                  title: 'Completion of services',
                },
              ],
              title: '',
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'radio',
              },
            },
            period_unit: {
              description: 'How compensation is calculated (e.g. per hour)',
              oneOf: [
                {
                  const: 'hourly',
                  title: 'Hour',
                },
                {
                  const: 'daily',
                  title: 'Day',
                },
                {
                  const: 'weekly',
                  title: 'Week',
                },
                {
                  const: 'monthly',
                  title: 'Month',
                },
              ],
              title: 'Compensation period unit',
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'select',
              },
            },
          },
          required: ['payment_terms_type', 'compensation_gross_amount'],
          title: 'Payment terms',
          type: 'object',
          'x-jsf-order': [
            'payment_terms_type',
            'invoicing_frequency',
            'compensation_gross_amount',
            'compensation_currency_code',
            'period_unit',
          ],
          'x-jsf-presentation': {
            inputType: 'fieldset',
          },
        },
        service_duration: {
          properties: {
            expiration_date: {
              description: 'Expected date of completion of services',
              format: 'date',
              maxLength: 255,
              title: 'Service end date',
              type: ['string', 'null'],
              'x-jsf-presentation': {
                description: 'Expected date of completion of services',
                inputType: 'date',
              },
            },
            provisional_start_date: {
              description:
                'When the contractor will start providing service to your company.',
              format: 'date',
              title: 'Service start date',
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'date',
              },
            },
          },
          required: ['provisional_start_date'],
          title: 'Service duration',
          type: 'object',
          'x-jsf-order': ['provisional_start_date', 'expiration_date'],
          'x-jsf-presentation': {
            inputType: 'fieldset',
          },
        },
        services_and_deliverables: {
          description:
            'List of projects, project descriptions and deliverables that a Contractor shall provide',
          maxLength: 3000,
          minLength: 10,
          title: 'Services and Deliverables',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        termination: {
          properties: {
            company_notice_period_amount: {
              description:
                'The notice period the company must give to the contractor before terminating the Statement of Work.',
              title: 'Company termination notice period, in days',
              type: 'number',
              'x-jsf-presentation': {
                inputType: 'number',
              },
            },
            contractor_notice_period_amount: {
              description:
                'The notice period the contractor must give to your company before terminating the Statement of Work.',
              title: 'Contractor termination notice period, in days',
              type: 'number',
              'x-jsf-presentation': {
                inputType: 'number',
              },
            },
          },
          required: [
            'contractor_notice_period_amount',
            'company_notice_period_amount',
          ],
          title: 'Termination',
          type: 'object',
          'x-jsf-order': [
            'contractor_notice_period_amount',
            'company_notice_period_amount',
          ],
          'x-jsf-presentation': {
            inputType: 'fieldset',
          },
        },
      },
      required: [
        'services_and_deliverables',
        'service_duration',
        'termination',
        'payment_terms',
      ],
      type: 'object',
      'x-jsf-order': [
        'services_and_deliverables',
        'service_duration',
        'termination',
        'payment_terms',
      ],
    },
  },
};

export const mockSignatureSchema = {};

export const mockContractDocumentPreviewResponse = {};

export const mockContractDocumentCreatedResponse = {};

export const mockContractDocumentSignedResponse = {};

export const inviteResponse = {};
