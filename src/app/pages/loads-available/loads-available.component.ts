import { Component, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/services/api.service';
import { keyValue } from 'src/app/models/keyValue.model';
import { load } from 'src/app/models/load.model';
import { Subscription, first } from 'rxjs';
import { DialogLoadComponent } from 'src/app/dialogs/dialog-load/dialog-load.component';
// import { UploadService } from 'app/shared/upload.service';
// import { upload } from 'app/models/upload';
import * as L from 'leaflet';
import { vehicle } from 'src/app/models/vehicle.model';
import { driver } from 'src/app/models/driver.model';
import { VariableService } from 'src/app/services/variable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { notification } from 'src/app/models/notification.model';
import { loadType } from 'src/app/models/loadType.model';
import { loadCategory } from 'src/app/models/loadCategory.model';
import { DialogPaypalComponent } from 'src/app/dialogs/dialog-paypal/dialog-paypal.component';
import { Capacitor } from '@capacitor/core';
import { MenuService } from 'src/app/services/menu.service';
import { LoadService } from 'src/app/pages/loads/loads.service';
import { LoadCategoryService } from '../lookups/loadCategories.service';
import { LoadTypeService } from '../lookups/loadTypes.service';
import { VehicleService } from '../vehicles/vehicle.service';
import { DriverService } from '../drivers/driver.service';
import { UserService } from 'src/app/services/user.service';
import { DialogImageComponent } from 'src/app/dialogs/dialog-image/dialog-image.component';

const MAX_SIZE: number = 1048576;

const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 25000,
    maximumAge: 0
};

@Component({
    selector: 'loads-available',
    templateUrl: './loads-available.component.html',
    styleUrls: ['./loads-available.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LoadsAvailableComponent implements OnInit {
    mapsActive = true;
    loading: boolean = true;
    rangeItems: any[] = [
        { description: '10km', value: 10 },
        { description: '50km', value: 50 },
        { description: '100km', value: 100 },
        { description: '500km', value: 500 },
        { description: 'ALL', value: 100000 },
    ]
    range: number = 50;
    weight: number = 50;
    volumeCm: number = 50;
    volumeLt: number = 100;
    tabIndex: number = 0;

    lat: number = -26.330647;
    lon: number = 28.107455;

    form!: FormGroup;
    displayedColumns: string[];
    dataSource!: MatTableDataSource<load>;
    @ViewChild(MatPaginator, { static: false })
    paginatorLoad!: MatPaginator;
    @ViewChild(MatSort, { static: false })
    sortLoad!: MatSort;

    notificationList: keyValue[] = [];

    theFile: any = null;
    messages: string[] = [];

    loadList: load[] = [];
    vehicleList: vehicle[] = [];
    driverList: driver[] = [];
    loadCategoryList: loadCategory[] = [];
    loadTypeList: loadType[] = [];

    quantity: number = Number(localStorage.getItem('vehiclesQuantity'));

    log: string = '';
    activeLink: string = 'map';
    subscriptionLoads!: Subscription;
    subscriptionLoadCategories!: Subscription;
    subscriptionLoadTypes!: Subscription;
    subscriptionVehicles!: Subscription;
    subscriptionDrivers!: Subscription;

    constructor(
        private dialog: MatDialog,
        private _formBuilder: FormBuilder,
        private apiService: ApiService,
        private _snackBar: MatSnackBar,
        public variableService: VariableService,
        private _router: Router,
        private route: ActivatedRoute,
        private loadService: LoadService,
        private loadCategoryService: LoadCategoryService,
        private loadTypeService: LoadTypeService,
        private vehicleService: VehicleService,
        private driverService: DriverService,
        public menuService: MenuService,
        private userService: UserService
    ) {
        this.userService.validateUser();
        this.menuService.onChangePage('loads');
        this.log = 'LOG:';
        this.loading = true;
        this.displayedColumns = this.getDisplayedColumns();//['cud', 'description', 'originatingAddressLabel', 'destinationAddressLabel', 'dateOut', 'weight', 'volumeLt', 'status'];
    }

    ngOnInit(): void {
        this.getLoads();
        this.getLoadCategories();
        this.getLoadTypes();
        this.getVehicles();
        this.getDrivers();
        // this.getLoadCategories().then((getLoadCategoriesResult: loadCategory[]) => {
        //     this.log += '<br>getLoadCategories';
        //     this.loadCategoryList = getLoadCategoriesResult;
        //     this.getLoadTypes().then((getLoadTypesResult: loadType[]) => {
        //         this.log += '<br>getLoadTypes';
        //         this.loadTypeList = getLoadTypesResult;
        //         this.getVehicles().then((getVehiclesResult: vehicle[]) => {
        //             this.log += '<br>getVehicles';
        //             this.vehicleList = getVehiclesResult;
        //             this.vehicleList.forEach(vehicleItem => {
        //                 this.volumeCm = (vehicleItem.maxLoadLength! * vehicleItem.maxLoadHeight! * vehicleItem.maxLoadWidth!) > this.volumeCm ? (vehicleItem.maxLoadLength! * vehicleItem.maxLoadHeight! * vehicleItem.maxLoadWidth!) : this.volumeCm;
        //                 this.weight = (vehicleItem.maxLoadWeight! > this.weight ? vehicleItem.maxLoadWeight : this.weight) ?? 0;
        //                 this.volumeLt = (vehicleItem.maxLoadVolume! > this.volumeLt ? vehicleItem.maxLoadVolume : this.volumeLt) ?? 0;
        //             })
        //             this.getDrivers().then((getDriversResult: driver[]) => {
        //                 this.log += '<br>getDrivers';
        //                 this.driverList = getDriversResult;
        //                 this.getLoads().then((getLoadsResult: load[]) => {
        //                     this.log += '<br>getLoads';
        //                     this.variableService.setPageSelected('Loads Available');
        //                     this.loadList = getLoadsResult;
        //                     this.dataSource = new MatTableDataSource(this.loadList);
        //                     this.loading = false;
        //                 });
        //             });
        //         });
        //     });
        // });
        // //}// else {
        // //     this.showPaypal();
        // // }
    }

    getLoads() {
        this.variableService.getPosition().then(res => {
            this.tabIndex = 0;
            let position: L.LatLng = new L.LatLng(res?.coords.latitude!, res?.coords.longitude!);
            this.subscriptionLoads = this.loadService.getLoadsFilter(position, this.range, this.weight, this.volumeCm, this.volumeLt).subscribe((loadList: load[]) => {
                loadList.forEach((load: load) => {
                    let positionCurrent: L.LatLng = new L.LatLng(res?.coords.latitude!, res?.coords.longitude!);
                    let positionDestination: L.LatLng = new L.LatLng(load.destinationAddressLat!, load.destinationAddressLon!);
                });
                this.loadList = loadList;
                this.dataSource = new MatTableDataSource(this.loadList);
                this.dataSource.paginator = this.paginatorLoad;
                this.dataSource.sort = this.sortLoad;
            });
        });
    }

    load() {
        this.tabIndex = 0;
        this.loading = true;
        this.getLoads();
    }

    showPaypal() {

        this.loading = false;
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = { page: 'loads-available' };

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.ariaLabel = 'fffff';
        dialogConfig.width = "800px";

        const dialogRef = this.dialog.open(DialogPaypalComponent,
            dialogConfig);


        dialogRef.afterClosed().subscribe(result => {
            //console.log(result);
        });
    }

    @HostListener('window:resize', ['$event'])
    getScreenSize(event?: any) {
        this.displayedColumns = this.getDisplayedColumns();
    }
    getDisplayedColumns() {
        return window.innerWidth > 800 ? ['cud', 'description', 'originatingAddressLabel', 'destinationAddressLabel', 'dateOut', 'weight', 'volumeCm', 'volumeLt', 'status'] : ['cud', 'description', 'destinationAddressLabel', 'dateOut', 'status'];
    }

    getLoadTypes() {
        this.subscriptionLoadTypes = this.loadTypeService.getLoadTypes().subscribe(loadTypeList => {
            this.loadTypeList = loadTypeList;
        });
    }
    getLoadCategories() {
        this.subscriptionLoadCategories = this.loadCategoryService.getLoadCategories().subscribe(loadCategoryList => {
            this.loadCategoryList = loadCategoryList;
        });
    }
    getVehicles() {
        this.subscriptionVehicles = this.vehicleService.getVehicles().subscribe(vehicleList => {
            this.vehicleList = vehicleList;
        });
    }
    getDrivers() {
        this.subscriptionDrivers = this.driverService.getDrivers().subscribe(driverList => {
            this.driverList = driverList;
        });
    }
    
    // getLoadCategories(): Promise<loadCategory[]> {
    //     var promise = new Promise<loadCategory[]>((resolve) => {
    //         try {
    //             this.apiService.getItems('loadCategories').subscribe({
    //                 next: (apiResult: any) => {
    //                     if (apiResult.result == true) {
    //                         resolve(apiResult.data);
    //                     } else {
    //                         if (apiResult.message == 'Expired') {
                    // this.menuService.selectItem('sign-out');
    //                         } else {
    //                             this.loading = false;
    //                             this.log += '<br>error: ' + JSON.stringify(apiResult.message);
    //                             this.variableService.showInfo('ERROR', 'Load Categories', apiResult.message, false).then(showInfoResult => {

    //                             });
    //                             //this._snackBar.open('Error: ' + apiResult.message, null, { duration: 2000 });
    //                         }
    //                     }
    //                 },
    //                 error: (error: any) => {
    //                     this.loading = false;
    //                     this.log += '<br>error: ' + JSON.stringify(error);
    //                     this.variableService.showInfo('ERROR', 'Load Categories', JSON.stringify(error), false).then(showInfoResult => {

    //                     });
    //                     //this._snackBar.open('Error: ' + error, null, { duration: 2000 });
    //                 },
    //                 complete: () => {
    //                     //console.log('Done');
    //                 }
    //             });
    //         } catch (exception) {
    //             this.log += '<br>exception: ' + JSON.stringify(exception);
    //             resolve([]);
    //         }
    //     });
    //     return promise;
    // }

    // getLoadTypes(): Promise<loadType[]> {
    //     var promise = new Promise<loadType[]>((resolve) => {
    //         try {
    //             this.apiService.getItems('loadTypes').subscribe({
    //                 next: (apiResult: any) => {
    //                     if (apiResult.result == true) {
    //                         resolve(apiResult.data);
    //                     } else {
    //                         if (apiResult.message == 'Expired') {
                    // this.menuService.selectItem('sign-out');
    //                         } else {
    //                             this.loading = false;
    //                             this.log += '<br>error: ' + JSON.stringify(apiResult.message);
    //                             this.variableService.showInfo('ERROR', 'Load Types', apiResult.message, false).then(showInfoResult => {

    //                             });
    //                             //this._snackBar.open('Error: ' + apiResult.message, null, { duration: 2000 });
    //                         }
    //                     }
    //                 },
    //                 error: (error: any) => {
    //                     this.loading = false;
    //                     this.log += '<br>error: ' + JSON.stringify(error);
    //                     this.variableService.showInfo('ERROR', 'Load Types', JSON.stringify(error), false).then(showInfoResult => {

    //                     });
    //                     //this._snackBar.open('Error: ' + error, null, { duration: 2000 });
    //                 },
    //                 complete: () => {
    //                     //console.log('Done');
    //                 }
    //             });
    //         } catch (exception) {
    //             this.log += '<br>exception: ' + JSON.stringify(exception);
    //             resolve([]);
    //         }
    //     });
    //     return promise;
    // }

    // getVehicles(): Promise<vehicle[]> {
    //     var promise = new Promise<vehicle[]>((resolve) => {
    //         try {
    //             this.apiService.getItems('vehicles').subscribe({
    //                 next: (apiResult: any) => {
    //                     if (apiResult.result == true) {
    //                         resolve(apiResult.data);
    //                     } else {
    //                         if (apiResult.message == 'Expired') {
                    // this.menuService.selectItem('sign-out');
    //                         } else {
    //                             this.loading = false;
    //                             this.log += '<br>error: ' + JSON.stringify(apiResult.message);
    //                             this.variableService.showInfo('ERROR', 'Vehicles', apiResult.message, false).then(showInfoResult => {

    //                             });
    //                             //this._snackBar.open('Error: ' + apiResult.message, null, { duration: 2000 });
    //                         }
    //                     }
    //                 },
    //                 error: (error: any) => {
    //                     this.loading = false;
    //                     this.log += '<br>error: ' + JSON.stringify(error);
    //                     this.variableService.showInfo('ERROR', 'Vehicles', JSON.stringify(error), false).then(showInfoResult => {

    //                     });
    //                     //this._snackBar.open('Error: ' + error, null, { duration: 2000 });
    //                 },
    //                 complete: () => {
    //                     //console.log('Done');
    //                 }
    //             });
    //         } catch (exception) {
    //             this.log += '<br>exception: ' + JSON.stringify(exception);
    //             resolve([]);
    //         }
    //     });
    //     return promise;
    // }

    // getDrivers(): Promise<driver[]> {
    //     var promise = new Promise<driver[]>((resolve) => {
    //         try {
    //             this.apiService.getItems('drivers').subscribe({
    //                 next: (apiResult: any) => {
    //                     if (apiResult.result == true) {
    //                         resolve(apiResult.data);
    //                     } else {
    //                         if (apiResult.message == 'Expired') {
                    // this.menuService.selectItem('sign-out');
    //                         } else {
    //                             this.loading = false;
    //                             this.log += '<br>error: ' + JSON.stringify(apiResult.message);
    //                             this.variableService.showInfo('ERROR', 'Drivers', apiResult.message, false).then(showInfoResult => {

    //                             });
    //                             //this._snackBar.open('Error: ' + apiResult.message, null, { duration: 2000 });
    //                         }
    //                     }
    //                 },
    //                 error: (error: any) => {
    //                     this.loading = false;
    //                     this.log += '<br>error: ' + JSON.stringify(error);
    //                     this.variableService.showInfo('ERROR', 'Drivers', JSON.stringify(error), false).then(showInfoResult => {

    //                     });
    //                     //this._snackBar.open('Error: ' + error, null, { duration: 2000 });
    //                 },
    //                 complete: () => {
    //                     //console.log('Done');
    //                 }
    //             });
    //         } catch (exception) {
    //             this.log += '<br>exception: ' + JSON.stringify(exception);
    //             resolve([]);
    //         }
    //     });
    //     return promise;
    // }

    handlePermission() {
        navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
            if (result.state == 'granted') {
                console.log(result.state);
            } else if (result.state == 'prompt') {
                console.log(result.state);
            } else if (result.state == 'denied') {
                console.log(result.state);
            }
            result.onchange = function () {
                console.log(result.state);
            }
        });
    }

    // getLoads(): Promise<load[]> {
    //     var promise = new Promise<load[]>((resolve) => {
    //         try {
    //             this.loading = false;
    //             this.variableService.checkLocationPermissions(true).then(checkPermissionResult => {
    //                 this.loading = true;
    //                 //this.mapsActive = checkPermissionResult;
    //                 this.log += '<br>checkPermissionResult: ' + checkPermissionResult;
    //                 if (checkPermissionResult) {
    //                     this.variableService.getPosition().then(res => {
    //                         this.log += '<br>getCurrentPosition: ' + JSON.stringify(res!.coords);
    //                         this.log += '<br>lat: ' + res!.coords.latitude;
    //                         this.log += '<br>lon: ' + res!.coords.longitude;
    //                         // this.apiService.post('loads', 'available', { distance: this.range, lat: res.coords.latitude, lon: res.coords.longitude, weight: this.weight, volumeCm: this.volumeCm, volumeLt: this.volumeLt }).subscribe({
    //                         //     next: (apiResult: any) => {
    //                         //         if (apiResult.result == true) {
    //                         //             resolve(apiResult.data);
    //                         //         } else {
    //                         //             if (apiResult.message == 'Expired') {
                    // this.menuService.selectItem('sign-out');
    //                         //             } else {
    //                         //                 this.loading = false;
    //                         //                 this.log += '<br>error: ' + JSON.stringify(apiResult.message);
    //                         //                 this.variableService.showInfo('ERROR', 'Loads', apiResult.message, false).then(showInfoResult => {

    //                         //                 });
    //                         //                 //this._snackBar.open('Error: ' + apiResult.message, null, { duration: 2000 });
    //                         //                 resolve([]);
    //                         //             }
    //                         //         }
    //                         //     },
    //                         //     error: (error: any) => {
    //                         //         this.loading = false;
    //                         //         this.log += '<br>error: ' + JSON.stringify(error);
    //                         //         this.variableService.showInfo('ERROR', 'Loads', JSON.stringify(error), false).then(showInfoResult => {

    //                         //         });
    //                         //         //this._snackBar.open('Error: ' + error, null, { duration: 2000 });
    //                         //         resolve([]);
    //                         //     },
    //                         //     complete: () => {
    //                         //         //console.log('Done');
    //                         //     }
    //                         // });
    //                     });
    //                 } else {
    //                     // this.loading = false;
    //                     // this.variableService.showInfo('ERROR', 'Permission Error', 'Location needs to be enabled for this feature', false).then(showInfoResult => {
    //                     //     this.loading = true;
    //                     //     resolve([]);
    //                     // });
    //                     // this.apiService.post('loads', 'available', { distance: this.range, lat: this.lat, lon: this.lon, weight: this.weight, volumeCm: this.volumeCm, volumeLt: this.volumeLt }).subscribe({
    //                     //     next: (apiResult: any) => {
    //                     //         if (apiResult.result == true) {
    //                     //             resolve(apiResult.data);
    //                     //         } else {
    //                     //             if (apiResult.message == 'Expired') {
                    // this.menuService.selectItem('sign-out');
    //                     //             } else {
    //                     //                 this.loading = false;
    //                     //                 this.log += '<br>error: ' + JSON.stringify(apiResult.message);
    //                     //                 this.variableService.showInfo('ERROR', 'Loads', apiResult.message, false).then(showInfoResult => {

    //                     //                 });
    //                     //                 //this._snackBar.open('Error: ' + apiResult.message, null, { duration: 2000 });
    //                     //                 resolve([]);
    //                     //             }
    //                     //         }
    //                     //     },
    //                     //     error: (error: any) => {
    //                     //         this.loading = false;
    //                     //         this.log += '<br>error: ' + JSON.stringify(error);
    //                     //         this.variableService.showInfo('ERROR', 'Loads', JSON.stringify(error), false).then(showInfoResult => {

    //                     //         });
    //                     //         //this._snackBar.open('Error: ' + error, null, { duration: 2000 });
    //                     //         resolve([]);
    //                     //     },
    //                     //     complete: () => {
    //                     //         //console.log('Done');
    //                     //     }
    //                     // });
    //                 }
    //             })
    //         } catch (exception) {
    //             this.loading = false;
    //             this.log += '<br>exception: ' + JSON.stringify(exception);
    //             this.variableService.showInfo('ERROR', 'Loads', JSON.stringify(exception), false).then(showInfoResult => {
    //                 resolve([]);
    //             });
    //             //this._snackBar.open('Error: ' + JSON.stringify(exception), null, { duration: 2000 });
    //         }
    //     });
    //     return promise;
    // }

    getNotifications(): Promise<notification[]> {
        var promise = new Promise<notification[]>((resolve) => {
            try {
                this.apiService.getItems('notifications').subscribe({
                    next: (apiResult: any) => {
                        if (apiResult.result == true) {
                            resolve(apiResult.data);
                        } else {
                            if (apiResult.message == 'Expired') {
                                this.menuService.selectItem('sign-out');
                            } else {
                                this.loading = false;
                                this.log += '<br>error: ' + JSON.stringify(apiResult.message);
                                this.variableService.showInfo('ERROR', 'Notifications', apiResult.message, false).then(showInfoResult => {

                                });
                                //this._snackBar.open('Error: ' + apiResult.message, null, { duration: 2000 });
                            }
                        }
                    },
                    error: (error: any) => {
                        this.loading = false;
                        this.log += '<br>error: ' + JSON.stringify(error);
                        this.variableService.showInfo('ERROR', 'Notifications', JSON.stringify(error), false).then(showInfoResult => {

                        });
                        //this._snackBar.open('Error: ' + error, null, { duration: 2000 });
                    },
                    complete: () => {
                        //console.log('Done');
                    }
                });
            } catch (exception) {
                this.log += '<br>exception: ' + JSON.stringify(exception);
                resolve([]);
            }
        });
        return promise;
    }

    initUpsert(row: any, readOnly: number) {
        if (1 == 1 || this.quantity !== 0) {
            this.form = this._formBuilder.group({
                id: [row == null ? undefined : row.id],
                userId: [row == null ? localStorage.getItem('userId') : row.userId],
                loadCategoryId: [row == null ? null : row.loadCategoryId],
                loadTypeId: [{ value: row == null ? null : row.loadTypeId, disabled: readOnly == 1 }, Validators.required],
                description: [{ value: row == null ? null : row.description, disabled: readOnly == 1 }, Validators.required],
                note: [{ value: row == null ? null : row.note, disabled: readOnly == 1 }, Validators.required],
                price: [{ value: row == null ? null : row.price, disabled: readOnly == 1 }, Validators.required],
                originatingAddress: [row == null ? null : row.originatingAddress],
                originatingAddressLabel: [{ value: row == null ? null : row == null ? null : row.originatingAddressLabel, disabled: readOnly == 1 }, Validators.required],
                originatingAddressLat: [{ value: row == null ? null : row == null ? null : row.originatingAddressLat, disabled: readOnly == 1 }, Validators.required],
                originatingAddressLon: [{ value: row == null ? null : row == null ? null : row.originatingAddressLon, disabled: readOnly == 1 }, Validators.required],
                destinationAddress: [row == null ? null : row.destinationAddress],
                destinationAddressLabel: [{ value: row == null ? null : row == null ? null : row.destinationAddressLabel, disabled: readOnly == 1 }, Validators.required],
                destinationAddressLat: [{ value: row == null ? null : row == null ? null : row.destinationAddressLat, disabled: readOnly == 1 }, Validators.required],
                destinationAddressLon: [{ value: row == null ? null : row == null ? null : row.destinationAddressLon, disabled: readOnly == 1 }, Validators.required],
                itemCount: [{ value: row == null ? null : row.itemCount, disabled: readOnly == 1 }, Validators.required],
                weight: [{ value: row == null ? null : row.weight, disabled: readOnly == 1 }, Validators.required],
                length: [{ value: row == null ? null : row.length, disabled: readOnly == 1 }, Validators.required],
                width: [{ value: row == null ? null : row.width, disabled: readOnly == 1 }, Validators.required],
                height: [{ value: row == null ? null : row.height, disabled: readOnly == 1 }, Validators.required],
                volumeCm: [{ value: row == null ? null : row.volumeCm, disabled: readOnly == 1 }],
                volumeLt: [{ value: row == null ? null : row.volumeLt, disabled: readOnly == 1 }, Validators.required],
                totalValue: [{ value: row == null ? null : row.totalValue, disabled: readOnly == 1 }, Validators.required],
                dateOut: [{ value: row == null ? null : row.dateOut ? row.dateOut.seconds ? new Date(row.dateOut.seconds * 1000) : new Date(row.dateOut) : null, disabled: readOnly == 1 }, Validators.required],
                dateIn: [{ value: row == null ? null : row.dateIn ? row.dateIn.seconds ? new Date(row.dateIn.seconds * 1000) : new Date(row.dateIn) : null, disabled: readOnly == 1 }, Validators.required],
                dateBidEnd: [{ value: row == null ? null : row.dateBidEnd ? row.dateBidEnd.seconds ? new Date(row.dateBidEnd.seconds * 1000) : new Date(row.dateBidEnd) : null, disabled: readOnly == 1 }, Validators.required],
                avatar: [row == null ? null : row.avatar],
                avatarChanged: [false],
                status: [row == null ? 'Open' : row.status],
                review: [row!.review],
                reviewCount: [row!.reviewCount],
                bidCount: [row!.bidCount]
            });

            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = {
                item: row,
                form: this.form,
                notificationList: this.notificationList,
                vehicleList: this.vehicleList,
                driverList: this.driverList,
                loadCategoryList: this.loadCategoryList,
                loadTypeList: this.loadTypeList,
                //statusList: this.statusList,
                originatingAddressLabel: row == null ? null : row.originatingAddressLabel,
                originatingAddressLat: row == null ? null : row.originatingAddressLat,
                originatingAddressLon: row == null ? null : row.originatingAddressLon,
                destinationAddressLabel: row == null ? null : row.destinationAddressLabel,
                destinationAddressLat: row == null ? null : row.destinationAddressLat,
                destinationAddressLon: row == null ? null : row.destinationAddressLon,
                title: readOnly ? 'View' : row == null ? 'Insert' : 'Update',
                readOnly: readOnly
            }

            dialogConfig.autoFocus = true;
            dialogConfig.disableClose = true;
            dialogConfig.hasBackdrop = true;
            dialogConfig.ariaLabel = 'fffff';
            dialogConfig.width = "800px";

            const dialogRef = this.dialog.open(DialogLoadComponent,
                dialogConfig);
        } else {
            this.showPaypal();
        }
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
}
