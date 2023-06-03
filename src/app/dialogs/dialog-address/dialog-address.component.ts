import { Component, OnInit, AfterViewInit, Inject, ViewEncapsulation } from '@angular/core';
import * as L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Address } from 'src/app/interfaces/address';
import { DialogInfoComponent } from 'src/app/dialogs/dialog-info/dialog-info.component';
import { VariableService } from 'src/app/services/variable.service';
import { NativeGeocoder } from '@capgo/nativegeocoder';

const options: PositionOptions = {
  enableHighAccuracy: true,
  timeout: Infinity,
  maximumAge: 0
};

const iconRetinaUrl = 'assets/images/leaflet/marker-icon-2x.png';
const iconUrl = 'assets/images/leaflet/location_green.png';
const shadowUrl = 'assets/images/leaflet/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl: 'assets/images/leaflet/location_green.png',
  shadowUrl,
  iconSize: [23, 33],
  iconAnchor: [16, 33],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [33, 33]
});
const iconFrom = L.icon({
  iconRetinaUrl,
  iconUrl: 'assets/images/leaflet/truck_green.png',
  shadowUrl,
  iconSize: [33, 33],
  iconAnchor: [16, 33],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [33, 33]
});
const iconTo = L.icon({
  iconRetinaUrl,
  iconUrl: 'assets/images/leaflet/location_red.png',
  shadowUrl,
  iconSize: [23, 32],
  iconAnchor: [12, 32],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [32, 32]
});

@Component({
  selector: 'app-address',
  templateUrl: './dialog-address.component.html',
  styleUrls: ['./dialog-address.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogAddressComponent implements OnInit, AfterViewInit {
  mapsActive = false;
  private map!: L.Map;
  location: Address = { lat: 0, lon: 0, label: '' };
  loaded = false;

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogAddressComponent>,
    private variableService: VariableService,
    ) {
    if (data) {
      this.location.lat = data.lat;
      this.location.lon = data.lon;
      this.location.label = data.label;
      this.loaded = true;
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.initAutocomplete();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [this.location.lat, this.location.lon],
      zoom: 14
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    L.marker(new L.LatLng(this.location.lat, this.location.lon), { icon: iconDefault }).addTo(this.map);
  }

  async current() {
    this.map.remove();
    this.variableService.checkLocationPermissions(true).then(permission => {
      this.mapsActive = permission;
      if (permission) {
        this.variableService.getPosition().then(res => {
          this.location.lat = res!.coords.latitude;
          this.location.lon = res!.coords.longitude;

          let options:any = {
            latitude:this.location.lat,
            longitude:this.location.lon,
            useLocale: true,
            maxResults: 1,
            apiKey: 'AIzaSyDveu3-NKKJ7OKUUGJmPvScWM7AxaSTW7Y'
          };
          NativeGeocoder.reverseGeocode(options)
            .then((result: any) => console.log(JSON.stringify(result[0])))
            .catch((error: any) => console.log(error));


          this.initMap();
          this.initAutocomplete();
        });
      } else {
        this.showInfo('ERROR', 'Permission Error', 'Location needs to be enabled for this feature', false).then(showInfoResult => {
          this.dialogRef.close(null);
        });
      }
    });
    // this.clearWatch();
    // this.getCurrentCoordinate();
    // this.watchPosition();
  }


  showInfo(title: string, alertHeading: string, alertContent: string, stopAction: boolean): Promise<boolean> {
    var promise = new Promise<boolean>((resolve) => {
      try {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          title: title,
          alertHeading: alertHeading,
          alertContent: alertContent,
          stopAction: stopAction
        }

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.ariaLabel = 'fffff';
        dialogConfig.width = "800px";

        const dialogRef = this.dialog.open(DialogInfoComponent,
          dialogConfig);

        if (stopAction) {
          resolve(false);
        } else {
          dialogRef.afterClosed().subscribe((result: boolean | PromiseLike<boolean>) => {
            resolve(result);
          });
        }
      } catch (exception) {
        resolve(false);
      }
    });
    return promise;
  }

  initAutocomplete() {
    const input = document.getElementById("pac-input") as HTMLInputElement;
    var options = {
      componentRestrictions: { country: 'za' }
    };
    const searchBox = new google.maps.places.Autocomplete(input, options);

    searchBox.addListener("place_changed", () => {
      const place = searchBox.getPlace();

      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      this.location.lat = place.geometry.location.lat();
      this.location.lon = place.geometry.location.lng();
      this.location.label = place.formatted_address == undefined ? '' : place.formatted_address;

      L.marker(new L.LatLng(this.location.lat, this.location.lon), { icon: iconDefault }).addTo(this.map);

      setTimeout(() => {
        this.map.fitBounds(L.latLngBounds(new L.LatLng(this.location.lat, this.location.lon), new L.LatLng(this.location.lat, this.location.lon)))
      }, 100);
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
  submit(): void {
    this.dialogRef.close(this.location);
  }
}
