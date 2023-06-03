import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { reviewDriver } from 'src/app/models/reviewDriver.model';
import { reviewLoad } from 'src/app/models/reviewLoad.model';
import { StarRatingColor } from 'src/app/widgets/star-rating/star-rating.component';

@Component({
    selector: 'dialog-review',
    templateUrl: 'dialog-review.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogReviewComponent {
    form!: FormGroup;
    reviewType: string;
    reviewDriverRow!: reviewDriver;
    reviewLoadRow!: reviewLoad;
    starColor: StarRatingColor = StarRatingColor.accent;
    starColorP: StarRatingColor = StarRatingColor.primary;
    starColorW: StarRatingColor = StarRatingColor.warn;
    ratingPunctuality: number = 0;
    ratingVehicleDescription: number = 0;
    ratingLoadDescription: number = 0;
    ratingPayment: number = 0;
    ratingCondition: number = 0;
    ratingCare: number = 0;
    ratingAttitude: number = 0;

    constructor(
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogReviewComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private apiService: ApiService,
        private sanitizer: DomSanitizer) {
        this.reviewType = data.reviewType;
        if (data.reviewType === 'Driver') {
            this.reviewDriverRow = data.item;
        }
        if (data.reviewType === 'Load') {
            this.reviewLoadRow = data.item;
        }
    }

    ngOnInit(): void {
        this.form = this.data.form;
        this.ratingPunctuality = this.form.controls['ratingPunctuality'].value;
        this.ratingVehicleDescription = this.form.controls['ratingVehicleDescription'].value;
        this.ratingLoadDescription = this.form.controls['ratingLoadDescription'].value;
        this.ratingPayment = this.form.controls['ratingPayment'].value;
        this.ratingCondition = this.form.controls['ratingCondition'].value;
        this.ratingCare = this.form.controls['ratingCare'].value;
        this.ratingAttitude = this.form.controls['ratingAttitude'].value;
    }

    public hasError = (controlName: string, errorName: string) => {
        return this.form.controls[controlName].hasError(errorName);
    }

    onRatingChanged(item: string, event: number) {
        switch (this.reviewType) {
            case 'Driver':
                switch (item) {
                    case 'ratingPunctuality':
                        this.ratingPunctuality = event;
                        this.form.controls["ratingPunctuality"].setValue(event);
                        break;
                    case 'ratingVehicleDescription':
                        this.ratingVehicleDescription = event;
                        this.form.controls["ratingVehicleDescription"].setValue(event);
                        break;
                    case 'ratingCare':
                        this.ratingCare = event;
                        this.form.controls["ratingCare"].setValue(event);
                        break;
                    case 'ratingCondition':
                        this.ratingCondition = event;
                        this.form.controls["ratingCondition"].setValue(event);
                        break;
                    case 'ratingAttitude':
                        this.ratingAttitude = event;
                        this.form.controls["ratingAttitude"].setValue(event);
                        break;
                    default:
                        break;
                }
                break;
            case 'Load':
                switch (item) {
                    case 'ratingPunctuality':
                        this.ratingPunctuality = event;
                        this.form.controls["ratingPunctuality"].setValue(event);
                        break;
                    case 'ratingLoadDescription':
                        this.ratingLoadDescription = event;
                        this.form.controls["ratingLoadDescription"].setValue(event);
                        break;
                    case 'ratingPayment':
                        this.ratingPayment = event;
                        this.form.controls["ratingPayment"].setValue(event);
                        break;
                    case 'ratingCare':
                        this.ratingCare = event;
                        this.form.controls["ratingCare"].setValue(event);
                        break;
                    case 'ratingAttitude':
                        this.ratingAttitude = event;
                        this.form.controls["ratingAttitude"].setValue(event);
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    onNoClick(): void {
        this.dialogRef.close(false);
    }
    onYesClick(): void {
        this.dialogRef.close(this.form.value);
    }
}