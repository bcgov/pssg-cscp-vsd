import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PronounSelectorComponent } from './pronoun-selector.component';

describe('PronounSelectorComponent', () => {
  let component: PronounSelectorComponent;
  let fixture: ComponentFixture<PronounSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PronounSelectorComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PronounSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
