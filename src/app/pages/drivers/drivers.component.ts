import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// import { ApiService } from 'src/app/services/api.service';
import { driver } from 'src/app/models/driver.model';
import { licenceType } from 'src/app/models/licenceType.model';

import { first } from 'rxjs';
import { DialogDriverComponent } from 'src/app/dialogs/dialog-driver/dialog-driver.component';
import { VariableService } from 'src/app/services/variable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { HttpEventType } from '@angular/common/http';
// import { DialogPaypalComponent } from 'src/app/dialogs/dialog-paypal/dialog-paypal.component';
import { MenuService } from 'src/app/services/menu.service';
import { Dialog } from '@capacitor/dialog';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { DriverService } from './driver.service';
import { LicenceTypeService } from './../../services/licenceType.service';
import { UserService } from 'src/app/services/user.service';
import { DialogImageComponent } from 'src/app/dialogs/dialog-image/dialog-image.component';
//import {promises as fs} from 'fs';

@Component({
    selector: 'drivers',
    templateUrl: './drivers.component.html',
    encapsulation: ViewEncapsulation.None
})
export class DriversComponent implements OnInit, OnDestroy {
    timestamp: number = 0;
    loading: boolean = false;
    form!: FormGroup;
    licenceTypeList: licenceType[] = [];
    driverList: driver[] = [];

    displayedColumns: string[];
    dataSource!: MatTableDataSource<driver>;
    @ViewChild(MatPaginator, { static: false }) paginatorDriver!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sortDriver!: MatSort;

    deleteform!: FormGroup;

    subscriptionLicenseTypes!: Subscription;
    subscriptionDrivers!: Subscription;

    quantity: number = Number(localStorage.getItem('vehiclesQuantity'));

    constructor(
        private dialog: MatDialog,
        private _formBuilder: FormBuilder,
        // private apiService: ApiService,
        private _snackBar: MatSnackBar,
        public variableService: VariableService,
        private _router: Router,

        public licenceTypeService: LicenceTypeService,
        public driverService: DriverService,

        private route: ActivatedRoute,
        private menuService: MenuService,
        private userService: UserService
    ) {
        this.userService.validateUser();
        this.menuService.onChangePage('Drivers');
        this.loading = true;
        this.dataSource = new MatTableDataSource;
        this.displayedColumns = ['cud', 'avatar', 'firstName', 'lastName', 'licenceTypeCode'];
    }

    ngOnInit(): void {
        this.menuService.onChangePage('My Drivers');
        this.route.queryParams.subscribe(params => {
            if (params['action'] == 'return') {
                //console.log('now');
            }
        });

        this.getDrivers();
        this.getLicenceTypes();
    }

    getLicenceTypes() {
        this.subscriptionLicenseTypes = this.licenceTypeService.getLicenceTypes().subscribe(licenceTypeList => {
            this.licenceTypeList = licenceTypeList;
        });
    }
    getDrivers() {
        this.subscriptionDrivers = this.driverService.getDrivers().subscribe(driverList => {
            this.driverList = driverList;
            this.dataSource.data = this.driverList;
            this.dataSource.paginator = this.paginatorDriver;
            this.dataSource.sort = this.sortDriver;
        });
    }

    showPaypal() {

        this.loading = false;
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = { page: 'drivers' };

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.ariaLabel = 'fffff';
        dialogConfig.width = "800px";

        // const dialogRef = this.dialog.open(DialogPaypalComponent,
        //     dialogConfig);


        // dialogRef.afterClosed().subscribe(result => {
        //     //console.log(result);
        // });
    }

    // getDrivers(): Promise<driver[]> {
    //     var promise = new Promise<driver[]>((resolve) => {
    //         try {
    //             this.apiService.getItems('drivers').subscribe({
    //                 next: (apiResult: any) => {
    //                     if (apiResult.result == true) {
    //                         resolve(apiResult);
    //                     } else {
    //                         if (apiResult.message == 'Expired') {v
    //                         } else {
    //                             this._snackBar.open('Error: ' + apiResult.message, undefined, { duration: 2000 });
    //                             this.loading = false;
    //                         }
    //                     }
    //                 },
    //                 error: (error: string) => {
    //                     console.log(error);
    //                     this._snackBar.open('Error: ' + error, undefined, { duration: 2000 });
    //                     this.loading = false;
    //                 },
    //                 complete: () => {
    //                     //console.log('Done');
    //                 }
    //             });
    //         } catch (exception) {
    //             resolve([]);
    //         }
    //     });
    //     return promise;
    // }

    initUpsert(row: any) {
        if (1 == 1 || this.quantity !== 0 || row !== null) {
            this.form = this._formBuilder.group({
                id: [row == null ? undefined : row.id],
                userId: [row == null ? localStorage.getItem('userId') : row.userId],
                firstName: [row == null ? null : row.firstName, Validators.required],
                lastName: [row == null ? null : row.lastName, Validators.required],
                phone: [row == null ? null : row.phone, Validators.required],
                email: [row == null ? null : row.email, Validators.required],
                password: [row == null ? null : row.password],
                idNumber: [row == null ? null : row.idNumber, Validators.required],
                dateOfBirth: [row == null ? null : new Date(row.dateOfBirth.seconds * 1000), Validators.required],
                licenceTypeId: [row == null ? null : row.licenceTypeId, Validators.required],
                licenceTypeCode: [row == null ? null : row.licenceTypeCode],
                licenceExpiryDate: [row == null ? null : new Date(row.licenceExpiryDate.seconds * 1000), Validators.required],
                avatar: [row == null ? null : row.avatar],
                avatarChanged: [false],
                fileToUpload: [null],
                status: [row == null ? 'Active' : row.status]
            });

            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = {
                item: row,
                form: this.form,
                licenceTypeList: this.licenceTypeList,
                title: row == null ? 'Insert' : 'Update'
            }

            dialogConfig.autoFocus = true;
            dialogConfig.disableClose = true;
            dialogConfig.hasBackdrop = true;
            dialogConfig.ariaLabel = 'fffff';
            dialogConfig.width = "800px";

            const dialogRef = this.dialog.open(DialogDriverComponent,
                dialogConfig);

            dialogRef.afterClosed().subscribe(result => {
                if (result !== false) {
                    this.loading = true;
                    if (row == null) {
                        this.driverService.createDriver(result.form,result.fileToUpload).then((apiResult: any) => {
                        });
                    } else {
                        this.driverService.updateDrivers(result.form,result.fileToUpload).then((apiResult: any) => {
                        });
                    }
                }
            });
        } else {
            this.showPaypal();
        }
    }
    async initDelete(id: any, avatar: string) {
        const cont = await Dialog.confirm({
            title: 'Confirm',
            message: `Are you sure you want to delete this item?`,
        });

        if (cont.value) {
            this.loading = true;
            this.driverService.deleteDriver(id).then((apiResult: any) => {
                this.driverList.splice(this.driverList.findIndex(item => item.id === id), 1);
                this.dataSource = new MatTableDataSource(this.driverList);
                this.loading = false;
            });
        }
    }

    uploadFile(fileToUpload: string | Blob, filename: string): Promise<boolean> {
        var promise = new Promise<boolean>((resolve) => {
            try {
                const formData = new FormData();
                formData.append('file', fileToUpload);
                // this.apiService.upload('drivers', formData, filename).subscribe(event => {
                //     if (event.type === HttpEventType.Response) {
                //         resolve(true);
                //     }
                // })
            } catch (exception) {
                resolve(false);
            }
        });
        return promise;
    }

    viewImage(avatar:string){
        const dialogConfig = new MatDialogConfig();
            dialogConfig.data = {
                avatar: avatar
            }

            dialogConfig.autoFocus = true;
            dialogConfig.disableClose = true;
            dialogConfig.hasBackdrop = true;
            dialogConfig.ariaLabel = 'fffff';

            this.dialog.open(DialogImageComponent,
                dialogConfig);
    }

    getAddressSubstring(str: string, char: string) {
        let arr = str.split(char);
        return arr.length > 1 ? arr[0] + ',' + arr[1] : str;
    }

    ngOnDestroy() {
        this.subscriptionLicenseTypes.unsubscribe();
        this.subscriptionDrivers.unsubscribe();
    }
}
