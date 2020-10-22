import { Component, Output, EventEmitter } from '@angular/core';
import { FileBundle } from '../models/file-bundle';

@Component({
  selector: 'app-filename-block',
  templateUrl: './filename-block.component.html',
  styleUrls: ['./filename-block.component.scss']
})

export class FilenameBlockComponent {
  @Output() fileBundle = new EventEmitter<FileBundle>();

  fileCollection: FileBundle = {
    fileName: [],
    fileDescription: [],
    fileData: []
  };

  removeItem(index: number): void {
    this.fileCollection.fileName.splice(index, 1);
    this.fileCollection.fileData.splice(index, 1);
    this.fileCollection.fileDescription.splice(index, 1);
    this.emitBundle();
  }
  emitBundle() {
    this.fileBundle.emit(this.fileCollection);
  }
}
