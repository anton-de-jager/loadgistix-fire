import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";
import { Subject } from 'rxjs';
import { vehicleCategory } from 'src/app/models/vehicleCategory.model';

@Component({
    selector: 'dialog-vehicleType',
    templateUrl: 'dialog-vehicleType.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogVehicleTypeComponent {
    form!: FormGroup;
    formErrors: any;
    formValid!: boolean;
    formData: any;
    private _unsubscribeAll: Subject<any>;

    constructor(
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogVehicleTypeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.formErrors = data.formErrors;
        this.formData = data;

        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.form = this.data.form;
        this.formValid = false;
    }

    changeVehicleCategory(){
        if (this.form.value.vehicleCategoryId) {
            this.form.controls['vehicleCategoryDescription'].setValue(this.getVehicleCategoryDescription(this.form.value.vehicleCategoryId));
        }
    }

    getVehicleCategoryDescription(val: string): string {
        return this.formData.vehicleCategoryList.find((x: vehicleCategory) => x.id == val).description;
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
}