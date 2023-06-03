import { Component, EventEmitter, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-tc',
  templateUrl: './dialog-tc.component.html',
  styleUrls: ['./dialog-tc.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogTcComponent implements OnInit {
  
  constructor(public dialogRef: MatDialogRef<DialogTcComponent>) { }

  ngOnInit(): void {
  }
  cancel(): void {
    this.dialogRef.close(null);
  }
}
