import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tool-tip',
  templateUrl: './tool-tip.component.html'
})
export class ToolTipTriggerComponent implements OnInit {
  @Input() trigger = '';

  constructor() { }

  ngOnInit() {
  }

}
