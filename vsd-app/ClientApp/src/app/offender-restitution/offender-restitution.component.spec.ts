import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { OffenderRestitutionComponent } from './offender-restitution.component';
let component: OffenderRestitutionComponent;
let fixture: ComponentFixture<OffenderRestitutionComponent>;

describe('OffenderRestitution component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
          declarations: [OffenderRestitutionComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        });
      fixture = TestBed.createComponent(OffenderRestitutionComponent);
        component = fixture.componentInstance;
    }));

    it('should do something', async(() => {
        expect(true).toEqual(true);
    }));
});
