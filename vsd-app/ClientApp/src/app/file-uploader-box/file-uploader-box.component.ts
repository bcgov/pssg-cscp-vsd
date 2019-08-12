import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-file-uploader-box',
  templateUrl: './file-uploader-box.component.html',
  styleUrls: ['./file-uploader-box.component.css']
})
export class FileUploaderBoxComponent implements OnInit {

  @ViewChild('files')
  myInputVariable: ElementRef;

  // base64 encoded file turned into a string
  fileNameList = [];
  fileList = [];

  constructor() { }

  ngOnInit() {
  }

  fakeBrowseClick() {
    // the UI element for the native element is completely useless and ugly so we hide it and fake the user click.
    this.myInputVariable.nativeElement.click();
    console.log('Native button is clicked.');
  }

  onFilesAdded(files: FileList) {
    // for each file added we go through the same conversion process.
    for (let i = 0; i < files.length; i++) {
      // convert the file to base64 for upload
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(files.item(i));
      reader.onload = () => {
        if (this.fileNameList.indexOf(files.item(i).name) >= 0) {
          // save the result over the old result
          this.fileList[this.fileNameList.indexOf(files.item(i).name)] = reader.result;
          console.log('Overwriting old file');
        } else {
          // push a fresh file name and file contents
          this.fileNameList.push(files.item(i).name);
          this.fileList.push(reader.result);
          console.log('Adding new file');
        }
      };
      reader.onerror = error => console.log('Error: ', error);

    }
    // this.resetFiles();
  }
  removeItem(index: number) {
    console.log('Remove Item');
    this.fileNameList.splice(index, 1);
    this.fileList.splice(index, 1);
  }
}
