import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { DocumentCollectioninformation } from '../../interfaces/victim-restitution.interface';
import { FormBuilder, FormArray } from '@angular/forms';

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


  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
  }

  fakeBrowseClick(): void {
    // the UI element for the native element style doesn't match so we hide it and fake the user click.
    this.myInputVariable.nativeElement.click();
  }

  onFilesAdded(files: FileList): void {
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
    }
  }
  removeItem(index: number): void {
    this.documents.removeAt(index);
  }
  emitBundle() {
  }
}