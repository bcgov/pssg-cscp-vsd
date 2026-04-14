import { Component, inject, isDevMode, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, first } from 'rxjs';
import moment from 'moment-timezone';
import { environment } from '../environments/environment';
import { HeaderTitleService } from './services/titile.service';
import { ConfigStore } from './store/config.store';
import { LoginService } from './services/login.service';

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
  get error(): boolean {
    return !!this.configStore.error();
  }
  apiPath = environment.apiRootUrl;
  public isNewUser: boolean;
  public isDevMode: boolean;
  isAuthenticated = false;
  authUsername: string | null = null;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private headerTitleService: HeaderTitleService,
    private authService: LoginService
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
    this.headerTitleService.title.subscribe((updatedTitle) => {
      this.title = updatedTitle;
    });

    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
    if(this.configStore.featureFlags().useUpdatedComplianceFields == true) {
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
