import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { VictimApplicationComponent } from './victim-application.component';
let component: VictimApplicationComponent;
let fixture: ComponentFixture<VictimApplicationComponent>;

describe('VictimApplication component', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VictimApplicationComponent],
      imports: [BrowserModule],
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    });
    fixture = TestBed.createComponent(VictimApplicationComponent);
    component = fixture.componentInstance;
  }));

  it('should do something', waitForAsync(() => {
    expect(true).toEqual(true);
  }));
});
