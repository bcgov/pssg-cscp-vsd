import { Address } from "./address.interface";
import { Courtfile } from "./files.interface";

export interface Application {
  Introduction: Introduction;
  PersonalInformation: PersonalInformation;
  CrimeInformation: CrimeInformation;
  MedicalInformation: MedicalInformation;
  ExpenseInformation: ExpenseInformation;
  EmploymentIncomeInformation?: EmploymentIncomeInformation;// optional: not in ifm-application but found in victim application
  RepresentativeInformation: RepresentativeInformation;
  DeclarationInformation: DeclarationInformation;
  AuthorizationInformation: AuthorizationInformation;
  VictimInformation?: VictimInformation;// optional: not in ifm-application but found in victim application
}
export interface Introduction {
  understoodInformation: string;
}
export interface PersonalInformation {
  permissionToContactViaMethod: boolean;
  gender: number;
  maritalStatus: number;
  preferredMethodOfContact: number;
  dateOfNameChange?: Date;
  birthDate?: Date;
  firstName: string;
  middleName: string;
  lastName: string;
  iHaveOtherNames: string;
  otherFirstName: string;
  otherLastName: string;
  sin: string;
  occupation: string;
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
  haveYouAppliedForWorkersCompensation: number;
  daysWorkMissedStart?: Date;
  daysWorkMissedEnd?: Date;
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
export interface DeclarationInformation {
  declaredAndSigned: string;
  signature: string;
}
export interface AuthorizationInformation {
  approvedAuthorityNotification: string;
  readAndUnderstoodTermsAndConditions: string;
  signature: string;
  allowCvapStaffSharing: string;
  authorizedPersonFullName: string;
  authorizedPersonPhoneNumber: string;
  authorizedPersonRelationship: string;
  authorizedPersonAgencyName: string;
  authorizedPersonAuthorizesDiscussion: string;
  authorizedPersonSignature: string;
  authorizedPersonAgencyAddress: Address;
}

interface Crimelocation {
  location: string;
}
interface Policereport {
  policeFileNumber: string;
  investigatingOfficer: string;
}

interface Racafinformation {
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
interface Othertreatment {
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
interface VictimInformation {
  firstName: string;
  middleName?: string;
  lastName: string;
  iHaveOtherNames?: string;
  otherFirstName?: string;
  otherLastName?: string;
  dateOfNameChange?: string;
  gender: number;
  birthDate: string;
  sin: string;
  occupation?: string;
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  email?: string;
  confirmEmail?: string;
  mostRecentMailingAddressSameAsPersonal: string;
}
