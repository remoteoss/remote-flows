export const basicInformationSchemaV3Germany = {
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
        const: 'no',
        default: 'no',
        description:
          'Our operational framework is designed to comply with local regulations, ensuring full legal alignment and reducing risk for all parties involved.',
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
        title:
          '<strong>Previous seniority cannot be recognized in Germany</strong>',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 43641713246093,
              title: 'Help center unavailable',
            },
          },
        },
      },
      job_title: {
        description:
          'We can hire most roles but there are some we cannot support. These include licensed roles, blue-collar roles, and certain C-level roles.',
        maxLength: 255,
        pattern: '\\S',
        title: 'Job title',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'text',
        },
      },
      mobile_number: {
        anyOf: [
          {
            not: {
              const: null,
            },
            pattern: '^(\\+93)[0-9]{6,}$',
            title: 'Afghanistan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '93',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+355)[0-9]{6,}$',
            title: 'Albania',
            'x-jsf-presentation': {
              meta: {
                countryCode: '355',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+213)[0-9]{6,}$',
            title: 'Algeria',
            'x-jsf-presentation': {
              meta: {
                countryCode: '213',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(684)[0-9]{6,}$',
            title: 'American Samoa',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+376)[0-9]{6,}$',
            title: 'Andorra',
            'x-jsf-presentation': {
              meta: {
                countryCode: '376',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+244)[0-9]{6,}$',
            title: 'Angola',
            'x-jsf-presentation': {
              meta: {
                countryCode: '244',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(264)[0-9]{6,}$',
            title: 'Anguilla',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(268)[0-9]{6,}$',
            title: 'Antigua and Barbuda',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+54)[0-9]{6,}$',
            title: 'Argentina',
            'x-jsf-presentation': {
              meta: {
                countryCode: '54',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+374)[0-9]{6,}$',
            title: 'Armenia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '374',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+297)[0-9]{6,}$',
            title: 'Aruba',
            'x-jsf-presentation': {
              meta: {
                countryCode: '297',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+247)[0-9]{6,}$',
            title: 'Ascension Island',
            'x-jsf-presentation': {
              meta: {
                countryCode: '247',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+61)[0-9]{6,}$',
            title: 'Australia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '61',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+43)[0-9]{6,}$',
            title: 'Austria',
            'x-jsf-presentation': {
              meta: {
                countryCode: '43',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+994)[0-9]{6,}$',
            title: 'Azerbaijan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '994',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(242)[0-9]{6,}$',
            title: 'Bahamas',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+973)[0-9]{6,}$',
            title: 'Bahrain',
            'x-jsf-presentation': {
              meta: {
                countryCode: '973',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+880)[0-9]{6,}$',
            title: 'Bangladesh',
            'x-jsf-presentation': {
              meta: {
                countryCode: '880',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(246)[0-9]{6,}$',
            title: 'Barbados',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+375)[0-9]{6,}$',
            title: 'Belarus',
            'x-jsf-presentation': {
              meta: {
                countryCode: '375',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+32)[0-9]{6,}$',
            title: 'Belgium',
            'x-jsf-presentation': {
              meta: {
                countryCode: '32',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+501)[0-9]{6,}$',
            title: 'Belize',
            'x-jsf-presentation': {
              meta: {
                countryCode: '501',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+229)[0-9]{6,}$',
            title: 'Benin',
            'x-jsf-presentation': {
              meta: {
                countryCode: '229',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(441)[0-9]{6,}$',
            title: 'Bermuda',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+975)[0-9]{6,}$',
            title: 'Bhutan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '975',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+591)[0-9]{6,}$',
            title: 'Bolivia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '591',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+387)[0-9]{6,}$',
            title: 'Bosnia and Herzegovina',
            'x-jsf-presentation': {
              meta: {
                countryCode: '387',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+267)[0-9]{6,}$',
            title: 'Botswana',
            'x-jsf-presentation': {
              meta: {
                countryCode: '267',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+55)[0-9]{6,}$',
            title: 'Brazil',
            'x-jsf-presentation': {
              meta: {
                countryCode: '55',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+246)[0-9]{6,}$',
            title: 'British Indian Ocean Territory',
            'x-jsf-presentation': {
              meta: {
                countryCode: '246',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(284)[0-9]{6,}$',
            title: 'British Virgin Islands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+673)[0-9]{6,}$',
            title: 'Brunei',
            'x-jsf-presentation': {
              meta: {
                countryCode: '673',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+359)[0-9]{6,}$',
            title: 'Bulgaria',
            'x-jsf-presentation': {
              meta: {
                countryCode: '359',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+226)[0-9]{6,}$',
            title: 'Burkina Faso',
            'x-jsf-presentation': {
              meta: {
                countryCode: '226',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+257)[0-9]{6,}$',
            title: 'Burundi',
            'x-jsf-presentation': {
              meta: {
                countryCode: '257',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+855)[0-9]{6,}$',
            title: 'Cambodia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '855',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+237)[0-9]{6,}$',
            title: 'Cameroon',
            'x-jsf-presentation': {
              meta: {
                countryCode: '237',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern:
              '^(\\+1)(204|226|236|249|250|289|306|343|365|387|403|416|418|431|437|438|450|506|514|519|548|579|581|587|604|613|639|647|672|705|709|742|778|780|782|807|819|825|867|873|902|905)[0-9]{6,}$',
            title: 'Canada',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+238)[0-9]{6,}$',
            title: 'Cape Verde',
            'x-jsf-presentation': {
              meta: {
                countryCode: '238',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+599)(3|4|7)[0-9]{6,}$',
            title: 'Caribbean Netherlands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '599',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(345)[0-9]{6,}$',
            title: 'Cayman Islands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+236)[0-9]{6,}$',
            title: 'Central African Republic',
            'x-jsf-presentation': {
              meta: {
                countryCode: '236',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+235)[0-9]{6,}$',
            title: 'Chad',
            'x-jsf-presentation': {
              meta: {
                countryCode: '235',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+56)[0-9]{6,}$',
            title: 'Chile',
            'x-jsf-presentation': {
              meta: {
                countryCode: '56',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+86)[0-9]{6,}$',
            title: 'China',
            'x-jsf-presentation': {
              meta: {
                countryCode: '86',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+61)(89164)[0-9]{6,}$',
            title: 'Christmas Island',
            'x-jsf-presentation': {
              meta: {
                countryCode: '61',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+61)(89162)[0-9]{6,}$',
            title: 'Cocos (Keeling) Island',
            'x-jsf-presentation': {
              meta: {
                countryCode: '61',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+57)[0-9]{6,}$',
            title: 'Colombia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '57',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+269)[0-9]{6,}$',
            title: 'Comoros',
            'x-jsf-presentation': {
              meta: {
                countryCode: '269',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+243)[0-9]{6,}$',
            title: 'Congo (DRC)',
            'x-jsf-presentation': {
              meta: {
                countryCode: '243',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+242)[0-9]{6,}$',
            title: 'Congo (Republic)',
            'x-jsf-presentation': {
              meta: {
                countryCode: '242',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+682)[0-9]{6,}$',
            title: 'Cook Islands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '682',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+506)[0-9]{6,}$',
            title: 'Costa Rica',
            'x-jsf-presentation': {
              meta: {
                countryCode: '506',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+385)[0-9]{6,}$',
            title: 'Croatia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '385',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+53)[0-9]{6,}$',
            title: 'Cuba',
            'x-jsf-presentation': {
              meta: {
                countryCode: '53',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+599)[0-9]{6,}$',
            title: 'Curaçao',
            'x-jsf-presentation': {
              meta: {
                countryCode: '599',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+357)[0-9]{6,}$',
            title: 'Cyprus',
            'x-jsf-presentation': {
              meta: {
                countryCode: '357',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+420)[0-9]{6,}$',
            title: 'Czech Republic',
            'x-jsf-presentation': {
              meta: {
                countryCode: '420',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+225)[0-9]{6,}$',
            title: 'Côte d’Ivoire',
            'x-jsf-presentation': {
              meta: {
                countryCode: '225',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+45)[0-9]{6,}$',
            title: 'Denmark',
            'x-jsf-presentation': {
              meta: {
                countryCode: '45',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+253)[0-9]{6,}$',
            title: 'Djibouti',
            'x-jsf-presentation': {
              meta: {
                countryCode: '253',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(767)[0-9]{6,}$',
            title: 'Dominica',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(809|829|849)[0-9]{6,}$',
            title: 'Dominican Republic',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+593)[0-9]{6,}$',
            title: 'Ecuador',
            'x-jsf-presentation': {
              meta: {
                countryCode: '593',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+20)[0-9]{6,}$',
            title: 'Egypt',
            'x-jsf-presentation': {
              meta: {
                countryCode: '20',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+503)[0-9]{6,}$',
            title: 'El Salvador',
            'x-jsf-presentation': {
              meta: {
                countryCode: '503',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+240)[0-9]{6,}$',
            title: 'Equatorial Guinea',
            'x-jsf-presentation': {
              meta: {
                countryCode: '240',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+291)[0-9]{6,}$',
            title: 'Eritrea',
            'x-jsf-presentation': {
              meta: {
                countryCode: '291',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+372)[0-9]{6,}$',
            title: 'Estonia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '372',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+268)[0-9]{6,}$',
            title: 'Eswatini',
            'x-jsf-presentation': {
              meta: {
                countryCode: '268',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+251)[0-9]{6,}$',
            title: 'Ethiopia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '251',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+500)[0-9]{6,}$',
            title: 'Falkland Islands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '500',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+298)[0-9]{6,}$',
            title: 'Faroe Islands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '298',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+679)[0-9]{6,}$',
            title: 'Fiji',
            'x-jsf-presentation': {
              meta: {
                countryCode: '679',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+358)[0-9]{6,}$',
            title: 'Finland',
            'x-jsf-presentation': {
              meta: {
                countryCode: '358',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+33)[0-9]{6,}$',
            title: 'France',
            'x-jsf-presentation': {
              meta: {
                countryCode: '33',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+594)[0-9]{6,}$',
            title: 'French Guiana',
            'x-jsf-presentation': {
              meta: {
                countryCode: '594',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+689)[0-9]{6,}$',
            title: 'French Polynesia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '689',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+241)[0-9]{6,}$',
            title: 'Gabon',
            'x-jsf-presentation': {
              meta: {
                countryCode: '241',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+220)[0-9]{6,}$',
            title: 'Gambia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '220',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+995)[0-9]{6,}$',
            title: 'Georgia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '995',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+49)[0-9]{6,}$',
            title: 'Germany',
            'x-jsf-presentation': {
              meta: {
                countryCode: '49',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+233)[0-9]{6,}$',
            title: 'Ghana',
            'x-jsf-presentation': {
              meta: {
                countryCode: '233',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+350)[0-9]{6,}$',
            title: 'Gibraltar',
            'x-jsf-presentation': {
              meta: {
                countryCode: '350',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+30)[0-9]{6,}$',
            title: 'Greece',
            'x-jsf-presentation': {
              meta: {
                countryCode: '30',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+299)[0-9]{6,}$',
            title: 'Greenland',
            'x-jsf-presentation': {
              meta: {
                countryCode: '299',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(473)[0-9]{6,}$',
            title: 'Grenada',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+590)[0-9]{6,}$',
            title: 'Guadeloupe',
            'x-jsf-presentation': {
              meta: {
                countryCode: '590',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(671)[0-9]{6,}$',
            title: 'Guam',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+502)[0-9]{6,}$',
            title: 'Guatemala',
            'x-jsf-presentation': {
              meta: {
                countryCode: '502',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+44)(1481|7781|7839|7911)[0-9]{6,}$',
            title: 'Guernsey',
            'x-jsf-presentation': {
              meta: {
                countryCode: '44',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+224)[0-9]{6,}$',
            title: 'Guinea',
            'x-jsf-presentation': {
              meta: {
                countryCode: '224',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+245)[0-9]{6,}$',
            title: 'Guinea-Bissau',
            'x-jsf-presentation': {
              meta: {
                countryCode: '245',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+592)[0-9]{6,}$',
            title: 'Guyana',
            'x-jsf-presentation': {
              meta: {
                countryCode: '592',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+509)[0-9]{6,}$',
            title: 'Haiti',
            'x-jsf-presentation': {
              meta: {
                countryCode: '509',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+504)[0-9]{6,}$',
            title: 'Honduras',
            'x-jsf-presentation': {
              meta: {
                countryCode: '504',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+852)[0-9]{6,}$',
            title: 'Hong Kong',
            'x-jsf-presentation': {
              meta: {
                countryCode: '852',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+36)[0-9]{6,}$',
            title: 'Hungary',
            'x-jsf-presentation': {
              meta: {
                countryCode: '36',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+354)[0-9]{6,}$',
            title: 'Iceland',
            'x-jsf-presentation': {
              meta: {
                countryCode: '354',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+91)[0-9]{6,}$',
            title: 'India',
            'x-jsf-presentation': {
              meta: {
                countryCode: '91',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+62)[0-9]{6,}$',
            title: 'Indonesia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '62',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+98)[0-9]{6,}$',
            title: 'Iran',
            'x-jsf-presentation': {
              meta: {
                countryCode: '98',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+964)[0-9]{6,}$',
            title: 'Iraq',
            'x-jsf-presentation': {
              meta: {
                countryCode: '964',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+353)[0-9]{6,}$',
            title: 'Ireland',
            'x-jsf-presentation': {
              meta: {
                countryCode: '353',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+44)(1624|74576|7524|7924|7624)[0-9]{6,}$',
            title: 'Isle of Man',
            'x-jsf-presentation': {
              meta: {
                countryCode: '44',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+972)[0-9]{6,}$',
            title: 'Israel',
            'x-jsf-presentation': {
              meta: {
                countryCode: '972',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+39)[0-9]{6,}$',
            title: 'Italy',
            'x-jsf-presentation': {
              meta: {
                countryCode: '39',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(876|658)[0-9]{6,}$',
            title: 'Jamaica',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+81)[0-9]{6,}$',
            title: 'Japan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '81',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+44)(1534|7509|7700|7797|7829|7937)[0-9]{6,}$',
            title: 'Jersey',
            'x-jsf-presentation': {
              meta: {
                countryCode: '44',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+962)[0-9]{6,}$',
            title: 'Jordan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '962',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+7)(33|7)[0-9]{6,}$',
            title: 'Kazakhstan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '7',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+254)[0-9]{6,}$',
            title: 'Kenya',
            'x-jsf-presentation': {
              meta: {
                countryCode: '254',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+686)[0-9]{6,}$',
            title: 'Kiribati',
            'x-jsf-presentation': {
              meta: {
                countryCode: '686',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+383)[0-9]{6,}$',
            title: 'Kosovo',
            'x-jsf-presentation': {
              meta: {
                countryCode: '383',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+965)[0-9]{6,}$',
            title: 'Kuwait',
            'x-jsf-presentation': {
              meta: {
                countryCode: '965',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+996)[0-9]{6,}$',
            title: 'Kyrgyzstan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '996',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+856)[0-9]{6,}$',
            title: 'Laos',
            'x-jsf-presentation': {
              meta: {
                countryCode: '856',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+371)[0-9]{6,}$',
            title: 'Latvia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '371',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+961)[0-9]{6,}$',
            title: 'Lebanon',
            'x-jsf-presentation': {
              meta: {
                countryCode: '961',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+266)[0-9]{6,}$',
            title: 'Lesotho',
            'x-jsf-presentation': {
              meta: {
                countryCode: '266',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+231)[0-9]{6,}$',
            title: 'Liberia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '231',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+218)[0-9]{6,}$',
            title: 'Libya',
            'x-jsf-presentation': {
              meta: {
                countryCode: '218',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+423)[0-9]{6,}$',
            title: 'Liechtenstein',
            'x-jsf-presentation': {
              meta: {
                countryCode: '423',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+370)[0-9]{6,}$',
            title: 'Lithuania',
            'x-jsf-presentation': {
              meta: {
                countryCode: '370',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+352)[0-9]{6,}$',
            title: 'Luxembourg',
            'x-jsf-presentation': {
              meta: {
                countryCode: '352',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+853)[0-9]{6,}$',
            title: 'Macau',
            'x-jsf-presentation': {
              meta: {
                countryCode: '853',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+261)[0-9]{6,}$',
            title: 'Madagascar',
            'x-jsf-presentation': {
              meta: {
                countryCode: '261',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+265)[0-9]{6,}$',
            title: 'Malawi',
            'x-jsf-presentation': {
              meta: {
                countryCode: '265',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+60)[0-9]{6,}$',
            title: 'Malaysia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '60',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+960)[0-9]{6,}$',
            title: 'Maldives',
            'x-jsf-presentation': {
              meta: {
                countryCode: '960',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+223)[0-9]{6,}$',
            title: 'Mali',
            'x-jsf-presentation': {
              meta: {
                countryCode: '223',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+356)[0-9]{6,}$',
            title: 'Malta',
            'x-jsf-presentation': {
              meta: {
                countryCode: '356',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+692)[0-9]{6,}$',
            title: 'Marshall Islands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '692',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+596)[0-9]{6,}$',
            title: 'Martinique',
            'x-jsf-presentation': {
              meta: {
                countryCode: '596',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+222)[0-9]{6,}$',
            title: 'Mauritania',
            'x-jsf-presentation': {
              meta: {
                countryCode: '222',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+230)[0-9]{6,}$',
            title: 'Mauritius',
            'x-jsf-presentation': {
              meta: {
                countryCode: '230',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+262)(269|639)[0-9]{6,}$',
            title: 'Mayotte',
            'x-jsf-presentation': {
              meta: {
                countryCode: '262',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+52)[0-9]{6,}$',
            title: 'Mexico',
            'x-jsf-presentation': {
              meta: {
                countryCode: '52',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+691)[0-9]{6,}$',
            title: 'Micronesia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '691',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+373)[0-9]{6,}$',
            title: 'Moldova',
            'x-jsf-presentation': {
              meta: {
                countryCode: '373',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+377)[0-9]{6,}$',
            title: 'Monaco',
            'x-jsf-presentation': {
              meta: {
                countryCode: '377',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+976)[0-9]{6,}$',
            title: 'Mongolia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '976',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+382)[0-9]{6,}$',
            title: 'Montenegro',
            'x-jsf-presentation': {
              meta: {
                countryCode: '382',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(664)[0-9]{6,}$',
            title: 'Montserrat',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+212)[0-9]{6,}$',
            title: 'Morocco',
            'x-jsf-presentation': {
              meta: {
                countryCode: '212',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+258)[0-9]{6,}$',
            title: 'Mozambique',
            'x-jsf-presentation': {
              meta: {
                countryCode: '258',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+95)[0-9]{6,}$',
            title: 'Myanmar',
            'x-jsf-presentation': {
              meta: {
                countryCode: '95',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+264)[0-9]{6,}$',
            title: 'Namibia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '264',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+674)[0-9]{6,}$',
            title: 'Nauru',
            'x-jsf-presentation': {
              meta: {
                countryCode: '674',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+977)[0-9]{6,}$',
            title: 'Nepal',
            'x-jsf-presentation': {
              meta: {
                countryCode: '977',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+31)[0-9]{6,}$',
            title: 'Netherlands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '31',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+687)[0-9]{6,}$',
            title: 'New Caledonia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '687',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+64)[0-9]{6,}$',
            title: 'New Zealand',
            'x-jsf-presentation': {
              meta: {
                countryCode: '64',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+505)[0-9]{6,}$',
            title: 'Nicaragua',
            'x-jsf-presentation': {
              meta: {
                countryCode: '505',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+227)[0-9]{6,}$',
            title: 'Niger',
            'x-jsf-presentation': {
              meta: {
                countryCode: '227',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+234)[0-9]{6,}$',
            title: 'Nigeria',
            'x-jsf-presentation': {
              meta: {
                countryCode: '234',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+683)[0-9]{6,}$',
            title: 'Niue',
            'x-jsf-presentation': {
              meta: {
                countryCode: '683',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+672)[0-9]{6,}$',
            title: 'Norfolk Island',
            'x-jsf-presentation': {
              meta: {
                countryCode: '672',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+850)[0-9]{6,}$',
            title: 'North Korea',
            'x-jsf-presentation': {
              meta: {
                countryCode: '850',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+389)[0-9]{6,}$',
            title: 'North Macedonia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '389',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(670)[0-9]{6,}$',
            title: 'Northern Mariana Islands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+47)[0-9]{6,}$',
            title: 'Norway',
            'x-jsf-presentation': {
              meta: {
                countryCode: '47',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+968)[0-9]{6,}$',
            title: 'Oman',
            'x-jsf-presentation': {
              meta: {
                countryCode: '968',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+92)[0-9]{6,}$',
            title: 'Pakistan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '92',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+680)[0-9]{6,}$',
            title: 'Palau',
            'x-jsf-presentation': {
              meta: {
                countryCode: '680',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+970)[0-9]{6,}$',
            title: 'Palestine',
            'x-jsf-presentation': {
              meta: {
                countryCode: '970',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+507)[0-9]{6,}$',
            title: 'Panama',
            'x-jsf-presentation': {
              meta: {
                countryCode: '507',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+675)[0-9]{6,}$',
            title: 'Papua New Guinea',
            'x-jsf-presentation': {
              meta: {
                countryCode: '675',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+595)[0-9]{6,}$',
            title: 'Paraguay',
            'x-jsf-presentation': {
              meta: {
                countryCode: '595',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+51)[0-9]{6,}$',
            title: 'Peru',
            'x-jsf-presentation': {
              meta: {
                countryCode: '51',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+63)[0-9]{6,}$',
            title: 'Philippines',
            'x-jsf-presentation': {
              meta: {
                countryCode: '63',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+48)[0-9]{6,}$',
            title: 'Poland',
            'x-jsf-presentation': {
              meta: {
                countryCode: '48',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+351)[0-9]{6,}$',
            title: 'Portugal',
            'x-jsf-presentation': {
              meta: {
                countryCode: '351',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(787|939)[0-9]{6,}$',
            title: 'Puerto Rico',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+974)[0-9]{6,}$',
            title: 'Qatar',
            'x-jsf-presentation': {
              meta: {
                countryCode: '974',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+40)[0-9]{6,}$',
            title: 'Romania',
            'x-jsf-presentation': {
              meta: {
                countryCode: '40',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+7)[0-9]{6,}$',
            title: 'Russia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '7',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+250)[0-9]{6,}$',
            title: 'Rwanda',
            'x-jsf-presentation': {
              meta: {
                countryCode: '250',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+262)[0-9]{6,}$',
            title: 'Réunion',
            'x-jsf-presentation': {
              meta: {
                countryCode: '262',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+590)[0-9]{6,}$',
            title: 'Saint Barthélemy',
            'x-jsf-presentation': {
              meta: {
                countryCode: '590',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+290)[0-9]{6,}$',
            title: 'Saint Helena',
            'x-jsf-presentation': {
              meta: {
                countryCode: '290',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(869)[0-9]{6,}$',
            title: 'Saint Kitts and Nevis',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(758)[0-9]{6,}$',
            title: 'Saint Lucia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+590)[0-9]{6,}$',
            title: 'Saint Martin',
            'x-jsf-presentation': {
              meta: {
                countryCode: '590',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+508)[0-9]{6,}$',
            title: 'Saint Pierre and Miquelon',
            'x-jsf-presentation': {
              meta: {
                countryCode: '508',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(784)[0-9]{6,}$',
            title: 'Saint Vincent and the Grenadines',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+685)[0-9]{6,}$',
            title: 'Samoa',
            'x-jsf-presentation': {
              meta: {
                countryCode: '685',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+378)[0-9]{6,}$',
            title: 'San Marino',
            'x-jsf-presentation': {
              meta: {
                countryCode: '378',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+966)[0-9]{6,}$',
            title: 'Saudi Arabia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '966',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+221)[0-9]{6,}$',
            title: 'Senegal',
            'x-jsf-presentation': {
              meta: {
                countryCode: '221',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+381)[0-9]{6,}$',
            title: 'Serbia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '381',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+248)[0-9]{6,}$',
            title: 'Seychelles',
            'x-jsf-presentation': {
              meta: {
                countryCode: '248',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+232)[0-9]{6,}$',
            title: 'Sierra Leone',
            'x-jsf-presentation': {
              meta: {
                countryCode: '232',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+65)[0-9]{6,}$',
            title: 'Singapore',
            'x-jsf-presentation': {
              meta: {
                countryCode: '65',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(721)[0-9]{6,}$',
            title: 'Sint Maarten',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+421)[0-9]{6,}$',
            title: 'Slovakia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '421',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+386)[0-9]{6,}$',
            title: 'Slovenia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '386',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+677)[0-9]{6,}$',
            title: 'Solomon Islands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '677',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+252)[0-9]{6,}$',
            title: 'Somalia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '252',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+27)[0-9]{6,}$',
            title: 'South Africa',
            'x-jsf-presentation': {
              meta: {
                countryCode: '27',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+82)[0-9]{6,}$',
            title: 'South Korea',
            'x-jsf-presentation': {
              meta: {
                countryCode: '82',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+211)[0-9]{6,}$',
            title: 'South Sudan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '211',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+34)[0-9]{6,}$',
            title: 'Spain',
            'x-jsf-presentation': {
              meta: {
                countryCode: '34',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+94)[0-9]{6,}$',
            title: 'Sri Lanka',
            'x-jsf-presentation': {
              meta: {
                countryCode: '94',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+249)[0-9]{6,}$',
            title: 'Sudan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '249',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+597)[0-9]{6,}$',
            title: 'Suriname',
            'x-jsf-presentation': {
              meta: {
                countryCode: '597',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+47)(79)[0-9]{6,}$',
            title: 'Svalbard and Jan Mayen',
            'x-jsf-presentation': {
              meta: {
                countryCode: '47',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+46)[0-9]{6,}$',
            title: 'Sweden',
            'x-jsf-presentation': {
              meta: {
                countryCode: '46',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+41)[0-9]{6,}$',
            title: 'Switzerland',
            'x-jsf-presentation': {
              meta: {
                countryCode: '41',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+963)[0-9]{6,}$',
            title: 'Syria',
            'x-jsf-presentation': {
              meta: {
                countryCode: '963',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+239)[0-9]{6,}$',
            title: 'São Tomé and Príncipe',
            'x-jsf-presentation': {
              meta: {
                countryCode: '239',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+886)[0-9]{6,}$',
            title: 'Taiwan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '886',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+992)[0-9]{6,}$',
            title: 'Tajikistan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '992',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+255)[0-9]{6,}$',
            title: 'Tanzania',
            'x-jsf-presentation': {
              meta: {
                countryCode: '255',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+66)[0-9]{6,}$',
            title: 'Thailand',
            'x-jsf-presentation': {
              meta: {
                countryCode: '66',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+670)[0-9]{6,}$',
            title: 'Timor-Leste',
            'x-jsf-presentation': {
              meta: {
                countryCode: '670',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+228)[0-9]{6,}$',
            title: 'Togo',
            'x-jsf-presentation': {
              meta: {
                countryCode: '228',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+690)[0-9]{6,}$',
            title: 'Tokelau',
            'x-jsf-presentation': {
              meta: {
                countryCode: '690',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+676)[0-9]{6,}$',
            title: 'Tonga',
            'x-jsf-presentation': {
              meta: {
                countryCode: '676',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(868)[0-9]{6,}$',
            title: 'Trinidad and Tobago',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+216)[0-9]{6,}$',
            title: 'Tunisia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '216',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+90)[0-9]{6,}$',
            title: 'Turkey',
            'x-jsf-presentation': {
              meta: {
                countryCode: '90',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+993)[0-9]{6,}$',
            title: 'Turkmenistan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '993',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(649)[0-9]{6,}$',
            title: 'Turks and Caicos Islands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+688)[0-9]{6,}$',
            title: 'Tuvalu',
            'x-jsf-presentation': {
              meta: {
                countryCode: '688',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)(340)[0-9]{6,}$',
            title: 'U.S. Virgin Islands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+256)[0-9]{6,}$',
            title: 'Uganda',
            'x-jsf-presentation': {
              meta: {
                countryCode: '256',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+380)[0-9]{6,}$',
            title: 'Ukraine',
            'x-jsf-presentation': {
              meta: {
                countryCode: '380',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+971)[0-9]{6,}$',
            title: 'United Arab Emirates',
            'x-jsf-presentation': {
              meta: {
                countryCode: '971',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+44)[0-9]{6,}$',
            title: 'United Kingdom',
            'x-jsf-presentation': {
              meta: {
                countryCode: '44',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+1)[0-9]{6,}$',
            title: 'United States',
            'x-jsf-presentation': {
              meta: {
                countryCode: '1',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+598)[0-9]{6,}$',
            title: 'Uruguay',
            'x-jsf-presentation': {
              meta: {
                countryCode: '598',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+998)[0-9]{6,}$',
            title: 'Uzbekistan',
            'x-jsf-presentation': {
              meta: {
                countryCode: '998',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+678)[0-9]{6,}$',
            title: 'Vanuatu',
            'x-jsf-presentation': {
              meta: {
                countryCode: '678',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+39)(06698)[0-9]{6,}$',
            title: 'Vatican City',
            'x-jsf-presentation': {
              meta: {
                countryCode: '39',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+58)[0-9]{6,}$',
            title: 'Venezuela',
            'x-jsf-presentation': {
              meta: {
                countryCode: '58',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+84)[0-9]{6,}$',
            title: 'Vietnam',
            'x-jsf-presentation': {
              meta: {
                countryCode: '84',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+681)[0-9]{6,}$',
            title: 'Wallis and Futuna',
            'x-jsf-presentation': {
              meta: {
                countryCode: '681',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+212)(5288|5289)[0-9]{6,}$',
            title: 'Western Sahara',
            'x-jsf-presentation': {
              meta: {
                countryCode: '212',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+967)[0-9]{6,}$',
            title: 'Yemen',
            'x-jsf-presentation': {
              meta: {
                countryCode: '967',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+260)[0-9]{6,}$',
            title: 'Zambia',
            'x-jsf-presentation': {
              meta: {
                countryCode: '260',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+263)[0-9]{6,}$',
            title: 'Zimbabwe',
            'x-jsf-presentation': {
              meta: {
                countryCode: '263',
              },
            },
          },
          {
            not: {
              const: null,
            },
            pattern: '^(\\+358)(18)[0-9]{6,}$',
            title: 'Åland Islands',
            'x-jsf-presentation': {
              meta: {
                countryCode: '358',
              },
            },
          },
        ],
        description:
          "Enter the employee's phone number, including country code, without spaces (e.g. +15389274785 for the USA)",
        items: {
          anyOf: [
            {
              not: {
                const: null,
              },
              pattern: '^(\\+93)[0-9]{6,}$',
              title: 'Afghanistan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '93',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+355)[0-9]{6,}$',
              title: 'Albania',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '355',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+213)[0-9]{6,}$',
              title: 'Algeria',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '213',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(684)[0-9]{6,}$',
              title: 'American Samoa',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+376)[0-9]{6,}$',
              title: 'Andorra',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '376',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+244)[0-9]{6,}$',
              title: 'Angola',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '244',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(264)[0-9]{6,}$',
              title: 'Anguilla',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(268)[0-9]{6,}$',
              title: 'Antigua and Barbuda',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+54)[0-9]{6,}$',
              title: 'Argentina',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '54',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+374)[0-9]{6,}$',
              title: 'Armenia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '374',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+297)[0-9]{6,}$',
              title: 'Aruba',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '297',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+247)[0-9]{6,}$',
              title: 'Ascension Island',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '247',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+61)[0-9]{6,}$',
              title: 'Australia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '61',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+43)[0-9]{6,}$',
              title: 'Austria',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '43',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+994)[0-9]{6,}$',
              title: 'Azerbaijan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '994',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(242)[0-9]{6,}$',
              title: 'Bahamas',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+973)[0-9]{6,}$',
              title: 'Bahrain',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '973',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+880)[0-9]{6,}$',
              title: 'Bangladesh',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '880',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(246)[0-9]{6,}$',
              title: 'Barbados',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+375)[0-9]{6,}$',
              title: 'Belarus',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '375',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+32)[0-9]{6,}$',
              title: 'Belgium',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '32',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+501)[0-9]{6,}$',
              title: 'Belize',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '501',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+229)[0-9]{6,}$',
              title: 'Benin',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '229',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(441)[0-9]{6,}$',
              title: 'Bermuda',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+975)[0-9]{6,}$',
              title: 'Bhutan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '975',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+591)[0-9]{6,}$',
              title: 'Bolivia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '591',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+387)[0-9]{6,}$',
              title: 'Bosnia and Herzegovina',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '387',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+267)[0-9]{6,}$',
              title: 'Botswana',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '267',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+55)[0-9]{6,}$',
              title: 'Brazil',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '55',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+246)[0-9]{6,}$',
              title: 'British Indian Ocean Territory',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '246',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(284)[0-9]{6,}$',
              title: 'British Virgin Islands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+673)[0-9]{6,}$',
              title: 'Brunei',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '673',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+359)[0-9]{6,}$',
              title: 'Bulgaria',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '359',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+226)[0-9]{6,}$',
              title: 'Burkina Faso',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '226',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+257)[0-9]{6,}$',
              title: 'Burundi',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '257',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+855)[0-9]{6,}$',
              title: 'Cambodia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '855',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+237)[0-9]{6,}$',
              title: 'Cameroon',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '237',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern:
                '^(\\+1)(204|226|236|249|250|289|306|343|365|387|403|416|418|431|437|438|450|506|514|519|548|579|581|587|604|613|639|647|672|705|709|742|778|780|782|807|819|825|867|873|902|905)[0-9]{6,}$',
              title: 'Canada',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+238)[0-9]{6,}$',
              title: 'Cape Verde',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '238',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+599)(3|4|7)[0-9]{6,}$',
              title: 'Caribbean Netherlands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '599',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(345)[0-9]{6,}$',
              title: 'Cayman Islands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+236)[0-9]{6,}$',
              title: 'Central African Republic',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '236',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+235)[0-9]{6,}$',
              title: 'Chad',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '235',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+56)[0-9]{6,}$',
              title: 'Chile',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '56',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+86)[0-9]{6,}$',
              title: 'China',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '86',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+61)(89164)[0-9]{6,}$',
              title: 'Christmas Island',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '61',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+61)(89162)[0-9]{6,}$',
              title: 'Cocos (Keeling) Island',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '61',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+57)[0-9]{6,}$',
              title: 'Colombia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '57',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+269)[0-9]{6,}$',
              title: 'Comoros',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '269',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+243)[0-9]{6,}$',
              title: 'Congo (DRC)',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '243',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+242)[0-9]{6,}$',
              title: 'Congo (Republic)',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '242',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+682)[0-9]{6,}$',
              title: 'Cook Islands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '682',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+506)[0-9]{6,}$',
              title: 'Costa Rica',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '506',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+385)[0-9]{6,}$',
              title: 'Croatia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '385',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+53)[0-9]{6,}$',
              title: 'Cuba',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '53',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+599)[0-9]{6,}$',
              title: 'Curaçao',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '599',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+357)[0-9]{6,}$',
              title: 'Cyprus',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '357',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+420)[0-9]{6,}$',
              title: 'Czech Republic',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '420',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+225)[0-9]{6,}$',
              title: 'Côte d’Ivoire',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '225',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+45)[0-9]{6,}$',
              title: 'Denmark',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '45',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+253)[0-9]{6,}$',
              title: 'Djibouti',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '253',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(767)[0-9]{6,}$',
              title: 'Dominica',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(809|829|849)[0-9]{6,}$',
              title: 'Dominican Republic',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+593)[0-9]{6,}$',
              title: 'Ecuador',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '593',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+20)[0-9]{6,}$',
              title: 'Egypt',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '20',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+503)[0-9]{6,}$',
              title: 'El Salvador',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '503',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+240)[0-9]{6,}$',
              title: 'Equatorial Guinea',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '240',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+291)[0-9]{6,}$',
              title: 'Eritrea',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '291',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+372)[0-9]{6,}$',
              title: 'Estonia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '372',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+268)[0-9]{6,}$',
              title: 'Eswatini',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '268',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+251)[0-9]{6,}$',
              title: 'Ethiopia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '251',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+500)[0-9]{6,}$',
              title: 'Falkland Islands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '500',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+298)[0-9]{6,}$',
              title: 'Faroe Islands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '298',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+679)[0-9]{6,}$',
              title: 'Fiji',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '679',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+358)[0-9]{6,}$',
              title: 'Finland',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '358',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+33)[0-9]{6,}$',
              title: 'France',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '33',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+594)[0-9]{6,}$',
              title: 'French Guiana',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '594',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+689)[0-9]{6,}$',
              title: 'French Polynesia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '689',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+241)[0-9]{6,}$',
              title: 'Gabon',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '241',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+220)[0-9]{6,}$',
              title: 'Gambia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '220',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+995)[0-9]{6,}$',
              title: 'Georgia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '995',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+49)[0-9]{6,}$',
              title: 'Germany',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '49',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+233)[0-9]{6,}$',
              title: 'Ghana',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '233',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+350)[0-9]{6,}$',
              title: 'Gibraltar',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '350',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+30)[0-9]{6,}$',
              title: 'Greece',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '30',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+299)[0-9]{6,}$',
              title: 'Greenland',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '299',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(473)[0-9]{6,}$',
              title: 'Grenada',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+590)[0-9]{6,}$',
              title: 'Guadeloupe',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '590',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(671)[0-9]{6,}$',
              title: 'Guam',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+502)[0-9]{6,}$',
              title: 'Guatemala',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '502',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+44)(1481|7781|7839|7911)[0-9]{6,}$',
              title: 'Guernsey',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '44',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+224)[0-9]{6,}$',
              title: 'Guinea',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '224',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+245)[0-9]{6,}$',
              title: 'Guinea-Bissau',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '245',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+592)[0-9]{6,}$',
              title: 'Guyana',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '592',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+509)[0-9]{6,}$',
              title: 'Haiti',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '509',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+504)[0-9]{6,}$',
              title: 'Honduras',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '504',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+852)[0-9]{6,}$',
              title: 'Hong Kong',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '852',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+36)[0-9]{6,}$',
              title: 'Hungary',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '36',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+354)[0-9]{6,}$',
              title: 'Iceland',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '354',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+91)[0-9]{6,}$',
              title: 'India',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '91',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+62)[0-9]{6,}$',
              title: 'Indonesia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '62',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+98)[0-9]{6,}$',
              title: 'Iran',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '98',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+964)[0-9]{6,}$',
              title: 'Iraq',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '964',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+353)[0-9]{6,}$',
              title: 'Ireland',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '353',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+44)(1624|74576|7524|7924|7624)[0-9]{6,}$',
              title: 'Isle of Man',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '44',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+972)[0-9]{6,}$',
              title: 'Israel',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '972',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+39)[0-9]{6,}$',
              title: 'Italy',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '39',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(876|658)[0-9]{6,}$',
              title: 'Jamaica',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+81)[0-9]{6,}$',
              title: 'Japan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '81',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+44)(1534|7509|7700|7797|7829|7937)[0-9]{6,}$',
              title: 'Jersey',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '44',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+962)[0-9]{6,}$',
              title: 'Jordan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '962',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+7)(33|7)[0-9]{6,}$',
              title: 'Kazakhstan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '7',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+254)[0-9]{6,}$',
              title: 'Kenya',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '254',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+686)[0-9]{6,}$',
              title: 'Kiribati',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '686',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+383)[0-9]{6,}$',
              title: 'Kosovo',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '383',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+965)[0-9]{6,}$',
              title: 'Kuwait',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '965',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+996)[0-9]{6,}$',
              title: 'Kyrgyzstan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '996',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+856)[0-9]{6,}$',
              title: 'Laos',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '856',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+371)[0-9]{6,}$',
              title: 'Latvia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '371',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+961)[0-9]{6,}$',
              title: 'Lebanon',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '961',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+266)[0-9]{6,}$',
              title: 'Lesotho',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '266',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+231)[0-9]{6,}$',
              title: 'Liberia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '231',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+218)[0-9]{6,}$',
              title: 'Libya',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '218',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+423)[0-9]{6,}$',
              title: 'Liechtenstein',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '423',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+370)[0-9]{6,}$',
              title: 'Lithuania',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '370',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+352)[0-9]{6,}$',
              title: 'Luxembourg',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '352',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+853)[0-9]{6,}$',
              title: 'Macau',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '853',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+261)[0-9]{6,}$',
              title: 'Madagascar',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '261',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+265)[0-9]{6,}$',
              title: 'Malawi',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '265',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+60)[0-9]{6,}$',
              title: 'Malaysia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '60',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+960)[0-9]{6,}$',
              title: 'Maldives',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '960',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+223)[0-9]{6,}$',
              title: 'Mali',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '223',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+356)[0-9]{6,}$',
              title: 'Malta',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '356',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+692)[0-9]{6,}$',
              title: 'Marshall Islands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '692',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+596)[0-9]{6,}$',
              title: 'Martinique',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '596',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+222)[0-9]{6,}$',
              title: 'Mauritania',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '222',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+230)[0-9]{6,}$',
              title: 'Mauritius',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '230',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+262)(269|639)[0-9]{6,}$',
              title: 'Mayotte',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '262',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+52)[0-9]{6,}$',
              title: 'Mexico',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '52',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+691)[0-9]{6,}$',
              title: 'Micronesia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '691',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+373)[0-9]{6,}$',
              title: 'Moldova',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '373',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+377)[0-9]{6,}$',
              title: 'Monaco',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '377',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+976)[0-9]{6,}$',
              title: 'Mongolia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '976',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+382)[0-9]{6,}$',
              title: 'Montenegro',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '382',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(664)[0-9]{6,}$',
              title: 'Montserrat',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+212)[0-9]{6,}$',
              title: 'Morocco',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '212',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+258)[0-9]{6,}$',
              title: 'Mozambique',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '258',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+95)[0-9]{6,}$',
              title: 'Myanmar',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '95',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+264)[0-9]{6,}$',
              title: 'Namibia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '264',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+674)[0-9]{6,}$',
              title: 'Nauru',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '674',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+977)[0-9]{6,}$',
              title: 'Nepal',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '977',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+31)[0-9]{6,}$',
              title: 'Netherlands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '31',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+687)[0-9]{6,}$',
              title: 'New Caledonia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '687',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+64)[0-9]{6,}$',
              title: 'New Zealand',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '64',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+505)[0-9]{6,}$',
              title: 'Nicaragua',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '505',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+227)[0-9]{6,}$',
              title: 'Niger',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '227',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+234)[0-9]{6,}$',
              title: 'Nigeria',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '234',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+683)[0-9]{6,}$',
              title: 'Niue',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '683',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+672)[0-9]{6,}$',
              title: 'Norfolk Island',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '672',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+850)[0-9]{6,}$',
              title: 'North Korea',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '850',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+389)[0-9]{6,}$',
              title: 'North Macedonia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '389',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(670)[0-9]{6,}$',
              title: 'Northern Mariana Islands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+47)[0-9]{6,}$',
              title: 'Norway',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '47',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+968)[0-9]{6,}$',
              title: 'Oman',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '968',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+92)[0-9]{6,}$',
              title: 'Pakistan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '92',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+680)[0-9]{6,}$',
              title: 'Palau',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '680',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+970)[0-9]{6,}$',
              title: 'Palestine',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '970',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+507)[0-9]{6,}$',
              title: 'Panama',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '507',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+675)[0-9]{6,}$',
              title: 'Papua New Guinea',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '675',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+595)[0-9]{6,}$',
              title: 'Paraguay',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '595',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+51)[0-9]{6,}$',
              title: 'Peru',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '51',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+63)[0-9]{6,}$',
              title: 'Philippines',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '63',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+48)[0-9]{6,}$',
              title: 'Poland',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '48',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+351)[0-9]{6,}$',
              title: 'Portugal',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '351',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(787|939)[0-9]{6,}$',
              title: 'Puerto Rico',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+974)[0-9]{6,}$',
              title: 'Qatar',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '974',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+40)[0-9]{6,}$',
              title: 'Romania',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '40',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+7)[0-9]{6,}$',
              title: 'Russia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '7',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+250)[0-9]{6,}$',
              title: 'Rwanda',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '250',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+262)[0-9]{6,}$',
              title: 'Réunion',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '262',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+590)[0-9]{6,}$',
              title: 'Saint Barthélemy',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '590',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+290)[0-9]{6,}$',
              title: 'Saint Helena',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '290',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(869)[0-9]{6,}$',
              title: 'Saint Kitts and Nevis',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(758)[0-9]{6,}$',
              title: 'Saint Lucia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+590)[0-9]{6,}$',
              title: 'Saint Martin',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '590',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+508)[0-9]{6,}$',
              title: 'Saint Pierre and Miquelon',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '508',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(784)[0-9]{6,}$',
              title: 'Saint Vincent and the Grenadines',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+685)[0-9]{6,}$',
              title: 'Samoa',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '685',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+378)[0-9]{6,}$',
              title: 'San Marino',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '378',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+966)[0-9]{6,}$',
              title: 'Saudi Arabia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '966',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+221)[0-9]{6,}$',
              title: 'Senegal',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '221',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+381)[0-9]{6,}$',
              title: 'Serbia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '381',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+248)[0-9]{6,}$',
              title: 'Seychelles',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '248',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+232)[0-9]{6,}$',
              title: 'Sierra Leone',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '232',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+65)[0-9]{6,}$',
              title: 'Singapore',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '65',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(721)[0-9]{6,}$',
              title: 'Sint Maarten',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+421)[0-9]{6,}$',
              title: 'Slovakia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '421',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+386)[0-9]{6,}$',
              title: 'Slovenia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '386',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+677)[0-9]{6,}$',
              title: 'Solomon Islands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '677',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+252)[0-9]{6,}$',
              title: 'Somalia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '252',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+27)[0-9]{6,}$',
              title: 'South Africa',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '27',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+82)[0-9]{6,}$',
              title: 'South Korea',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '82',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+211)[0-9]{6,}$',
              title: 'South Sudan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '211',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+34)[0-9]{6,}$',
              title: 'Spain',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '34',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+94)[0-9]{6,}$',
              title: 'Sri Lanka',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '94',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+249)[0-9]{6,}$',
              title: 'Sudan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '249',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+597)[0-9]{6,}$',
              title: 'Suriname',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '597',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+47)(79)[0-9]{6,}$',
              title: 'Svalbard and Jan Mayen',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '47',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+46)[0-9]{6,}$',
              title: 'Sweden',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '46',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+41)[0-9]{6,}$',
              title: 'Switzerland',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '41',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+963)[0-9]{6,}$',
              title: 'Syria',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '963',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+239)[0-9]{6,}$',
              title: 'São Tomé and Príncipe',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '239',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+886)[0-9]{6,}$',
              title: 'Taiwan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '886',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+992)[0-9]{6,}$',
              title: 'Tajikistan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '992',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+255)[0-9]{6,}$',
              title: 'Tanzania',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '255',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+66)[0-9]{6,}$',
              title: 'Thailand',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '66',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+670)[0-9]{6,}$',
              title: 'Timor-Leste',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '670',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+228)[0-9]{6,}$',
              title: 'Togo',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '228',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+690)[0-9]{6,}$',
              title: 'Tokelau',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '690',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+676)[0-9]{6,}$',
              title: 'Tonga',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '676',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(868)[0-9]{6,}$',
              title: 'Trinidad and Tobago',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+216)[0-9]{6,}$',
              title: 'Tunisia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '216',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+90)[0-9]{6,}$',
              title: 'Turkey',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '90',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+993)[0-9]{6,}$',
              title: 'Turkmenistan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '993',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(649)[0-9]{6,}$',
              title: 'Turks and Caicos Islands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+688)[0-9]{6,}$',
              title: 'Tuvalu',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '688',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)(340)[0-9]{6,}$',
              title: 'U.S. Virgin Islands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+256)[0-9]{6,}$',
              title: 'Uganda',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '256',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+380)[0-9]{6,}$',
              title: 'Ukraine',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '380',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+971)[0-9]{6,}$',
              title: 'United Arab Emirates',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '971',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+44)[0-9]{6,}$',
              title: 'United Kingdom',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '44',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+1)[0-9]{6,}$',
              title: 'United States',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '1',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+598)[0-9]{6,}$',
              title: 'Uruguay',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '598',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+998)[0-9]{6,}$',
              title: 'Uzbekistan',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '998',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+678)[0-9]{6,}$',
              title: 'Vanuatu',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '678',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+39)(06698)[0-9]{6,}$',
              title: 'Vatican City',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '39',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+58)[0-9]{6,}$',
              title: 'Venezuela',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '58',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+84)[0-9]{6,}$',
              title: 'Vietnam',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '84',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+681)[0-9]{6,}$',
              title: 'Wallis and Futuna',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '681',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+212)(5288|5289)[0-9]{6,}$',
              title: 'Western Sahara',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '212',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+967)[0-9]{6,}$',
              title: 'Yemen',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '967',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+260)[0-9]{6,}$',
              title: 'Zambia',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '260',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+263)[0-9]{6,}$',
              title: 'Zimbabwe',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '263',
                },
              },
            },
            {
              not: {
                const: null,
              },
              pattern: '^(\\+358)(18)[0-9]{6,}$',
              title: 'Åland Islands',
              'x-jsf-presentation': {
                meta: {
                  countryCode: '358',
                },
              },
            },
          ],
        },
        maxLength: 30,
        title: "Employee's phone number",
        type: 'string',
        'x-jsf-errorMessage': {
          maxLength: 'Must be at most 30 digits',
        },
        'x-jsf-presentation': {
          inputType: 'tel',
        },
      },
      name: {
        description:
          "Employee's full legal name as it appears on identification document. Failure to do so may result in onboarding delays or noncompliance.",
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
          'Minimum onboarding time for Germany is 20 working days. Remote will confirm the start date once we have all required documentation. Consider a later start date if conducting background checks.',
        format: 'date',
        maxLength: 255,
        title: 'Provisional start date',
        type: 'string',
        'x-jsf-logic-validations': ['blocked_date_validation'],
        'x-jsf-presentation': {
          blockedDates: [],
          inputType: 'date',
          meta: {
            mot: 20,
          },
          minDate: '2025-05-12',
          softBlockedDates: [],
        },
      },
      seniority_date: {
        description:
          "A reserve payment is required for employees with 2+ years of seniority. <a href='https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment-in-Employ-of-Record' target='_blank'>Learn more about reserve payments</a>",
        format: 'date',
        title: 'Seniority date',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          _maxYearsFromToday: 5,
          inputType: 'date',
          minDate: '2021-04-22',
        },
      },
      tax_job_category: {
        oneOf: [
          {
            const: 'business_process_improvement_product_management',
            title: 'Business Process Improvement / Product Management',
          },
          {
            const: 'customer_experience_support',
            title: 'Customer Experience/Support',
          },
          {
            const: 'engineering_it',
            title: 'Engineering/IT',
          },
          {
            const: 'finance',
            title: 'Finance',
          },
          {
            const: 'growth_marketing',
            title: 'Growth & Marketing',
          },
          {
            const: 'legal',
            title: 'Legal/Paralegal',
          },
          {
            const: 'onboarding_payroll',
            title: 'Onboarding & Payroll',
          },
          {
            const: 'operations',
            title: 'Operations',
          },
          {
            const: 'people_mobility',
            title: 'People and mobility',
          },
          {
            const: 'research_development',
            title: 'Research & Development',
          },
          {
            const: 'sales',
            title: 'Sales',
          },
          {
            const: 'techops_supply_chain',
            title: 'Techops/Supply Chain',
          },
        ],
        title: 'What is the main job category that the employee performs?',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      tax_servicing_countries: {
        description:
          "Country(s) or region(s) where employee activity is consumed. This doesn't necessarily mean where the employee is based.",
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
        title:
          "Which country(s) or region(s) does this employee's work primarily serve?",
        type: 'array',
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
          meta: {
            helpCenter: {
              callToAction: 'Show examples',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 35452468547725,
              title: 'Help center unavailable',
            },
          },
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
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'email',
        },
      },
    },
    required: [
      'has_seniority_date',
      'mobile_number',
      'name',
      'email',
      'job_title',
      'provisional_start_date',
      'tax_servicing_countries',
      'tax_job_category',
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
      'mobile_number',
      'job_title',
      'tax_servicing_countries',
      'tax_job_category',
      'provisional_start_date',
      'has_seniority_date',
      'seniority_date',
    ],
  },
};
