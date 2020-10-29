import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input, NgModule, ViewContainerRef } from '@angular/core';
import { FileBundle } from '../models/file-bundle';
import { FilenameBlockComponent } from '../filename-block/filename-block.component';

@Component({
  selector: 'app-file-uploader-box',
  templateUrl: './file-uploader-box.component.html',
  styleUrls: ['./file-uploader-box.component.css']
})

// This component only seems to be used on the restitution pages. There's a second one used on the CVAP Applications??? The other one works, so probably get rid of this one

export class FileUploaderBoxComponent implements OnInit {
  // collect the element reference frin the child so that we can access native parts of the files element
  @ViewChild('files') myInputVariable: ElementRef;

  @Output() fileBundle = new EventEmitter<FileBundle>();

  @Input() initialValues;
  fileCollection: FileBundle = {
    // list of file names (same order as file array)
    fileName: [],
    fileDescription: [],
    // base64 encoded file turned into a string
    fileData: []
  };

  constructor() { }

  ngOnInit() {
    if (
      this.initialValues && this.initialValues.fileName &&
      this.initialValues.fileName.length === this.initialValues.fileData.length
    ) {
      this.fileCollection.fileData = this.initialValues.fileData;
      this.fileCollection.fileName = this.initialValues.fileName;
    }
  }

  fakeBrowseClick(): void {
    // the UI element for the native element doesn't match styling, so hide it and fake the click
    this.myInputVariable.nativeElement.click();
  }

  onFilesAdded(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      // convert the file to base64 for upload
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(files.item(i));
      reader.onload = () => {
        if (this.fileCollection.fileName.indexOf(files.item(i).name) >= 0) {
          this.fileCollection.fileData[this.fileCollection.fileName.indexOf(files.item(i).name)] = reader.result.toString();
          this.emitBundle();
        } else {
          // push a fresh file name and file contents
          this.fileCollection.fileName.push(files.item(i).name);
          this.fileCollection.fileData.push(reader.result.toString());
          this.emitBundle();
        }
      };
      reader.onerror = error => console.log('Error: ', error);
    }
  }
  removeItem(index: number): void {
    this.fileCollection.fileName.splice(index, 1);
    this.fileCollection.fileData.splice(index, 1);
    this.emitBundle();
  }
  emitBundle() {
    this.fileBundle.emit(this.fileCollection);
  }
}
