import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { LookupStore } from '../store/lookup.store';
import { ApplicationCancelledComponent } from './application-cancelled.component';

describe('ApplicationCancelledComponent', () => {
  let component: ApplicationCancelledComponent;
  let fixture: ComponentFixture<ApplicationCancelledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationCancelledComponent],
      providers: [
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
        { provide: ActivatedRoute, useValue: { snapshot: { data: {}, queryParamMap: { get: () => null } } } },
        { provide: LookupStore, useValue: { cvapEmail: () => '' } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ApplicationCancelledComponent, { set: { template: '<div></div>', styleUrls: [] } })
      .compileComponents();
    fixture = TestBed.createComponent(ApplicationCancelledComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
