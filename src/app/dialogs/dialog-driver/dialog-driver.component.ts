import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { VariableService } from 'src/app/services/variable.service';
import { licenceType } from 'src/app/models/licenceType.model';
import { DialogImageUploadComponent } from '../dialog-image-upload/dialog-image-upload.component';

@Component({
    selector: 'dialog-driver',
    templateUrl: 'dialog-driver.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogDriverComponent {
    timestamp: number = 0;
    form!: FormGroup;
    formErrors: any;
    formValid!: boolean;
    private _unsubscribeAll: Subject<any>;
    formData: any;
    previewImage: string | null = null;
    fileToUpload: any;
    avatarChanged = false;

    constructor(
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogDriverComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _snackBar: MatSnackBar,
        private apiService: ApiService,
        private sanitizer: DomSanitizer,
        private variableService: VariableService) {
        this.timestamp = new Date().getTime();
        this.formErrors = data.formErrors;
        this.formData = data;
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.form = this.data.form;
        this.formValid = false;
    }


    uploadImage(event: Event) {
        event.preventDefault();
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            title: 'Upload Image',
            message: 'Please select an image to upload',
            roundCropper: false,
            croppedImage: this.avatarChanged ? this.form.value.fileToUpload : this.form.value.avatar
        };

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.ariaLabel = 'fffff';
        dialogConfig.width = "100vw";
        dialogConfig.maxWidth = "600px";
        dialogConfig.panelClass = 'my-dialog';

        const dialogRef = this.dialog.open(DialogImageUploadComponent,
            dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
            if (result !== null) {
                this.avatarChanged = true;
                this.fileToUpload = result;
            }
        });

    }

    licenceTypeChanged() {
        if (this.form.value.licenceTypeId) {
            this.form.controls['licenceTypeCode'].setValue(this.getLicenceTypeCode(this.form.value.licenceTypeId));
        }
    }
    getLicenceTypeCode(val: string): string {
        return this.formData.licenceTypeList.find((x: licenceType) => x.id == val).code;
    }

    public hasError = (controlName: string, errorName: string) => {
        return this.form.controls[controlName].hasError(errorName);
    }

    onNoClick(): void {
        this.dialogRef.close(false);
    }
    onYesClick(): void {
        this.dialogRef.close({ form: this.form.value, fileToUpload: this.fileToUpload });
    }
}