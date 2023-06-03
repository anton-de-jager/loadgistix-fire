import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-info',
  templateUrl: './dialog-info.component.html',
  styleUrls: ['./dialog-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogInfoComponent {
  stopAction = true;
  title = '';
  alertHeading = '';
  alertContent = '';

  constructor(
    public dialogRef: MatDialogRef<DialogInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.stopAction = data.stopAction;
      this.title = data.title;
      this.alertHeading = data.alertHeading;
      this.alertContent = data.alertContent;
  }

  close(){
    this.dialogRef.close(false);
  }
}
