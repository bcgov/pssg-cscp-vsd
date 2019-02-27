using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Gov.Jag.VictimServices.Public.JsonObjects
{
    public partial class ApplicationRoot
    {
        [JsonProperty("Application")]
        public Application Application { get; set; }

        [JsonProperty("CourtInfoCollection")]
        public List<CourtInfoCollection> CourtInfoCollection { get; set; }

        [JsonProperty("ProviderCollection")]
        public List<ProviderCollection> ProviderCollection { get; set; }
    }

    public partial class Application
    {
        [JsonProperty("@odata.type")]
        public string OdataType { get; set; }

        [JsonProperty("vsd_applicanttype")]
        public long VsdApplicanttype { get; set; }

        // Personal Information
        [JsonProperty("vsd_applicantsfirstname")]
        public string VsdApplicantsfirstname { get; set; }

        [JsonProperty("vsd_applicantsmiddlename")]
        public string VsdApplicantsmiddlename { get; set; }

        [JsonProperty("vsd_applicantslastname")]
        public string VsdApplicantslastname { get; set; }

        [JsonProperty("vsd_otherfirstname")]
        public string VsdApplicantsotherfirstname { get; set; }

        [JsonProperty("vsd_otherlastname")]
        public string VsdApplicantsotherlastname { get; set; }

        [JsonProperty("vsd_dateofnamechange")]
        public DateTime? VsdDateofnamechange { get; set; }

        [JsonProperty("vsd_applicantsbirthdate")]
        public DateTime VsdApplicantsbirthdate { get; set; }

        [JsonProperty("vsd_applicantsgendercode")]
        public long VsdApplicantsgendercode { get; set; }

        [JsonProperty("vsd_applicantsmaritalstatus")]
        public long VsdApplicantsmaritalstatus { get; set; }

        [JsonProperty("vsd_applicantsprimaryphonenumber")]
        public string VsdApplicantsprimaryphonenumber { get; set; }

        [JsonProperty("vsd_applicantsemail")]
        public string VsdApplicantsemail { get; set; }

        [JsonProperty("vsd_applicantssocialinsurancenumber")]
        public string VsdApplicantssocialinsurancenumber { get; set; }

        [JsonProperty("vsd_applicantsoccupation")]
        public string VsdApplicantsoccupation { get; set; }

        // Primary Address Information
        public string vsd_applicantsprimaryaddressline1 { get; set; }
        public string vsd_applicantsprimaryaddressline2 { get; set; }
        public string vsd_applicantsprimaryaddressline3 { get; set; }
        public string vsd_applicantsprimarycity { get; set; }
        public string vsd_applicantsprimaryprovince { get; set; }
        public string vsd_applicantsprimarycountry { get; set; }
        public string vsd_applicantsprimarypostalcode { get; set; }

        // Alternate Address Information
        public string vsd_applicantsalternateaddressline1 { get; set; }
        public string vsd_applicantsalternateaddressline2 { get; set; }
        public string vsd_applicantsalternateaddressline3 { get; set; }
        public string vsd_applicantsalternatecity { get; set; }
        public string vsd_applicantsalternateprovince { get; set; }
        public string vsd_applicantsalternatecountry { get; set; }
        public string vsd_applicantsalternatepostalcode { get; set; }


        // Crime Information
        [JsonProperty("vsd_cvap_typeofcrime")]
        public string VsdCvapTypeofcrime { get; set; }

        [JsonProperty("vsd_cvap_crimestartdate")]
        public DateTime VsdCvapCrimestartdate { get; set; }

        [JsonProperty("vsd_cvap_crimeenddate")]
        public DateTime? VsdCvapCrimeenddate { get; set; }

        [JsonProperty("vsd_cvap_crimelocations")]
        public string VsdCvapCrimelocations { get; set; }

        [JsonProperty("vsd_cvap_crimedetails")]
        public string VsdCvapCrimeDetails { get; set; }

        [JsonProperty("vsd_cvap_injuries")]
        public string VsdCvapInjuries { get; set; }

        [JsonProperty("vsd_cvap_onbehalfofdeclaration")]
        public long VsdCvapOnbehalfofdeclaration { get; set; }

        [JsonProperty("vsd_applicantssignature")]
        public string VsdApplicantssignature { get; set; }

        [JsonProperty("vsd_cvap_declarationsigneddate")]
        //public DateTime VsdCvapDeclarationsigneddate { get; set; }
        public string VsdCvapDeclarationsigneddate { get; set; }

        [JsonProperty("vsd_cvap_authorizationsigneddate")]
        //public DateTime VsdCvapAuthorizationsigneddate { get; set; }
        public string VsdCvapAuthorizationsigneddate { get; set; }
    }

    public partial class CourtInfoCollection
    {
        [JsonProperty("@odata.type")]
        public string OdataType { get; set; }

        [JsonProperty("vsd_courtfilenumber")]
        public string VsdCourtfilenumber { get; set; }

        [JsonProperty("vsd_courtlocation")]
        public string VsdCourtlocation { get; set; }
    }

    public partial class ProviderCollection
    {
        [JsonProperty("@odata.type")]
        public string OdataType { get; set; }

        [JsonProperty("vsd_providername")]
        public string VsdProvidername { get; set; }

        [JsonProperty("vsd_type")]
        public long VsdType { get; set; }
    }
}


