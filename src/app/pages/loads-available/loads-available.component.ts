import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/services/api.service';
import { keyValue } from 'src/app/models/keyValue.model';
import { load } from 'src/app/models/load.model';
import { Observable, Subscription, first } from 'rxjs';
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
import { Preferences } from '@capacitor/preferences';
import { User } from 'src/app/interfaces/user';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { GoogleMap, Marker, Polyline  } from '@capacitor/google-maps';
//import { GoogleMapsPlugin } from '@capacitor-community/google-maps';
import { environment } from 'src/environments/environment.dev';
import { SheetLoadDetailsComponent } from 'src/app/sheets/sheet-load-details/sheet-load-details.component';
import { DirectionsService } from 'src/app/services/directions.service';
import { Point, getCoord } from '@turf/turf';
import { Geolocation } from '@capacitor/geolocation';

const MAX_SIZE: number = 1048576;

// const mapNumbersToObject = (tuple: NumberTuple): google.maps.LatLng => {
//     return {        
//         lng: tuple[0],
//         lat: tuple[1]
//     };
// };

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
export class LoadsAvailableComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    @ViewChild('map', { static: false }) mapRef!: ElementRef;
    map!: GoogleMap;
    mapReady: boolean = false;
    markers: Marker[] = [];
    loadSubscription?: Subscription;
    center!: Point;

    signal = true;
    loaded = false;
    lat: number = -26.330647;
    lon: number = 28.107455;

    loading: boolean = true;
    rangeItems: any[] = [
        { description: '10km', value: 10 },
        { description: '50km', value: 50 },
        { description: '100km', value: 100 },
        { description: '500km', value: 500 },
        { description: 'ALL', value: 100000 },
    ]
    range: number = 50;
    weight: number | null = 50;//null;
    volumeCm: number | null = 50;//null;
    volumeLt: number | null = 50;//null;
    tabIndex: number = 0;

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

    user!: User;
    log: string = '';
    activeLink: string = 'map';
    subscriptionLoads!: Subscription;
    subscriptionLoadCategories!: Subscription;
    subscriptionLoadTypes!: Subscription;
    subscriptionVehicles!: Subscription;
    subscriptionDrivers!: Subscription;

    subscriptionSubMenu: Subscription;
    subMenuSelected: string = '';

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
        private userService: UserService,
        private bottomSheet: MatBottomSheet,
        private changeDetector: ChangeDetectorRef,
        private directionsService: DirectionsService
    ) {
        this.subscriptionSubMenu = this.menuService.subMenu.subscribe(val => this.subMenuSelected = val)

        //console.log('subMenuSelected', menuService.subMenuSelected);
        this.log = 'LOG:';
        this.loading = true;
        this.displayedColumns = this.getDisplayedColumns();//['cud', 'description', 'originatingAddress', 'destinationAddress', 'dateOut', 'weight', 'volumeLt', 'status'];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.mapRef) {
            if (!this.mapReady) {

            }
            //this.mapReady = true;
        }
    }

    ngOnInit(): void {
        //this.getLoads();
        this.getLoadCategories();
        this.getLoadTypes();
        this.getVehicles();
        this.getDrivers();

        // this.menuService.invokeChangeSubMenuFunction.subscribe(res => {
        //     if (res == 'map') {
        //         this.mapReady = false;
        //         this.initMap();
        //     }
        // });

        this.variableService.getPosition().then(pos => {
            this.center = {
                type: 'Point',
                coordinates: [pos?.coords.longitude!, pos?.coords.latitude!]
            };

            this.loadSubscription = this.loadService.getItemsWithinRadius(this.center, this.range).subscribe((filteredItems) => {
                this.updateMarkers(filteredItems);
            });

            this.initializeMap();
        })
    }

    ngOnDestroy() {
        this.loadSubscription?.unsubscribe();
        
        this.subscriptionLoads.unsubscribe();
        this.subscriptionLoadCategories.unsubscribe();
        this.subscriptionLoadTypes.unsubscribe();
        this.subscriptionVehicles!.unsubscribe();
        this.subscriptionDrivers.unsubscribe();

        this.subscriptionSubMenu.unsubscribe();
    }

    async initializeMap() {
        this.map = await GoogleMap.create({
            id: 'map',
            apiKey: environment.mapsKey,
            element: this.mapRef.nativeElement,
            forceCreate: true,
            config: {
                center: {
                    lat: getCoord(this.center)[1],
                    lng: getCoord(this.center)[0]
                },
                zoom: this.range > 50 ? 7 : 5,
                mapTypeControl: false,
                streetViewControl: false,
            },
        });
        this.map.enableClustering(4);
        this.mapReady = true;
    }

    updateMarkers(items: load[]) {
        this.clearMarkers();

        items.forEach((item) => {
            // const markers: Marker[] = [
            //     {
            //         coordinate: {
            //             lat: getCoord(item!.originatingCoordinates!)[1],
            //             lng: getCoord(item!.originatingCoordinates!)[0]
            //         },
            //         title: 'localhost',
            //         snippet: 'snippet',
            //         draggable: false
            //     }
            // ];

            // var marker = new google.maps.Marker({
            //     position: { lat: getCoord(item!.originatingCoordinates!)[1], lng: getCoord(item!.originatingCoordinates!)[0] },
            //     icon: '/assets/images/leaflet/truck_green.png',
            //     draggable: false,
            //     title: item.description,
            //     animation: google.maps.Animation.DROP,
            // });



            const markerOptions: Marker = {
                coordinate: {
                    lat: getCoord(item!.originatingCoordinates!)[1],
                    lng: getCoord(item!.originatingCoordinates!)[0]
                },
                iconUrl: '/assets/images/leaflet/truck_green.png',
                draggable: false,
                title: item.description
            };

            const marker = this.map.addMarker(markerOptions);
            this.markers.push(markerOptions);
        });
    }

    clearMarkers() {
        this.markers.forEach((marker) => {
        //    this.removeMarker(marker);
        //    this.map.removeMarker(marker.);
        });

        this.markers = [];
    }

    async ngAfterViewInit(): Promise<void> {
        // this.initMap();
    }

    // async initMap() {
    //     if (this.mapRef) {
    //         if (!this.mapReady) {
    //             await this.createMap();
    //             await this.addMarkers();
    //             this.mapReady = true;
    //         }
    //     } else {
    //         setTimeout(async () => {
    //             this.initMap();
    //         }, 100);
    //     }
    // }

    // async createMap() {
    //     this.map = await GoogleMap.create({
    //         id: 'map',
    //         apiKey: environment.mapsKey,
    //         element: this.mapRef.nativeElement,
    //         forceCreate: true,
    //         config: {
    //             center: {
    //                 lat: this.lat,
    //                 lng: this.lon,
    //             },
    //             zoom: this.range > 50 ? 7 : 5,
    //             mapTypeControl: false,
    //             streetViewControl: false,
    //         },
    //     });
    //     this.map.enableClustering(4);
    //     this.mapReady = true;
    // }

    // async addMarkers() {
    //     this.changeDetector.detectChanges();
    //     if (this.mapReady) {
    //         // const markers: Marker[] = [
    //         //     {
    //         //         coordinate: {
    //         //             lat: this.lat,
    //         //             lng: this.lon,
    //         //         },
    //         //         title: 'localhost',
    //         //         snippet: 'snippet',
    //         //         draggable: false
    //         //     }
    //         // ];

    //         // var marker = new google.maps.Marker({
    //         //     position: { lat: this.lat, lng: this.lon },
    //         //     icon: '/assets/images/leaflet/truck_green.png',
    //         //     draggable: false,
    //         //     animation: google.maps.Animation.DROP,
    //         // });
    //         // //markers.push(marker);

    //         // await this.map.addMarkers(markers);

    //     }
    // }

    toggleBounce(marker: google.maps.Marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

    // getLoads() {
    //     /*
    //     Preferences.get({ key: 'user' }).then(user => {
    //         this.user = JSON.parse(user!.value!) as User;
    //         this.variableService.getPosition().then(res => {
    //             this.tabIndex = 0;
    //             let position: L.LatLng = new L.LatLng(res?.coords.latitude!, res?.coords.longitude!);
    //             this.subscriptionLoads = this.loadService.getLoadsFilter(position, this.range, this.weight!, this.volumeCm!, this.volumeLt!, this.user.role!).subscribe((loadList: load[]) => {

    //                 if (this.subMenuSelected == 'map') {
    //                     this.getDirections();
    //                 }
    //                 this.loadList = loadList;
    //                 this.dataSource = new MatTableDataSource(this.loadList);
    //                 this.dataSource.paginator = this.paginatorLoad;
    //                 this.dataSource.sort = this.sortLoad;
    //             });
    //         });
    //     });
    //     */
    // }

    async getDirections(): Promise<any[] | undefined> {
        if (this.loadList.length > 0) {
            this.loadList.forEach((load) => {
                let from = load.originatingCoordinates! ?? 0;
                let to = load.destinationCoordinates!.coordinates ?? 0;
                if (getCoord(from)[1] == 0 || getCoord(from)[0] == 0 || getCoord(to)[1] == 0 || getCoord(to)[0] == 0) {
                    return [];
                } else {
                    this.directionsService.get({ lat: getCoord(from)[1], lon: getCoord(from)[0] }, { lat: getCoord(to)[1], lon: getCoord(to)[0] }).then(async (directions: any) => {
                        await this.drawRoute(directions.features[0].geometry.coordinates, load)
                        return [];
                    }, err => {
                        return [];
                    });
                }
                return [];
            });
        } else {
            return [];
        }
        return [];
        this.map.getMapBounds().then((mapBounds) => {
        });
    }

    async drawRoute(coordinates: any[], load: load) {
        let latlngList: any[] = [];
        let coordinatesList: google.maps.MVCArray<google.maps.LatLng> = new google.maps.MVCArray<google.maps.LatLng>();
        coordinates.forEach((x) => {
            coordinatesList.push(new google.maps.LatLng(x[1], x[0]));
            latlngList.push({ lat: x[1], lng: x[0] });
        });

        var markerStart: Marker = {
            coordinate: {
                lat: coordinates[0][1],
                lng: coordinates[0][0],
            },
            title: 'localhost',
            snippet: 'snippet',
            draggable: false,
            iconUrl: '/assets/images/icons/map/destination-' + this.getColor(load.status!).description + '.png',
            iconSize: { width: 36, height: 48 },
            iconAnchor: { x: 18, y: 48 }
        }
        var markerEnd: Marker = {
            coordinate: {
                lat: coordinates[coordinates.length - 1][1],
                lng: coordinates[coordinates.length - 1][0],
            },
            title: 'localhost',
            snippet: 'snippet',
            draggable: false,
            iconUrl: '/assets/images/icons/map/origin-' + this.getColor(load.status!).description + '.png',
            iconSize: { width: 36, height: 48 },
            iconAnchor: { x: 6, y: 48 }
        }
        this.map.setOnMarkerClickListener(async (marker) => {
            this.initinitUpsert(load.id!);
            // const bootomSheetConfig = new MatBottomSheetConfig();
            // bootomSheetConfig.data = {
            //     title: marker.title,
            //     snippet: load.id,
            //     coordinate: { lat: marker.latitude, lon: marker.longitude }
            // }

            // const bottomSheetRef = this.bottomSheet.open(SheetLoadDetailsComponent, bootomSheetConfig);

            // bottomSheetRef.afterDismissed().subscribe(id => {
            //     console.log(id);
            // })
        });

        await this.map.addMarker(markerStart);
        setTimeout(async () => {
            await this.map.addMarker(markerEnd);
        }, 500);

        // let path1: google.maps.LatLng[] = coordinates.map((tuple: [number, number]) => {
        //     return new google.maps.LatLng(tuple[0], tuple[1]);
        //   });
        // let path: google.maps.LatLng[] = coordinates.map((tuple: [number, number]) => {
        //     return new google.maps.LatLng(tuple[0], tuple[1]);
        //   });
        setTimeout(async () => {
            const lines: Polyline[] = [
                {
                    path: latlngList,
                    strokeColor: this.getColor(load.status!).value,
                    strokeWeight: 5,
                    geodesic: true,
                    draggable: false,
                    editable: false,
                    tag: load.id
                },
            ]
            const result = await this.map.addPolylines(lines);
            this.map.setOnPolylineClickListener(lineClicked => {
                this.initinitUpsert(load.id!);
                //console.log(lineClicked);
            })
        }, 100);
    }

    getColor(status: string): { description: string, value: string } {
        switch (status) {
            case 'Open':
                return { description: 'blue', value: 'blue' };
            //return { description: 'blue', value: '#5DB1DE' };
            case 'Bids':
                return { description: 'green', value: 'green' };
            //return { description: 'orange', value: '#F8A407' };
            case 'Accepted':
                return { description: 'red', value: 'red' };
            //return { description: 'green', value: '#00FF00' };
            case 'En-Route':
                return { description: 'red', value: 'red' };
            //return { description: 'red', value: '#FF0000' };
            default:
                return { description: 'blue', value: 'blue' };
                return { description: 'blue', value: '#283593' };
        }
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

    initinitUpsert(id: string) {
        this.initUpsert(this.loadList.find(x => x.id === id), 1);
    }
    //initUpsert(row, 1)

    @HostListener('window:resize', ['$event'])
    getScreenSize(event?: any) {
        this.displayedColumns = this.getDisplayedColumns();
    }
    getDisplayedColumns() {
        return window.innerWidth > 800 ? ['cud', 'description', 'originatingAddress', 'destinationAddress', 'dateOut', 'weight', 'volumeCm', 'volumeLt', 'status'] : ['cud', 'description', 'destinationAddress', 'dateOut', 'status'];
    }

    getLoadTypes() {
        this.subscriptionLoadTypes = this.loadTypeService.getLoadTypes().subscribe(loadTypeList => {
            this.loadTypeList = loadTypeList;
        });
    }
    getLoadCategories() {
        this.subscriptionLoadCategories = this.loadCategoryService.loadCategories$.subscribe(loadCategoryList => {
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
                originatingAddress: [{ value: row == null ? null : row == null ? null : row.originatingAddress, disabled: readOnly == 1 }, Validators.required],
                originatingCoordinates: [{ value: row == null ? null : row == null ? null : row.originatingCoordinates, disabled: readOnly == 1 }, Validators.required],
                destinationAddress: [{ value: row == null ? null : row == null ? null : row.destinationAddress, disabled: readOnly == 1 }, Validators.required],
                destinationCoordinates: [{ value: row == null ? null : row == null ? null : row.destinationCoordinates, disabled: readOnly == 1 }, Validators.required],
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
                originatingAddress: row == null ? null : row.originatingAddress,
                originatingCoordinates: row == null ? null : row.originatingCoordinates,
                destinationAddress: row == null ? null : row.destinationAddress,
                destinationCoordinates: row == null ? null : row.destinationCoordinates,
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

    viewImage(avatar: string) {
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

type NumberTuple = [number, number];