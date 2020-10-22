import { Address } from "./address.interface";
import { Courtfile } from "./files.interface";
import { NameBlock } from "../name-block/name-block.component";
import { DocumentCollectioninformation } from "./victim-restitution.interface";

export interface Application {
  ApplicationType: number;
  Introduction: Introduction;
  PersonalInformation: PersonalInformation;
  VictimInformation?: VictimInformation;
  CrimeInformation: CrimeInformation;
  MedicalInformation: MedicalInformation;
  ExpenseInformation: ExpenseInformation;
  EmploymentIncomeInformation?: EmploymentIncomeInformation;
  RepresentativeInformation: RepresentativeInformation;
  DeclarationInformation: DeclarationInformation;
  AuthorizationInformation: AuthorizationInformation;
}
export interface Introduction {
  understoodInformation: string;
}
export interface PersonalInformation {
  agreeToCvapCommunicationExchange: string;
  alias: NameBlock;
  alternateAddress: Address;
  alternatePhoneNumber: string;
  birthDate?: Date;
  dateOfNameChange?: Date;
  email: string;
  gender: number;
  iHaveOtherNames: string;
  indigenousStatus: number;
  leaveVoicemail: number;
  maritalStatus: number;
  name: NameBlock;
  occupation: string;
  permissionToContactViaMethod: boolean;
  phoneNumber: string;
  preferredMethodOfContact: number;
  primaryAddress: Address;
  relationshipToVictim: string;
  relationshipToVictimOther: string;
  sin: string;
}
export interface CrimeInformation {
  courtFiles: Courtfile[];
  crimeDetails: string;
  crimeInjuries: string;
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
  overOneYearFromCrime: number;
  policeReportedMultipleTimes: string;
  policeReports: Policereport[];
  racafInformation: Racafinformation;
  typeOfCrime: string;
  unsureOfCrimeDates: boolean;
  victimDeceasedFromCrime?: boolean;
  wasReportMadeToPolice: number;
  whenDidCrimeOccur: string;
  whyDidYouNotApplySooner: string;
}
export interface MedicalInformation {
  beingTreatedByFamilyDoctor: string;
  doYouHaveMedicalServicesCoverage: string;
  doYouHaveOtherHealthCoverage: number;
  familyDoctorAddress: Address;
  familyDoctorClinic: string;
  familyDoctorEmail: string;
  familyDoctorFax: string;
  familyDoctorFirstName: string;
  familyDoctorLastName: string;
  familyDoctorPhoneNumber: string;
  hadOtherTreatments: string;
  haveMedicalCoverageProvince: string;
  haveMedicalCoverageProvinceOther: string;
  otherHealthCoverageExtendedPlanNumber: string;
  otherHealthCoverageProviderName: string;
  otherTreatments: Othertreatment[];
  personalHealthNumber: string;
  treatedAtHospitalDate?: Date;
  treatedAtHospitalName: string;
  treatedOutsideBc: boolean;
  treatedOutsideBcHospitalName: string;
  wereYouTreatedAtHospital: string;
}
export interface ExpenseInformation {
  daysWorkMissedEnd?: Date;
  daysWorkMissedStart?: Date;
  didYouLoseWages?: number;
  employers: Employer[];
  haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits: boolean;
  haveCanadaPensionPlanBenefits: boolean;
  haveCivilActionBenefits: boolean;
  haveCounsellingExpenses: boolean;
  haveCounsellingTransportation: boolean;
  haveCrimeSceneCleaningExpenses: string;
  haveDentalExpenses: boolean;
  haveDisabilityExpenses: boolean;
  haveDisabilityPlanBenefits: boolean;
  haveEmploymentInsuranceBenefits: boolean;
  haveIncomeAssistanceBenefits: boolean;
  haveLegalProceedingExpenses: boolean;
  haveLifeInsuranceBenefits: boolean;
  haveLostEmploymentIncomeExpenses: boolean;
  haveMedicalExpenses: boolean;
  haveMovingExpenses: boolean;
  haveOtherBenefits: boolean;
  haveOtherExpenses: boolean;
  havePersonalPropertyLostExpenses: boolean;
  havePrescriptionDrugExpenses: boolean;
  haveProtectiveMeasureExpenses: boolean;
  haveProtectiveMovingExpenses: boolean;
  mayContactEmployer?: number;
  missedWorkDueToDeathOfVictim?: number;
  noneOfTheAboveBenefits: boolean;
  otherSpecificBenefits: string;
  otherSpecificExpenses: string;
  sin?: number;
}
export interface EmploymentIncomeInformation {
  areYouSelfEmployed?: number;
  areYouStillOffWork?: number;
  daysWorkMissedEnd?: Date;
  daysWorkMissedStart?: Date;
  didYouLoseWages?: number;
  didYouMissWorkDueToCrime: number;
  employers: Employer[];
  haveYouAppliedForWorkersCompensation: number;
  haveYouAppliedToWorkSafe?: number;
  mayContactEmployer?: number;
  sin?: number;
  wereYouAtWorkAtTimeOfIncident?: number;
  wereYouEmployedAtTimeOfCrime?: number;
  workersCompensationClaimNumber: string;
  wsbcClaimNumber?: string;
}
export interface RepresentativeInformation {
  completingOnBehalfOf?: number;
  documents: DocumentCollectioninformation[];
  mostRecentMailingAddressSameAsPersonal: boolean;
  relationshipToPerson: string;
  representativeAddress: Address;
  representativeAlternatePhoneNumber: string;
  representativeEmail: string;
  representativeFirstName: string;
  representativeLastName: string;
  representativeMiddleName: string;
  representativePhoneNumber: string;
  representativePreferredMethodOfContact?: number;
}
export interface DeclarationInformation {
  declaredAndSigned: string;
  signature: string;
}
export interface AuthorizationInformation {
  allowCvapStaffSharing: number;
  approvedAuthorityNotification: string;
  authorizedPerson: AuthorizedPerson[];
  authorizedPersonAuthorizesDiscussion: string;
  authorizedPersonSignature: string;
  readAndUnderstoodTermsAndConditions: string;
  signature: string;
}

interface Crimelocation {
  location: string;
}
interface Policereport {
  investigatingOfficer: string;
  policeDetachment: string;
  policeFileNumber: string;
  reportEndDate: Date;
  reportStartDate: Date;
}

interface Racafinformation {
  applyToCourtForMoneyFromOffender: number;
  expensesAwarded?: string;
  expensesReceived?: string;
  expensesRequested: string;
  haveLawyer?: number;
  lawyerAddress: Address;
  lawyerOrFirmName: string;
  signName?: string;
  signature?: string;
  willBeTakingLegalAction: number;
}
interface Othertreatment {
  providerAddress: Address;
  providerCompany: string;
  providerEmail: string;
  providerFax: string;
  providerFirstName: string;
  providerLastName: string;
  providerPhoneNumber: string;
  providerType: string;
  providerTypeText: string;
}
interface AuthorizedPerson {
  authorizedPersonAgencyAddress: Address;
  authorizedPersonAgencyName: string;
  authorizedPersonEmail: string;
  authorizedPersonFirstName: string;
  authorizedPersonLastName: string;
  authorizedPersonPhoneNumber: string;
  authorizedPersonRelationship: string;
  authorizedPersonRelationshipOther: string;
  providerType: string;
}
export interface Employer {
  contactable: boolean;
  employerAddress: Address;
  employerEmail: string;
  employerFax: string;
  employerFirstName: string;
  employerLastName: string;
  employerName: string;
  employerPhoneNumber: string;
}
export interface VictimInformation {
  alternatePhoneNumber?: string;
  birthDate: string;
  confirmEmail?: string;
  dateOfNameChange?: string;
  email?: string;
  firstName: string;
  gender: number;
  iHaveOtherNames?: string;
  lastName: string;
  middleName?: string;
  mostRecentMailingAddressSameAsPersonal: boolean;
  occupation?: string;
  otherFirstName?: string;
  otherLastName?: string;
  phoneNumber?: string;
  primaryAddress: Address;
  sin: string;
}
