import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { bid } from 'src/app/models/bid.model';
import { StarRatingColor } from 'src/app/widgets/star-rating/star-rating.component';

@Component({
    selector: 'dialog-bid',
    templateUrl: 'dialog-bid.component.html',
    encapsulation: ViewEncapsulation.None
})
export class DialogBidComponent {
    form!: FormGroup;
    formErrors: any;
    formValid!: boolean;
    private _unsubscribeAll: Subject<any>;
    formData: any;
    previewImage: string | null = null;
    readOnly: boolean = false;
    bidRow: bid;
    minDate: Date = new Date();
    maxDate!: Date;
    dateToday = new Date();

    starColor: StarRatingColor = StarRatingColor.accent;
    starColorP: StarRatingColor = StarRatingColor.primary;
    starColorW: StarRatingColor = StarRatingColor.warn;

    constructor(
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogBidComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private apiService: ApiService,
        private sanitizer: DomSanitizer) {
        this.formErrors = data.formErrors;
        this.formData = data;
        this.bidRow = data.item;
        this.readOnly = data.readOnly == 1 ? true : false;

        //dateBidEnd
        if (data.item.dateOut) { this.minDate = data.item.dateOut ? data.item.dateOut.seconds ? new Date(data.item.dateOut.seconds * 1000) : new Date(data.item.dateOut) : this.dateToday; }
        if (data.item.dateIn) { this.maxDate = data.item.dateIn ? data.item.dateIn.seconds ? new Date(data.item.dateIn.seconds * 1000) : new Date(data.item.dateIn) : this.dateToday; }

        this.minDate = this.minDate < this.dateToday ? this.dateToday : this.minDate;
        this.maxDate = this.maxDate < this.dateToday ? this.dateToday : this.maxDate;

        let dateBidEnd: Date | null = data.item.dateBidEnd ? data.item.dateBidEnd.seconds ? new Date(data.item.dateBidEnd.seconds * 1000) : new Date(data.item.dateBidEnd) : null;
        if(dateBidEnd) { this.minDate = this.minDate > dateBidEnd ? dateBidEnd : this.minDate;}
        if(dateBidEnd) { this.maxDate = this.maxDate > dateBidEnd ? dateBidEnd : this.maxDate;}

        console.log(data.item.dateOut);
        console.log(data.item.dateOut.toString('yyyy-MM-dd HH:mm:ss'));
        console.log(this.minDate, this.maxDate);

        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.form = this.data.form;
        //this.previewImage = this.form.controls['avatar'].value;
        this.formValid = false;
    }

    public hasError = (controlName: string, errorName: string) => {
        return this.form.controls[controlName].hasError(errorName);
    }

    onNoClick(): void {
        this.dialogRef.close(false);
    }
    onYesClick(): void {
        this.dialogRef.close(this.form.value);
    }
    accept(): void {
        this.bidRow.status = 'Accepted';
        this.dialogRef.close(this.bidRow);
    }
    decline(): void {
        this.bidRow.status = 'Declined';
        this.dialogRef.close(this.bidRow);
    }
}