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
         
        // NAME OF DATE CHANGE HERE

        [JsonProperty("vsd_applicantsbirthdate")]
        //public DateTime VsdApplicantsbirthdate { get; set; }
        public string VsdApplicantsbirthdate { get; set; }

        [JsonProperty("vsd_applicantsgendercode")]
        public long VsdApplicantsgendercode { get; set; }

        [JsonProperty("vsd_applicantsmaritalstatus")]
        public long VsdApplicantsmaritalstatus { get; set; }

        [JsonProperty("vsd_applicantsprimaryphonenumber")]
        public string VsdApplicantsprimaryphonenumber { get; set; }

        [JsonProperty("vsd_applicantsemail")]
        public string VsdApplicantsemail { get; set; }

        [JsonProperty("vsd_cvap_typeofcrime")]
        public string VsdCvapTypeofcrime { get; set; }

        [JsonProperty("vsd_cvap_crimestartdate")]
        //public DateTime VsdCvapCrimestartdate { get; set; }
        public string VsdCvapCrimestartdate { get; set; }

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


