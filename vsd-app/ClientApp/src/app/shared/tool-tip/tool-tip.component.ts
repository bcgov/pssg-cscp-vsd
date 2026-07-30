import { Component, Input, TemplateRef, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-tool-tip',
  templateUrl: './tool-tip.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      .tooltip-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .tooltip-popup {
        position: absolute;
        left: calc(100% + 8px);
        top: 50%;
        transform: translateY(-50%);
        min-width: 300px;
        max-width: 425px;
        padding: 12px 20px;
        color: #fff;
        text-align: left;
        font-size: 14px;
        line-height: 1.4;
        background-color: #21527e;
        border-radius: 4px;
        border-bottom: 3px solid #fcba19;
        z-index: 1000;
        pointer-events: none;

        h3 {
          color: #fff;
          margin-top: 10px;
          margin-bottom: 10px;
        }
      }
    `
  ],
  standalone: false
})
export class ToolTipTriggerComponent {
  @Input() trigger: string | TemplateRef<any> = '';

  show = false;

  get isTemplate(): boolean {
    return this.trigger instanceof TemplateRef;
  }

  get asTemplate(): TemplateRef<any> {
    return this.trigger as TemplateRef<any>;
  }

  get asString(): string {
    return this.trigger as string;
  }
}
