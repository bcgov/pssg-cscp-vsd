import {
  AngularSignaturePadModule,
  NgSignaturePadOptions,
  SignaturePadComponent
} from '@almothafar/angular-signature-pad';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, NO_ERRORS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-sign-dialog',
  templateUrl: './sign-dialog.component.html',
  styleUrls: ['./sign-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, AngularSignaturePadModule, MatDialogModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class SignPadDialog implements OnInit {
  public signatureImage: any;
  wasSigned: boolean = false;
  signatureData: string;
  CRM_HEIGHT = 125;
  CRM_WIDTH = 300;

  @ViewChild(SignaturePadComponent) signaturePad: SignaturePadComponent;

  signaturePadOptions: NgSignaturePadOptions = {
    minWidth: 0.3,
    maxWidth: 2.5,
    canvasWidth: 600,
    canvasHeight: 200
  };

  constructor(public dialogRef: MatDialogRef<SignPadDialog>) {}

  clearSignature() {
    this.wasSigned = false;
    this.signatureData = null;
    this.signaturePad.clear();
  }

  acceptSignature() {
    if (this.wasSigned) {
      const canvas = this.signaturePad.getCanvas();

      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.height = this.CRM_HEIGHT;
      resizedCanvas.width = this.CRM_WIDTH;

      const resizedContext = resizedCanvas.getContext('2d');
      resizedContext.drawImage(canvas, 0, 0, this.CRM_WIDTH, this.CRM_HEIGHT);

      const signatureData = resizedCanvas.toDataURL();

      this.signatureData = signatureData;
      this.dialogRef.close(signatureData);
    } else {
      this.dialogRef.close();
    }
  }

  closeDialog() {
    this.signatureData = null;
    this.dialogRef.close();
  }

  drawStart() {
    this.wasSigned = true;
  }

  ngOnInit() {}
}
