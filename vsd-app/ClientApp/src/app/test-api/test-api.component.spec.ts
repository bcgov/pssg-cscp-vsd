import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { TestApiComponent } from './test-api.component';
let component: TestApiComponent;
let fixture: ComponentFixture<TestApiComponent>;

describe('TestApi component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
          declarations: [ TestApiComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        });
      fixture = TestBed.createComponent(TestApiComponent);
        component = fixture.componentInstance;
    }));

    it('should do something', async(() => {
        expect(true).toEqual(true);
    }));
});
