import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ApiService } from 'src/app/services/api.service';
import { directory } from 'src/app/models/directory.model';
import { directoryCategory } from 'src/app/models/directoryCategory.model';

import { first } from 'rxjs';
import { DialogDirectoryComponent } from 'src/app/dialogs/dialog-directory/dialog-directory.component';
import { VariableService } from 'src/app/services/variable.service';
import { ActivatedRoute, Router } from '@angular/router';

import { HttpEventType } from '@angular/common/http';
import { user } from 'src/app/models/user.model';
// import { DialogPaypalComponent } from 'src/app/dialogs/dialog-paypal/dialog-paypal.component';
import { Dialog } from '@capacitor/dialog';
import { GlobalConstants } from 'src/app/shared/global-constants';
//import {promises as fs} from 'fs';
import { Subscription } from 'rxjs';
import { MenuService } from 'src/app/services/menu.service';

@Component({
    selector: 'directories',
    templateUrl: './directories.component.html',
    styleUrls: ['./directories.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DirectoriesComponent implements OnInit, OnDestroy {
    timestamp: number = 0;
    loading: boolean;
    form!: FormGroup;
    directoryCategoryList: directoryCategory[] = [];
    directoryList: directory[] = [];
    user!: user;

    displayedColumns: string[];
    dataSource!: MatTableDataSource<directory>;
    @ViewChild(MatPaginator, { static: false }) paginatorDirectory!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sortDirectory!: MatSort;

    deleteform!: FormGroup;

    quantity: number = Number(localStorage.getItem('directoryQuantity')!.toString() == '-1' ? 1 : localStorage.getItem('directoryQuantity'));

    subscriptionDirectories!: Subscription;

    constructor(
        private dialog: MatDialog,
        private _formBuilder: FormBuilder,
        private apiService: ApiService,
        private _snackBar: MatSnackBar,
        public variableService: VariableService,
        private _router: Router,
        
        
        private route: ActivatedRoute,
        private menuService: MenuService
    ) {
        this.menuService.onChangePage('Adverts');
        this.dataSource = new MatTableDataSource;
        this.user = JSON.parse(localStorage.getItem('user')!);
        this.loading = true;
        this.displayedColumns = ['cud', 'companyName', 'directoryCategoryDescription', 'status'];
    }

    ngOnInit(): void {
        this.menuService.onChangePage('Directory');
        this.route.queryParams.subscribe(params => {
            if (params['action'] == 'return') {
                //console.log('now');
            }
        });

        this.getDirectoryCategories().then(getDirectoryCategoriesResult => {
            this.directoryCategoryList = getDirectoryCategoriesResult;
            this.getDirectories().then(getDirectoryResult => {
                GlobalConstants.pageSelected = 'Directory';
                this.directoryList = getDirectoryResult;
                this.dataSource = new MatTableDataSource(this.directoryList);
                this.loading = false;
            });
        });

    }

    showPaypal() {
        
        this.loading = false;
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = { page: 'directory' };

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

    getDirectories(): Promise<directory[]> {
        var promise = new Promise<directory[]>((resolve) => {
            try {
                this.apiService.getItems('directories').subscribe((apiResult: any) => {
                    resolve(apiResult);
                });
            } catch (exception) {
                resolve([]);
            }
        });
        return promise;
    }

    getDirectoryCategories(): Promise<directoryCategory[]> {
        var promise = new Promise<directoryCategory[]>((resolve) => {
            try {
                this.apiService.getItems('directoryCategories').subscribe((apiResult: any) => {
                    resolve(apiResult);
                });
            } catch (exception) {
                resolve([]);
            }
        });
        return promise;
    }

    initUpsert(row:any) {
        if (1 == 1 || this.dataSource.data.length < this.quantity || this.quantity === -1 || row !== null) {
            this.form = this._formBuilder.group({
                
                userId: [row == null ? localStorage.getItem('userId') : row.userId],
                directoryCategoryId: [row == null ? null : row.directoryCategoryId, Validators.required],
                companyName: [row == null ? null : row.companyName, Validators.required],
                description: [row == null ? null : row.description, Validators.required],
                email: [row == null ? null : row.email, Validators.required],
                phone: [row == null ? null : row.phone, Validators.required],
                website: [row == null ? null : row.website, Validators.required],
                instagram: [row == null ? null : row.instagram],
                facebook: [row == null ? null : row.facebook],
                twitter: [row == null ? null : row.twitter],
                addressLat: [row == null ? null : row.addressLat, Validators.required],
                addressLon: [row == null ? null : row.addressLon, Validators.required],
                addressLabel: [row == null ? null : row.addressLabel, Validators.required],
                avatar: [row == null ? null : row.avatar],
                avatarChanged: [false],
                fileToUpload: [null],
                status: [row == null ? 'Active' : row.status]
            });

            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = {
                item: row,
                form: this.form,
                directoryCategoryList: this.directoryCategoryList,
                title: row == null ? 'Insert' : 'Update'
            }

            dialogConfig.autoFocus = true;
            dialogConfig.disableClose = true;
            dialogConfig.hasBackdrop = true;
            dialogConfig.ariaLabel = 'fffff';
            dialogConfig.width = "800px";

            const dialogRef = this.dialog.open(DialogDirectoryComponent,
                dialogConfig);

            dialogRef.afterClosed().subscribe(result => {
                if (result !== false) {
                    this.loading = true;
                    if (row == null) {
                        this.apiService.createItem('directories', result).then((apiResult: any) => {
                            if (apiResult.id != '00000000-0000-0000-0000-000000000000' && result.fileToUpload) {
                                this.uploadFile(result.fileToUpload, apiResult.id + '.' + result.fileToUpload.name.split('.').pop()).then(x => {
                                    apiResult.avatar = '.' + result.fileToUpload.name.split('.').pop();
                                    this.directoryList.push(apiResult);
                                    this.dataSource = new MatTableDataSource(this.directoryList);
                                    this.loading = false;
                                    this.timestamp = new Date().getTime();
                                });
                            } else {
                                this.directoryList.push(apiResult);
                                this.dataSource = new MatTableDataSource(this.directoryList);
                                this.loading = false;
                            }
                        });
                    } else {
                        this.apiService.updateItem('directories', result).then((apiResult: any) => {
                            if (apiResult.id != '00000000-0000-0000-0000-000000000000' && result.fileToUpload) {
                                this.uploadFile(result.fileToUpload, apiResult.id + '.' + result.fileToUpload.name.split('.').pop()).then(x => {
                                    apiResult.avatar = '.' + result.fileToUpload.name.split('.').pop();
                                    let objIndex = this.directoryList.findIndex(x => x.id === row.id);
                                    this.directoryList[objIndex] = apiResult;
                                    this.dataSource = new MatTableDataSource(this.directoryList);
                                    this.loading = false;
                                    this.timestamp = new Date().getTime();
                                });
                            } else {
                                let objIndex = this.directoryList.findIndex(x => x.id === row.id);
                                this.directoryList[objIndex] = apiResult;
                                this.dataSource = new MatTableDataSource(this.directoryList);
                                this.loading = false;
                            }
                        });
                    }
                }
            });
        } else {
            this.showPaypal();
        }
    }
    
    // async initDelete(id: any, avatar: string) {
    //     const cont = await Dialog.confirm({
    //         title: 'Confirm',
    //         message: `Are you sure you want to delete this item?`,
    //     });

    //     if (cont.value) {
    //         this.loading = true;
    //         this.driverService.deleteDriver(id).then((apiResult: any) => {
    //             this.driverList.splice(this.driverList.findIndex(item => item.id === id), 1);
    //             this.dataSource = new MatTableDataSource(this.driverList);
    //             this.loading = false;
    //         });
    //     }
    // }
    async initDelete(id: any, avatar:string) {
        const cont = await Dialog.confirm({
            title: 'Confirm',
            message: `Are you sure you want to delete this item?`,
        });

        if (cont.value) {
                this.loading = true;
                this.apiService.deleteItem('directories', id, avatar).then((apiResult: any) => {
                    this.directoryList.splice(this.directoryList.findIndex(item => item.id === id), 1);
                    this.dataSource = new MatTableDataSource(this.directoryList);
                    this.loading = false;
                });
            }
    }

    uploadFile(fileToUpload: string | Blob, filename: string): Promise<boolean> {
        var promise = new Promise<boolean>((resolve) => {
            try {
                // const formData = new FormData();
                // formData.append('file', fileToUpload);
                // this.apiService.upload('directories', formData, filename).subscribe(event => {
                //     if (event.type === HttpEventType.Response) {
                        resolve(true);
                //     }
                // })
            } catch (exception) {
                resolve(false);
            }
        });
        return promise;
    }

    getAddressSubstring(str: string, char: string) {
        let arr = str.split(char);
        return arr.length > 1 ? arr[0] + ',' + arr[1] : str;
    }

    ngOnDestroy() {
        // this.subscriptionLicenseTypes.unsubscribe();
        // this.subscriptionDrivers.unsubscribe();
    }
}
