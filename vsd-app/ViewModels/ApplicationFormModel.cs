using System;

namespace Gov.Cscp.VictimServices.Public.ViewModels
{
    public class ApplicationFormModel
    {
        public Introduction Introduction { get; set; }
        public Personalinformation PersonalInformation { get; set; }
        public Crimeinformation CrimeInformation { get; set; }
        public Medicalinformation MedicalInformation { get; set; }
        public Expenseinformation ExpenseInformation { get; set; }
        public Employmentincomeinformation EmploymentIncomeInformation { get; set; }
        public Representativeinformation RepresentativeInformation { get; set; }
        public Declarationinformation DeclarationInformation { get; set; }
        public Authorizationinformation AuthorizationInformation { get; set; }
        //public DocumentCollectioninformation[] DocumentCollectionInformation { get; set; }
        // TODO: Missing VictimInformation
    }

    public class Introduction
    {
        public string understoodInformation { get; set; }
    }

    public class Personalinformation
    {
        public string firstName { get; set; }
        public string middleName { get; set; }
        public string lastName { get; set; }
        public string iHaveOtherNames { get; set; }
        public string otherFirstName { get; set; }
        public string otherLastName { get; set; }
        public DateTime? dateOfNameChange { get; set; }
        public int gender { get; set; }
        public DateTime? birthDate { get; set; }
        public int? maritalStatus { get; set; }
        public string sin { get; set; }
        public string occupation { get; set; }
        public int preferredMethodOfContact { get; set; }
        public bool permissionToContactViaMethod { get; set; }
        public string agreeToCvapCommunicationExchange { get; set; }
        public string phoneNumber { get; set; }
        public string alternatePhoneNumber { get; set; }
        public string email { get; set; }
        public Address primaryAddress { get; set; }
        public Address alternateAddress { get; set; }
    }

    public class Crimeinformation
    {
        public string typeOfCrime { get; set; }
        public string unsureOfCrimeDates { get; set; }
        public string whenDidCrimeOccur { get; set; }
        public DateTime? crimePeriodStart { get; set; }
        public DateTime? crimePeriodEnd { get; set; }
        public string applicationFiledWithinOneYearFromCrime { get; set; }
        public string whyDidYouNotApplySooner { get; set; }
        public string crimeLocation { get; set; }
        public Crimelocation[] crimeLocations { get; set; }
        public string crimeDetails { get; set; }
        public string crimeInjuries { get; set; }
        public DocumentCollectioninformation additionalInformationFiles { get; set; }
        public string documentDescription { get; set; }
        public int wasReportMadeToPolice { get; set; }
        // public string policeReportedWhichPoliceForce { get; set; }
        public string policeReportedMultipleTimes { get; set; }
        // public DateTime? policeReportedDate { get; set; }
        // public DateTime? policeReportedEndDate { get; set; }
        public Policereport[] policeReports { get; set; }
        public string noPoliceReportIdentification { get; set; }
        public string offenderFirstName { get; set; }
        public string offenderMiddleName { get; set; }
        public string offenderLastName { get; set; }
        public string offenderRelationship { get; set; }
        public int offenderBeenCharged { get; set; }
        public Courtfile[] courtFiles { get; set; }
        public int haveYouSuedOffender { get; set; }
        public int intendToSueOffender { get; set; }
        public Racafinformation racafInformation { get; set; }
    }

    public class Racafinformation
    {
        public int? applyToCourtForMoneyFromOffender { get; set; }
        public string expensesRequested { get; set; }
        public float? expensesAwarded { get; set; }
        public float? expensesReceived { get; set; }
        public int? willBeTakingLegalAction { get; set; }
        public string lawyerOrFirmName { get; set; }
        public Address lawyerAddress { get; set; }
        public string signName { get; set; }
        public string signature { get; set; }
    }

    public class Crimelocation
    {
        public string location { get; set; }
    }

    public class Policereport
    {
        public string policeFileNumber { get; set; }
        public string investigatingOfficer { get; set; }
        public string policeDetachment { get; set; }
        public DateTime? reportStartDate { get; set; }
        public DateTime? reportEndDate { get; set; }
        public string policeReportedMultipleTimes { get; set; }
    }

    public class Medicalinformation
    {
        public string doYouHaveMedicalServicesCoverage { get; set; }
        public string personalHealthNumber { get; set; }
        public string haveMedicalCoverageProvince { get; set; }
        public string haveMedicalCoverageProvinceOther { get; set; }
        public string doYouHaveOtherHealthCoverage { get; set; }
        public string otherHealthCoverageProviderName { get; set; }
        public string otherHealthCoverageExtendedPlanNumber { get; set; }
        public string wereYouTreatedAtHospital { get; set; }
        public string treatedAtHospitalName { get; set; }
        public string treatedOutsideBc { get; set; }
        public string treatedOutsideBcHospitalName { get; set; }
        public DateTime? treatedAtHospitalDate { get; set; }
        public string beingTreatedByFamilyDoctor { get; set; }
        public string familyDoctorName { get; set; }
        public string familyDoctorPhoneNumber { get; set; }
        public string familyDoctorAddressLine1 { get; set; }
        public string familyDoctorAddressLine2 { get; set; }
        public string hadOtherTreatments { get; set; }
        public Othertreatment[] otherTreatments { get; set; }
    }

    public class Othertreatment
    {
        public string providerType { get; set; }
        public string providerTypeText { get; set; } // Extra text for "Other" provider type
        public string providerName { get; set; }
        public string providerPhoneNumber { get; set; }
        public Address providerAddress { get; set; }
    }

    public class Expenseinformation
    {
        public bool haveMedicalExpenses { get; set; }
        public bool haveDentalExpenses { get; set; }
        public bool havePrescriptionDrugExpenses { get; set; }
        public bool haveCounsellingExpenses { get; set; }
        public bool haveLostEmploymentIncomeExpenses { get; set; }
        public bool havePersonalPropertyLostExpenses { get; set; }
        public bool haveProtectiveMeasureExpenses { get; set; }
        public bool haveDisabilityExpenses { get; set; }
        public bool haveCrimeSceneCleaningExpenses { get; set; }
        public bool haveOtherExpenses { get; set; }
        public string otherSpecificExpenses { get; set; }
        public bool haveDisabilityPlanBenefits { get; set; }
        public bool haveEmploymentInsuranceBenefits { get; set; }
        public bool haveIncomeAssistanceBenefits { get; set; }
        public bool haveCanadaPensionPlanBenefits { get; set; }
        public bool haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits { get; set; }
        public bool haveCivilActionBenefits { get; set; }
        public bool haveOtherBenefits { get; set; }
        public string otherSpecificBenefits { get; set; }
        public bool noneOfTheAboveBenefits { get; set; }
    }

    public class Employmentincomeinformation
    {
        public int? wereYouEmployedAtTimeOfCrime { get; set; }
        public int? wereYouAtWorkAtTimeOfIncident { get; set; }
        public string haveYouAppliedForWorkersCompensation { get; set; }
        public string workersCompensationClaimNumber { get; set; }
        public int didYouMissWorkDueToCrime { get; set; }
        public DateTime? daysWorkMissedStart { get; set; }
        public DateTime? daysWorkMissedEnd { get; set; }
        public int? areYouStillOffWork { get; set; }
        public int? didYouLoseWages { get; set; }
        public int? areYouSelfEmployed { get; set; }
        public Employer[] employers { get; set; }
        public int? mayContactEmployer { get; set; }
    }

    public class Employer
    {
        public string employerName { get; set; }
        public string employerPhoneNumber { get; set; }
        public string employerFirstName { get; set; }
        public string employerLastName { get; set; }
        public Address employerAddress { get; set; }
    }

    public class Representativeinformation
    {
        public int? completingOnBehalfOf { get; set; }
        public string representativeFirstName { get; set; }
        public string representativeMiddleName { get; set; }
        public string representativeLastName { get; set; }
        public int? representativePreferredMethodOfContact { get; set; }
        public string representativePhoneNumber { get; set; }
        public string representativeAlternatePhoneNumber { get; set; }
        public string representativeEmail { get; set; }
        public Address representativeAddress { get; set; }
        public DocumentCollectioninformation legalGuardianFiles { get; set; }
        public string documentDescription { get; set; }
    }

    public class Declarationinformation
    {
        public string declaredAndSigned { get; set; }
        public string signature { get; set; }
    }

    public class Authorizationinformation
    {
        public string approvedAuthorityNotification { get; set; }
        public string readAndUnderstoodTermsAndConditions { get; set; }
        public string signature { get; set; }
        public string allowCvapStaffSharing { get; set; }
        public string authorizedPersonFullName { get; set; }
        public string authorizedPersonPhoneNumber { get; set; }
        public string authorizedPersonRelationship { get; set; }
        public string authorizedPersonAgencyName { get; set; }
        public Address authorizedPersonAgencyAddress { get; set; }
        public string authorizedPersonAuthorizesDiscussion { get; set; }
        public string authorizedPersonSignature { get; set; }
    }

    public class DocumentCollectioninformation
    {
        public string fileName { get; set; }
        public string body { get; set; }
    }
}