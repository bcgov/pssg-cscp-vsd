import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { LoginService } from './login.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService) {}

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
     console.log('AuthGuard starting');
    const response = await this.loginService.checkAuth().toPromise();
    console.log('AuthGuard canActivate response:', response);
    return response?.isAuthenticated ?? false;
  }
}
