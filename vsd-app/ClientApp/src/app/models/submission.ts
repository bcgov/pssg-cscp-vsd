export interface iSubmission {
  Application: iApplication;
  CourtInfoCollection: iCourtInfo[];
  DocumentCollection: iDocument[];
  PoliceFileNumberCollection: iPoliceFileNumber[];
  ProviderCollection: iProvider[];
}
export interface iDocument {
  "@odata.type": "Microsoft.Dynamics.CRM.activitymimeattachment";
  body: string;
  filename: string;
}
export interface iCourtInfo {
  "@odata.type": "Microsoft.Dynamics.CRM.vsd_applicationcourtinformation";
  vsd_courtlocation: string;
  vsd_courtfilenumber: string;
}
export interface iPoliceFileNumber {
  "@odata.type": "Microsoft.Dynamics.CRM.vsd_applicationpolicenumber";
  vsd_investigatingpoliceofficername: string;
  vsd_policefilenumber: string;
  vsd_policedetachment: string;
  vsd_policereportingstartdate: string;
  vsd_policereportingenddate: string;
}
export interface iProvider {
  "@odata.type": "Microsoft.Dynamics.CRM.vsd_participant";
  vsd_addressline1: string;
  vsd_addressline2: string;
  vsd_city: string;
  vsd_email: string;
  vsd_name: string;
  vsd_phonenumber: string;
  vsd_postalcode: string;
  vsd_province: string;
  vsd_relationship1: string;
}

interface iApplication {
  "@odata.type": "Microsoft.Dynamics.CRM.vsd_application";
  // 100000000: witness application
  // 100000001: IFM application
  // 100000002: victim application
  vsd_applicanttype: number;

  vsd_applicantsalternateaddressline1: string;
  vsd_applicantsalternateaddressline2: string;
  vsd_applicantsalternatecity: string;
  vsd_applicantsalternatecountry: string;
  vsd_applicantsalternatephonenumber: string;
  vsd_applicantsalternatepostalcode: string;
  vsd_applicantsalternateprovince: string;
  vsd_applicantsbirthdate: string;
  vsd_applicantsemail: string;
  vsd_applicantsextendedhealthnumber: string;
  vsd_applicantsextendedhealthprovidername: string;
  vsd_applicantsfirstname: string;
  vsd_applicantsgendercode: number;
  vsd_applicantslastname: string;
  vsd_applicantsmiddlename: string;
  vsd_applicantsoccupation: string;
  vsd_applicantspersonalhealthnumber: string;
  vsd_applicantspreferredmethodofcontact: number;
  vsd_applicantsprimaryaddressline1: string;
  vsd_applicantsprimaryaddressline2: string;
  vsd_applicantsprimarycity: string;
  vsd_applicantsprimarycountry: string;
  vsd_applicantsprimaryphonenumber: string;
  vsd_applicantsprimarypostalcode: string;
  vsd_applicantsprimaryprovince: string;
  vsd_applicantssignature: string;
  vsd_applicantssocialinsurancenumber: string;
  vsd_cvap_benefitsrequested: string;
  vsd_cvap_benefitsrequestedother: string;
  vsd_cvap_crimedetails: string;
  vsd_cvap_crimeenddate: string;
  vsd_cvap_crimelocations: string;
  vsd_cvap_crimereportedto: string;
  vsd_cvap_crimestartdate: string;
  vsd_cvap_ifmatworkduringcrime: number;
  vsd_cvap_ifmcontactemployer: number;
  vsd_cvap_ifmemployedduringcrime: number;
  vsd_cvap_ifmlostwages: number;
  vsd_cvap_ifmmissedwork: number;
  vsd_cvap_ifmmissedworkend: string;
  vsd_cvap_ifmmissedworkstart: string;
  vsd_cvap_ifmselfemployed: number;
  vsd_cvap_ifmwcbclaimnumber: string;
  vsd_cvap_injuries: string;
  vsd_cvap_intentiontosueoffender: number;
  vsd_cvap_isoffendercharged: number;
  vsd_cvap_isoffendersued: number;
  vsd_cvap_offenderfirstname: string;
  vsd_cvap_offenderlastname: string;
  vsd_cvap_offendermiddlename: string;
  vsd_cvap_onbehalfofdeclaration: number;
  vsd_cvap_otherbenefitsother: string;
  // vsd_cvap_policedetachment: string;
  // vsd_cvap_policereportingenddate: string;
  // vsd_cvap_policereportingstartdate: string;
  vsd_cvap_reasontoapplylate: string;
  vsd_cvap_relationshiptooffender: string;
  vsd_cvap_reporttopolice: number;
  vsd_cvap_treatmentdate: string;
  vsd_cvap_treatmenthospitalname: string;
  vsd_cvap_typeofcrime: string;
  vsd_dateofnamechange: string;
  vsd_otherfirstname: string;
  vsd_otherlastname: string;
  vsd_racaf_amountreceived: number;
  vsd_racaf_appliedforrestitution: number;
  vsd_racaf_expensesawarded: number;
  vsd_racaf_lawyeraddressline1: string;
  vsd_racaf_lawyeraddressline2: string;
  vsd_racaf_lawyercity: string;
  vsd_racaf_lawyercountry: string;
  vsd_racaf_lawyerorfirmname: string;
  vsd_racaf_lawyerpostalcode: string;
  vsd_racaf_lawyerprovince: string;
  vsd_racaf_legalactiontaken: number;
  vsd_racaf_signature: string;
}
export interface iWitnessApplication extends iIfmApplication {
  // both this one and the iIfmApplication are the same. We just extend the other one for laziness/efficiency
  // if the form requirements become divergent then we can duplicate the properties of the other at that point
}
export interface iIfmApplication extends iApplication {
  vsd_cvap_relationshiptovictim: string;//missing on victim application
  vsd_cvap_victimaddressline1: string;//not in victim form
  vsd_cvap_victimaddressline2: string;//not in victim form
  vsd_cvap_victimalternatephonenumber: string;//not in victim form
  vsd_cvap_victimbirthdate: string;//not in victim form
  vsd_cvap_victimcity: string;//not in victim form
  vsd_cvap_victimcountry: string;//not in victim form
  vsd_cvap_victimdateofnamechange: string;//not in victim form
  vsd_cvap_victimemailaddress: string;//not in victim form
  vsd_cvap_victimfirstname: string;//not in victim form
  vsd_cvap_victimgendercode: number;//not in victim form
  vsd_cvap_victimlastname: string;//not in victim form
  vsd_cvap_victimmaritalstatus: number;//not in victim form
  vsd_cvap_victimmiddlename: string;//not in victim form
  vsd_cvap_victimoccupation: string;//not in victim form
  vsd_cvap_victimotherfirstname: string;//not in victim form
  vsd_cvap_victimotherlastname: string;//not in victim form
  vsd_cvap_victimpostalcode: string;//not in victim form
  vsd_cvap_victimprimaryphonenumber: string;//not in victim form
  vsd_cvap_victimprovince: string;//not in victim form
  vsd_cvap_victimsocialinsurancenumber: string;//not in victim form
}
export interface iVictimApplication extends iApplication {
  vsd_applicantsmaritalstatus: number;//only on victim application
}
