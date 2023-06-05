import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogAddressComponent } from 'src/app/dialogs/dialog-address/dialog-address.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { VariableService } from 'src/app/services/variable.service';
import { DialogImageUploadComponent } from '../dialog-image-upload/dialog-image-upload.component';
import { directoryCategory } from 'src/app/models/directoryCategory.model';

const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 25000,
    maximumAge: 0
};

@Component({
    selector: 'dialog-directory',
    templateUrl: 'dialog-directory.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogDirectoryComponent {
    mapsActive = false;
    timestamp: number = 0;
    form!: FormGroup;
    formErrors: any;
    formValid!: boolean;
    private _unsubscribeAll: Subject<any>;
    formData: any;
    previewImage: string | null = null;
    fileToUpload: any;
    freeListing: boolean = false;
    avatarChanged = false;

    constructor(
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogDirectoryComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _snackBar: MatSnackBar,
        private apiService: ApiService,
        private sanitizer: DomSanitizer,
        private variableService: VariableService) {
        this.timestamp = new Date().getTime();
        this.formErrors = data.formErrors;
        this.formData = data;
        // this.freeListing = localStorage.getItem('directoryQuantity').toString() == '-1';

        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.form = this.data.form;
        this.formValid = false;
        //this.previewImage = this.form.controls['avatar'].value;
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

        dialogRef.afterClosed().subscribe((result: string | null) => {
            if (result !== null) {
                this.avatarChanged = true;
                this.fileToUpload = result;
            }
        });

    }

    changeDirectoryCategory(){
        if (this.form.value.directoryCategoryId) {
            this.form.controls['directoryCategoryDescription'].setValue(this.getDirectoryCategoryDescription(this.form.value.directoryCategoryId));
        }
    }

    getDirectoryCategoryDescription(val: string): string {
        return this.formData.directoryCategoryList.find((x: directoryCategory) => x.id == val).description;
    }

    public hasError = (controlName: string, errorName: string) => {
        return this.form.controls[controlName].hasError(errorName);
    }

    getAddress() {
        this.variableService.checkLocationPermissions(true).then(permission => {
            this.mapsActive = permission;
            if (permission) {
                const dialogConfig = new MatDialogConfig();
                this.variableService.getPosition().then(res => {
                    dialogConfig.data = { label: 'Loadgistix', lat: res!.coords.latitude, lon: res!.coords.longitude };
                    if (this.form.controls['addressLabel'].value) {
                        dialogConfig.data.label = this.form.controls['addressLabel'].value;
                        dialogConfig.data.lat = this.form.controls['addressLat'].value;
                        dialogConfig.data.lon = this.form.controls['addressLon'].value;
                    }

                    dialogConfig.autoFocus = true;
                    dialogConfig.disableClose = true;
                    dialogConfig.hasBackdrop = true;
                    dialogConfig.ariaLabel = 'fffff';
                    dialogConfig.width = "800px";

                    const dialogRef = this.dialog.open(DialogAddressComponent,
                        dialogConfig);


                    dialogRef.afterClosed().subscribe(result => {
                        if (result) {
                            this.form.controls['addressLabel'].setValue(result.label);
                            this.form.controls['addressLat'].setValue(result.lat);
                            this.form.controls['addressLon'].setValue(result.lon);
                        }
                    });
                });
            } else {
                this.variableService.showInfo('ERROR', 'Permission Error', 'Location needs to be enabled for this feature', false).then(showInfoResult => { });
            }
        });
    }

    onNoClick(): void {
        this.dialogRef.close(false);
    }
    onYesClick(): void {
        this.dialogRef.close({ form: this.form.value, fileToUpload: this.fileToUpload });
    }
}