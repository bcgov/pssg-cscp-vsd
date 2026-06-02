import { Component, inject, isDevMode, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import moment from 'moment-timezone';
import { first } from 'rxjs';
import { environment } from '../environments/environment';
import { LoginService } from './services/login.service';
import { HeaderTitleService } from './services/titile.service';
import { ConfigStore } from './store/config.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = '';
  previousUrl: string;
  protected readonly configStore = inject(ConfigStore);
  private readonly renderer = inject(Renderer2);
  private readonly router = inject(Router);
  private readonly headerTitleService = inject(HeaderTitleService);
  private readonly authService = inject(LoginService);
  get error(): boolean {
    return !!this.configStore.error();
  }
  apiPath = environment.apiRootUrl;
  public isNewUser: boolean;
  public isDevMode: boolean = isDevMode();
  isAuthenticated = false;
  authUsername: string | null = null;

  constructor() {
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
    this.headerTitleService.title.subscribe((updatedTitle) => {
      this.title = updatedTitle;
    });

    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
    if (this.configStore.featureFlags().useAuthentication == true) {
      this.refreshAuthState();
    }
  }

  logout(): void {
    this.authService.logOff();
  }

  isOutage() {
    const outageEndDate = this.configStore.outageEndDate();
    const outageStartDate = this.configStore.outageStartDate();
    const outageMessage = this.configStore.outageMessage();
    if (!outageEndDate || !outageStartDate || !outageMessage) {
      return false;
    }
    const currentDate = moment().tz('America/Vancouver');
    const start = moment(outageStartDate).tz('America/Vancouver');
    const end = moment(outageEndDate).tz('America/Vancouver');
    return currentDate.isBetween(start, end, null, '[]');
  }

  generateOutageDateMessage(): string {
    const startDate = moment(this.configStore.outageStartDate()).tz('America/Vancouver').format('MMMM Do YYYY, h:mm a');
    const endDate = moment(this.configStore.outageEndDate()).tz('America/Vancouver').format('MMMM Do YYYY, h:mm a');
    return 'The system will be down for maintenance from ' + startDate + ' to ' + endDate;
  }

  isIE10orLower() {
    if (window.document['documentMode']) {
      return true;
    }

    return false;
  }

  private refreshAuthState(): void {
    this.authService
      .checkAuth()
      .pipe(first())
      .subscribe((response) => {
        this.isAuthenticated = !!response?.isAuthenticated;

        if (!this.isAuthenticated) {
          this.authUsername = null;
          return;
        }

        this.authService
          .getUserName()
          .pipe(first())
          .subscribe((username) => {
            this.authUsername = username || null;
          });
      });
  }
}
