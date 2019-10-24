import { Component, OnInit, Inject } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DOCUMENT } from '@angular/common';

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

  constructor(@Inject(DOCUMENT) private document: any) {

  }

  ngOnInit() {
    setTimeout(() => {
      this.isOpen = false;
    }, 3000);
  }

  closeEverything() {
    this.document.location.href = 'https://www.google.ca';
  }

  openSlide() {
    this.isOpen = true;
  }

  closeSlide() {
    this.isOpen = false;
  }
}
