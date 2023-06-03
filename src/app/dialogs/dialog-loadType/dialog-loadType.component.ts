import { Component, Inject , ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";
import { loadCategory } from 'src/app/models/loadCategory.model';

@Component({
    selector: 'dialog-loadType',
    templateUrl: 'dialog-loadType.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogLoadTypeComponent {
    form!: FormGroup;
    formErrors: any;
    formValid!: boolean;
    formData: any;

    constructor(
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogLoadTypeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.formErrors = data.formErrors;
        this.formData = data;
    }

    ngOnInit(): void {
        this.form = this.data.form;
        this.formValid = false;
    }

    changeLoadCategory(){
        if (this.form.value.loadCategoryId) {
            this.form.controls['loadCategoryDescription'].setValue(this.getLoadCategoryDescription(this.form.value.loadCategoryId));
        }
    }

    getLoadCategoryDescription(val: string): string {
        return this.formData.loadCategoryList.find((x: loadCategory) => x.id == val).description;
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