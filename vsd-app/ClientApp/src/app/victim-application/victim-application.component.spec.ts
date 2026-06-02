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
import { StateService } from '../services/state.service';
import { LookupStore } from '../store/lookup.store';
import { VictimApplicationComponent } from './victim-application.component';

describe('VictimApplicationComponent', () => {
  let component: VictimApplicationComponent;
  let fixture: ComponentFixture<VictimApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VictimApplicationComponent],
      imports: [RouterTestingModule, ReactiveFormsModule],
      providers: [
        { provide: LookupStore, useValue: {} },
        { provide: JusticeService, useValue: {} },
        { provide: ApplicationDraftsService, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: StateService, useValue: { cloning: false, data: null } },
        { provide: AEMService, useValue: {} },
        { provide: LoginService, useValue: { isAuthenticated: { value: false } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(VictimApplicationComponent, { set: { template: '<div></div>', styleUrls: [] } })
      .compileComponents();
    fixture = TestBed.createComponent(VictimApplicationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
