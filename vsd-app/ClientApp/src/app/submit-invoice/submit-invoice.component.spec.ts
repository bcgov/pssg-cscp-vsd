import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { SubmitInvoiceComponent } from './submit-invoice.component';
let component: SubmitInvoiceComponent;
let fixture: ComponentFixture<SubmitInvoiceComponent>;

describe('SubmitInvoice component', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SubmitInvoiceComponent],
      imports: [BrowserModule],
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    });
    fixture = TestBed.createComponent(SubmitInvoiceComponent);
    component = fixture.componentInstance;
  }));

  it('should do something', waitForAsync(() => {
    expect(true).toEqual(true);
  }));
});
