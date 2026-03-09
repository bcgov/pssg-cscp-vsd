namespace Gov.Cscp.VictimServices.Public.ViewModels
{
    /// <summary>
    /// CRM option-set values mirroring the Angular enums-list.ts enums.
    /// </summary>
    internal static class Crm
    {
        // CRMBoolean  (yes/no stored as CRM integers)
        public const int BoolTrue = 100000001;
        public const int BoolFalse = 100000000;

        // CRMMultiBoolean  (yes / no / undecided)
        public const int MultiBoolTrue = 100000000;
        public const int MultiBoolFalse = 100000001;
        public const int MultiBoolUndecided = 100000002;

        // ApplicationType
        public const int AppTypeWitness = 100000000;
        public const int AppTypeIFM = 100000001;
        public const int AppTypeVictim = 100000002;

        // OnBehalfOf / RepresentativeInformation.completingOnBehalfOf
        public const int OnBehalfMyself = 100000000;
        public const int OnBehalfParent = 100000002;
        public const int OnBehalfLegalRep = 100000003;

        // PersonalInformation.preferredMethodOfContact
        public const int ContactEmail = 1;
        public const int ContactPhone = 2;
        public const int ContactMail = 4;
        public const int ContactAlternateMail = 100000002;

        // PersonalInformation.leaveVoicemail
        public const int VoicemailPrimaryAndAlternate = 100000000;
        public const int VoicemailPrimaryOnly = 100000001;
        public const int VoicemailAlternateOnly = 100000002;

        // Representative preferredMethodOfContact
        public const int RepContactEmail = 100000000;
        public const int RepContactPhone = 100000001;
    }
}
