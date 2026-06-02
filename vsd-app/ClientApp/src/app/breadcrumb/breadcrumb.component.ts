import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  standalone: false
})
export class BreadcrumbComponent implements OnInit {
  public breadcrumbs: Array<{}> = [];
  public visible = false;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(LoginService);

  constructor() {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated.value;
  }

  get homeRoute(): string {
    if (this.router.url.startsWith('/drafts')) return '/';

    return this.authService.isAuthenticated.value ? '/drafts' : '/';
  }

  ngOnInit() {
    const ROUTE_DATA_BREADCRUMB: string = 'breadcrumb';
    const PRIMARY_OUTLET: string = 'primary';

    function resolveBreadcrumbs(route, urlPrefix: string, prevName: string) {
      let ret = [];
      let children = route.children;
      if (children) {
        children.forEach((child) => {
          // Verify this is the primary route
          if (child.outlet !== PRIMARY_OUTLET) {
            return;
          }

          //get the route's URL segment
          let routeURL: string = urlPrefix + child.snapshot.url.map((segment) => segment.path).join('/');

          // Verify the custom data property "breadcrumb" is specified on the route
          if (child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
            let bcName = child.snapshot.data[ROUTE_DATA_BREADCRUMB];
            if (bcName !== null && bcName !== '' && bcName !== prevName) {
              ret.push({
                label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
                url: routeURL
              });
            }
            prevName = bcName;
          }

          ret = ret.concat(resolveBreadcrumbs(child, routeURL + '/', prevName));
        });
      }
      return ret;
    }

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.breadcrumbs = resolveBreadcrumbs(this.route.root, '', '');
      this.visible = this.breadcrumbs.length > 0;
    });
  }
}
