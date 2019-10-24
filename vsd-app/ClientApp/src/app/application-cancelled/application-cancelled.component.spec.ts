import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { ApplicationCancelledComponent } from './application-cancelled.component';

let component: ApplicationCancelledComponent;
let fixture: ComponentFixture<ApplicationCancelledComponent>;

describe('ApplicationCancelled component', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationCancelledComponent],
      imports: [BrowserModule],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true }
      ]
    });
    fixture = TestBed.createComponent(ApplicationCancelledComponent);
    component = fixture.componentInstance;
  }));

  it('should do something', async(() => {
    expect(true).toEqual(true);
  }));
});
