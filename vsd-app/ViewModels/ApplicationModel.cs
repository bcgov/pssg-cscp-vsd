using System;

namespace Gov.Jag.VictimServices.Public.ViewModels
{
    public class CustomAddress
    {
        public string line1 { get; set; }
        public string line2 { get; set; }
        public string line3 { get; set; }
        public string city { get; set; }
        public string province { get; set; }
        public string postalcode { get; set; }
        public string country { get; set; }
    }

    public class ApplicationModel
    {
        public PersonalInformation PersonalInformation { get; set; }
        public CrimeInformation CrimeInformation { get; set; }


        //public string applicantsfirstname { get; set; }
        //public string applicantsmiddlename { get; set; }
        //public string applicantslastname { get; set; }
        //public string applicantsotherfirstname { get; set; }
        //public string applicantsotherlastname { get; set; }
        //public string applicantsphoneNumber { get; set; }
        //public string applicantsemail { get; set; }
        //public string applicantsbirthdate { get; set; }

        //public long applicantsgender { get; set; }
        //public long applicantsmaritalstatus { get; set; }
        //public string applicantssocialinsurancenumber { get; set; }

        public string typeofcrime { get; set; }
    }

    public class PersonalInformation
    {
        public string firstName { get; set; }
        public string middleName { get; set; }
        public string lastName { get; set; }
        public string otherFirstName { get; set; }
        public string otherLastName { get; set; }
        public DateTime? dateOfNameChange { get; set; }

        public string phoneNumber { get; set; }
        public string email { get; set; }
        public DateTime? birthDate { get; set; }

        public string sinPart1 { get; set; }
        public string sinPart2 { get; set; }
        public string sinPart3 { get; set; }

        public long gender { get; set; }
        public long maritalStatus { get; set; }
        public string occupation { get; set; }

        public CustomAddress primaryAddress { get; set; }
        public CustomAddress alternateAddress { get; set; }
    }

    public class CrimeInformation
    {
        public string typeOfCrime { get; set; }

        //public long whenDidCrimeOccur { get; set; }  // Probably not used
        public DateTime? crimePeriodStart { get; set; }
        public DateTime? crimePeriodEnd { get; set; }
        //public bool applicationFiledWithinOneYearFromCrime { get; set; }
        public string whyDidYouNotApplySooner { get; set; }

        public string crimeLocation { get; set; }
        public string crimeDetails { get; set; }
        public string crimeInjuries { get; set; }
        //        additionalInformation: this.fb.array([]),  // This will be a collection of uploaded files

        public long? wasReportMadeToPolice { get; set; }

        public string policeReportedWhichPoliceForce { get; set; }
        public DateTime? policeReportedDate { get; set; }
        public string policeReportedPoliceFileNumber { get; set; }
        public string policeReportedInvestigatingOfficer { get; set; }

        public string noPoliceReportIdentification { get; set; }

        public string offenderFirstName { get; set; }
        public string offenderMiddleName { get; set; }
        public string offenderLastName { get; set; }
        public string offenderRelationship { get; set; }
        public long? offenderBeenCharged { get; set; }

        //        courtFiles: this.fb.array([]),

        public string courtFileNumber { get; set; }
        public string courtLocation { get; set; }

        public long? haveYouSuedOffender { get; set; }
        public string suedCourtLocation { get; set; }
        public string suedCourtFileNumber { get; set; }
        public long? intendToSueOffender { get; set; }
    }
}