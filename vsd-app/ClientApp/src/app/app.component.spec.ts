import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppComponent } from './app.component';
import { LoginService } from './services/login.service';
import { HeaderTitleService } from './services/titile.service';
import { ConfigStore } from './store/config.store';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: HeaderTitleService, useValue: { title: '' } },
        { provide: ConfigStore, useValue: { isLoaded: () => true, error: () => null } },
        { provide: LoginService, useValue: { isAuthenticated: { value: false } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(AppComponent, { set: { template: '<div></div>', styleUrls: [] } })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
