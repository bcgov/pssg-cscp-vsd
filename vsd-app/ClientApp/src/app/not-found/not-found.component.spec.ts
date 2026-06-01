import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { NotFoundComponent } from './not-found.component';

let component: NotFoundComponent;
let fixture: ComponentFixture<NotFoundComponent>;

describe('NotFound component', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NotFoundComponent],
      imports: [BrowserModule],
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    });
    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
  }));

  it('should do something', waitForAsync(() => {
    expect(true).toEqual(true);
  }));
});
