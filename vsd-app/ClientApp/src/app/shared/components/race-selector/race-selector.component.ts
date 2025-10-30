import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormBase } from '../../form-base';
import { EnumHelper } from '../../enums-list';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * A form control for selecting race/ethnicity, including indigenous status.
 *
 * @export
 * @class RaceSelectorComponent
 * @extends {FormBase}
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-race-selector',
  templateUrl: './race-selector.component.html',
  styleUrls: ['./race-selector.component.scss']
})
export class RaceSelectorComponent extends FormBase implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() isDisabled: boolean;
  @Input() raceEthnicityFormControlName: string;
  @Input() otherRaceEthnicityFormControlName: string;
  @Input() indigenousStatusFormControlName: string;

  private $destroy = new Subject<void>();

  enumHelper = new EnumHelper();

  public otherRaceEthnicityValue = this.enumHelper.RaceEthnicity_V2.Other.val;

  /**
   * Get the list of race/ethnicity codes.
   *
   * @readonly
   * @type {{ val: number; name: string }[]}
   */
  public get raceEthnicityList(): { val: number; name: string }[] {
    return Object.values(this.enumHelper.RaceEthnicity_V2);
  }

  /**
   * Returns `true` if the "Other" race/ethnicity option is selected.
   *
   * @readonly
   * @type {boolean}
   */
  public get showOtherRaceEthnicity(): boolean {
    return Number(this.form.get(this.raceEthnicityFormControlName).value) === this.otherRaceEthnicityValue;
  }

  /**
   * Returns `true` if the selected race/ethnicity indicates the person is Indigenous.
   *
   * @readonly
   * @type {boolean}
   */
  public get isPersonIndigenous(): boolean {
    return (
      Number(this.form.get(this.raceEthnicityFormControlName).value) === this.enumHelper.RaceEthnicity_V2.Indigenous.val
    );
  }

  /**
   * Get the list of indigenous status codes.
   *
   * @readonly
   * @type {{ val: number; name: string }[]}
   */
  public get indigenousStatusList(): { val: number; name: string }[] {
    if (!this.enumHelper.IndigenousStatus) {
      return [];
    }

    return Object.values(this.enumHelper.IndigenousStatus);
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    // Clear the `otherRaceEthnicity' field if the `raceEthnicity' field changes.
    this.form
      .get(this.raceEthnicityFormControlName)
      .valueChanges.pipe(takeUntil(this.$destroy))
      .subscribe(() => {
        this.form.get(this.otherRaceEthnicityFormControlName).setValue('');
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
