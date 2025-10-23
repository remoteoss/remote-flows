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

export const mockContractDocumentPreviewResponse = {
  data: {
    contract_document: {
      name: '2025-10-23_MagicLinkTestCompany_Gabriel_Unsigned.pdf',
      content:
        'data:application/pdf;base64,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OTcgMzY2IDQ2OSA1NzQgNjQxIDYzMSA2NDkgNjM4IDI0NyA1ODkgNjIwIDYwOCA2MzkgNjM0IDYxNSAzNzUgMzc1IDE5OCA1NjIgMjgxIDU0NyA5NzAgNjk0IDI0NyA3NDEgNzE2IDYxMiAyNjcgNjQ5IDI4MSAzNjUgNjMxIDQ1OSA2MjYgNTQ3IDczMiA2OTQgNzQzIDc2MiA2NDAgNTk4IDIxNiAzNzUgNjc5IDczNiAzNzUgNjYxIDQ1NiA5NjAgXQpdCj4+CmVuZG9iago0NiAwIG9iago8PCAvTGVuZ3RoIDg2OCA+PgpzdHJlYW0KL0NJREluaXQgL1Byb2NTZXQgZmluZHJlc291cmNlIGJlZ2luCjEyIGRpY3QgYmVnaW4KYmVnaW5jbWFwCi9DSURTeXN0ZW1JbmZvIDw8IC9SZWdpc3RyeSAoQWRvYmUpIC9PcmRlcmluZyAoVUNTKSAvU3VwcGxlbWVudCAwID4+IGRlZgovQ01hcE5hbWUgL0Fkb2JlLUlkZW50aXR5LVVDUyBkZWYKL0NNYXBUeXBlIDIgZGVmCjEgYmVnaW5jb2Rlc3BhY2VyYW5nZQo8MDAwMD4gPEZGRkY+CmVuZGNvZGVzcGFjZXJhbmdlCjIgYmVnaW5iZnJhbmdlCjwwMDAwPiA8MDAwMD4gPDAwMDA+CjwwMDAxPiA8MDA0OD4gWzwwMDREPiA8MDA2MT4gPDAwNjc+IDwwMDY5PiA8MDA2Mz4gPDAwMjA+IDwwMDRDPiA8MDA2RT4gPDAwNkI+IDwwMDU0PiA8MDA2NT4gPDAwNzM+IDwwMDc0PiA8MDA0Mz4gPDAwNkY+IDwwMDZEPiA8MDA3MD4gPDAwNzk+IDwwMDJDPiA8MDA3Mj4gPDAwNjQ+IDwwMDQ2PiA8MDA3Nz4gPDAwNjg+IDwwMDY2PiA8MDAzMT4gPDAwMzc+IDwwMDMwPiA8MDAzOT4gPDAwNDI+IDwwMDUzPiA8MDA2Qz4gPDAwNzU+IDwwMDYyPiA8MDAzMj4gPDAwMzM+IDwwMDUwPiA8MDAzNT4gPDAwMjg+IDwwMDI5PiA8MjAxOT4gPDAwNzY+IDwwMDJFPiA8MDA3OD4gPDAwNTc+IDwwMDQxPiA8MDA2QT4gPDAwNEU+IDwwMDQ0PiA8MDA3MT4gPDAwNDk+IDwwMDM0PiA8MDAz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NDIgMjc5IDc1NSA5MDcgNjIwIDU5MyA2NDMgNTc1IDQwNSAzODYgMjcwIDU1OCAyOTUgNjA5IDkwNSA2MjcgNjE3IDU4MSA2MzAgNjE3IDU4MyAzODMgMTAyNyA1NzcgNTgxIDYyOCA0ODUgMjk1IDYyNSA2NTQgNzIxIDI3MCA2MzAgNjcyIDYzOSA1ODAgMzAwIDQwNiA0MDYgNjU1IDU5MCA1NjMgNjU1IDY1NSA2ODIgMjcwIDg0MyBdCl0KPj4KZW5kb2JqCjUxIDAgb2JqCjw8IC9MZW5ndGggNzU2ID4+CnN0cmVhbQovQ0lESW5pdCAvUHJvY1NldCBmaW5kcmVzb3VyY2UgYmVnaW4KMTIgZGljdCBiZWdpbgpiZWdpbmNtYXAKL0NJRFN5c3RlbUluZm8gPDwgL1JlZ2lzdHJ5IChBZG9iZSkgL09yZGVyaW5nIChVQ1MpIC9TdXBwbGVtZW50IDAgPj4gZGVmCi9DTWFwTmFtZSAvQWRvYmUtSWRlbnRpdHktVUNTIGRlZgovQ01hcFR5cGUgMiBkZWYKMSBiZWdpbmNvZGVzcGFjZXJhbmdlCjwwMDAwPiA8RkZGRj4KZW5kY29kZXNwYWNlcmFuZ2UKMiBiZWdpbmJmcmFuZ2UKPDAwMDA+IDwwMDAwPiA8MDAwMD4KPDAwMDE+IDwwMDM4PiBbPDAwNDM+IDwwMDRGPiA8MDA0RT4gPDAwNTQ+IDwwMDUyPiA8MDA0MT4gPDAwMjA+IDwwMDUzPiA8MDA0NT4gPDAwNTY+IDwwMDQ5PiA8MDA0Nz4gPDAwNEQ+IDwwMDY4PiA8MDA2NT4gPDAwNTA+IDwwMDYxPiA8MDA3Mj4gPDAwNzQ+IDwwMDY5PiA8MDA3Mz4gPDAwM0E+IDwwMDZGPiA8MDA2RD4gPDAwNzA+IDwwMDZFPiA8MDA3OT4gPDAwNjQ+IDwwMDc1PiA8MDA2Mz4gPDAwNjY+IDwwMDU3PiA8MDA2Qj4gPDAwNzY+IDwwMDY3PiA8MDAzMT4gPDAwMkU+IDwwMDMyPiA8MDAzMz4gPDAwNDQ+IDwwMDZDPiA8MDA2Mj4gPDAwMzQ+IDwwMDM1PiA8MDA0Nj4gPDAwMkM+IDwwMDI4PiA8MDAyOT4gPDAwMzY+IDwwMDM3PiA8MDA0Qz4gPDAwMzg+IDwwMDM5PiA8MDAzMD4gPDAwNkE+IDwwMDc3PiBdCmVuZGJmcmFuZ2UKZW5kY21hcApDTWFwTmFtZSBjdXJyZW50ZGljdCAvQ01hcCBkZWZpbmVyZXNvdXJjZSBwb3AKZW5kCmVuZAoKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8IC9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMAovQmFzZUZvbnQgL0ludGVyLUJvbGQKL0VuY29kaW5nIC9JZGVudGl0eS1ICi9EZXNjZW5kYW50Rm9udHMgWzUwIDAgUl0KL1RvVW5pY29kZSA1MSAwIFI+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgClsKNSAwIFIKMTIgMCBSCjE3IDAgUgoyMiAwIFIKMjcgMCBSCjMyIDAgUgozNyAwIFIKXQovQ291bnQgNwovUHJvY1NldCBbL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUNdCj4+CmVuZG9iagp4cmVmCjAgNTMKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwNDM0NDYgMDAwMDAgbiAKMDAwMDAwMDE2MSAwMDAwMCBuIAowMDAwMDAwMjU2IDAwMDAwIG4gCjAwMDAwMDAyOTMgMDAwMDAgbiAKMDAwMDA0MzMxMCAwMDAwMCBuIAowMDAwMDM2MjI5IDAwMDAwIG4gCjAwMDAwMDA2MDkgMDAwMDAgbiAKMDAwMDAwNDQ0MyAwMDAwMCBuIAowMDAwMDAwNDEzIDAwMDAwIG4gCjAwMDAwMDA1ODkgMDAwMDAgbiAKMDAwMDAwNDQ2MyAwMDAwMCBuIAowMDAwMDA0NzgxIDAwMDAwIG4gCjAwMDAwMDkwMDQgMDAwMDAgbiAKMDAwMDAwNDU4NSAwMDAwMCBuIAowMDAwMDA0NzYxIDAwMDAwIG4gCjAwMDAwMDkwMjUgMDAwMDAgbiAKMDAwMDAwOTM0MyAwMDAwMCBuIAowMDAwMDEzNzExIDAwMDAwIG4gCjAwMDAwMDkxNDcgMDAwMDAgbiAKMDAwMDAwOTMyMyAwMDAwMCBuIAowMDAwMDEzNzMyIDAwMDAwIG4gCjAwMDAwMTQwNTAgMDAwMDAgbiAKMDAwMDAxODk4OSAwMDAwMCBuIAowMDAwMDEzODU0IDAwMDAwIG4gCjAwMDAwMTQwMzAgMDAwMDAgbiAKMDAwMDAxOTAxMCAwMDAwMCBuIAowMDAwMDE5MzI4IDAwMDAwIG4gCjAwMDAwMjM1MjAgMDAwMDAgbiAKMDAwMDAxOTEzMiAwMDAwMCBuIAowMDAwMDE5MzA4IDAwMDAwIG4gCjAwMDAwMjM1NDEgMDAwMDAgbiAKMDAwMDAyMzg1OSAwMDAwMCBuIAowMDAwMDI2Njk2IDAwMDAwIG4gCjAwMDAwMjM2NjMgMDAwMDAgbiAKMDAwMDAyMzgzOSAwMDAwMCBuIAowMDAwMDI2NzY3IDAwMDAwIG4gCjAwMDAwMjY3MTcgMDAwMDAgbiAKMDAwMDAyNzA4NSAwMDAwMCBuIAowMDAwMDI4MDkzIDAwMDAwIG4gCjAwMDAwMjY4ODkgMDAwMDAgbiAKMDAwMDAyNzA2NSAwMDAwMCBuIAowMDAwMDI4MTEzIDAwMDAwIG4gCjAwMDAwMjgzNzUgMDAwMDAgbiAKMDAwMDAzNDgwNCAwMDAwMCBuIAowMDAwMDM1MzA5IDAwMDAwIG4gCjAwMDAwMzQ3ODMgMDAwMDAgbiAKMDAwMDAzNjM2NyAwMDAwMCBuIAowMDAwMDM2NjI3IDAwMDAwIG4gCjAwMDAwNDIwNjIgMDAwMDAgbiAKMDAwMDA0MjUwMiAwMDAwMCBuIAowMDAwMDQyMDQxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNTMKL0luZm8gMSAwIFIKL1Jvb3QgMzggMCBSCj4+CnN0YXJ0eHJlZgo0MzU4NgolJUVPRgo=',
    },
  },
};

export const mockContractDocumentCreatedResponse = {
  data: {
    contract_document: {
      id: 'f4f32dbf-4d15-42ef-a960-fea60ab3b68c',
    },
  },
};

export const mockContractDocumentSignedResponse = {};

export const inviteResponse = {};
