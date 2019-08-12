import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  // base64 encoded file turned into a string
  file = null;

  constructor() { }

  ngOnInit() {
  }


  onFilesAdded(files: FileList) {
    // convert the file to base64 for upload
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(files.item(0));
    reader.onload = () => this.file = reader.result;
    reader.onerror = error => console.log('Error: ', error);
  }
}
