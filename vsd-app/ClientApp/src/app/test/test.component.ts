import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// class AddressForm implements Address {
//   line1: string;
//   line2: string;
//   city: string;
//   postalCode: string;
//   province: string = null; // made null so option can select default
//   country: string = null;
//   constructor(address?) {
//     if (address) {
//       this.line1 = address.line1 || null;
//       this.line2 = address.line2 || null;
//       this.city = address.city || null;
//       this.postalCode = address.postalCode || null;
//       this.province = address.province || null;
//       this.country = address.country || null;
//     }
//   }
// }
// class PersonalInformationForm implements PersonalInformation {
//   permissionToContactViaMethod: boolean;
//   gender: number;
//   maritalStatus: number;
//   preferredMethodOfContact: number;
//   dateOfNameChange?: Date;
//   birthDate?: Date;
//   firstName: string;
//   middleName: string;
//   lastName: string;
//   iHaveOtherNames: string;
//   otherFirstName: string;
//   otherLastName: string;
//   sin: string;
//   occupation: string;
//   agreeToCvapCommunicationExchange: string;
//   phoneNumber: string;
//   alternatePhoneNumber: string;
//   email: string;
//   primaryAddress: AddressForm;
//   alternateAddress: AddressForm;
//   constructor(pi?: PersonalInformation) {
//     if (pi) {
//       this.permissionToContactViaMethod = pi.permissionToContactViaMethod || null;
//       this.gender = pi.gender || null;
//       this.maritalStatus = pi.maritalStatus || null;
//       this.preferredMethodOfContact = pi.preferredMethodOfContact || null;
//       this.dateOfNameChange = pi.dateOfNameChange || null;
//       this.birthDate = pi.birthDate || null;
//       this.firstName = pi.firstName || null;
//       this.middleName = pi.middleName || null;
//       this.lastName = pi.lastName || null;
//       this.iHaveOtherNames = pi.iHaveOtherNames || null;
//       this.otherFirstName = pi.otherFirstName || null;
//       this.otherLastName = pi.otherLastName || null;
//       this.sin = pi.sin || null;
//       this.occupation = pi.occupation || null;
//       this.agreeToCvapCommunicationExchange = pi.agreeToCvapCommunicationExchange || null;
//       this.phoneNumber = pi.phoneNumber || null;
//       this.alternatePhoneNumber = pi.alternatePhoneNumber || null;
//       this.email = pi.email || null;
//       this.primaryAddress = new AddressForm(pi.primaryAddress) || null;
//       this.alternateAddress = new AddressForm(pi.alternateAddress) || null;
//     } else {
//       this.primaryAddress = new AddressForm() || null;
//       this.alternateAddress = new AddressForm() || null;
//     }
//   }
// }
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  personalInfoForm: FormGroup;
  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.personalInfoForm = this.fb.group({
      primaryAddress: [null, Validators.required],
      alternateAddress: [null],
    });
  }

  submit() {
    console.log(`Value: ${this.personalInfoForm.controls.mySwitch.value}`);
  }
}
