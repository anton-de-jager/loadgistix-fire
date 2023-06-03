import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DialogVehicleCategoryComponent } from 'src/app/dialogs/dialog-vehicleCategory/dialog-vehicleCategory.component';
import { DialogVehicleTypeComponent } from 'src/app/dialogs/dialog-vehicleType/dialog-vehicleType.component';
import { DialogLoadCategoryComponent } from 'src/app/dialogs/dialog-loadCategory/dialog-loadCategory.component';
import { DialogLoadTypeComponent } from 'src/app/dialogs/dialog-loadType/dialog-loadType.component';
import { DialogLicenceTypeComponent } from 'src/app/dialogs/dialog-licenceType/dialog-licenceType.component';
import { vehicleCategory } from 'src/app/models/vehicleCategory.model';
import { MenuService } from 'src/app/services/menu.service';
import { VariableService } from 'src/app/services/variable.service';
import { Dialog } from '@capacitor/dialog';
import { vehicleType } from 'src/app/models/vehicleType.model';
import { loadCategory } from 'src/app/models/loadCategory.model';
import { loadType } from 'src/app/models/loadType.model';
import { licenceType } from 'src/app/models/licenceType.model';
import { VehicleCategoryService } from './vehicleCategories.service';
import { VehicleTypeService } from './vehicleTypes.service';
import { LoadCategoryService } from './loadCategories.service';
import { LoadTypeService } from './loadTypes.service';
import { LicenceTypeService } from './licenceTypes.service';
import { Subscription } from 'rxjs';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
    selector: 'app-lookups',
    templateUrl: './lookups.component.html',
    styleUrls: ['./lookups.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LookupsComponent implements OnInit, OnDestroy {
    subscriptionVehicleCategories!: Subscription;
    subscriptionVehicleTypes!: Subscription;
    subscriptionLoadCategories!: Subscription;
    subscriptionLoadTypes!: Subscription;
    subscriptionLicenceTypes!: Subscription;
    loading: boolean = false;

    vehicleCategoryList: vehicleCategory[] = [];
    displayedColumnsVehicleCategories: string[] = ['cud', 'description'];
    dataSourceVehicleCategories!: MatTableDataSource<vehicleCategory>;
    formVehicleCategories!: FormGroup;
    deleteFormVehicleCategories!: FormGroup;
    @ViewChild('paginatorVehicleCategories', { static: false }) paginatorVehicleCategories!: MatPaginator;
    @ViewChild('sortVehicleCategories', { static: false }) sortVehicleCategories!: MatSort;

    vehicleTypeList: vehicleType[] = [];
    displayedColumnsVehicleTypes: string[] = ['cud', 'vehicleCategoryDescription', 'description', 'liquid'];
    dataSourceVehicleTypes: MatTableDataSource<vehicleType>;
    formVehicleTypes!: FormGroup;
    deleteFormVehicleTypes!: FormGroup;
    @ViewChild('paginatorVehicleTypes', { static: false }) paginatorVehicleTypes!: MatPaginator;
    @ViewChild('sortVehicleTypes', { static: false }) sortVehicleTypes!: MatSort;

    loadCategoryList: loadCategory[] = [];
    displayedColumnsLoadCategories: string[] = ['cud', 'description'];
    dataSourceLoadCategories: MatTableDataSource<loadCategory>;
    formLoadCategories!: FormGroup;
    deleteFormLoadCategories!: FormGroup;
    @ViewChild('paginatorLoadCategories', { static: false }) paginatorLoadCategories!: MatPaginator;
    @ViewChild('sortLoadCategories', { static: false }) sortLoadCategories!: MatSort;

    loadTypeList: loadType[] = [];
    displayedColumnsLoadTypes: string[] = ['cud', 'loadCategoryDescription', 'description', 'liquid'];
    dataSourceLoadTypes: MatTableDataSource<loadType>;
    formLoadTypes!: FormGroup;
    deleteFormLoadTypes!: FormGroup;
    @ViewChild('paginatorLoadTypes', { static: false }) paginatorLoadTypes!: MatPaginator;
    @ViewChild('sortLoadTypes', { static: false }) sortLoadTypes!: MatSort;

    licenceTypeList: licenceType[] = [];
    displayedColumnsLicenceTypes: string[] = ['cud', 'code', 'description'];
    dataSourceLicenceTypes: MatTableDataSource<licenceType>;
    formLicenceTypes!: FormGroup;
    deleteFormLicenceTypes!: FormGroup;
    @ViewChild('paginatorLicenceTypes', { static: false }) paginatorLicenceTypes!: MatPaginator;
    @ViewChild('sortLicenceTypes', { static: false }) sortLicenceTypes!: MatSort;

    constructor(
        private dialog: MatDialog,
        private _formBuilder: FormBuilder,
        private vehicleCategoryService: VehicleCategoryService,
        private vehicleTypeService: VehicleTypeService,
        private loadCategoryService: LoadCategoryService,
        private loadTypeService: LoadTypeService,
        private licenceTypeService: LicenceTypeService,
        private _snackBar: MatSnackBar,
        public variableService: VariableService,
        private _router: Router,
        private menuService: MenuService
    ) {
        this.menuService.onChangePage('Lookups');
        this.loading = true;
        this.dataSourceVehicleCategories = new MatTableDataSource;
        this.dataSourceVehicleTypes = new MatTableDataSource;
        this.dataSourceLoadCategories = new MatTableDataSource;
        this.dataSourceLoadTypes = new MatTableDataSource;
        this.dataSourceLicenceTypes = new MatTableDataSource;
    }

    ngOnInit(): void {
        GlobalConstants.pageSelected = 'Lookups';
        this.subscriptionVehicleCategories = this.vehicleCategoryService.getVehicleCategories().subscribe(list => {
            this.vehicleCategoryList = list;
            this.dataSourceVehicleCategories.data = this.vehicleCategoryList;
            this.dataSourceVehicleCategories.paginator = this.paginatorVehicleCategories;
            this.dataSourceVehicleCategories.sort = this.sortVehicleCategories;
        });
        this.subscriptionVehicleTypes = this.vehicleTypeService.getVehicleTypes().subscribe(list => {
            this.vehicleTypeList = list;
            this.dataSourceVehicleTypes.data = this.vehicleTypeList;
            this.dataSourceVehicleTypes.paginator = this.paginatorVehicleTypes;
            this.dataSourceVehicleTypes.sort = this.sortVehicleTypes;
        });
        this.subscriptionLoadCategories = this.loadCategoryService.getLoadCategories().subscribe(list => {
            this.loadCategoryList = list;
            this.dataSourceLoadCategories.data = this.loadCategoryList;
            this.dataSourceLoadCategories.paginator = this.paginatorLoadCategories;
            this.dataSourceLoadCategories.sort = this.sortLoadCategories;
        });
        this.subscriptionLoadTypes = this.loadTypeService.getLoadTypes().subscribe(list => {
            this.loadTypeList = list;
            this.dataSourceLoadTypes.data = this.loadTypeList;
            this.dataSourceLoadTypes.paginator = this.paginatorLoadTypes;
            this.dataSourceLoadTypes.sort = this.sortLoadTypes;
        });
        this.subscriptionLicenceTypes = this.licenceTypeService.getLicenceTypes().subscribe(list => {
            this.licenceTypeList = list;
            this.dataSourceLicenceTypes.data = this.licenceTypeList;
            this.dataSourceLicenceTypes.paginator = this.paginatorLicenceTypes;
            this.dataSourceLicenceTypes.sort = this.sortLicenceTypes;
        });
    }

    initUpsertVehicleCategory(row: vehicleCategory | null) {
        this.formVehicleCategories = this._formBuilder.group({
            id: [row == null ? undefined : row.id],
            description: [row == null ? null : row.description, Validators.required]
        });

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
            item: row,
            form: this.formVehicleCategories,
            vehicleCategoryList: this.vehicleCategoryList,
            title: row == null ? 'Insert' : 'Update'
        }

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.ariaLabel = 'fffff';
        dialogConfig.width = "800px";
        // dialogConfig.height = "300px";

        const dialogRef = this.dialog.open(DialogVehicleCategoryComponent,
            dialogConfig);


        dialogRef.afterClosed().subscribe(result => {
            if (result !== false) {
                this.loading = true;
                if (row == null) {
                    this.vehicleCategoryService.createVehicleCategory(result).then((apiResult: any) => {
                        // this.getVehicleCategories().then(getVehicleCategoriesResult => {
                        //     this.vehicleCategoryList = getVehicleCategoriesResult;
                        //     this.dataSourceVehicleCategories = new MatTableDataSource(this.vehicleCategoryList);
                        //     setTimeout(() => {
                        //         this.dataSourceVehicleCategories.paginator = this.paginatorVehicleCategories;
                        //         this.dataSourceVehicleCategories.sort = this.sortVehicleCategories;
                        //     }, 100);
                        //     this.loading = false;
                        // });
                    });
                } else {
                    this.vehicleCategoryService.updateVehicleCategories(result).then((apiResult: any) => {
                    });
                    //     this.getVehicleCategories().then(getVehicleCategoriesResult => {
                    //         this.vehicleCategoryList = getVehicleCategoriesResult;
                    //         this.dataSourceVehicleCategories = new MatTableDataSource(this.vehicleCategoryList);
                    //         setTimeout(() => {
                    //             this.dataSourceVehicleCategories.paginator = this.paginatorVehicleCategories;
                    //             this.dataSourceVehicleCategories.sort = this.sortVehicleCategories;
                    //         }, 100);
                    //         this.loading = false;
                    //     });
                    // });
                }
            }
        });
    }
    async initDeleteVehicleCategory(id: any) {
        const cont = await Dialog.confirm({
            title: 'Confirm',
            message: `Are you sure you want to delete this item?`,
        });

        if (cont.value) {
            this.loading = true;
            this.vehicleCategoryService.deleteVehicleCategory(id).then((apiResult: any) => {
                // this.vehicleCategoryList.splice(this.vehicleCategoryList.findIndex(item => item.id === id), 1);
                // this.dataSourceVehicleCategories = new MatTableDataSource(this.vehicleCategoryList);
                // setTimeout(() => {
                //     this.dataSourceVehicleCategories.paginator = this.paginatorVehicleCategories;
                //     this.dataSourceVehicleCategories.sort = this.sortVehicleCategories;
                // }, 100);
                // this.loading = false;
            });
        }
    }
    applyFilterVehicleCategories(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceVehicleCategories.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceVehicleCategories.paginator) {
            this.dataSourceVehicleCategories.paginator.firstPage();
        }
    }

    // getVehicleTypes(): Promise<vehicleType[]> {
    //     var promise = new Promise<vehicleType[]>((resolve) => {
    //         try {
    //             this.apiService.getItems('vehicleTypes').subscribe({
    //                 next: (apiResult: any) => {
    //                     resolve(apiResult);
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
    initUpsertVehicleType(row: vehicleType | null) {
        this.formVehicleTypes = this._formBuilder.group({
            id: [row == null ? undefined : row.id],
            description: [row == null ? null : row.description, Validators.required],
            vehicleCategoryId: [row == null ? null : row.vehicleCategoryId, Validators.required],
            vehicleCategoryDescription: [row == null ? null : row.vehicleCategoryDescription, Validators.required],
            liquid: [row == null ? false : row.liquid]
        });

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
            item: row,
            form: this.formVehicleTypes,
            vehicleCategoryList: this.vehicleCategoryList,
            title: row == null ? 'Insert' : 'Update'
        }

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.ariaLabel = 'fffff';
        dialogConfig.width = "800px";

        const dialogRef = this.dialog.open(DialogVehicleTypeComponent,
            dialogConfig);


        dialogRef.afterClosed().subscribe(result => {
            if (result !== false) {
                this.loading = true;
                if (row == null) {
                    this.vehicleTypeService.createVehicleType(result).then((apiResult: any) => {
                        // this.getVehicleTypes().then(getVehicleTypesResult => {
                        //     this.vehicleTypeList = getVehicleTypesResult;
                        //     this.dataSourceVehicleTypes = new MatTableDataSource(this.vehicleTypeList);
                        //     setTimeout(() => {
                        //         this.dataSourceVehicleTypes.paginator = this.paginatorVehicleTypes;
                        //         this.dataSourceVehicleTypes.sort = this.sortVehicleTypes;
                        //     }, 100);
                        //     this.loading = false;
                        // });
                    });
                } else {
                    this.vehicleTypeService.updateVehicleTypes(result).then((apiResult: any) => {
                        // this.getVehicleTypes().then(getVehicleTypesResult => {
                        //     this.vehicleTypeList = getVehicleTypesResult;
                        //     this.dataSourceVehicleTypes = new MatTableDataSource(this.vehicleTypeList);
                        //     setTimeout(() => {
                        //         this.dataSourceVehicleTypes.paginator = this.paginatorVehicleTypes;
                        //         this.dataSourceVehicleTypes.sort = this.sortVehicleTypes;
                        //     }, 100);
                        //     this.loading = false;
                        // });
                    });
                }
            }
        });
    }
    async initDeleteVehicleType(id: any) {
        const cont = await Dialog.confirm({
            title: 'Confirm',
            message: `Are you sure you want to delete this item?`,
        });

        if (cont.value) {
            this.loading = true;
            this.vehicleTypeService.deleteVehicleType(id).then((apiResult: any) => {
                // this.vehicleTypeList.splice(this.vehicleTypeList.findIndex(item => item.id === id), 1);
                // this.dataSourceVehicleTypes = new MatTableDataSource(this.vehicleTypeList);
                // setTimeout(() => {
                //     this.dataSourceVehicleTypes.paginator = this.paginatorVehicleTypes;
                //     this.dataSourceVehicleTypes.sort = this.sortVehicleTypes;
                // }, 100);
                // this.loading = false;
            });
        }
    }
    applyFilterVehicleTypes(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceVehicleTypes.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceVehicleTypes.paginator) {
            this.dataSourceVehicleTypes.paginator.firstPage();
        }
    }

    // getLoadCategories(): Promise<loadCategory[]> {
    //     var promise = new Promise<loadCategory[]>((resolve) => {
    //         try {
    //             this.apiService.getItems('loadCategories').subscribe((apiResult: any) => {
    //                 resolve(apiResult);
    //             });
    //         } catch (exception) {
    //             resolve([]);
    //         }
    //     });
    //     return promise;
    // }
    initUpsertLoadCategory(row: loadCategory | null) {
        this.formLoadCategories = this._formBuilder.group({
            id: [row == null ? undefined : row.id],
            description: [row == null ? null : row.description, Validators.required]
        });

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
            item: row,
            form: this.formLoadCategories,
            loadCategoryList: this.loadCategoryList,
            title: row == null ? 'Insert' : 'Update'
        }

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.ariaLabel = 'fffff';
        dialogConfig.width = "800px";

        const dialogRef = this.dialog.open(DialogLoadCategoryComponent,
            dialogConfig);


        dialogRef.afterClosed().subscribe(result => {
            if (result !== false) {
                this.loading = true;
                if (row == null) {
                    this.loadCategoryService.createLoadCategory(result).then((apiResult: any) => {
                        // this.getLoadCategories().then(getLoadCategoriesResult => {
                        //     this.loadCategoryList = getLoadCategoriesResult;
                        //     this.dataSourceLoadCategories = new MatTableDataSource(this.loadCategoryList);
                        //     setTimeout(() => {
                        //         this.dataSourceLoadCategories.paginator = this.paginatorLoadCategories;
                        //         this.dataSourceLoadCategories.sort = this.sortLoadCategories;
                        //     }, 100);
                        //     this.loading = false;
                        // });
                    });
                } else {
                    this.loadCategoryService.updateLoadCategories(result).then((apiResult: any) => {
                        // this.getLoadCategories().then(getLoadCategoriesResult => {
                        //     this.loadCategoryList = getLoadCategoriesResult;
                        //     this.dataSourceLoadCategories = new MatTableDataSource(this.loadCategoryList);
                        //     setTimeout(() => {
                        //         this.dataSourceLoadCategories.paginator = this.paginatorLoadCategories;
                        //         this.dataSourceLoadCategories.sort = this.sortLoadCategories;
                        //     }, 100);
                        //     this.loading = false;
                        // });
                    });
                }
            }
        });
    }
    async initDeleteLoadCategory(id: string) {
        const cont = await Dialog.confirm({
            title: 'Confirm',
            message: `Are you sure you want to delete this item?`,
        });

        if (cont.value) {
            this.loading = true;
            this.loadCategoryService.deleteLoadCategory(id).then((apiResult: any) => {
                // this.loadCategoryList.splice(this.loadCategoryList.findIndex(item => item.id === id), 1);
                // this.dataSourceLoadCategories = new MatTableDataSource(this.loadCategoryList);
                // setTimeout(() => {
                //     this.dataSourceLoadCategories.paginator = this.paginatorLoadCategories;
                //     this.dataSourceLoadCategories.sort = this.sortLoadCategories;
                // }, 100);
                // this.loading = false;
            });
        }
    }
    applyFilterLoadCategories(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceLoadCategories.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceLoadCategories.paginator) {
            this.dataSourceLoadCategories.paginator.firstPage();
        }
    }

    // getLoadTypes(): Promise<loadType[]> {
    //     var promise = new Promise<loadType[]>((resolve) => {
    //         try {
    //             this.apiService.getItems('loadTypes').subscribe((apiResult: any) => {
    //                 resolve(apiResult);
    //             });
    //         } catch (exception) {
    //             resolve([]);
    //         }
    //     });
    //     return promise;
    // }
    initUpsertLoadType(row: loadType | null) {
        this.formLoadTypes = this._formBuilder.group({
            id: [row == null ? undefined : row.id],
            description: [row == null ? null : row.description, Validators.required],
            loadCategoryId: [row == null ? null : row.loadCategoryId, Validators.required],
            loadCategoryDescription: [row == null ? null : row.loadCategoryDescription, Validators.required],
            liquid: [row == null ? false : row.liquid]
        });

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
            item: row,
            form: this.formLoadTypes,
            loadCategoryList: this.loadCategoryList,
            title: row == null ? 'Insert' : 'Update'
        }

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.ariaLabel = 'fffff';
        dialogConfig.width = "800px";

        const dialogRef = this.dialog.open(DialogLoadTypeComponent,
            dialogConfig);


        dialogRef.afterClosed().subscribe(result => {
            if (result !== false) {
                this.loading = true;
                if (row == null) {
                    this.loadTypeService.createLoadType(result).then((apiResult: any) => {
                        // this.getLoadTypes().then(getLoadTypesResult => {
                        //     this.loadTypeList = getLoadTypesResult;
                        //     this.dataSourceLoadTypes = new MatTableDataSource(this.loadTypeList);
                        //     setTimeout(() => {
                        //         this.dataSourceLoadTypes.paginator = this.paginatorLoadTypes;
                        //         this.dataSourceLoadTypes.sort = this.sortLoadTypes;
                        //     }, 100);
                        //     this.loading = false;
                        // });
                    });
                } else {
                    this.loadTypeService.updateLoadTypes(result).then((apiResult: any) => {
                        // this.getLoadTypes().then(getLoadTypesResult => {
                        //     this.loadTypeList = getLoadTypesResult;
                        //     this.dataSourceLoadTypes = new MatTableDataSource(this.loadTypeList);
                        //     setTimeout(() => {
                        //         this.dataSourceLoadTypes.paginator = this.paginatorLoadTypes;
                        //         this.dataSourceLoadTypes.sort = this.sortLoadTypes;
                        //     }, 100);
                        //     this.loading = false;
                        // });
                    });
                }
            }
        });
    }
    async initDeleteLoadType(id: string) {
        const cont = await Dialog.confirm({
            title: 'Confirm',
            message: `Are you sure you want to delete this item?`,
        });

        if (cont.value) {
            this.loading = true;
            this.loadTypeService.deleteLoadType(id).then((apiResult: any) => {
                // this.loadTypeList.splice(this.loadTypeList.findIndex(item => item.id === id), 1);
                // this.dataSourceLoadTypes = new MatTableDataSource(this.loadTypeList);
                // setTimeout(() => {
                //     this.dataSourceLoadTypes.paginator = this.paginatorLoadTypes;
                //     this.dataSourceLoadTypes.sort = this.sortLoadTypes;
                // }, 100);
                // this.loading = false;
            });
        }
    }
    applyFilterLoadTypes(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceLoadTypes.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceLoadTypes.paginator) {
            this.dataSourceLoadTypes.paginator.firstPage();
        }
    }

    initUpsertLicenceType(row: licenceType | null) {
        this.formLicenceTypes = this._formBuilder.group({
            id: [row == null ? undefined : row.id],
            code: [row == null ? null : row.code, Validators.required],
            description: [row == null ? null : row.description, Validators.required]
        });

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
            item: row,
            form: this.formLicenceTypes,
            title: row == null ? 'Insert' : 'Update'
        }

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.ariaLabel = 'fffff';
        dialogConfig.width = "800px";

        const dialogRef = this.dialog.open(DialogLicenceTypeComponent,
            dialogConfig);


        dialogRef.afterClosed().subscribe(result => {
            if (result !== false) {
                this.loading = true;
                if (row == null) {
                    this.licenceTypeService.createLicenceType(result).then((apiResult: any) => {
                    });
                } else {
                    this.licenceTypeService.updateLicenceTypes(result).then((apiResult: any) => {
                    });
                }
            }
        });
    }
    async initDeleteLicenceType(id: string) {
        const cont = await Dialog.confirm({
            title: 'Confirm',
            message: `Are you sure you want to delete this item?`,
        });

        if (cont.value) {
            this.loading = true;
            this.licenceTypeService.deleteLicenceType(id).then((apiResult: any) => {
            });
        }
    }
    applyFilterLicenceTypes(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceLicenceTypes.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceLicenceTypes.paginator) {
            this.dataSourceLicenceTypes.paginator.firstPage();
        }
    }

    ngOnDestroy() {
        this.subscriptionVehicleCategories.unsubscribe();
        this.subscriptionVehicleTypes.unsubscribe();
        this.subscriptionLoadCategories.unsubscribe();
        this.subscriptionLoadTypes.unsubscribe();
        this.subscriptionLicenceTypes.unsubscribe();
    }
}
