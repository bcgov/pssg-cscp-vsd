import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestitutionAddressComponent } from './address.component';

describe('RestitutionAddressComponent', () => {
  let component: RestitutionAddressComponent;
  let fixture: ComponentFixture<RestitutionAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestitutionAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestitutionAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
