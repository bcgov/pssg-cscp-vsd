import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddressLegacyComponent } from './address-legacy.component';


describe('AddressComponent', () => {
  let component: AddressLegacyComponent;
  let fixture: ComponentFixture<AddressLegacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressLegacyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressLegacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
