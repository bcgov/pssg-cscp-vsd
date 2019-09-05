import { Component, OnInit, forwardRef, OnDestroy, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PersonalInformation } from '../interfaces/application.interface';

@Component({
  selector: 'app-victim-information',
  templateUrl: './victim-information.component.html',
  styleUrls: ['./victim-information.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VictimInformationComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => VictimInformationComponent),
      multi: true,
    }
  ]
})
export class VictimInformationComponent implements ControlValueAccessor, OnDestroy {

  // is this control required?
  @Input() required: boolean = false;

  piForm: FormGroup;
  subscriptions: Subscription[] = [];

  get value(): PersonalInformation {
    return this.piForm.value;
  }
  set value(value: PersonalInformation) {
    this.piForm.setValue(value);
    this.onChange(value);
    this.onTouched();
  }

  constructor(
    private formBuilder: FormBuilder
  ) {
    // build the formbuilder form
    this.buildForm();

    // set form defaults

    this.subscriptions.push(
      // any time the inner form changes update the parent of any change
      this.piForm.valueChanges.subscribe(value => {
        this.onChange(value);
        this.onTouched();
      })
    );
  }

  buildForm() {
    // use form builder to build the correct form

    // create the form in a not-required way
    this.piForm = this.formBuilder.group({
      permissionToContactViaMethod: [''],
      gender: ['', Validators.required],
      maritalStatus: [''],
      preferredMethodOfContact: ['', Validators.required],
      dateOfNameChange: [''],
      birthDate: [''],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      iHaveOtherNames: [''],
      otherFirstName: [''],
      otherLastName: [''],
      sin: [''],
      occupation: [''],
      agreeToCvapCommunicationExchange: [''],
      phoneNumber: [''],
      alternatePhoneNumber: [''],
      email: [''],
      primaryAddress: [''],
      alternateAddress: [''],
    }, { validator: this.matchingEmailValidator('email', 'confirmEmail') });
  }
  matchingEmailValidator(emailKey: string, confirmEmailKey: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let email = group.controls[emailKey];
      let confirmEmail = group.controls[confirmEmailKey];

      if (email.value !== confirmEmail.value) {
        return {
          mismatchedEmails: true
        };
      }
    }
  }

  //!!!!!!!!!!!!!!! Needed interfaces for ControlValueAccessor !!!!!!!!!!!!//
  // Modify below sparingly. Just for how it talks to the parent.
  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  onChange: any = () => { };
  onTouched: any = () => { };
  registerOnChange(fn) {
    this.onChange = fn;
  }
  writeValue(value) {
    if (value) {
      this.value = value;
    }
  }
  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  // communicate the inner form validation to the parent form
  validate(_: FormControl) {
    return this.piForm.valid ? null : { profile: { valid: false, }, };
  }
}
