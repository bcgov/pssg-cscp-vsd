export interface iRestitutionCRM {
    Application: iCRMApplication;
    CourtInfoCollection?: iCRMCourtInfo[];
    DocumentCollection?: iCRMDocument[];
    ProviderCollection?: iCRMParticipant[];
}
export interface iCRMApplication {
    vsd_applicanttype: number;
    vsd_applicantsfirstname: string;
    vsd_applicantsmiddlename: string;
    vsd_applicantslastname: string;
    vsd_otherfirstname?: string;
    vsd_otherlastname?: string;
    vsd_applicantsgendercode: number;
    vsd_applicantsbirthdate: Date;
    vsd_indigenous: number;
    vsd_applicantspreferredmethodofcontact: number;
    vsd_smspreferred?: number;
    vsd_applicantsprimaryphonenumber?: string;
    vsd_applicantsalternatephonenumber?: string;
    vsd_applicantsemail?: string;
    vsd_applicantsprimaryaddressline1: string;
    vsd_applicantsprimaryaddressline2: string;
    vsd_applicantsprimarycity: string;
    vsd_applicantsprimaryprovince: string;
    vsd_applicantsprimarypostalcode: string;
    vsd_applicantsprimarycountry: string;
    vsd_voicemailoption?: number;
    vsd_applicantssignature: string;
}
export interface iCRMCourtInfo {
    vsd_courtfilenumber: string;
    vsd_courtlocation: string;
}
export interface iCRMParticipant {
    vsd_firstname?: string;
    vsd_middlename?: string;
    vsd_lastname?: string;
    vsd_preferredname?: string;
    vsd_companyname?: string;
    vsd_name?: string;
    vsd_addressline1?: string;
    vsd_addressline2?: string;
    vsd_city?: string;
    vsd_province?: string;
    vsd_postalcode?: string;
    vsd_country?: string;
    vsd_restcontactpreferenceforupdates?: number;
    vsd_phonenumber?: string;
    vsd_alternatephonenumber?: string;
    vsd_voicemailoptions?: number;
    vsd_email?: string;
    vsd_rest_custodylocation?: string;
    vsd_rest_programname?: string;
    vsd_relationship1: string;
    vsd_relationship2?: string;
}
export interface iCRMDocument {
    filename: string;
    body: string;
    subject?: string;
}