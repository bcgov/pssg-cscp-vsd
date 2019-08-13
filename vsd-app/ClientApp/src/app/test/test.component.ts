import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FileBundle } from '../models/file-bundle';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  constructor() { }
  bundlesOfFun: FileBundle = null;
  ngOnInit() { }

  onFileBundle(fileBundle: FileBundle) {
    this.bundlesOfFun = fileBundle;
    // console.log(fileBundle);
  }

}
