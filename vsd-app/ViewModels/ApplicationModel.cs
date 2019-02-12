namespace Gov.Jag.VictimServices.Public.ViewModels
{
    public class ApplicationModel
    {
        public string applicantsfirstname { get; set; }
        public string applicantsmiddlename { get; set; }
        public string applicantslastname { get; set; }
        public string applicantsotherfirstname { get; set; }
        public string applicantsotherlastname { get; set; }
        public string applicantsphoneNumber { get; set; }
        public string applicantsemail { get; set; }
        public string applicantsbirthdate { get; set; }

        public long applicantsgender { get; set; }
        public long applicantsmaritalstatus { get; set; }
        public string applicantssocialinsurancenumber { get; set; }

        public string typeofcrime { get; set; }
    }
}