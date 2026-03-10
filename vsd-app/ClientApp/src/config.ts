export const config = {
  canada_crm_id: '52e224c4-989a-e811-8155-480fcff4f6a1',
  bc_crm_id: 'fde4dbca-989a-e811-8155-480fcff4f6a1',
  preferred_police_detachments: [
    { name: 'Surrey RCMP Detachment', id: '7e9e3177-b5a4-e811-8164-480fcff407a1' },
    { name: 'Vancouver Police Department', id: '369f3177-b5a4-e811-8164-480fcff407a1' },
    { name: 'Abbotsford Police Department', id: '1c9e3177-b5a4-e811-8164-480fcff407a1' },
    { name: 'Kelowna RCMP Detachment', id: 'b89d3177-b5a4-e811-8164-480fcff407a1' },
    { name: 'Chilliwack RCMP Detachment', id: '429f3177-b5a4-e811-8164-480fcff407a1' },
    { name: 'New Westminster Police Department', id: '269e3177-b5a4-e811-8164-480fcff407a1' },
    { name: 'Burnaby RCMP Detachment', id: 'b8cf9469-ada4-e811-815f-480fcff4f621' },
    { name: 'Victoria Police Department', id: '169e3177-b5a4-e811-8164-480fcff407a1' },
    { name: 'Coquitlam RCMP Detachment', id: '709e3177-b5a4-e811-8164-480fcff407a1' },
    { name: 'Langley RCMP Detachment', id: '749e3177-b5a4-e811-8164-480fcff407a1' },
    { name: 'Nanaimo RCMP Detachment', id: '949e3177-b5a4-e811-8164-480fcff407a1' },
    { name: 'Kamloops RCMP Detachment', id: 'e09d3177-b5a4-e811-8164-480fcff407a1' }
  ],

  preferred_countries: [
    { name: 'Other', id: '' },
    { name: 'Canada', id: '52e224c4-989a-e811-8155-480fcff4f6a1' },
    { name: 'United States of America', id: '49b05a13-e149-ea11-b816-00505683fbf4' },
    { name: 'Mexico', id: '39b05a13-e149-ea11-b816-00505683fbf4' },
    { name: 'United Kingdom', id: '55b05a13-e149-ea11-b816-00505683fbf4' },
    { name: 'Australia', id: '11b05a13-e149-ea11-b816-00505683fbf4' },
    { name: 'India', id: '2db05a13-e149-ea11-b816-00505683fbf4' },
    { name: 'Italy', id: '31b05a13-e149-ea11-b816-00505683fbf4' },
    { name: 'China', id: '15b05a13-e149-ea11-b816-00505683fbf4' },
    { name: 'Russia', id: '64bb1d2f-e56a-ea11-b812-005056830319' }
  ],

  other_country: { name: 'Other', id: '' },
  other_province: { name: 'Other', id: '', countryId: '', code: '' },
  other_city: { name: 'Other', countryId: '', provinceId: '', id: '' },

  accepted_file_extensions: {
    pdf: true,
    png: true,
    jpeg: true,
    jpg: true,
    doc: true,
    docx: true,
    ppt: true
  }
};
