import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploymentIncomeComponent } from './employment-income.component';

describe('EmploymentIncomeComponent', () => {
  let component: EmploymentIncomeComponent;
  let fixture: ComponentFixture<EmploymentIncomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmploymentIncomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmploymentIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
