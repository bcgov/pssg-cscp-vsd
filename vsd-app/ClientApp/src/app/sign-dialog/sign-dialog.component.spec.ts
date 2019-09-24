import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignPadDialog } from './sign-dialog.component';

describe('SignPadDialog', () => {
  let component: SignPadDialog;
  let fixture: ComponentFixture<SignPadDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignPadDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignPadDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
