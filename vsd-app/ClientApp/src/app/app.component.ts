import { Component, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { isDevMode } from '@angular/core';
import 'rxjs/add/operator/filter';
import { HeaderTitleService } from './services/titile.service';
import { LookupService } from './services/lookup.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = '';
  previousUrl: string;
  public isNewUser: boolean;
  public isDevMode: boolean;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private headerTitleService: HeaderTitleService,
    private lookupService: LookupService
  ) {
    this.isDevMode = isDevMode();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let prevSlug = this.previousUrl;
        let nextSlug = event.url.slice(1);
        if (!nextSlug) nextSlug = 'home';
        if (prevSlug) {
          this.renderer.removeClass(document.body, 'ctx-' + prevSlug);
        }
        if (nextSlug) {
          this.renderer.addClass(document.body, 'ctx-' + nextSlug);
        }
        this.previousUrl = nextSlug;
      }
    });
  }

  ngOnInit() {
    this.headerTitleService.title.subscribe(updatedTitle => {
      this.title = updatedTitle;
    });

    this.lookupService.getCVAPEmails().subscribe((res) => {
      if (res) {
        this.lookupService.cvapEmail = res.cvapEmail;
        this.lookupService.cvapCounsellingEmail = res.cvapCounsellingEmail;
      }
    });
  }

  isIE10orLower() {
    if (window.document["documentMode"]) {
      return true;
    }

    return false;
  }
}
