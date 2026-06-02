import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EnumHelper } from '../../enums-list';
import { FormBase } from '../../form-base';

/**
 * A form control for selecting pronouns.
 *
 * @export
 * @class PronounSelectorComponent
 * @extends {FormBase}
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-pronoun-selector',
  templateUrl: './pronoun-selector.component.html',
  styleUrls: ['./pronoun-selector.component.scss'],
  standalone: false
})
export class PronounSelectorComponent extends FormBase implements OnInit, OnDestroy {
  @Input() declare form: UntypedFormGroup;
  @Input() isDisabled: boolean;
  @Input() pronounFormControlName: string;
  @Input() otherPronounFormControlName: string;

  private $destroy = new Subject<void>();

  enumHelper = new EnumHelper();

  otherPronounValue = this.enumHelper.Pronouns_V2.Other.val;

  /**
   * Get the list of pronoun codes.
   *
   * @readonly
   * @type {{ val: number; name: string }[]}
   */
  public get pronounList(): { val: number; name: string }[] {
    return Object.values(this.enumHelper.Pronouns_V2);
  }

  /**
   * Returns `true` if the "Other" pronoun option is selected.
   *
   * @readonly
   * @type {boolean}
   */
  public get showOtherPronoun(): boolean {
    return Number(this.form.get(this.pronounFormControlName).value) === this.otherPronounValue;
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    // Clear the `otherPronoun' field if the `pronouns' field changes.
    this.form
      .get(this.pronounFormControlName)
      .valueChanges.pipe(takeUntil(this.$destroy))
      .subscribe(() => {
        this.form.get(this.otherPronounFormControlName).setValue('');
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
