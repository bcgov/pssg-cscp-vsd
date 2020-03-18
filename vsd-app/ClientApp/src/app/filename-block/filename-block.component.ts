import { Component, Input, forwardRef, OnDestroy, Output, EventEmitter, NgModule } from '@angular/core';
import { Subscription } from 'rxjs';
import { FileBundle } from '../models/file-bundle';

@Component({
  selector: 'app-filename-block',
  templateUrl: './filename-block.component.html',
  styleUrls: ['./filename-block.component.scss']
})

export class FilenameBlockComponent {

  @Output() fileBundle = new EventEmitter<FileBundle>();

  fileCollection: FileBundle = {
    // list of file names (same order as file array)
    fileName: [],
    fileDescription: [],
    // base64 encoded file turned into a string
    fileData: []
  };

  removeItem(index: number): void {
    // console.log('Remove Item');
    this.fileCollection.fileName.splice(index, 1);
    this.fileCollection.fileData.splice(index, 1);
    this.fileCollection.fileDescription.splice(index, 1);
    // emit the updated bundle
    this.emitBundle();
  }
  emitBundle() {
    // when needed emit the file bundle
    this.fileBundle.emit(this.fileCollection);
  }

}
