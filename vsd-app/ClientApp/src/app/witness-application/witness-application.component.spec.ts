import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { WitnessApplicationComponent } from './witness-application.component';
let component: WitnessApplicationComponent;
let fixture: ComponentFixture<WitnessApplicationComponent>;

describe('WitnessApplication component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
          declarations: [ WitnessApplicationComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        });
      fixture = TestBed.createComponent(WitnessApplicationComponent);
        component = fixture.componentInstance;
    }));

    it('should do something', async(() => {
        expect(true).toEqual(true);
    }));
});
