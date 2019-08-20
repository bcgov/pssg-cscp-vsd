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
export interface MedicalInformation { }
export interface ExpenseInformation { }
export interface EmploymentIncomeInformation { }
export interface RepresentativeInformation { }
export interface DeclarationInformation { }
export interface AuthorizationInformation { }

// -SHARED-
interface Address {
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
}
interface Crimelocation {
  location: string;
}
interface Policereport {
  policeFileNumber: string;
  investigatingOfficer: string;
}
interface Courtfile {
  courtFileNumber: string;
  courtLocation: string;
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
