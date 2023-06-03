import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Clipboard } from '@capacitor/clipboard';
import { Toast } from '@capacitor/toast';

const options: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 25000,
  maximumAge: 0
};

@Component({
  selector: 'app-app-code',
  templateUrl: './dialog-app-code.component.html',
  styleUrls: ['./dialog-app-code.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogAppCodeComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogAppCodeComponent>) {
  }

  copyReferral() {
      Clipboard.write({
          string: "https://play.google.com/store/apps/details?id=com.loadgistix.www"
      });
      Toast.show({
          text: 'App Link copied to clipboard',
        });
  }

  submit(): void {
    this.dialogRef.close();
  }
}
