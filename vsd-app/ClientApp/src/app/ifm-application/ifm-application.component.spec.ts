
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { IfmApplicationComponent } from './ifm-application.component';
let component: IfmApplicationComponent;
let fixture: ComponentFixture<IfmApplicationComponent>;

describe('IfmApplication component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
          declarations: [ IfmApplicationComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        });
      fixture = TestBed.createComponent(IfmApplicationComponent);
        component = fixture.componentInstance;
    }));

    it('should do something', async(() => {
        expect(true).toEqual(true);
    }));
});
