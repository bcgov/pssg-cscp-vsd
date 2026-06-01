import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ApplicationSuccessComponent } from './application-success.component';

let component: ApplicationSuccessComponent;
let fixture: ComponentFixture<ApplicationSuccessComponent>;

describe('ApplicationSuccess component', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationSuccessComponent],
      imports: [BrowserModule],
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    });
    fixture = TestBed.createComponent(ApplicationSuccessComponent);
    component = fixture.componentInstance;
  }));

  it('should do something', waitForAsync(() => {
    expect(true).toEqual(true);
  }));
});
