using System;

namespace Gov.Cscp.VictimServices.Public.ViewModels
{
    public class OffenderRestitutionFormModel
    {
        public OffenderRestitutionInformation RestitutionInformation { get; set; }
        public DocumentCollectioninformation DocumentCollectionInformation { get; set; }
    }

    public class OffenderRestitutionInformation
    {
        public string offenderFirstName { get; set; }
        public string offenderMiddleName { get; set; }
        public string offenderLastName { get; set; }
        public int offenderGender { get; set; }
        public DateTime offenderBirthDate { get; set; }
        public string preferredMethodOfContact { get; set; }
        public string phoneNumber { get; set; }
        public string alternatePhoneNumber { get; set; }
        public string email { get; set; }
        public Address mailingAddress { get; set; }
        public bool permissionToLeaveDetailedMessage { get; set; }
        public Restitutioncourtfile[] restitutionCourtFiles { get; set; }
        public string probationOfficerFirstName { get; set; }
        public string probationOfficerLastName { get; set; }
        public string custodyLocation { get; set; }
        public string custodyPhoneNumber { get; set; }
        public string custodyEmailAddress { get; set; }
        //public object[] restitutionOrders { get; set; }
        public bool declaredAndSigned { get; set; }
        public string signature { get; set; }
    }

    public class Restitutioncourtfile
    {
        public string courtFileNumber { get; set; }
        public string courtLocation { get; set; }
        public Victim[] victims { get; set; }
    }

    public class Victim
    {
        public string firstName { get; set; }
        public string middleName { get; set; }
        public string lastName { get; set; }
        public string relationship { get; set; }
    }
}
