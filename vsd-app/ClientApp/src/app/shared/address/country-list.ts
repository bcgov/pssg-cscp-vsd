export interface iCountry {
  name: string;
  postalCodeName: string;
  postalCodeSample: string;
  areaType: string;
  areas: string[];
}
export const COUNTRIES_ADDRESS: iCountry[] = [
  {
    name: 'Canada',
    postalCodeName: 'Postal Code',
    postalCodeSample: 'V9A 0A9',
    areaType: 'Province',
    areas: [
      'Alberta',
      'British Columbia',
      'Manitoba',
      'New Brunswick',
      'Newfoundland and Labrador',
      'Northwest Territories',
      'Nova Scotia',
      'Nunavut',
      'Ontario',
      'Prince Edward Island',
      'Quebec',
      'Saskatchewan',
      'Yukon',
    ]
  },
  {
    name: 'United States of America',
    postalCodeName: 'ZIP Code',
    postalCodeSample: '10001',
    areaType: 'State',
    areas: [
      'Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ]
  },
  {
    name: 'Other Country',
    postalCodeName: 'Postal/ZIP Code',
    postalCodeSample: '',
    areaType: 'Province/State',
    areas: []
  }
];


// the one above is basically useless for addressing. I left it because I don't want broken forms. You must iterate and check the name to get a value. So wasteful on resources.
export const COUNTRIES_ADDRESS_2 = {
  'Canada': {
    name: 'Canada',
    postalCodeName: 'Postal Code',
    postalCodeSample: 'V9A 0A9',
    areaType: 'Province',
    areas: [
      'Alberta',
      'British Columbia',
      'Manitoba',
      'New Brunswick',
      'Newfoundland and Labrador',
      'Northwest Territories',
      'Nova Scotia',
      'Nunavut',
      'Ontario',
      'Prince Edward Island',
      'Quebec',
      'Saskatchewan',
      'Yukon',
    ]
  } as iCountry,
  'United States of America': {
    name: 'United States of America',
    postalCodeName: 'ZIP Code',
    postalCodeSample: '10001',
    areaType: 'State',
    areas: [
      'Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ]
  } as iCountry,
  'Other Country': {
    name: 'Other Country',
    postalCodeName: 'Postal/ZIP Code',
    postalCodeSample: '',
    areaType: 'Province/State',
    areas: []
  } as iCountry
}
