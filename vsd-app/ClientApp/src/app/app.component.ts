import { Component, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { isDevMode } from '@angular/core';
import 'rxjs/add/operator/filter';
import { HeaderTitleService } from './services/titile.service';
import { LookupService } from './services/lookup.service';
import { ConfigService } from "./services/config.service";
import { Configuration } from "./interfaces/configuration.interface";
import * as moment from 'moment-timezone';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = '';
  previousUrl: string;
  configuration: Configuration;
  error = false;
  apiPath = environment.apiRootUrl;
  public isNewUser: boolean;
  public isDevMode: boolean;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private headerTitleService: HeaderTitleService,
    private lookupService: LookupService,
    private configService: ConfigService,
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

    this.configService.load()
      .then((configuration) => {
        console.log("Fetched Configuration:", configuration);
        this.configuration = configuration;
      })
      .catch((error) => {
        console.error("Failed to fetch configuration:", error);
        this.error = error;
      });
  }

  isOutage() {
    if (!this.configuration || !this.configuration.outageEndDate || !this.configuration.outageStartDate || !this.configuration.outageMessage) {
      return false;
    }
    const currentDate = moment().tz("America/Vancouver");
    const outageStartDate = moment(this.configuration.outageStartDate).tz("America/Vancouver");
    const outageEndDate = moment(this.configuration.outageEndDate).tz("America/Vancouver");
    return currentDate.isBetween(outageStartDate, outageEndDate, null, '[]');
  }

  generateOutageDateMessage(): string {
    const startDate = moment(this.configuration.outageStartDate).tz("America/Vancouver").format("MMMM Do YYYY, h:mm a");
    const endDate = moment(this.configuration.outageEndDate).tz("America/Vancouver").format("MMMM Do YYYY, h:mm a");
    return "The system will be down for maintenance from " + startDate + " to " + endDate;
  }

  isIE10orLower() {
    if (window.document["documentMode"]) {
      return true;
    }

    return false;
  }
}
