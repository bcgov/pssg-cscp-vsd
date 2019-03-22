import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-quick-exit',
  templateUrl: './quick-exit.component.html',
  styleUrls: ['./quick-exit.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        transform: 'translateX(0)',
      })),
      state('closed', style({
        transform: 'translateX(240px)',
      })),
      transition('open => closed', [
        animate('1s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ]),
  ],
})
export class QuickExitComponent implements OnInit {

  isOpen = true;

  constructor() {
  }

  ngOnInit() {
    setTimeout(() => {
      this.isOpen = false;
    }, 3000);
  }

  closeEverything() {
    console.log('Close down the site');
  }

  openSlide() {
    this.isOpen = true;
  }

  closeSlide() {
    this.isOpen = false;
  }
}
