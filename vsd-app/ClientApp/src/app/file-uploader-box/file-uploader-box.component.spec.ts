import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploaderBoxComponent } from './file-uploader-box.component';

describe('FileUploaderBoxComponent', () => {
  let component: FileUploaderBoxComponent;
  let fixture: ComponentFixture<FileUploaderBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileUploaderBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploaderBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
