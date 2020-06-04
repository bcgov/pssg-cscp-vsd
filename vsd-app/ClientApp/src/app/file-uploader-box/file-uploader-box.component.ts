import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input, NgModule, ViewContainerRef } from '@angular/core';
import { FileBundle } from '../models/file-bundle';
import { FilenameBlockComponent } from '../filename-block/filename-block.component';

@Component({
  selector: 'app-file-uploader-box',
  templateUrl: './file-uploader-box.component.html',
  styleUrls: ['./file-uploader-box.component.css']
})

export class FileUploaderBoxComponent implements OnInit {
  // collect the element reference frin the child so that we can access native parts of the files element
  @ViewChild('files') myInputVariable: ElementRef;
  // @ViewChild('filenameBlock') filenameBlock: FilenameBlockComponent;

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
    // sanity check the included data. they must be the same length and there must be more than 0 files
    if (
      this.initialValues && this.initialValues.fileName && //this.initialValues.fileName.length > 0 &&
      this.initialValues.fileName.length === this.initialValues.fileData.length
    ) {
      this.fileCollection.fileData = this.initialValues.fileData;
      this.fileCollection.fileName = this.initialValues.fileName;
    }
  }

  fakeBrowseClick(): void {
    // the UI element for the native element is completely useless and ugly so we hide it and fake the user click.
    this.myInputVariable.nativeElement.click();
    console.log('Native button is clicked.');
  }

  onFilesAdded(files: FileList): void {
    console.log("on files added");
    console.log(files);
    // for each file added we go through the same conversion process.
    for (let i = 0; i < files.length; i++) {
      // convert the file to base64 for upload
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(files.item(i));
      reader.onload = () => {
        if (this.fileCollection.fileName.indexOf(files.item(i).name) >= 0) {
          // save the result over the old result
          this.fileCollection.fileData[this.fileCollection.fileName.indexOf(files.item(i).name)] = reader.result.toString();
          // console.log('Overwriting old file');
          // emit the updated bundle
          this.emitBundle();
        } else {
          // push a fresh file name and file contents
          this.fileCollection.fileName.push(files.item(i).name);
          this.fileCollection.fileData.push(reader.result.toString());
          //this.filenameBlock.fileName = files.item(i).name;
          // console.log('Adding new file');
          // emit the updated bundle
          this.emitBundle();
        }
      };
      reader.onerror = error => console.log('Error: ', error);
      // this.filenameBlock.fileCollection.fileName[i] = files.item(i).name;
      // this.filenameBlock.emitBundle();
    }
  }
  removeItem(index: number): void {
    // console.log('Remove Item');
    this.fileCollection.fileName.splice(index, 1);
    this.fileCollection.fileData.splice(index, 1);
    // emit the updated bundle
    this.emitBundle();
  }
  emitBundle() {
    // when needed emit the file bundle
    this.fileBundle.emit(this.fileCollection);
  }

  // downloadFile() {
  //   // TODO: when downloading a file this may work.
  //   // make an anchor for downloading
  //   const a = document.createElement('a');
  //   a.id = this.fileCollection.fileName[0]; // optional?
  //   a.download = this.fileCollection.fileName[0];
  //   a.href = this.fileCollection.fileData[0];
  //   a.dataset.downloadurl = [a.download, a.href].join(':');
  //   a.click();
  // }
}
