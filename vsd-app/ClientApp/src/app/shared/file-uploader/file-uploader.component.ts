import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { DocumentCollectioninformation } from '../../interfaces/victim-restitution.interface';
import { FormGroup, ControlContainer, FormBuilder, FormArray } from '@angular/forms';
import { FormBase } from '../form-base';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit {
  @ViewChild('files') myInputVariable: ElementRef;
  @Input() formType: number;
  @Input() documents: FormArray;
  @Output() fileBundle = new EventEmitter<DocumentCollectioninformation[]>();


  constructor(private controlContainer: ControlContainer,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    console.log("file uploader");
    console.log(this.documents);
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
        let body = reader.result.toString();
        body = body.split(',').slice(-1)[0];
        let fileIndex = this.documents.controls.findIndex(doc => doc.get('filename').value === files.item(i).name);
        if (fileIndex >= 0) {
          this.documents.controls[fileIndex].get('body').patchValue(body);
        }
        else {
          this.documents.push(this.fb.group({
            filename: [files.item(i).name],
            body: [body],
            subject: ['']
          }));
        }

      };
      reader.onerror = error => console.log('Error: ', error);
      // this.filenameBlock.fileCollection.fileName[i] = files.item(i).name;
      // this.filenameBlock.emitBundle();
    }
  }
  removeItem(index: number): void {
    console.log('Remove Item');
    this.documents.removeAt(index);
  }
  emitBundle() {
    // when needed emit the file bundle
    // this.fileBundle.emit(this.fileCollection);
  }
}