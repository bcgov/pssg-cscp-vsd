import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InvoicesService } from '../../api/invoices/invoices.service';
import { JusticeService } from '../../api/justice/justice.service';
import { AEMService } from '../services/aem.service';
import { LookupStore } from '../store/lookup.store';
import { SubmitInvoiceComponent } from './submit-invoice.component';

describe('SubmitInvoiceComponent', () => {
  let component: SubmitInvoiceComponent;
  let fixture: ComponentFixture<SubmitInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubmitInvoiceComponent],
      imports: [RouterTestingModule, ReactiveFormsModule],
      providers: [
        { provide: LookupStore, useValue: { cvapEmail: () => '', cvapCounsellingEmail: () => '' } },
        { provide: InvoicesService, useValue: {} },
        { provide: JusticeService, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: AEMService, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(SubmitInvoiceComponent, { set: { template: '<div></div>', styleUrls: [] } })
      .compileComponents();
    fixture = TestBed.createComponent(SubmitInvoiceComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
