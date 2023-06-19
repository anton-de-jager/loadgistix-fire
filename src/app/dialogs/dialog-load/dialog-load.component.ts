import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DialogAddressComponent } from 'src/app/dialogs/dialog-address/dialog-address.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { load } from 'src/app/models/load.model';
import { DialogBidComponent } from 'src/app/dialogs/dialog-bid/dialog-bid.component';
import { vehicle } from 'src/app/models/vehicle.model';
import { driver } from 'src/app/models/driver.model';
import { StarRatingColor } from 'src/app/widgets/star-rating/star-rating.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { VariableService } from 'src/app/services/variable.service';
import { DialogImageUploadComponent } from '../dialog-image-upload/dialog-image-upload.component';
import { loadType } from 'src/app/models/loadType.model';
import { LoadingService } from 'src/app/services/loading.service';
import * as turf from '@turf/turf';

const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 25000,
    maximumAge: 0
};

@Component({
    selector: 'dialog-load',
    templateUrl: 'dialog-load.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogLoadComponent {
    mapsActive = false;
    timestamp: number = 0;
    form!: FormGroup;
    formBid!: FormGroup;
    formErrors: any;
    formValid!: boolean;
    private _unsubscribeAll: Subject<any>;
    formData: any;
    previewImage: string | null = null;
    fileToUpload: any;
    readOnly: boolean = false;
    bidRow!: load;
    vehicleList: vehicle[] = [];
    driverList: driver[] = [];
    loadCategoryList: any[] = [];
    loading: boolean = true;
    starColor: StarRatingColor = StarRatingColor.accent;
    starColorP: StarRatingColor = StarRatingColor.primary;
    starColorW: StarRatingColor = StarRatingColor.warn;
    avatarChanged = false;
    dateToday = new Date();

    constructor(
        private dialog: MatDialog,
        private loadingService: LoadingService,
        public dialogRef: MatDialogRef<DialogLoadComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        private apiService: ApiService,
        private _snackBar: MatSnackBar,
        private variableService: VariableService) {
        this.timestamp = new Date().getTime();
        if (data.readOnly == 1) {
            this.bidRow = data.item;
        }
        this.formErrors = data.formErrors;
        this.formData = data;
        this.readOnly = data.readOnly == 1 ? true : false;
        this.vehicleList = data.vehicleList;
        this.driverList = data.driverList;

        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.form = this.data.form;
        this.formValid = false;

        this.data.loadCategoryList.forEach((loadCategoryItem: { loadTypeList: any; id: any; }) => {
            loadCategoryItem.loadTypeList = this.data.loadTypeList.filter((x: { loadCategoryId: any; }) => x.loadCategoryId == loadCategoryItem.id).sort((a: { description: string; }, b: { description: any; }) => a.description.localeCompare(b.description));
            this.loadCategoryList.push(loadCategoryItem);
        });

        setTimeout(() => {
            this.loadCategoryList = this.loadCategoryList.sort((a, b) => a.description.localeCompare(b.description));
            this.loadTypeChanged();
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
        this.variableService.checkLocationPermissions(true).then(permission => {
            this.mapsActive = permission;
          if(permission){
            const dialogConfig = new MatDialogConfig();
            this.variableService.getPosition().then(res => {
                dialogConfig.data = { label: 'Loadgistix', lat: res!.coords.latitude, lon: res!.coords.longitude };
                if (control == 'originatingAddress' && this.form.controls['originatingAddress'].value) {
                    dialogConfig.data.address = this.form.controls['originatingAddress'].value;
                    dialogConfig.data.coordinates = this.form.controls['originatingCoordinates'].value;
                }
                if (control == 'destinationAddress' && this.form.controls['destinationAddress'].value) {
                    dialogConfig.data.address = this.form.controls['destinationAddress'].value;
                    dialogConfig.data.coordinates = this.form.controls['destinationCoordinates'].value;
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
                        if (control == 'originatingAddress') {
                            this.form.controls['originatingAddress'].setValue(result.label);
                            this.form.controls['originatingCoordinates'].setValue(result.coordinates);
                        }
                        if (control == 'destinationAddress') {
                            this.form.controls['destinationAddress'].setValue(result.label);
                            this.form.controls['destinationCoordinates'].setValue(result.coordinates);
                        }
                    }
                });
            });
          }else{
            this.variableService.showInfo('ERROR', 'Permission Error', 'Location needs to be enabled for this feature', false).then(showInfoResult => {});
          }
        });
    }


    getLoadTypeDescription(val: string): string {
        return this.formData.loadTypeList.find((x: loadType) => x.id == val).description;
    }

    getLoadIsTypeLiquid(val: string): boolean {
        return this.formData.loadTypeList.find((x: loadType) => x.id == val).liquid;
    }
    loadTypeChanged() {
        if (this.form.value.loadTypeId) {
            this.form.controls['loadTypeDescription'].setValue(this.getLoadTypeDescription(this.form.value.loadTypeId));
            this.form.controls['loadTypeLiquid'].setValue(this.getLoadIsTypeLiquid(this.form.value.loadTypeId));
        }
        if (this.getLoadTypeLiquid()) {
            this.form.controls["height"].clearValidators();
            this.form.controls["width"].clearValidators();
            this.form.controls["length"].clearValidators();
            this.form.controls["itemCount"].clearValidators();
            this.form.controls["volumeLt"].setValidators([Validators.required]);
        } else {
            this.form.controls["height"].setValidators([Validators.required]);
            this.form.controls["width"].setValidators([Validators.required]);
            this.form.controls["length"].setValidators([Validators.required]);
            this.form.controls["itemCount"].setValidators([Validators.required]);
            this.form.controls["volumeLt"].clearValidators();
        }
        setTimeout(() => {
            this.form.controls["height"].updateValueAndValidity();
            this.form.controls["width"].updateValueAndValidity();
            this.form.controls["length"].updateValueAndValidity();
            this.form.controls["itemCount"].updateValueAndValidity();
            this.form.controls["volumeLt"].updateValueAndValidity();
        }, 100);
    }

    getLoadTypeLiquid(): string {
        return this.form.controls['loadTypeId'].value ? this.formData.loadTypeList.find((x: { id: any; }) => x.id === this.form.controls['loadTypeId'].value) ? this.formData.loadTypeList.find((x: { id: any; }) => x.id === this.form.controls['loadTypeId'].value).liquid : false : false;
    }

    public hasError = (controlName: string, errorName: string) => {
        return this.form.controls[controlName].hasError(errorName);
    }

    initBid() {
        this.formBid = this._formBuilder.group({
            userId: [this.bidRow == null ? localStorage.getItem('userId') : this.bidRow.userId],
            loadId: [this.bidRow == null ? null : this.bidRow.id, Validators.required],
            vehicleId: [null, Validators.required],
            driverId: [null, Validators.required],
            price: [this.bidRow == null ? null : this.bidRow.price, Validators.required],
            dateOut: [this.bidRow == null ? null : this.bidRow.dateOut, Validators.required],
            dateIn: [this.bidRow == null ? null : this.bidRow.dateIn, Validators.required],
            status: [this.bidRow == null ? 'Open' : this.bidRow.status!]
        });

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
            item: this.bidRow,
            form: this.formBid,
            loadList: [this.bidRow],//this.loadList,
            vehicleList: this.vehicleList,
            driverList: this.driverList,
            title: 'Place a'
        }

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.ariaLabel = 'fffff';
        dialogConfig.width = "800px";

        const dialogRef = this.dialog.open(DialogBidComponent,
            dialogConfig);


        dialogRef.afterClosed().subscribe(result => {
            if (result !== false) {
                this.loadingService.setLoading(true, 'dialog-load');
                result.loadUserId = this.bidRow.userId;
                this.loading = true;
                this.apiService.createItem('bids', result).then(r => {
                    this.loadingService.setLoading(false, 'dialog-load');
                    this.dialogRef.close(false);
                }, error => {
                    console.log(error);
                    this._snackBar.open('Error: ' + error, undefined, { duration: 2000 });
                    this.loadingService.setLoading(false, 'dialog-load');
                });
            }
        });
    }

    onNoClick(): void {
        this.dialogRef.close(false);
    }
    onYesClick(): void {
        this.dialogRef.close({ form: this.form.value});
    }
}