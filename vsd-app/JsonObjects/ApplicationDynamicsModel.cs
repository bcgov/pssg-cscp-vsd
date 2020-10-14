using System;

namespace Gov.Cscp.VictimServices.Public.JsonObjects
{
    public class ApplicationDynamicsModel
    {
        public Application Application { get; set; }
        public Courtinfocollection[] CourtInfoCollection { get; set; }
        public Policefilenumbercollection[] PoliceFileNumberCollection { get; set; }
        public Providercollection[] ProviderCollection { get; set; }
        public Documentcollection[] DocumentCollection { get; set; }
    }

    public class Application
    {
        public string odatatype => "Microsoft.Dynamics.CRM.vsd_application";
        public int vsd_applicanttype { get; set; }
        public string vsd_applicantsfirstname { get; set; }
        public string vsd_applicantsmiddlename { get; set; }
        public string vsd_applicantslastname { get; set; }
        public string vsd_otherfirstname { get; set; }
        public string vsd_otherlastname { get; set; }
        public DateTime? vsd_dateofnamechange { get; set; }
        public string vsd_cvap_relationshiptovictim { get; set; }
        public string vsd_relationshipother1 { get; set; }

        public int vsd_applicantsgendercode { get; set; }
        public DateTime? vsd_applicantsbirthdate { get; set; }
        public int? vsd_applicantsmaritalstatus { get; set; }

        public string vsd_applicantsoccupation { get; set; }
        public string vsd_applicantssocialinsurancenumber { get; set; }
        public int? vsd_indigenous { get; set; }

        public string vsd_applicantsprimaryphonenumber { get; set; }
        // public bool vsd_leavevoicemail { get; set; }
        public int? vsd_voicemailoption { get; set; }
        public string vsd_applicantsalternatephonenumber { get; set; }
        public string vsd_applicantsemail { get; set; }
        public int vsd_applicantspreferredmethodofcontact { get; set; }

        public string vsd_applicantsprimaryaddressline1 { get; set; }
        public string vsd_applicantsprimaryaddressline2 { get; set; }
        public string vsd_applicantsprimarycity { get; set; }
        public string vsd_applicantsprimaryprovince { get; set; }
        public string vsd_applicantsprimarypostalcode { get; set; }
        public string vsd_applicantsprimarycountry { get; set; }

        public string vsd_applicantsalternateaddressline1 { get; set; }
        public string vsd_applicantsalternateaddressline2 { get; set; }
        public string vsd_applicantsalternatecity { get; set; }
        public string vsd_applicantsalternateprovince { get; set; }
        public string vsd_applicantsalternatepostalcode { get; set; }
        public string vsd_applicantsalternatecountry { get; set; }

        public string vsd_cvap_victimfirstname { get; set; }
        public string vsd_cvap_victimmiddlename { get; set; }
        public string vsd_cvap_victimlastname { get; set; }
        public int? vsd_cvap_victimmaritalstatus { get; set; }
        public string vsd_cvap_victimotherfirstname { get; set; }
        public string vsd_cvap_victimotherlastname { get; set; }
        public DateTime? vsd_cvap_victimdateofnamechange { get; set; }
        public int? vsd_cvap_victimgendercode { get; set; }
        public DateTime? vsd_cvap_victimbirthdate { get; set; }
        public string vsd_cvap_victimsocialinsurancenumber { get; set; }
        public string vsd_cvap_victimoccupation { get; set; }
        public string vsd_cvap_victimprimaryphonenumber { get; set; }
        public string vsd_cvap_victimalternatephonenumber { get; set; }
        public string vsd_cvap_victimemailaddress { get; set; }
        public string vsd_cvap_victimaddressline1 { get; set; }
        public string vsd_cvap_victimaddressline2 { get; set; }
        public string vsd_cvap_victimcity { get; set; }
        public string vsd_cvap_victimpostalcode { get; set; }
        public string vsd_cvap_victimprovince { get; set; }
        public string vsd_cvap_victimcountry { get; set; }

        public string vsd_cvap_typeofcrime { get; set; }
        public bool vsd_cvap_unsureofspecificcrimedates { get; set; }
        public DateTime? vsd_cvap_crimestartdate { get; set; }
        public DateTime? vsd_cvap_crimeenddate { get; set; }
        public string vsd_cvap_reasontoapplylate { get; set; }
        public string vsd_cvap_crimelocations { get; set; }
        public int? vsd_cvap_victimdeceased { get; set; }
        public DateTime? vsd_cvap_victimdateofdeath { get; set; }
        public string vsd_cvap_crimedetails { get; set; }
        public string vsd_cvap_injuries { get; set; }

        public int? vsd_cvap_reporttopolice { get; set; }
        // public string vsd_cvap_policedetachment { get; set; } //deleted in COAST
        // public DateTime? vsd_cvap_policereportingstartdate { get; set; }
        // public DateTime? vsd_cvap_policereportingenddate { get; set; }
        public string vsd_cvap_crimereportedto { get; set; }

        public string vsd_cvap_offenderfirstname { get; set; }
        public string vsd_cvap_offendermiddlename { get; set; }
        public string vsd_cvap_offenderlastname { get; set; }

        public string vsd_cvap_relationshiptooffender { get; set; }
        public int? vsd_cvap_isoffendercharged { get; set; }
        public int? vsd_cvap_isoffendersued { get; set; }
        public int? vsd_cvap_intentiontosueoffender { get; set; }

        public int? vsd_racaf_appliedforrestitution { get; set; }
        public string vsd_racaf_requestedexpenses { get; set; }
        public float? vsd_racaf_expensesawarded { get; set; }
        public float? vsd_racaf_amountreceived { get; set; }

        public int? vsd_racaf_legalactiontaken { get; set; }
        public string vsd_racaf_lawyerorfirmname { get; set; }
        public string vsd_racaf_lawyeraddressline1 { get; set; }
        public string vsd_racaf_lawyeraddressline2 { get; set; }
        public string vsd_racaf_lawyercity { get; set; }
        public string vsd_racaf_lawyerprovince { get; set; }
        public string vsd_racaf_lawyerpostalcode { get; set; }
        public string vsd_racaf_lawyercountry { get; set; }

        public string vsd_racaf_signature { get; set; }
        public string vsd_racaf_fullname { get; set; }

        public string vsd_applicantspersonalhealthnumber { get; set; }
        public string vsd_applicantsmspprovince { get; set; }
        public string vsd_applicantsmspprovinceother { get; set; }
        public string vsd_applicantsextendedhealthprovidername { get; set; }
        public string vsd_applicantsextendedhealthnumber { get; set; }

        public int? vsd_cvap_otherhealthcoverage { get; set; }

        public string vsd_cvap_treatmenthospitalname { get; set; }
        public DateTime? vsd_cvap_treatmentdate { get; set; }

        public string vsd_cvap_benefitsrequested { get; set; }
        public string vsd_cvap_benefitsrequestedother { get; set; }
        public string vsd_cvap_otherbenefits { get; set; }
        public string vsd_cvap_otherbenefitsother { get; set; }
        public string vsd_cvap_benefitsrequesteddescription { get; set; }

        public int? vsd_cvap_ifmemployedduringcrime { get; set; }
        public int? vsd_cvap_ifmatworkduringcrime { get; set; }
        public string vsd_cvap_ifmwcbclaimnumber { get; set; }
        public int? vsd_cvap_ifmmissedwork { get; set; }
        public DateTime? vsd_cvap_ifmmissedworkstart { get; set; }
        public DateTime? vsd_cvap_ifmmissedworkend { get; set; }
        public int? vsd_cvap_ifmareyoustilloffwork { get; set; }
        public int? vsd_cvap_ifmlostwages { get; set; }
        public int? vsd_cvap_ifmselfemployed { get; set; }
        public int? vsd_cvap_ifmcontactemployer { get; set; }

        public int? vsd_cvap_onbehalfofdeclaration { get; set; }
        public string vsd_applicantssignature { get; set; }
        public string vsd_authorizationsignature { get; set; }
        public int? vsd_cvap_optionalauthorization { get; set; }
        public int? vsd_cvap_agency_person_authorization { get; set; }
        public string vsd_optionalauthorizationsignature { get; set; }
    }

    public class Courtinfocollection
    {
        public string odatatype => "Microsoft.Dynamics.CRM.vsd_applicationcourtinformation";
        public string vsd_courtfilenumber { get; set; }
        public string vsd_courtlocation { get; set; }
    }

    public class Policefilenumbercollection
    {
        public string odatatype => "Microsoft.Dynamics.CRM.vsd_applicationpolicenumber";
        public string vsd_policefilenumber { get; set; }
        public string vsd_investigatingpoliceofficername { get; set; }
        // public string vsd_policeforce { get; set; }
        public string vsd_policedetachment { get; set; }
        public DateTime? vsd_policereportingstartdate { get; set; }
        public DateTime? vsd_policereportingenddate { get; set; }
    }

    public class Providercollection
    {
        public string odatatype => "Microsoft.Dynamics.CRM.vsd_participant";
        public string vsd_name { get; set; }
        public string vsd_phonenumber { get; set; }
        public string vsd_fax { get; set; }
        public string vsd_addressline1 { get; set; }
        public string vsd_addressline2 { get; set; }
        public string vsd_city { get; set; }
        public string vsd_province { get; set; }
        public string vsd_postalcode { get; set; }
        public string vsd_email { get; set; }
        public string vsd_relationship1 { get; set; }
        public string vsd_relationship2 { get; set; }
        public string vsd_relationship1other { get; set; }
        public string vsd_relationship2other { get; set; }
        public string vsd_country { get; set; }
        public string vsd_firstname { get; set; }
        public string vsd_lastname { get; set; }
        public string vsd_companyname { get; set; }
        public int? vsd_preferredmethodofcontact { get; set; }
        public string vsd_alternatephonenumber { get; set; }
        public string vsd_middlename { get; set; }
    }

    public class Documentcollection
    {
        public string odatatype => "Microsoft.Dynamics.CRM.activitymimeattachment";
        public string filename { get; set; }
        public string body { get; set; }
        public string subject { get; set; }
    }

}


