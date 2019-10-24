import { Address } from "./address.interface";
import { DocumentCollectioninformation } from "./victim-restitution.interface";

export interface OffenderRestitution {
  RestitutionInformation: OffenderRestitutionInformation;
  DocumentCollectionInformation: DocumentCollectioninformation;
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
interface OffenderRestitutionCourtFile {
  courtFileNumber: string;
  courtLocation: string;
  victims: Victim[];
}
interface Victim {
  firstName: string;
  middleName: string;
  lastName: string;
  relationship: string;
}
