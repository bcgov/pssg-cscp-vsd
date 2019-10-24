
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { SubmitInvoiceComponent } from './submit-invoice.component';
let component: SubmitInvoiceComponent;
let fixture: ComponentFixture<SubmitInvoiceComponent>;

describe('SubmitInvoice component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
          declarations: [SubmitInvoiceComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        });
      fixture = TestBed.createComponent(SubmitInvoiceComponent);
        component = fixture.componentInstance;
    }));

    it('should do something', async(() => {
        expect(true).toEqual(true);
    }));
});
