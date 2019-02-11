import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { ApplicationSuccessComponent } from './application-success.component';

let component: ApplicationSuccessComponent;
let fixture: ComponentFixture<ApplicationSuccessComponent>;

describe('ApplicationSuccess component', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationSuccessComponent],
      imports: [BrowserModule],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true }
      ]
    });
    fixture = TestBed.createComponent(ApplicationSuccessComponent);
    component = fixture.componentInstance;
  }));

  it('should do something', async(() => {
    expect(true).toEqual(true);
  }));
});
