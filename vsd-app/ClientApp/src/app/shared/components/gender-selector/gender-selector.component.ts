import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormBase } from '../../form-base';
import { EnumHelper } from '../../enums-list';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * A form control for selecting gender.
 *
 * @export
 * @class GenderSelectorComponent
 * @extends {FormBase}
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-gender-selector',
  templateUrl: './gender-selector.component.html',
  styleUrls: ['./gender-selector.component.scss']
})
export class GenderSelectorComponent extends FormBase implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() isDisabled: boolean;
  @Input() genderFormControlName: string;
  @Input() otherGenderFormControlName: string;

  private $destroy = new Subject<void>();

  enumHelper = new EnumHelper();

  otherGenderValue = this.enumHelper.Gender_V2.Prefer_To_Self_Describe.val;

  /**
   * Get the list of gender codes.
   *
   * @readonly
   * @type {{ val: number; name: string }[]}
   */
  public get genderList(): { val: number; name: string }[] {
    return Object.values(this.enumHelper.Gender_V2);
  }

  /**
   * Returns `true` if the "Other" gender option is selected.
   *
   * @readonly
   * @type {boolean}
   */
  public get showOtherGender(): boolean {
    return Number(this.form.get(this.genderFormControlName).value) === this.otherGenderValue;
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    // Clear the `otherGender' field if the `gender' field changes.
    this.form
      .get(this.genderFormControlName)
      .valueChanges.pipe(takeUntil(this.$destroy))
      .subscribe(() => {
        this.form.get(this.otherGenderFormControlName).setValue('');
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
