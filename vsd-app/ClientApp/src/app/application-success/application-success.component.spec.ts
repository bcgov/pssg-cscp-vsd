import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApplicationSuccessComponent } from './application-success.component';

describe('ApplicationSuccessComponent', () => {
  let component: ApplicationSuccessComponent;
  let fixture: ComponentFixture<ApplicationSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationSuccessComponent],
      providers: [{ provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ApplicationSuccessComponent, { set: { template: '<div></div>', styleUrls: [] } })
      .compileComponents();
    fixture = TestBed.createComponent(ApplicationSuccessComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
