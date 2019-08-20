export interface ApplicationForm {
  Introduction: Introduction;
  Personalinformation: PersonalInformation;
  Crimeinformation: CrimeInformation;
  Medicalinformation: MedicalInformation;
  Expenseinformation: ExpenseInformation;
  Employmentincomeinformation: EmploymentIncomeInformation;
  Representativeinformation: RepresentativeInformation;
  Declarationinformation: DeclarationInformation;
  Authorizationinformation: AuthorizationInformation;
}
export interface Introduction {
  understoodInformation: string;
}
export interface PersonalInformation {
  firstName: string;
  middleName: string;
  lastName: string;
  iHaveOtherNames: string;
  otherFirstName: string;
  otherLastName: string;
  dateOfNameChange?: Date;
  gender: number;
  birthDate?: Date;
  maritalStatus: number;
  sin: string;
  occupation: string;
  preferredMethodOfContact: number;
  permissionToContactViaMethod: boolean;
  agreeToCvapCommunicationExchange: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  email: string;
  primaryAddress: Address;
  alternateAddress: Address;
}

export interface CrimeInformation {
  unsureOfCrimeDates: string;
  whenDidCrimeOccur: string;
  crimePeriodStart?: Date;
  crimePeriodEnd?: Date;
  typeOfCrime: string;
  whyDidYouNotApplySooner: string;
  crimeLocation: string;
  crimeInjuries: string;
  applicationFiledWithinOneYearFromCrime: string;
  wasReportMadeToPolice: number;
  policeReportedMultipleTimes: string;
  crimeDetails: string;
  policeReportedDate?: Date;
  policeReportedEndDate?: Date;
  policeReportedWhichPoliceForce: string;
  offenderFirstName: string;
  offenderMiddleName: string;
  offenderLastName: string;
  offenderRelationship: string;
  noPoliceReportIdentification: string;
  offenderBeenCharged: number;
  haveYouSuedOffender: number;
  intendToSueOffender: number;
  crimeLocations: Crimelocation[];
  policeReports: Policereport[];
  courtFiles: Courtfile[];
  racafInformation: Racafinformation;
  additionalInformationFiles: Object[];
}
export interface MedicalInformation {
  doYouHaveMedicalServicesCoverage: string;
  personalHealthNumber: string;
  doYouHaveOtherHealthCoverage: string;
  otherHealthCoverageProviderName: string;
  otherHealthCoverageExtendedPlanNumber: string;
  wereYouTreatedAtHospital: string;
  treatedAtHospitalName: string;
  treatedOutsideBc: string;
  treatedOutsideBcHospitalName: string;
  treatedAtHospitalDate?: Date;
  beingTreatedByFamilyDoctor: string;
  familyDoctorName: string;
  familyDoctorPhoneNumber: string;
  familyDoctorAddressLine1: string;
  familyDoctorAddressLine2: string;
  hadOtherTreatments: string;
  otherTreatments: Othertreatment[];
}
export interface ExpenseInformation {
  haveMedicalExpenses: boolean;
  haveDentalExpenses: boolean;
  havePrescriptionDrugExpenses: boolean;
  haveCounsellingExpenses: boolean;
  haveLostEmploymentIncomeExpenses: boolean;
  havePersonalPropertyLostExpenses: boolean;
  haveProtectiveMeasureExpenses: boolean;
  haveDisabilityExpenses: boolean;
  haveOtherExpenses: boolean;
  haveDisabilityPlanBenefits: boolean;
  haveEmploymentInsuranceBenefits: boolean;
  haveIncomeAssistanceBenefits: boolean;
  haveCanadaPensionPlanBenefits: boolean;
  haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits: boolean;
  haveCivilActionBenefits: boolean;
  haveOtherBenefits: boolean;
  noneOfTheAboveBenefits: boolean;
  haveCrimeSceneCleaningExpenses: string;
  otherSpecificExpenses: string;
  otherSpecificBenefits: string;
}
export interface EmploymentIncomeInformation {
  wereYouEmployedAtTimeOfCrime?: number;
  wereYouAtWorkAtTimeOfIncident?: number;
  didYouMissWorkDueToCrime: number;
  didYouLoseWages?: number;
  areYouSelfEmployed?: number;
  mayContactEmployer?: number;
  daysWorkMissedStart?: Date;
  daysWorkMissedEnd?: Date;
  haveYouAppliedForWorkersCompensation: string;
  workersCompensationClaimNumber: string;
  employers: Employer[];
}
export interface RepresentativeInformation {
  completingOnBehalfOf?: number;
  representativePreferredMethodOfContact?: number;
  representativeFirstName: string;
  representativeMiddleName: string;
  representativeLastName: string;
  representativePhoneNumber: string;
  representativeAlternatePhoneNumber: string;
  representativeEmail: string;
  representativeAddress: Address;
  legalGuardianFiles: Object[];
}
export interface DeclarationInformation { }
export interface AuthorizationInformation { }

// -SHARED-
export interface Address {
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
}
export interface Crimelocation {
  location: string;
}
export interface Policereport {
  policeFileNumber: string;
  investigatingOfficer: string;
}
export interface Courtfile {
  courtFileNumber: string;
  courtLocation: string;
}
export interface Racafinformation {
  applyToCourtForMoneyFromOffender?: number;
  expensesRequested: string;
  expensesAwarded?: number;
  expensesReceived?: number;
  willBeTakingLegalAction?: number;
  lawyerOrFirmName: string;
  lawyerAddress: Address;
  signName: string;
  signature: string;
}
export interface Othertreatment {
  providerType: number;
  providerName: string;
  providerPhoneNumber: string;
  providerAddress: Address;
}
export interface Employer {
  employerName: string;
  employerPhoneNumber: string;
  employerFirstName: string;
  employerLastName: string;
  employerAddress: Address;
}
