import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-url',
  templateUrl: './dialog-url.component.html',
  styleUrls: ['./dialog-url.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogUrlComponent {
  title = '';
  url = '';

  constructor(
    public dialogRef: MatDialogRef<DialogUrlComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.title = data.title;
      this.url = data.url;
  }

  close(){
    this.dialogRef.close(false);
  }
}
