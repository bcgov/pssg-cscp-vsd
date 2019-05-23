
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { VictimRestitutionComponent } from './victim-restitution.component';
let component: VictimRestitutionComponent;
let fixture: ComponentFixture<VictimRestitutionComponent>;

describe('VictimRestitution component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
          declarations: [ VictimRestitutionComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        });
      fixture = TestBed.createComponent(VictimRestitutionComponent);
        component = fixture.componentInstance;
    }));

    it('should do something', async(() => {
        expect(true).toEqual(true);
    }));
});
