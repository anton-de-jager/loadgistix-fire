import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-sheet-load-details',
  templateUrl: './sheet-load-details.component.html',
  styleUrls: ['./sheet-load-details.component.scss']
})
export class SheetLoadDetailsComponent {
  title: string = '';
  snippet: string = '';

  constructor(
    public bottomSheetRef: MatBottomSheetRef<SheetLoadDetailsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {
    this.title = data.title;
    this.snippet = data.snippet;
  }

  close(event: any) {
    this.bottomSheetRef.dismiss(this.snippet);
  }
}
