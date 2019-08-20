import { Address } from "./address.interface";

export interface OffenderRestitution {
  RestitutionInformation: OffenderRestitutionInformation;
}
interface OffenderRestitutionInformation {
  offenderFirstName: string;
  offenderMiddleName: string;
  offenderLastName: string;
  preferredMethodOfContact: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  email: string;
  probationOfficerFirstName: string;
  probationOfficerLastName: string;
  custodyLocation: string;
  custodyPhoneNumber: string;
  custodyEmailAddress: string;
  signature: string;
  offenderGender: number;
  offenderBirthDate: Date;
  mailingAddress: Address;
  restitutionCourtFiles: OffenderRestitutionCourtFile[];
  restitutionOrders: Object[];
  permissionToLeaveDetailedMessage: boolean;
  declaredAndSigned: boolean;
}
export interface OffenderRestitutionCourtFile {
  courtFileNumber: string;
  courtLocation: string;
  victims: Victim[];
}
export interface Victim {
  firstName: string;
  middleName: string;
  lastName: string;
  relationship: string;
}
