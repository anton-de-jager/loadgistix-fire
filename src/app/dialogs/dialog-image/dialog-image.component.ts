import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-image',
  templateUrl: './dialog-image.component.html',
  styleUrls: ['./dialog-image.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogImageComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogImageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  close(){
    this.dialogRef.close(false);
  }
}
