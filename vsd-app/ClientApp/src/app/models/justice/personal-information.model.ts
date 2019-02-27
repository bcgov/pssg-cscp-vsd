import { CustomAddress } from "../custom-address.model";

export class PersonalInformationModel {
  firstName: string;
  middleName: string;
  lastName: string;
  otherFirstName: string;
  otherLastName: string;
  dateOfNameChange: Date | null;

  preferredMethodOfContact: number;

  phoneNumber: string;
  email: string;
  birthDate: Date;

  sinPart1: number | null;
  sinPart2: number | null;
  sinPart3: number | null;

  gender: number;
  maritalStatus: number;
  occupation: string;

  primaryAddress: CustomAddress;
  alternateAddress: CustomAddress;
}
