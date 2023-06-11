import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Clipboard } from '@capacitor/clipboard';
import { Toast } from '@capacitor/toast';
import { environment } from 'src/environments/environment.dev';

const options: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 25000,
  maximumAge: 0
};

@Component({
  selector: 'app-qr-code',
  templateUrl: './dialog-qr-code.component.html',
  styleUrls: ['./dialog-qr-code.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogQrCodeComponent {
  email;
environment: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogQrCodeComponent>) {
      this.email = data.email;
  }

  copyReferral() {
      // Clipboard.write({
      //     string: environment.urlShort + "sign-up?r=" + this.email
      // });
      // Toast.show({
      //     text: 'Referral Link copied to clipboard',
      //   });
  }

  submit(): void {
    this.dialogRef.close();
  }
}
