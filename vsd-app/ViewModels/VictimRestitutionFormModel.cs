using System;

namespace Gov.Cscp.VictimServices.Public.ViewModels
{
    public class VictimRestitutionFormModel
    {
        public VictimRestitutionInformation RestitutionInformation { get; set; }
        public DocumentCollectioninformation DocumentCollectionInformation { get; set; }
    }

    public class VictimRestitutionInformation
    {
        public string victimFirstName { get; set; }
        public string victimMiddleName { get; set; }
        public string victimLastName { get; set; }
        public int victimGender { get; set; }
        public DateTime? victimBirthDate { get; set; }

        public bool authorizeDesignate { get; set; }
        public string authorisedDesignateFirstName { get; set; }
        public string authorisedDesignateMiddleName { get; set; }
        public string authorisedDesignateLastName { get; set; }
        public bool? authoriseDesignateToActOnBehalf { get; set; }

        public int preferredMethodOfContact { get; set; }
        public string phoneNumber { get; set; }
        public string alternatePhoneNumber { get; set; }
        public string email { get; set; }
        public Address mailingAddress { get; set; }
        public bool? permissionToLeaveDetailedMessage { get; set; }

        public string offenderFirstName { get; set; }
        public string offenderMiddleName { get; set; }
        public string offenderLastName { get; set; }
        public string offenderRelationship { get; set; }
        public Courtfile[] courtFiles { get; set; }

        public string victimServiceWorkerFirstName { get; set; }
        public string victimServiceWorkerLastName { get; set; }
        public string victimServiceWorkerProgramName { get; set; }
        public string victimServiceWorkerEmail { get; set; }

        //public Uploadfile[] restitutionOrders { get; set; }

        public Providerfile[] providerFiles { get; set; }

        public bool declaredAndSigned { get; set; }
        public string signature { get; set; }
    }
}