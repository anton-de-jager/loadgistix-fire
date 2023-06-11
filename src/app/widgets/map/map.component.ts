import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { User } from 'src/app/interfaces/user';
import { directory } from 'src/app/models/directory.model';
import { load } from 'src/app/models/load.model';
import { VariableService } from 'src/app/services/variable.service';
import { SheetLoadDetailsComponent } from 'src/app/sheets/sheet-load-details/sheet-load-details.component';
import { environment } from 'src/environments/environment.dev';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @Input() loadsAvailable: load[] = [];
  @Input() directoryList: directory[] = [];
  @Input() user!: User;
  @Output() select: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('map') mapRef!: ElementRef;
  map!: GoogleMap;

  signal = true;
  loaded = false;
  lat: number = -26.330647;
  lon: number = 28.107455;

  constructor(
    private variableService: VariableService,
    private bottomSheet: MatBottomSheet
  ) {
  }

  ngOnInit() {
  }

  async ngAfterViewInit(): Promise<void> {
    await this.createMap();
    await this.addMarkers();
  }

  async createMap() {
    this.map = await GoogleMap.create({
      id: 'map',
      apiKey: environment.mapsKey,
      element: this.mapRef.nativeElement,
      forceCreate: true,
      config: {
        center: {
          lat: 33.6,
          lng: -117.9,
        },
        zoom: 8,
        //disableDefaultUI: true,
        draggable: false,
        mapTypeControl: false,
        streetViewControl:false        
      },
    });
  }

  async addMarkers() {
    const markers: Marker[] = [
      {
        coordinate: {
          lat: 33.6,
          lng: -117.9,
        },
        title: 'localhost',
        snippet: 'snippet'
      }
    ];

    await this.map.addMarkers(markers);

    this.map.setOnMarkerClickListener(async (marker) => {
      //this.toggleBounce(marker);
      const bootomSheetConfig = new MatBottomSheetConfig();
      bootomSheetConfig.data = {
        title: marker.title,
        snippet: marker.snippet,
        coordinate: { lat: marker.latitude, lon: marker.longitude }
      }

      const bottomSheetRef = this.bottomSheet.open(SheetLoadDetailsComponent, bootomSheetConfig);

      bottomSheetRef.afterDismissed().subscribe(res => {
        //console.log(res);
      })

      //console.log(marker);
    })
  }

  toggleBounce(marker: google.maps.Marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  }

  async getCurrentLocation() {
    this.variableService.checkLocationPermissions(false).then(async permission => {
      this.signal = permission;
      if (permission) {
        this.variableService.getPosition().then(coordinates => {
          this.lat = coordinates!.coords.latitude;
          this.lon = coordinates!.coords.longitude;
          this.loaded = true;
        });
      } else {
        this.variableService.showInfo('ERROR', 'Permission Error', 'Location needs to be enabled for this feature', true).then(showInfoResult => {
          this.loaded = true;
        });
      }
    });

  }
}