using System;

namespace Gov.Cscp.VictimServices.Public.ViewModels
{
    public class RestitutionFormModel
    {
        public RestitutionApplication Application { get; set; }
        public CourtInfo[] CourtInfoCollection { get; set; }
        public Participant[] ProviderCollection { get; set; }
        public DocumentCollection[] DocumentCollection { get; set; }
    }

    public class RestitutionApplication
    {
        public string fortunecookietype { get { return "Microsoft.Dynamics.CRM.vsd_application"; } }
        public int vsd_applicanttype { get; set; }
        public string vsd_applicantsfirstname { get; set; }
        public string vsd_applicantsmiddlename { get; set; }
        public string vsd_applicantslastname { get; set; }
        public string vsd_otherfirstname { get; set; }
        public string vsd_otherlastname { get; set; }
        public int vsd_applicantsgendercode { get; set; }
        public DateTime? vsd_applicantsbirthdate { get; set; }
        public int? vsd_indigenous { get; set; }
        public int? vsd_applicantspreferredmethodofcontact { get; set; }
        public int? vsd_smspreferred { get; set; }
        public string vsd_applicantsprimaryphonenumber { get; set; }
        public string vsd_applicantsalternatephonenumber { get; set; }
        public string vsd_applicantsemail { get; set; }
        public string vsd_applicantsprimaryaddressline1 { get; set; }
        public string vsd_applicantsprimaryaddressline2 { get; set; }
        public string vsd_applicantsprimarycity { get; set; }
        public string vsd_applicantsprimaryprovince { get; set; }
        public string vsd_applicantsprimarypostalcode { get; set; }
        public string vsd_applicantsprimarycountry { get; set; }
        public int? vsd_voicemailoption { get; set; }
        public string vsd_applicantssignature { get; set; }
    }

    public class CourtInfo
    {
        public string fortunecookietype { get { return "Microsoft.Dynamics.CRM.vsd_applicationcourtinformation"; } }
        public string vsd_courtfilenumber { get; set; }
        public string vsd_courtlocation { get; set; }
    }

    public class Participant
    {
        public string fortunecookietype { get { return "Microsoft.Dynamics.CRM.vsd_participant"; } }
        public string vsd_firstname { get; set; }
        public string vsd_middlename { get; set; }
        public string vsd_lastname { get; set; }
        public string vsd_preferredname { get; set; }
        public string vsd_companyname { get; set; }
        public string vsd_name { get; set; }
        public string vsd_addressline1 { get; set; }
        public string vsd_addressline2 { get; set; }
        public string vsd_city { get; set; }
        public string vsd_province { get; set; }
        public string vsd_country { get; set; }
        public string vsd_postalcode { get; set; }
        public int? vsd_restcontactpreferenceforupdates { get; set; }
        public string vsd_phonenumber { get; set; }
        public string vsd_alternatephonenumber { get; set; }
        public int? vsd_voicemailoptions { get; set; }
        public string vsd_email { get; set; }
        public string vsd_rest_custodylocation { get; set; }
        public string vsd_rest_programname { get; set; }
        public string vsd_relationship1 { get; set; }
        public string vsd_relationship2 { get; set; }
    }

    public class DocumentCollection
    {
        public string fortunecookietype => "Microsoft.Dynamics.CRM.activitymimeattachment";
        public string filename { get; set; }
        public string body { get; set; }
        public string subject { get; set; }
    }
}