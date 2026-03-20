import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationSelectorComponent } from './application-selector.component';

describe('ApplicationSelectorComponent', () => {
  let component: ApplicationSelectorComponent;
  let fixture: ComponentFixture<ApplicationSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationSelectorComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
