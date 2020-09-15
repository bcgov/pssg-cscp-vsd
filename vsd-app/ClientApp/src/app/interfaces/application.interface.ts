import { Address } from "./address.interface";
import { Courtfile } from "./files.interface";
import { NameBlock } from "../name-block/name-block.component";
import { DocumentCollectioninformation } from "./victim-restitution.interface";

export interface Application {
  ApplicationType: number;
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
  relationshipToVictim: string;
  relationshipToVictimOther: string;
  gender: number;
  maritalStatus: number;
  preferredMethodOfContact: number;
  dateOfNameChange?: Date;
  birthDate?: Date;
  name: NameBlock;
  iHaveOtherNames: string;
  alias: NameBlock;
  sin: string;
  occupation: string;
  indigenousStatus: number;
  agreeToCvapCommunicationExchange: string;
  phoneNumber: string;
  leaveVoicemail: boolean;
  alternatePhoneNumber: string;
  email: string;
  primaryAddress: Address;
  alternateAddress: Address;
}
export interface CrimeInformation {
  // policeReportedDate?: Date;
  // policeReportedEndDate?: Date;
  // policeReportedWhichPoliceForce: string;
  applicationFiledWithinOneYearFromCrime: string;
  courtFiles: Courtfile[];
  crimeDetails: string;
  crimeInjuries: string;
  crimeLocation: string;
  crimeLocations: Crimelocation[];
  crimePeriodEnd?: Date;
  crimePeriodStart?: Date;
  dateOfDeath?: Date;
  documents: DocumentCollectioninformation[];
  haveYouSuedOffender: number;
  intendToSueOffender?: number;
  noPoliceReportIdentification: string;
  offenderBeenCharged: number;
  offenderFirstName: string;
  offenderLastName: string;
  offenderMiddleName: string;
  offenderRelationship: string;
  policeReportedMultipleTimes: string;
  policeReports: Policereport[];
  racafInformation: Racafinformation;
  typeOfCrime: string;
  unsureOfCrimeDates: string;
  victimDeceasedFromCrime?: boolean;
  wasReportMadeToPolice: number;
  whenDidCrimeOccur: string;
  whyDidYouNotApplySooner: string;
}
export interface MedicalInformation {
  doYouHaveMedicalServicesCoverage: string;
  personalHealthNumber: string;
  haveMedicalCoverageProvince: string;
  haveMedicalCoverageProvinceOther: string;
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
  haveMovingExpenses: boolean;
  haveProtectiveMovingExpenses: boolean;
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
  didYouLoseWages?: number;
  sin?: number;
  missedWorkDueToDeathOfVictim?: number;
  daysWorkMissedStart?: Date;
  daysWorkMissedEnd?: Date;
  employers: Employer[];
  mayContactEmployer?: number;
}
export interface EmploymentIncomeInformation {
  wereYouEmployedAtTimeOfCrime?: number;
  wereYouAtWorkAtTimeOfIncident?: number;
  haveYouAppliedToWorkSafe?: number;
  wsbcClaimNumber?: string;
  didYouMissWorkDueToCrime: number;
  didYouLoseWages?: number;
  areYouSelfEmployed?: number;
  mayContactEmployer?: number;
  haveYouAppliedForWorkersCompensation: number;
  areYouStillOffWork?: number;
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
  documents: DocumentCollectioninformation[];
  relationshipToPerson: string;
}
export interface DeclarationInformation {
  declaredAndSigned: string;
  signature: string;
}
export interface AuthorizationInformation {
  approvedAuthorityNotification: string;
  readAndUnderstoodTermsAndConditions: string;
  signature: string;
  allowCvapStaffSharing: number;
  authorizedPerson: AuthorizedPerson[];
  //authorizedPersonFullName: string;
  //authorizedPersonPhoneNumber: string;
  //authorizedPersonRelationship: string;
  //authorizedPersonAgencyName: string;
  //authorizedPersonAuthorizesDiscussion: string;
  //authorizedPersonSignature: string;
  //authorizedPersonAgencyAddress: Address;
}

interface Crimelocation {
  location: string;
}
interface Policereport {
  policeFileNumber: string;
  investigatingOfficer: string;
  // policeForce: string;
  // reportDate: Date;
  policeDetachment: string;
  reportStartDate: Date;
  reportEndDate: Date;
}

interface Racafinformation {
  applyToCourtForMoneyFromOffender: number;
  expensesRequested: string;
  expensesAwarded?: string;
  expensesReceived?: string;
  willBeTakingLegalAction: number;
  haveLawyer?: number;
  lawyerOrFirmName: string;
  lawyerAddress: Address;
  signName?: string;
  signature?: string;
}
interface Othertreatment {
  providerType: string;
  providerTypeText: string;
  providerName: string;
  providerPhoneNumber: string;
  providerEmail: string;
  providerAddress: Address;
  providerFax: string;
}
interface AuthorizedPerson {
  providerType: string;
  providerTypeText: string;
  authorizedPersonFirstName: string;
  authorizedPersonLastName: string;
  authorizedPersonPhoneNumber: string;
  authorizedPersonEmail: string;
  authorizedPersonAgencyAddress: Address;
  authorizedPersonRelationship: string;
  authorizedPersonAgencyName: string;
}
export interface Employer {
  employerName: string;
  employerPhoneNumber: string;
  employerFax: string;
  employerEmail: string;
  employerFirstName: string;
  employerLastName: string;
  employerAddress: Address;
  contactable: boolean;
}
export interface VictimInformation {
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
  mostRecentMailingAddressSameAsPersonal: boolean;
  primaryAddress: Address;
}
