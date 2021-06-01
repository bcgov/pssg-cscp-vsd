import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

@Component({
  selector: 'app-sign-dialog',
  templateUrl: './sign-dialog.component.html',
  styleUrls: ['./sign-dialog.component.scss']
})
export class SignPadDialog implements OnInit {

  public signatureImage: any;
  wasSigned: boolean = false;
  signatureData: string;
  CRM_HEIGHT = 125;
  CRM_WIDTH = 300;

  @ViewChild(SignaturePad) signaturePad: SignaturePad;

  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 0.3,
    'maxWidth': 2.5,
    'canvasWidth': 600,
    'canvasHeight': 200,
    'penColor': '#000',
    'backgroundColor': 'rgba(255, 255, 255, 0)'
  };

  constructor(public dialogRef: MatDialogRef<SignPadDialog>) {
  }

  clearSignature() {
    this.wasSigned = false;
    this.signatureData = null;
    this.signaturePad.clear();
  }

  acceptSignature() {
    if (this.wasSigned) {
      var resizedCanvas = document.createElement("canvas");
      var resizedContext = resizedCanvas.getContext("2d");
      resizedCanvas.height = this.CRM_HEIGHT;
      resizedCanvas.width = this.CRM_WIDTH;
      var canvas = document.querySelectorAll(".signature-pad > signature-pad > canvas")[0] as CanvasImageSource;
      resizedContext.drawImage(canvas, 0, 0, this.CRM_WIDTH, this.CRM_HEIGHT);
      let signatureData = resizedCanvas.toDataURL();;
      
      this.signatureData = signatureData;
      this.dialogRef.close(signatureData);
    }
    else {
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

  ngOnInit() {
  }

}
