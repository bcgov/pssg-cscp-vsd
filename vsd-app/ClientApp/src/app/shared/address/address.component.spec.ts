import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { LookupService } from '../../../api/lookup/lookup.service';
import { LookupStore } from '../../store/lookup.store';
import { AddressComponent } from './address.component';

describe('AddressComponent', () => {
  let component: AddressComponent;
  let fixture: ComponentFixture<AddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddressComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: LookupService, useValue: {} },
        { provide: LookupStore, useValue: { provinces: () => [], countries: () => [] } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(AddressComponent, { set: { template: '<div></div>', styleUrls: [] } })
      .compileComponents();
    fixture = TestBed.createComponent(AddressComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
