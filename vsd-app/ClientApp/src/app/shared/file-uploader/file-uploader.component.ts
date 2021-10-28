import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ControlContainer } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { config } from '../../../config';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit {
  @ViewChild('files') myInputVariable: ElementRef;
  @Input() formType: number;
  @Input() documents: FormArray;
  public form: FormGroup;

  MAX_FILE_SIZE = 2 * 1024 * 1024; //2MB
  MAX_TOTAL_FILE_SIZE = 3.5 * 1024 * 1024; //3.5MB

  constructor(private fb: FormBuilder,
    private controlContainer: ControlContainer,
    public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.form = <FormGroup>this.controlContainer.control;
  }

  fakeBrowseClick(): void {
    this.myInputVariable.nativeElement.value = "";
    // the UI element for the native element style doesn't match so we hide it and fake the user click.
    this.myInputVariable.nativeElement.click();
  }

  onFilesAdded(files: FileList): void {
    let totalSize = this.form.parent.get("totalAttachmentSize").value;
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > this.MAX_FILE_SIZE) {
        // console.log("File too big:", (files[i].size / (1024 * 1024)).toFixed(2) + "MB");
        this.snackBar.open('File cannot exceed 2MB', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
        continue;
      }
      if ((totalSize + files[i].size) > this.MAX_TOTAL_FILE_SIZE) {
        // console.log("Total size too big:", ((totalSize + files[i].size) / (1024 * 1024)).toFixed(2) + "MB")
        this.snackBar.open('Files uploaded to application cannot exceed 3.5MB', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
        continue;
      }

      let file_extenstion = files.item(i).name.trim().split('.').pop();
      if (!config.accepted_file_extensions[file_extenstion]) {
        this.snackBar.open('Unsupported file type', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
        continue;
      }

      totalSize += files[i].size;

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
            subject: [''],
            size: files[i].size,
          }));
        }
      };
      reader.onerror = error => console.log('Error: ', error);
    }

    this.form.parent.get("totalAttachmentSize").patchValue(totalSize);
  }
  removeItem(index: number): void {
    let totalSize = this.form.parent.get("totalAttachmentSize").value;
    let fileSize = this.documents.at(index).get("size").value;
    totalSize -= fileSize;
    this.form.parent.get("totalAttachmentSize").patchValue(totalSize);
    this.documents.removeAt(index);
  }
}