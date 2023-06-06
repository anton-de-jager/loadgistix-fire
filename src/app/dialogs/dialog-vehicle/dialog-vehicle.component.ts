import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DialogAddressComponent } from 'src/app/dialogs/dialog-address/dialog-address.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { address } from 'src/app/models/address.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { VariableService } from 'src/app/services/variable.service';
import { vehicleType } from 'src/app/models/vehicleType.model';
import { DialogImageUploadComponent } from '../dialog-image-upload/dialog-image-upload.component';
import { LoadingService } from 'src/app/services/loading.service';

const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 25000,
    maximumAge: 0
};

@Component({
    selector: 'dialog-vehicle',
    templateUrl: 'dialog-vehicle.component.html',
    encapsulation: ViewEncapsulation.None
})
export class DialogVehicleComponent {
    mapsActive = false;
    timestamp: number = 0;
    form!: FormGroup;
    formErrors: any;
    formValid!: boolean;
    private _unsubscribeAll: Subject<any>;
    formData: any;
    previewImage: string | null = null;
    fileToUpload: string | null = null;
    avatarChanged = false;

    vehicleCategoryList: any[] = [];

    constructor(
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogVehicleComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _snackBar: MatSnackBar,
        private apiService: ApiService,
        private variableService: VariableService,
        private loadingService: LoadingService) {
        this.timestamp = new Date().getTime();
        this.formErrors = data.formErrors;
        this.formData = data;
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.form = this.data.form;
        this.formValid = false;
        this.data.vehicleCategoryList.forEach((vehicleCategoryItem: { vehicleTypeList: any; id: any; }) => {
            vehicleCategoryItem.vehicleTypeList = this.data.vehicleTypeList.filter((x: { vehicleCategoryId: any; }) => x.vehicleCategoryId == vehicleCategoryItem.id).sort((a: { description: string; }, b: { description: any; }) => a.description.localeCompare(b.description));
            this.vehicleCategoryList.push(vehicleCategoryItem);
        });

        setTimeout(() => {
            this.vehicleCategoryList = this.vehicleCategoryList.sort((a, b) => a.description.localeCompare(b.description));
            this.vehicleTypeChanged();
        }, 100);
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

    getAddress(control: string) {
        this.loadingService.setLoading(true, '');
        this.variableService.checkLocationPermissions(true).then(permission => {
            this.mapsActive = permission;
            if (permission) {
                this.variableService.getPosition().then(res => {
                    this.loadingService.setLoading(false, '');
                    dialogConfig.data = { label: 'Loadgistix', lat: res!.coords.latitude, lon: res!.coords.longitude };
                    if (control == 'originatingAddressLabel' && this.form.controls['originatingAddressLabel'].value) {
                        dialogConfig.data.label = this.form.controls['originatingAddressLabel'].value;
                        dialogConfig.data.lat = this.form.controls['originatingAddressLat'].value;
                        dialogConfig.data.lon = this.form.controls['originatingAddressLon'].value;
                    }
                    if (control == 'destinationAddressLabel' && this.form.controls['destinationAddressLabel'].value) {
                        dialogConfig.data.label = this.form.controls['destinationAddressLabel'].value;
                        dialogConfig.data.lat = this.form.controls['destinationAddressLat'].value;
                        dialogConfig.data.lon = this.form.controls['destinationAddressLon'].value;
                    }

                    dialogConfig.autoFocus = true;
                    dialogConfig.disableClose = true;
                    dialogConfig.hasBackdrop = true;
                    dialogConfig.ariaLabel = 'fffff';
                    dialogConfig.width = "800px";

                    const dialogRef = this.dialog.open(DialogAddressComponent,
                        dialogConfig);


                    dialogRef.afterClosed().subscribe((result: address) => {
                        if (result) {
                            if (control == 'originatingAddressLabel') {
                                this.form.controls['originatingAddressLabel'].setValue(result.label);
                                this.form.controls['originatingAddressLat'].setValue(result.lat);
                                this.form.controls['originatingAddressLon'].setValue(result.lon);
                            }
                            if (control == 'destinationAddressLabel') {
                                this.form.controls['destinationAddressLabel'].setValue(result.label);
                                this.form.controls['destinationAddressLat'].setValue(result.lat);
                                this.form.controls['destinationAddressLon'].setValue(result.lon);
                            }
                        }
                    });
                });
            } else {
                this.variableService.showInfo('ERROR', 'Permission Error', 'Location needs to be enabled for this feature', false).then(showInfoResult => { });
            }
        });
        const dialogConfig = new MatDialogConfig();
    }

    vehicleTypeChanged() {
        if (this.form.value.vehicleTypeId) {
            this.form.controls['vehicleTypeDescription'].setValue(this.getVehicleTypeDescription(this.form.value.vehicleTypeId));
        }
        if (this.getVehicleTypeLiquid()) {
            this.form.controls["maxLoadHeight"].clearValidators();
            this.form.controls["maxLoadWidth"].clearValidators();
            this.form.controls["maxLoadLength"].clearValidators();
            this.form.controls["availableCapacity"].clearValidators();
            this.form.controls["maxLoadVolumeLt"].setValidators([Validators.required]);
        } else {
            this.form.controls["maxLoadHeight"].setValidators([Validators.required]);
            this.form.controls["maxLoadWidth"].setValidators([Validators.required]);
            this.form.controls["maxLoadLength"].setValidators([Validators.required]);
            this.form.controls["availableCapacity"].setValidators([Validators.required]);
            this.form.controls["maxLoadVolumeLt"].clearValidators();
        }
        setTimeout(() => {
            this.form.controls["maxLoadHeight"].updateValueAndValidity();
            this.form.controls["maxLoadWidth"].updateValueAndValidity();
            this.form.controls["maxLoadLength"].updateValueAndValidity();
            this.form.controls["availableCapacity"].updateValueAndValidity();
            this.form.controls["maxLoadVolumeLt"].updateValueAndValidity();
        }, 100);
    }
    getVehicleTypeDescription(val: string): string {
        return this.formData.vehicleTypeList.find((x: vehicleType) => x.id == val).description;
    }

    getVehicleTypeLiquid(): string {
        return this.form.controls['vehicleTypeId'].value ? this.formData.vehicleTypeList.find((x: { id: any; }) => x.id === this.form.controls['vehicleTypeId'].value).liquid : false;
    }


    public hasError = (controlName: string, errorName: string) => {
        return this.form.controls[controlName].hasError(errorName);
    }

    onNoClick(): void {
        this.dialogRef.close(false);
    }
    onYesClick(): void {
        this.form.controls['availableFrom'].setValue(new Date(this.form.value.availableFrom));
        this.form.controls['availableTo'].setValue(new Date(this.form.value.availableTo));
        this.dialogRef.close({ form: this.form.value, fileToUpload: this.fileToUpload });
    }
}