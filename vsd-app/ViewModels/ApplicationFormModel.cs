using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace Gov.Cscp.VictimServices.Public.ViewModels
{
    [XmlRootAttribute("root")]
    public class ApplicationFormModel : IValidatableObject
    {
        public int ApplicationType { get; set; }
        public DocumentCollectioninformation[] ApplicationPDFs { get; set; }
        public DateTime ApplicationDate { get; set; }
        public Introduction Introduction { get; set; }
        public Personalinformation PersonalInformation { get; set; }
        public Crimeinformation CrimeInformation { get; set; }
        public Medicalinformation MedicalInformation { get; set; }
        public Expenseinformation ExpenseInformation { get; set; }
        public Employmentincomeinformation EmploymentIncomeInformation { get; set; }
        public Representativeinformation RepresentativeInformation { get; set; }
        public Declarationinformation DeclarationInformation { get; set; }
        public Authorizationinformation AuthorizationInformation { get; set; }
        public VictimInformation VictimInformation { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            int appType = ApplicationType;

            // ── Victim application ─────────────────────────────────────────────
            if (appType == Crm.AppTypeVictim)
            {
                if (PersonalInformation?.maritalStatus == null)
                    yield return new ValidationResult(
                        "Marital status is required.",
                        new[] { $"{nameof(PersonalInformation)}.{nameof(Personalinformation.maritalStatus)}" }
                    );
            }

            // ── IFM application ────────────────────────────────────────────────
            if (appType == Crm.AppTypeIFM)
            {
                if (string.IsNullOrWhiteSpace(PersonalInformation?.relationshipToVictim))
                    yield return new ValidationResult(
                        "Relationship to victim is required.",
                        new[] { $"{nameof(PersonalInformation)}.{nameof(Personalinformation.relationshipToVictim)}" }
                    );

                if (CrimeInformation?.victimDeceasedFromCrime == null)
                    yield return new ValidationResult(
                        "Please indicate whether the victim is deceased as a result of the crime.",
                        new[] { $"{nameof(CrimeInformation)}.{nameof(Crimeinformation.victimDeceasedFromCrime)}" }
                    );

                var vi = VictimInformation;
                if (vi != null)
                {
                    if (string.IsNullOrWhiteSpace(vi.firstName))
                        yield return new ValidationResult(
                            "Victim first name is required.",
                            new[] { $"{nameof(VictimInformation)}.{nameof(VictimInformation.firstName)}" }
                        );
                    if (string.IsNullOrWhiteSpace(vi.lastName))
                        yield return new ValidationResult(
                            "Victim last name is required.",
                            new[] { $"{nameof(VictimInformation)}.{nameof(VictimInformation.lastName)}" }
                        );
                    if (vi.birthDate == null)
                        yield return new ValidationResult(
                            "Victim birthdate is required.",
                            new[] { $"{nameof(VictimInformation)}.{nameof(VictimInformation.birthDate)}" }
                        );
                    if (vi.maritalStatus == null)
                        yield return new ValidationResult(
                            "Victim marital status is required.",
                            new[] { $"{nameof(VictimInformation)}.{nameof(VictimInformation.maritalStatus)}" }
                        );
                }
            }

            // ── Witness application ────────────────────────────────────────────
            if (appType == Crm.AppTypeWitness)
            {
                if (string.IsNullOrWhiteSpace(PersonalInformation?.relationshipToVictimOther))
                    yield return new ValidationResult(
                        "Relationship to victim is required.",
                        new[]
                        {
                            $"{nameof(PersonalInformation)}.{nameof(Personalinformation.relationshipToVictimOther)}",
                        }
                    );

                if (CrimeInformation?.victimDeceasedFromCrime == null)
                    yield return new ValidationResult(
                        "Please indicate whether the victim is deceased as a result of the crime.",
                        new[] { $"{nameof(CrimeInformation)}.{nameof(Crimeinformation.victimDeceasedFromCrime)}" }
                    );

                var vi = VictimInformation;
                if (vi != null)
                {
                    // firstName and lastName are optional for Witness applications
                    if (vi.maritalStatus == null)
                        yield return new ValidationResult(
                            "Victim marital status is required.",
                            new[] { $"{nameof(VictimInformation)}.{nameof(VictimInformation.maritalStatus)}" }
                        );
                    // birthDate is only required for IFM, not Witness
                }
            }

            // ── Employment gated on expense selection (Victim + Witness apps) ──
            if (
                (appType == Crm.AppTypeVictim || appType == Crm.AppTypeWitness)
                && ExpenseInformation?.haveLostEmploymentIncomeExpenses == true
                && EmploymentIncomeInformation != null
            )
            {
                var emp = EmploymentIncomeInformation;
                if (emp.wereYouEmployedAtTimeOfCrime == null)
                    yield return new ValidationResult(
                        "Please indicate whether you were employed at the time of the crime.",
                        new[]
                        {
                            $"{nameof(EmploymentIncomeInformation)}.{nameof(Employmentincomeinformation.wereYouEmployedAtTimeOfCrime)}",
                        }
                    );
                if (emp.didYouMissWorkDueToCrime == null)
                    yield return new ValidationResult(
                        "Please indicate whether you missed work due to the crime.",
                        new[]
                        {
                            $"{nameof(EmploymentIncomeInformation)}.{nameof(Employmentincomeinformation.didYouMissWorkDueToCrime)}",
                        }
                    );
            }
        }
    }

    public class Introduction
    {
        public string understoodInformation { get; set; }
    }

    public class Personalinformation : IValidatableObject
    {
        [Required]
        public string firstName { get; set; }
        public string middleName { get; set; }

        [Required]
        public string lastName { get; set; }
        public string fullName { get; set; }
        public string iHaveOtherNames { get; set; }
        public string otherFirstName { get; set; }
        public string otherLastName { get; set; }
        public DateTime? dateOfNameChange { get; set; }
        public int? gender { get; set; }
        public string otherGender { get; set; }
        public int? pronouns { get; set; }
        public string otherPronouns { get; set; }
        public int? raceEthnicity { get; set; }
        public string otherRaceEthnicity { get; set; }
        public int? indigenousStatus { get; set; }
        public string relationshipToVictim { get; set; }
        public string relationshipToVictimOther { get; set; }

        [Required]
        public DateTime? birthDate { get; set; }

        // Conditionally required – see ApplicationFormModel.Validate() (Victim app only)
        [Range(100000000, 100000006)]
        public int? maritalStatus { get; set; }
        public string sin { get; set; }
        public string occupation { get; set; }

        // Phone=2, Email=1, Mail=4, AlternateMail=100000002
        [Range(1, 100000002)]
        public int preferredMethodOfContact { get; set; }
        public bool permissionToContactViaMethod { get; set; }
        public string agreeToCvapCommunicationExchange { get; set; }
        public string phoneNumber { get; set; }
        public int? leaveVoicemail { get; set; }
        public string alternatePhoneNumber { get; set; }

        public string email { get; set; }
        public bool doNotLiveAtAddress { get; set; }
        public string mailRecipient { get; set; }
        public Address primaryAddress { get; set; }
        public Address alternateAddress { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // leaveVoicemail required when preferred contact is phone
            if (preferredMethodOfContact == Crm.ContactPhone && leaveVoicemail == null)
                yield return new ValidationResult(
                    "Please select a voicemail preference.",
                    new[] { nameof(leaveVoicemail) }
                );

            // phoneNumber required when preferred method is phone, or voicemail covers primary number
            bool phoneRequired =
                preferredMethodOfContact == Crm.ContactPhone
                || leaveVoicemail == Crm.VoicemailPrimaryAndAlternate
                || leaveVoicemail == Crm.VoicemailPrimaryOnly;
            if (phoneRequired && string.IsNullOrWhiteSpace(phoneNumber))
                yield return new ValidationResult("Primary phone number is required.", new[] { nameof(phoneNumber) });

            // alternatePhoneNumber required when voicemail covers alternate number
            bool altPhoneRequired =
                leaveVoicemail == Crm.VoicemailPrimaryAndAlternate || leaveVoicemail == Crm.VoicemailAlternateOnly;
            if (altPhoneRequired && string.IsNullOrWhiteSpace(alternatePhoneNumber))
                yield return new ValidationResult(
                    "Alternate phone number is required.",
                    new[] { nameof(alternatePhoneNumber) }
                );

            // email required when preferred contact is email or user agreed to CVAP exchange
            bool emailRequired =
                preferredMethodOfContact == Crm.ContactEmail
                || "true".Equals(agreeToCvapCommunicationExchange, StringComparison.OrdinalIgnoreCase);
            if (emailRequired && string.IsNullOrWhiteSpace(email))
                yield return new ValidationResult("Email address is required.", new[] { nameof(email) });

            // CVAP communication agreement required when preferred contact is email
            if (
                preferredMethodOfContact == Crm.ContactEmail
                && string.IsNullOrWhiteSpace(agreeToCvapCommunicationExchange)
            )
                yield return new ValidationResult(
                    "Please confirm whether CVAP may communicate with you by email.",
                    new[] { nameof(agreeToCvapCommunicationExchange) }
                );
        }
    }

    public class Crimeinformation : IValidatableObject
    {
        [XmlArrayItem("element")]
        public Courtfile[] courtFiles { get; set; }

        [XmlArrayItem("element")]
        public Crimelocation[] crimeLocations { get; set; }

        public DateTime? crimePeriodEnd { get; set; }

        [Required]
        public DateTime? crimePeriodStart { get; set; }
        public DateTime? dateOfDeath { get; set; }

        [XmlArrayItem("element")]
        public DocumentCollectioninformation[] documents { get; set; }

        [XmlArrayItem("element")]
        public Policereport[] policeReports { get; set; }

        [XmlArrayItem("element")]
        public Offender[] additionalOffenders { get; set; }

        public Racafinformation racafInformation { get; set; }

        [Required]
        [Range(100000000, 100000002)]
        public int? wasReportMadeToPolice { get; set; }
        public int? overOneYearFromCrime { get; set; }

        [Required]
        public string crimeDetails { get; set; }

        [Required]
        public string crimeInjuries { get; set; }
        public string crimeLocation { get; set; }
        public string noPoliceReportIdentification { get; set; }
        public bool moreThanOneOffender { get; set; }

        // NotReported=100000000, Reported=100000001; [Required] not applicable on non-nullable int
        [Range(100000000, 100000001)]
        public int haveYouSuedOffender { get; set; }

        [Required]
        [Range(100000000, 100000002)]
        public int? offenderBeenCharged { get; set; }
        public int? intendToSueOffender { get; set; }
        public string offenderFirstName { get; set; }
        public string offenderLastName { get; set; }
        public string offenderMiddleName { get; set; }
        public string offenderRelationship { get; set; }
        public string policeReportedMultipleTimes { get; set; }

        [Required]
        public string typeOfCrime { get; set; }
        public bool unsureOfCrimeDates { get; set; }
        public int? victimDeceasedFromCrime { get; set; }
        public string whenDidCrimeOccur { get; set; }
        public string whyDidYouNotApplySooner { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // noPoliceReportIdentification required when the crime was not reported to police
            // wasReportMadeToPolice: CRMMultiBoolean True=100000000(reported), so require id when != True
            if (
                wasReportMadeToPolice.HasValue
                && wasReportMadeToPolice != Crm.MultiBoolTrue
                && string.IsNullOrWhiteSpace(noPoliceReportIdentification)
            )
                yield return new ValidationResult(
                    "Please identify who you disclosed this incident to.",
                    new[] { nameof(noPoliceReportIdentification) }
                );

            // crimePeriodEnd required when crime occurred over a period, or dates are unsure
            bool endRequired =
                "true".Equals(whenDidCrimeOccur, StringComparison.OrdinalIgnoreCase) || unsureOfCrimeDates;
            if (endRequired && crimePeriodEnd == null)
                yield return new ValidationResult(
                    "Please enter the end date of the crime period.",
                    new[] { nameof(crimePeriodEnd) }
                );

            // intendToSueOffender required when haveYouSuedOffender is False (have not sued)
            if (haveYouSuedOffender == Crm.BoolFalse && intendToSueOffender == null)
                yield return new ValidationResult(
                    "Please indicate whether you intend to sue the person(s) responsible.",
                    new[] { nameof(intendToSueOffender) }
                );

            // willBeTakingLegalAction and applyToCourtForMoneyFromOffender required when
            // the applicant has sued or intends/is undecided about suing
            bool suedOrIntending =
                haveYouSuedOffender == Crm.BoolTrue
                || intendToSueOffender == Crm.MultiBoolTrue
                || intendToSueOffender == Crm.MultiBoolUndecided;
            if (suedOrIntending)
            {
                if (racafInformation?.willBeTakingLegalAction == null)
                    yield return new ValidationResult(
                        "Please indicate whether you will be taking legal action.",
                        new[] { $"{nameof(racafInformation)}.{nameof(Racafinformation.willBeTakingLegalAction)}" }
                    );
                if (racafInformation?.applyToCourtForMoneyFromOffender == null)
                    yield return new ValidationResult(
                        "Please indicate whether you applied to court for money from the offender.",
                        new[]
                        {
                            $"{nameof(racafInformation)}.{nameof(Racafinformation.applyToCourtForMoneyFromOffender)}",
                        }
                    );
            }
        }
    }

    public class Racafinformation : IValidatableObject
    {
        public int? applyToCourtForMoneyFromOffender { get; set; }
        public string expensesRequested { get; set; }
        public string expensesAwarded { get; set; }
        public string expensesReceived { get; set; }
        public int? willBeTakingLegalAction { get; set; }
        public int? haveLawyer { get; set; }
        public string lawyerOrFirmName { get; set; }
        public Address lawyerAddress { get; set; }
        public string signName { get; set; }
        public string signature { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // signName + signature required when applying to court (True) OR taking legal action (True)
            // CRMMultiBoolean True = 100000000
            bool sigRequired =
                applyToCourtForMoneyFromOffender == Crm.MultiBoolTrue || willBeTakingLegalAction == Crm.MultiBoolTrue;
            if (sigRequired)
            {
                if (string.IsNullOrWhiteSpace(signName))
                    yield return new ValidationResult("Please enter your name.", new[] { nameof(signName) });
                if (string.IsNullOrWhiteSpace(signature))
                    yield return new ValidationResult("Digital signature is required.", new[] { nameof(signature) });
            }

            // Expense breakdown required when the applicant applied to court for money
            if (applyToCourtForMoneyFromOffender == Crm.MultiBoolTrue)
            {
                if (string.IsNullOrWhiteSpace(expensesRequested))
                    yield return new ValidationResult(
                        "Please enter the expenses requested.",
                        new[] { nameof(expensesRequested) }
                    );
                if (string.IsNullOrWhiteSpace(expensesAwarded))
                    yield return new ValidationResult(
                        "Please enter the expenses awarded.",
                        new[] { nameof(expensesAwarded) }
                    );
                if (string.IsNullOrWhiteSpace(expensesReceived))
                    yield return new ValidationResult(
                        "Please enter the amount received.",
                        new[] { nameof(expensesReceived) }
                    );
            }
        }
    }

    public class Crimelocation
    {
        [Required]
        public string location { get; set; }
    }

    public class Policereport
    {
        public string policeFileNumber { get; set; }
        public string investigatingOfficer { get; set; }

        [Required]
        public string policeDetachment { get; set; }
        public string policeDetachmentOther { get; set; }
        public DateTime? reportStartDate { get; set; }
        public DateTime? reportEndDate { get; set; }
        public string policeReportedMultipleTimes { get; set; }
    }

    public class Offender
    {
        public string firstName { get; set; }
        public string middleName { get; set; }
        public string lastName { get; set; }
        public string relationship { get; set; }
    }

    public class Medicalinformation : IValidatableObject
    {
        [Required]
        public string doYouHaveMedicalServicesCoverage { get; set; }
        public string personalHealthNumber { get; set; }
        public string haveMedicalCoverageProvince { get; set; }
        public string haveMedicalCoverageProvinceOther { get; set; }

        [Required]
        public int? doYouHaveOtherHealthCoverage { get; set; }
        public string otherHealthCoverageProviderName { get; set; }
        public string otherHealthCoverageExtendedPlanNumber { get; set; }
        public string wereYouTreatedAtHospital { get; set; }
        public string treatedAtHospitalName { get; set; }
        public bool treatedOutsideBc { get; set; }
        public string treatedOutsideBcHospitalName { get; set; }
        public DateTime? treatedAtHospitalDate { get; set; }

        [Required]
        public string beingTreatedByFamilyDoctor { get; set; }
        public string familyDoctorClinic { get; set; }
        public string familyDoctorFirstName { get; set; }
        public string familyDoctorLastName { get; set; }

        public string familyDoctorEmail { get; set; }
        public string familyDoctorPhoneNumber { get; set; }
        public string familyDoctorFax { get; set; }
        public Address familyDoctorAddress { get; set; }

        [Required]
        public string hadOtherTreatments { get; set; }

        [XmlArrayItem("element")]
        public Othertreatment[] otherTreatments { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // Province required when applicant has medical services coverage
            if (IsTruthy(doYouHaveMedicalServicesCoverage) && string.IsNullOrWhiteSpace(haveMedicalCoverageProvince))
                yield return new ValidationResult(
                    "Please select a province for your medical services coverage.",
                    new[] { nameof(haveMedicalCoverageProvince) }
                );

            // Hospital name required when treated at hospital
            if (IsTruthy(wereYouTreatedAtHospital))
            {
                if (treatedOutsideBc)
                {
                    if (string.IsNullOrWhiteSpace(treatedOutsideBcHospitalName))
                        yield return new ValidationResult(
                            "Please enter the hospital name outside BC.",
                            new[] { nameof(treatedOutsideBcHospitalName) }
                        );
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(treatedAtHospitalName))
                        yield return new ValidationResult(
                            "Please enter the hospital name.",
                            new[] { nameof(treatedAtHospitalName) }
                        );
                }
            }

            // Clinic name required when being treated by family doctor
            if (IsTruthy(beingTreatedByFamilyDoctor) && string.IsNullOrWhiteSpace(familyDoctorClinic))
                yield return new ValidationResult(
                    "Please enter the name of the clinic.",
                    new[] { nameof(familyDoctorClinic) }
                );
        }

        /// <summary>
        /// Returns true when a string field carries a "yes" / truthy value.
        /// Handles Angular boolean serialization ("true"), CRM boolean true (100000001),
        /// and correctly rejects false-y variants.
        /// </summary>
        private static bool IsTruthy(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return false;
            if ("false".Equals(value, StringComparison.OrdinalIgnoreCase))
                return false;
            if ("0".Equals(value, StringComparison.OrdinalIgnoreCase))
                return false;
            // CRM Boolean False = 100000000
            if (value == Crm.BoolFalse.ToString())
                return false;
            return true;
        }
    }

    public class Othertreatment
    {
        [Required]
        public string providerType { get; set; }
        public string providerTypeText { get; set; } // Extra text for "Other" provider type
        public string providerCompany { get; set; }
        public string providerFirstName { get; set; }
        public string providerLastName { get; set; }

        public string providerEmail { get; set; }
        public string providerPhoneNumber { get; set; }
        public string providerFax { get; set; }
        public Address providerAddress { get; set; }
    }

    public class Expenseinformation
    {
        public bool haveMedicalExpenses { get; set; }
        public bool haveDentalExpenses { get; set; }
        public bool havePrescriptionDrugExpenses { get; set; }
        public bool haveCounsellingExpenses { get; set; }
        public bool haveCounsellingTransportation { get; set; }
        public bool haveLostEmploymentIncomeExpenses { get; set; }
        public bool havePersonalPropertyLostExpenses { get; set; }
        public bool haveProtectiveMeasureExpenses { get; set; }
        public bool haveMovingExpenses { get; set; }
        public bool haveProtectiveMovingExpenses { get; set; }
        public bool haveTransportationToObtainBenefits { get; set; }
        public bool haveDisabilityExpenses { get; set; }
        public bool haveCrimeSceneCleaningExpenses { get; set; }
        public bool haveOtherExpenses { get; set; }
        public string otherSpecificExpenses { get; set; }
        public bool haveLifeInsuranceBenefits { get; set; }
        public bool haveDisabilityPlanBenefits { get; set; }
        public bool haveEmploymentInsuranceBenefits { get; set; }
        public bool haveIncomeAssistanceBenefits { get; set; }
        public bool haveCanadaPensionPlanBenefits { get; set; }
        public bool haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits { get; set; }
        public bool haveCivilActionBenefits { get; set; }
        public bool haveOtherBenefits { get; set; }
        public string otherSpecificBenefits { get; set; }
        public bool noneOfTheAboveBenefits { get; set; }
        public string additionalBenefitsDetails { get; set; }

        //Additional Benefits
        public bool haveVocationalServicesExpenses { get; set; }
        public bool haveIncomeSupportExpenses { get; set; }
        public bool haveChildcareExpenses { get; set; }
        public bool haveLegalProceedingExpenses { get; set; }
        public bool haveFuneralExpenses { get; set; }
        public bool haveBereavementLeaveExpenses { get; set; }
        public bool haveLostOfParentalGuidanceExpenses { get; set; }
        public bool haveHomeMakerExpenses { get; set; }

        public int? missedWorkDueToDeathOfVictim { get; set; }
        public DateTime? daysWorkMissedStart { get; set; }
        public DateTime? daysWorkMissedEnd { get; set; }
        public int? didYouLoseWages { get; set; }

        [XmlArrayItem("element")]
        public Employer[] employers { get; set; }

        public int? mayContactEmployer { get; set; }
    }

    public class Employmentincomeinformation : IValidatableObject
    {
        public int? wereYouEmployedAtTimeOfCrime { get; set; }
        public int? wereYouAtWorkAtTimeOfIncident { get; set; }
        public string haveYouAppliedForWorkersCompensation { get; set; }
        public string workersCompensationClaimNumber { get; set; }
        public int? didYouMissWorkDueToCrime { get; set; }
        public DateTime? daysWorkMissedStart { get; set; }
        public DateTime? daysWorkMissedEnd { get; set; }
        public int? areYouStillOffWork { get; set; }
        public int? didYouLoseWages { get; set; }
        public int? areYouSelfEmployed { get; set; }

        [XmlArrayItem("element")]
        public Employer[] employers { get; set; }

        [XmlArrayItem("element")]
        public DocumentCollectioninformation[] documents { get; set; }

        public int? mayContactEmployer { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // wereYouAtWorkAtTimeOfIncident required when employed at the time of the crime
            if (wereYouEmployedAtTimeOfCrime == Crm.BoolTrue && wereYouAtWorkAtTimeOfIncident == null)
                yield return new ValidationResult(
                    "Please indicate whether you were at work at the time of the incident.",
                    new[] { nameof(wereYouAtWorkAtTimeOfIncident) }
                );

            // haveYouAppliedForWorkersCompensation required when at work at the time of the incident
            if (
                wereYouAtWorkAtTimeOfIncident == Crm.BoolTrue
                && string.IsNullOrWhiteSpace(haveYouAppliedForWorkersCompensation)
            )
                yield return new ValidationResult(
                    "Please indicate whether you have applied to WorkSafe BC.",
                    new[] { nameof(haveYouAppliedForWorkersCompensation) }
                );

            // workersCompensationClaimNumber required when applied for WorkSafe BC
            if (
                Crm.BoolTrue.ToString().Equals(haveYouAppliedForWorkersCompensation)
                && string.IsNullOrWhiteSpace(workersCompensationClaimNumber)
            )
                yield return new ValidationResult(
                    "Please enter your WorkSafe BC claim number.",
                    new[] { nameof(workersCompensationClaimNumber) }
                );

            if (didYouMissWorkDueToCrime == Crm.BoolTrue)
            {
                if (daysWorkMissedStart == null)
                    yield return new ValidationResult(
                        "Please provide the start date of work missed.",
                        new[] { nameof(daysWorkMissedStart) }
                    );
                if (areYouStillOffWork == null)
                    yield return new ValidationResult(
                        "Please indicate whether you are currently off work.",
                        new[] { nameof(areYouStillOffWork) }
                    );
                if (didYouLoseWages == null)
                    yield return new ValidationResult(
                        "Please indicate whether you lost wages.",
                        new[] { nameof(didYouLoseWages) }
                    );
                // daysWorkMissedEnd required when no longer off work
                if (areYouStillOffWork == Crm.BoolFalse && daysWorkMissedEnd == null)
                    yield return new ValidationResult(
                        "Please provide the end date of work missed.",
                        new[] { nameof(daysWorkMissedEnd) }
                    );
            }

            // areYouSelfEmployed required when lost wages
            if (didYouLoseWages == Crm.BoolTrue && areYouSelfEmployed == null)
                yield return new ValidationResult(
                    "Please indicate whether you are self-employed.",
                    new[] { nameof(areYouSelfEmployed) }
                );
        }
    }

    public class Employer
    {
        public string employerName { get; set; }
        public string employerPhoneNumber { get; set; }
        public string employerFax { get; set; }

        public string employerEmail { get; set; }
        public string employerFirstName { get; set; }
        public string employerLastName { get; set; }
        public Address employerAddress { get; set; }
    }

    public class Representativeinformation : IValidatableObject
    {
        [Required]
        public int? completingOnBehalfOf { get; set; }
        public string representativeFirstName { get; set; }
        public string representativeMiddleName { get; set; }
        public string representativeLastName { get; set; }
        public int? representativePreferredMethodOfContact { get; set; }
        public string representativePhoneNumber { get; set; }
        public string representativeAlternatePhoneNumber { get; set; }

        public string representativeEmail { get; set; }
        public Address representativeAddress { get; set; }

        [XmlArrayItem("element")]
        public DocumentCollectioninformation[] documents { get; set; }

        public string relationshipToPerson { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            bool hasRepresentative =
                completingOnBehalfOf == Crm.OnBehalfParent || completingOnBehalfOf == Crm.OnBehalfLegalRep;

            if (hasRepresentative)
            {
                if (string.IsNullOrWhiteSpace(representativeFirstName))
                    yield return new ValidationResult(
                        "Representative first name is required.",
                        new[] { nameof(representativeFirstName) }
                    );

                if (string.IsNullOrWhiteSpace(representativeLastName))
                    yield return new ValidationResult(
                        "Representative last name is required.",
                        new[] { nameof(representativeLastName) }
                    );

                if (representativePreferredMethodOfContact == null)
                    yield return new ValidationResult(
                        "Preferred method of contact for the representative is required.",
                        new[] { nameof(representativePreferredMethodOfContact) }
                    );

                // Phone number required when representative's preferred contact is phone
                if (
                    representativePreferredMethodOfContact == Crm.RepContactPhone
                    && string.IsNullOrWhiteSpace(representativePhoneNumber)
                )
                    yield return new ValidationResult(
                        "Representative phone number is required.",
                        new[] { nameof(representativePhoneNumber) }
                    );

                // Email address required when representative's preferred contact is email
                if (
                    representativePreferredMethodOfContact == Crm.RepContactEmail
                    && string.IsNullOrWhiteSpace(representativeEmail)
                )
                    yield return new ValidationResult(
                        "Representative email address is required.",
                        new[] { nameof(representativeEmail) }
                    );
            }

            // relationshipToPerson required when completing as legal representative
            if (completingOnBehalfOf == Crm.OnBehalfLegalRep && string.IsNullOrWhiteSpace(relationshipToPerson))
                yield return new ValidationResult(
                    "Please provide your relationship to the person.",
                    new[] { nameof(relationshipToPerson) }
                );
        }
    }

    public class Declarationinformation
    {
        [Required]
        public string declaredAndSigned { get; set; }

        [Required]
        public string signature { get; set; }
    }

    public class Authorizationinformation : IValidatableObject
    {
        [Required]
        public string approvedAuthorityNotification { get; set; }

        [Required]
        public string readAndUnderstoodTermsAndConditions { get; set; }

        [Required]
        public string signName { get; set; }

        [Required]
        public string signature { get; set; }
        public int? allowCvapStaffSharing { get; set; }

        [XmlArrayItem("element")]
        public AuthorizedPerson[] authorizedPerson { get; set; }

        public string authorizedPersonAuthorizesDiscussion { get; set; }
        public string authorizedPersonSignature { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // authorizedPersonAuthorizesDiscussion + authorizedPersonSignature required
            // when the applicant allows CVAP staff sharing (CRMBoolean True = 100000001)
            if (allowCvapStaffSharing == Crm.BoolTrue)
            {
                if (string.IsNullOrWhiteSpace(authorizedPersonAuthorizesDiscussion))
                    yield return new ValidationResult(
                        "Please indicate that you authorize the above discussion.",
                        new[] { nameof(authorizedPersonAuthorizesDiscussion) }
                    );
                if (string.IsNullOrWhiteSpace(authorizedPersonSignature))
                    yield return new ValidationResult(
                        "Authorized person signature is required.",
                        new[] { nameof(authorizedPersonSignature) }
                    );
            }
        }
    }

    public class AuthorizedPerson
    {
        public string authorizedPersonFirstName { get; set; }
        public string authorizedPersonLastName { get; set; }
        public string authorizedPersonPhoneNumber { get; set; }

        public string authorizedPersonEmail { get; set; }
        public string authorizedPersonRelationship { get; set; }
        public string authorizedPersonRelationshipOther { get; set; }
        public string authorizedPersonAgencyName { get; set; }
        public Address authorizedPersonAgencyAddress { get; set; }
    }

    public class VictimInformation
    {
        public string firstName { get; set; }
        public string middleName { get; set; }
        public string lastName { get; set; }
        public string iHaveOtherNames { get; set; }
        public string otherFirstName { get; set; }
        public string otherLastName { get; set; }
        public DateTime? dateOfNameChange { get; set; }
        public int? gender { get; set; }
        public string otherGender { get; set; }
        public int? pronouns { get; set; }
        public string otherPronouns { get; set; }
        public int? raceEthnicity { get; set; }
        public string otherRaceEthnicity { get; set; }
        public int? indigenousStatus { get; set; }
        public DateTime? birthDate { get; set; }
        public int? maritalStatus { get; set; }
        public string sin { get; set; }
        public string occupation { get; set; }
        public string phoneNumber { get; set; }
        public string alternatePhoneNumber { get; set; }

        public string email { get; set; }
        public Address primaryAddress { get; set; }
    }

    public class DocumentCollectioninformation
    {
        public string fileName { get; set; }
        public string body { get; set; }
        public string subject { get; set; }
    }
}
