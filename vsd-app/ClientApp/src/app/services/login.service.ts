import { Injectable } from '@angular/core';
import { LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private _accesstoken: string = null;

  constructor(private oidcSecurityService: OidcSecurityService) {}

  public checkAuth(): Observable<LoginResponse> {
    return this.oidcSecurityService.checkAuth().pipe(
      tap((response: LoginResponse) => {
        this._accesstoken = response?.accessToken;

        const isAuthenticated = !!(response?.isAuthenticated || this._accesstoken);
        this.isAuthenticated.next(isAuthenticated);
      })
    );
  }

  public authorize(): void {
    this.oidcSecurityService.authorize();
  }

  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public isAuthenticated$: Observable<boolean> = this.isAuthenticated.asObservable();

  public forceAuthenticated(): void {
    this.isAuthenticated.next(true);
  }

  public getAccessToken(): Observable<string> {
    return this.oidcSecurityService.getAccessToken().pipe(
      tap((response: string) => {
        if (response) {
          this._accesstoken = response;
        }
      })
    );
  }

  public getUserName(): Observable<string> {
    return this.oidcSecurityService.getUserData().pipe(
      map((userData: any) => {
        const username = `${userData?.family_name}, ${userData?.given_name}`;
        return username;
      })
    );
  }

  public logOff(): void {
    this.oidcSecurityService.logoff('').subscribe((result) => {
      this.isAuthenticated.next(false);
      this._accesstoken = null;
    });
  }
}
