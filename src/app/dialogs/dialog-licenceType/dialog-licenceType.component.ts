import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: 'dialog-licenceType',
    templateUrl: 'dialog-licenceType.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogLicenceTypeComponent {
    form!: FormGroup;
    formErrors: any;
    formValid!: boolean;
    formData: any;

    constructor(
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogLicenceTypeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.formErrors = data.formErrors;
        this.formData = data;
    }

    ngOnInit(): void {
        this.form = this.data.form;
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
}