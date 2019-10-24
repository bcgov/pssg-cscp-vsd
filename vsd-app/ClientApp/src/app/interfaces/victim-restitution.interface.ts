import { Address } from "./address.interface";
import { Courtfile, ProviderFile } from "./files.interface";

export interface VictimRestitution {
  RestitutionInformation: VictimRestitutionInformation;
  DocumentCollectionInformation: DocumentCollectioninformation;
}
export interface VictimRestitutionInformation {
  victimFirstName: string;
  victimMiddleName: string;
  victimLastName: string;
  victimGender: number;
  victimBirthDate?: Date;

  uthoriseVictimDesignate: boolean;
  authorisedDesignateFirstName: string;
  authorisedDesignateMiddleName: string;
  authorisedDesignateLastName: string;
  authoriseDesignateToActOnBehalf?: boolean;

  preferredMethodOfContact: number;
  phoneNumber: string;
  alternatePhoneNumber: string;
  email: string;
  mailingAddress: Address;
  permissionToLeaveDetailedMessage?: boolean;

  offenderFirstName: string;
  offenderMiddleName: string;
  offenderLastName: string;
  offenderRelationship: string;
  courtFiles: Courtfile;

  victimServiceWorkerFirstName: string;
  victimServiceWorkerLastName: string;
  victimServiceWorkerProgramName: string;
  victimServiceWorkerEmail: string;

  //public Uploadfile[] restitutionOrders { get; set; }

  providerFiles: ProviderFile[];

  declaredAndSigned: boolean;
  signature: string;

}

export interface DocumentCollectioninformation {
  filename: string;
  body: string;
}
