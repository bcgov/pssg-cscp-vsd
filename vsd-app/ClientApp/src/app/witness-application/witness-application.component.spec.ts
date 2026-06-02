import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApplicationDraftsService } from '../../api/application-drafts/application-drafts.service';
import { JusticeService } from '../../api/justice/justice.service';
import { AEMService } from '../services/aem.service';
import { LoginService } from '../services/login.service';
import { LookupStore } from '../store/lookup.store';
import { WitnessApplicationComponent } from './witness-application.component';

describe('WitnessApplicationComponent', () => {
  let component: WitnessApplicationComponent;
  let fixture: ComponentFixture<WitnessApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WitnessApplicationComponent],
      imports: [RouterTestingModule, ReactiveFormsModule],
      providers: [
        { provide: LookupStore, useValue: {} },
        { provide: JusticeService, useValue: {} },
        { provide: ApplicationDraftsService, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: AEMService, useValue: {} },
        { provide: LoginService, useValue: { isAuthenticated: { value: false } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(WitnessApplicationComponent, { set: { template: '<div></div>', styleUrls: [] } })
      .compileComponents();
    fixture = TestBed.createComponent(WitnessApplicationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
