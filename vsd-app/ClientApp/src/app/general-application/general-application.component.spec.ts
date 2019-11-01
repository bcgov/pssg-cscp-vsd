import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralApplicationComponent } from './general-application.component';

describe('GeneralApplicationComponent', () => {
  let component: GeneralApplicationComponent;
  let fixture: ComponentFixture<GeneralApplicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralApplicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
