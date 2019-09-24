
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { VictimApplicationComponent } from './victim-application.component';
let component: VictimApplicationComponent;
let fixture: ComponentFixture<VictimApplicationComponent>;

describe('VictimApplication component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
          declarations: [ VictimApplicationComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        });
      fixture = TestBed.createComponent(VictimApplicationComponent);
        component = fixture.componentInstance;
    }));

    it('should do something', async(() => {
        expect(true).toEqual(true);
    }));
});
