import { Directive, ElementRef, inject, Input, OnInit } from '@angular/core';
import { FeatureFlagConfiguration } from '../../interfaces/configuration.interface';
import { ConfigStore } from '../../store/config.store';

@Directive({
  selector: '[featureEnabled]',
  standalone: false
})
export class FeatureEnabledDirective implements OnInit {
  /**
   * The name of the relevant feature flag.
   */
  @Input('featureEnabled') featureName: keyof FeatureFlagConfiguration;
  /**
   * The value the feature flag must have for this element to be enabled.
   * If not enabled, the element will be remmoved from the DOM.
   */
  @Input('featureEnabledIf') featureEnabledIf: boolean;

  protected readonly configStore = inject(ConfigStore);

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (this.configStore.featureFlags()[this.featureName] !== this.featureEnabledIf) {
      this.el.nativeElement.parentNode.removeChild(this.el.nativeElement);
    }
  }
}
