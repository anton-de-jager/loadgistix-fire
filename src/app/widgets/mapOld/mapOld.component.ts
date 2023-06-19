import { Component, OnInit, AfterViewInit, Inject, Input, EventEmitter, Output, OnChanges, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import {
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { load } from 'src/app/models/load.model';
import { directory } from 'src/app/models/directory.model';
import { Capacitor } from '@capacitor/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { VariableService } from 'src/app/services/variable.service';
import { Position } from '@capacitor/geolocation';
import { LoadService } from 'src/app/pages/loads/loads.service';
import { Observable, catchError, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.dev';
// import { MapDirectionsService } from 'src/app/services/map-directions-service';
import { MenuService } from 'src/app/services/menu.service';
import { Preferences } from '@capacitor/preferences';
import { User } from 'src/app/interfaces/user';


// const options: PositionOptions = {
//     enableHighAccuracy: true,
//     timeout: 25000,
//     maximumAge: 0
// };

// const iconRetinaUrl = 'assets/images/leaflet/marker-icon-2x.png';
// const iconUrl = 'assets/images/leaflet/location_green.png';
// const shadowUrl = 'assets/images/leaflet/marker-shadow.png';
// const iconDefault = L.icon({
//     iconRetinaUrl,
//     iconUrl: 'assets/images/leaflet/location_green.png',
//     shadowUrl,
//     iconSize: [33, 43],
//     iconAnchor: [16, 43],
//     shadowAnchor: [12, 53],
//     popupAnchor: [1, -34],
//     tooltipAnchor: [16, -28],
//     shadowSize: [43, 53]
// });
// const iconFrom = L.icon({
//     iconRetinaUrl,
//     iconUrl: 'assets/images/leaflet/truck_green.png',
//     shadowUrl,
//     iconSize: [33, 33],
//     iconAnchor: [16, 33],
//     popupAnchor: [1, -34],
//     tooltipAnchor: [16, -28],
//     shadowSize: [33, 33]
// });
// const iconTo = L.icon({
//     iconRetinaUrl,
//     iconUrl: 'assets/images/leaflet/location_red.png',
//     shadowUrl,
//     iconSize: [23, 32],
//     iconAnchor: [12, 32],
//     popupAnchor: [1, -34],
//     tooltipAnchor: [16, -28],
//     shadowSize: [32, 32]
// });

@Component({
    selector: 'app-mapOld',
    templateUrl: './mapOld.component.html',
    styleUrls: ['./mapOld.component.scss']
})

export class MapOldComponent implements OnInit, AfterViewInit, OnChanges {
    // private map!: L.Map;
    @Input() loadsAvailable: load[] = [];
    @Input() directoryList: directory[] = [];
    @Input() user!: User;
    @Output() select: EventEmitter<any> = new EventEmitter<any>();

    // apiLoaded!: Observable<boolean>;
    zoom = 5;
    signal = true;    
    markers = [];
    infoContent = '';

    // imageBoundsLeft: google.maps.LatLngBoundsLiteral = {
    //     north: -20,
    //     south: -40,
    //     east: 10,
    //     west: -10,
    // };
    // imageBoundsNotPaid: google.maps.LatLngBoundsLiteral = {
    //     north: -20,
    //     south: -40,
    //     east: 35,
    //     west: 15,
    // };
    // imageBoundsRight: google.maps.LatLngBoundsLiteral = {
    //     north: -20,
    //     south: -40,
    //     east: 60,
    //     west: 40,
    // };
    // directionService: google.maps.DirectionsService = new google.maps.DirectionsService();
    // directionDisplays: google.maps.DirectionsRenderer[] = [];

    // message = '';

    constructor(
        private dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private loadService: LoadService,
        private variableService: VariableService,
        private httpClient: HttpClient,
        private menuService: MenuService,
    ) {
        navigator.geolocation.getCurrentPosition((position) => {
            // this.center = {
            //     lat: position.coords.latitude,
            //     lng: position.coords.longitude,
            // };
        });

        // this.menuService.invokeChangeMapFunction.subscribe(x => {
        //     this.initMap();
        // });
        // this.apiLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=' + environment.googleMapsApi, 'callback')
        //     .pipe(
        //         map(() => true),
        //         catchError(() => of(false)),
        //     );
    }

    ngOnChanges() {
        // this.iLoaded = 0;
        this.initMap();
        //console.log('ngOnChanges');
    }

    alert(str:string){
        this.alert(str);
    }

    requestPermission() {
        if (Capacitor.getPlatform() !== 'web') {
            this.variableService.requestPermission().then(location => {
                if (location == 'granted') {
                    this.signal = true;
                }
            });
        }
    }
    // async getCurrentLocation() {
    //     this.variableService.checkLocationPermissions(false).then(async permission => {
    //         this.signal = permission;
    //         if (permission) {
    //             this.variableService.getPosition().then(coordinates => {
    //                 // this.message += '<ul><li>lat: ' + coordinates!.coords.latitude + '</li><li>lon: ' + coordinates!.coords.longitude + '</li></ul>'
    //                 this.center.lat = coordinates!.coords.latitude;
    //                 this.center.lng = coordinates!.coords.longitude;
    //                 // this.loaded = true;
    //             });
    //         } else {
    //             // //this.variableService.showInfo('ERROR', 'Permission Error', 'Location needs to be enabled for this feature', true).then(showInfoResult => {
    //             // this.loaded = true;
    //             // this.initMap();
    //             // //});
    //         }
    //     });

    // }

    // calcRoute(start: google.maps.LatLngLiteral, end: google.maps.LatLngLiteral) {
    //     var request = {
    //         origin: start,
    //         destination: end,
    //         travelMode: google.maps.DirectionsTravelMode
    //       };
    //       this.mapDirectionsService.route(request, function (response: any, status: google.maps.DirectionsStatus) {
    //         if (status === google.maps.DirectionsStatus.OK) {
    //           directionsDisplay.setDirections(response);
    //           directionsDisplay.setMap($scope.map.control.getGMap());
    //           directionsDisplay.setPanel(document.getElementById('directionsList'));
    //           $scope.directions.showList = true;
    //         } else {
    //           alert('Google route unsuccesfull!');
    //         }
    //       });
    // });
    // }
    /*
        waitingForCurrentPosition = false;
        currentPos!: Position;
        async getCurrentPos() {
            try {
                this.variableService.checkLocationPermissions(false).then(async permission => {
                    this.signal = permission;
                    if (permission) {
                        this.waitingForCurrentPosition = true;
                        this.variableService.getPosition().then(position => {
                            this.currentPos = position!;
                            (this.currentPos);
                        });
                    } else {
                        //this.variableService.showInfo('ERROR', 'Permission Error', 'Location needs to be enabled for this feature', false).then(showInfoResult => { });
                    }
                });
            } catch (err) {
                console.error('Failed to get current position.', err);
            } finally {
                this.waitingForCurrentPosition = false;
            }
        }
     
        async getCurrentLocation() {
            this.variableService.checkLocationPermissions(false).then(async permission => {
                this.signal = permission;
                if (permission) {
                    this.variableService.getPosition().then(coordinates => {
                        this.message += '<ul><li>lat: ' + coordinates!.coords.latitude + '</li><li>lon: ' + coordinates!.coords.longitude + '</li></ul>'
                        this.lat = coordinates!.coords.latitude;
                        this.lon = coordinates!.coords.longitude;
                        this.loaded = true;
                        this.initMap();
                    });
                } else {
                    //this.variableService.showInfo('ERROR', 'Permission Error', 'Location needs to be enabled for this feature', true).then(showInfoResult => {
                    this.loaded = true;
                    this.initMap();
                    //});
                }
            });
     
        }
     
        private initMap(): void {
            if (this.loaded && this.mapReady && this.iLoaded < 100) {
                if (this.map) {
                    this.map.off();
                    this.map.remove();
                }
     
                this.map = L.map('map', {
                    center: [this.lat, this.lon],
                    zoom: 14
                });
     
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 18,
                    minZoom: 3,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(this.map);
     
                const planOptions: L.Routing.PlanOptions = {
                    addWaypoints: false,
                    draggableWaypoints: false,
                    routeWhileDragging: false
                    // createMarker: function () { return null; },
                    // createGeocoderElement: function () { return null; },
                    // createGeocoder: function () { return null; }
                };
     
                var minlat = 200, minlon = 200, maxlat = -200, maxlon = -200;
                this.loadsAvailable.forEach(loadItem => {
     
     
                    //if (!loadItem.coordinates) {
                    let plan = new L.Routing.Plan([
                        new L.LatLng(loadItem.originatingCoordinates!, loadItem.originatingAddressLon!),
                        new L.LatLng(loadItem.destinationCoordinates!, loadItem.destinationAddressLon!)
                    ], planOptions);
                    let control = L.Routing.control({
                        router: L.Routing.osrmv1({
                            serviceUrl: `https://router.project-osrm.org/route/v1/`,
                            useHints: false
                        },
                        ),
                        addWaypoints: false,
                        routeWhileDragging: false,
                        collapsible: false,
                        showAlternatives: false,
                        fitSelectedRoutes: false,
                        show: false,
                        plan,
                        lineOptions: {
                            extendToWaypoints: false,
                            missingRouteTolerance: 1,
                            addWaypoints: false,
                            styles: [
                                { color: '#5db1de', opacity: 0.8, weight: 5 }
                            ]
                        }
                    }).addTo(this.map);
     
                    //     control.on('routesfound', (e) => {
                    //         console.log(e);
                    //         let routes = e.routes;
                    //         let route = routes[0];
     
                    //         loadItem.coordinates = JSON.stringify(route.coordinates);
                    //         this.loadService.updateLoads(loadItem);
                    //     });
                    // } else {
                    //     console.log('getting data from');
                    //     L.polyline(JSON.parse(loadItem.coordinates), { color: 'green' }).addTo(this.map);
                    // }
                    // console.log('control', control);
                    // control.addTo(this.map!).getContainer()!.style.display = "None";
     
                    if (minlat > loadItem!.originatingCoordinates!) minlat = loadItem.originatingCoordinates ?? 0;
                    if (minlon > loadItem.originatingAddressLon!) minlon = loadItem.originatingAddressLon ?? 0;
                    if (maxlat < loadItem.originatingCoordinates!) maxlat = loadItem.originatingCoordinates ?? 0;
                    if (maxlon < loadItem.originatingAddressLon!) maxlon = loadItem.originatingAddressLon ?? 0;
     
                    if (minlat > loadItem.destinationCoordinates!) minlat = loadItem.destinationCoordinates ?? 0;
                    if (minlon > loadItem.destinationAddressLon!) minlon = loadItem.destinationAddressLon ?? 0;
                    if (maxlat < loadItem.destinationCoordinates!) maxlat = loadItem.destinationCoordinates ?? 0;
                    if (maxlon < loadItem.destinationAddressLon!) maxlon = loadItem.destinationAddressLon ?? 0;
     
                    L.marker(new L.LatLng(loadItem.originatingCoordinates!, loadItem.originatingAddressLon!), { icon: iconFrom }).addTo(this.map).on('click', () => {
                        this.select.emit(loadItem);
                    });
                    L.marker(new L.LatLng(loadItem.destinationCoordinates!, loadItem.destinationAddressLon!), { icon: iconTo }).addTo(this.map).on('click', () => {
                        this.select.emit(loadItem);
                    });
                });
     
                this.directoryList.forEach(loadItem => {
                    if (minlat > loadItem.addressLat!) minlat = loadItem.addressLat!;
                    if (minlon > loadItem.addressLon!) minlon = loadItem.addressLon!;
                    if (maxlat < loadItem.addressLat!) maxlat = loadItem.addressLat!;
                    if (maxlon < loadItem.addressLon!) maxlon = loadItem.addressLon!;
     
                    // L.marker(new L.LatLng(loadItem.addressLat!, loadItem.addressLon!), { icon: iconDefault }).addTo(this.map).on('click', () => {
                    //     this.select.emit(loadItem);
                    // });
                });
     
                setTimeout(() => {
                    this.map.fitBounds(L.latLngBounds(new L.LatLng(minlat, minlon), new L.LatLng(maxlat, maxlon)))
                }, 100);
            } else {
                setTimeout(() => {
                    this.iLoaded++;
                    this.initMap();
                }, 500);
            }
        }
    */
    ngOnInit(): void {
        // this.getCurrentLocation();
    }

    getColor(status: string): string {
        switch (status) {
            case 'Open':
                return '#5DB1DE';
            case 'Bids':
                return '#F8EC07';
            case 'Accepted':
                return '#00FF00';
            case 'En-Route':
                return '#FF0000';
            default:
                return '#283593';
        }
    }

    initMap() {
        this.resetMap();
        console.log('loadsAvailable', this.loadsAvailable);
        // this.loadsAvailable.forEach(load => {
        //     this.directionService = new google.maps.DirectionsService();
        //     this.directionService.route({
        //         destination: {
        //             lat: Number(load.destinationCoordinates),
        //             lng: Number(load.destinationAddressLon)
        //         },
        //         origin: {
        //             lat: Number(load.originatingCoordinates),
        //             lng: Number(load.originatingAddressLon)
        //         },
        //         travelMode: google.maps.TravelMode.DRIVING
        //     }, (response, status) => {
        //         if (status === 'OK') {
        //             let route: google.maps.DirectionsRenderer = new google.maps.DirectionsRenderer({ polylineOptions: { strokeColor: this.getColor(load!.status!) } });
        //             route.setDirections(response);
        //             route.setMap(this.map!.googleMap!);
        //             route.addListener('click', () => {
        //                 console.log('click', load);
        //                 this.select.emit(load);
        //             });
        //         } else {
        //             window.alert('Directions request failed due to ' + status);
        //         }
        //     });
        // });
    }

    ngAfterViewInit(): void {
        this.initMap();
        // // this.mapReady = true;
        // console.log('loadsAvailable', this.loadsAvailable);
        // this.loadsAvailable.forEach(load => {
        //     const request: google.maps.DirectionsRequest = {
        //         destination: {
        //             lat: Number(load.destinationCoordinates),
        //             lng: Number(load.destinationAddressLon)
        //         },
        //         origin: {
        //             lat: Number(load.originatingCoordinates),
        //             lng: Number(load.originatingAddressLon)
        //         },
        //         travelMode: google.maps.TravelMode.DRIVING
        //     };
        //     this.directionsResults$ = this.mapDirectionsService.route(request).pipe(map(response => response.result));
        // });
    }

    resetMap() {
        // if (this.map) {
        //     console.log('getControls',);
        //     if (this.map.googleMap) {
        //         // this.map.data.getControls()!.forEach(element => {
        //         //     console.log(element);
        //         // });
        //     }
        //     // this.map.googleMap = new google.maps.Map(document.getElementById('map')!, {
        //     //     zoom: this.zoom,
        //     //     center: this.center,
        //     // });
        // }
    }

    click(event: any) {
        console.log(event);
    }

    // addMarker() {
    //     this.markers.push({
    //         position: {
    //             lat: (this.center.lat + ((Math.random() - 0.5) * 2) / 10) ?? 0,
    //             lng: (this.center.lng + ((Math.random() - 0.5) * 2) / 10) ?? 0,
    //         },
    //         label: {
    //             color: 'red' ?? '',
    //             text: 'Marker label ' + (this.markers.length + 1) ?? '',
    //         },
    //         title: 'Marker title ' + (this.markers.length + 1) ?? '',
    //         info: 'Marker info ' + (this.markers.length + 1) ?? '',
    //         options: {
    //             animation: google.maps.Animation.BOUNCE,
    //         },
    //     });
    // }

}