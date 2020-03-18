import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilenameBlockComponent } from './filename-block.component';

describe('FilenameBlockComponent', () => {
  let component: FilenameBlockComponent;
  let fixture: ComponentFixture<FilenameBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilenameBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilenameBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
