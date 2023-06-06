import { Component, OnInit, ViewChild } from '@angular/core';
import { MapDirectionsService, MapGeocoder, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { Observable, map } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss']
})
export class GoogleMapComponent implements OnInit {
  display: any;
  center: google.maps.LatLngLiteral = {
    lat: 24,
    lng: 12
  };
  zoom = 4;
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;

  readonly directionsResults$: Observable<google.maps.DirectionsResult | undefined>;
  constructor(mapDirectionsService: MapDirectionsService, geocoder: MapGeocoder,
    private loadingService: LoadingService) {
    const request: google.maps.DirectionsRequest = {
      destination: {
        lat: 12,
        lng: 4
      },
      origin: {
        lat: 14,
        lng: 8
      },
      travelMode: google.maps.TravelMode.DRIVING
    };
    this.directionsResults$ = mapDirectionsService.route(request).pipe(map(response => response.result));



    geocoder.geocode({
      address: '1600 Amphitheatre Parkway, Mountain View, CA'
    }).subscribe(({
      results
    }) => {
      console.log(results);
    });
  }
  ngOnInit(): void { }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = (event.latLng.toJSON());
  }
  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }


  markerOptions: google.maps.MarkerOptions = {
    draggable: false
  };
  markerPositions: google.maps.LatLngLiteral[] = [];
  addMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.markerPositions.push(event.latLng.toJSON());
  }
  openInfoWindow(marker: MapMarker) {
    if (this.infoWindow != undefined) this.infoWindow.open(marker);
  }


  vertices: google.maps.LatLngLiteral[] = [{
    lat: 13,
    lng: 13
  }, {
    lat: -13,
    lng: 0
  }, {
    lat: 13,
    lng: -13
  },];




  bounds: google.maps.LatLngBoundsLiteral = {
    east: 10,
    north: 10,
    south: -10,
    west: -10,
  };




  circleCenter: google.maps.LatLngLiteral = {
    lat: 10,
    lng: 15
  };
  radius = 3;




  imageUrl = '../../assets/images/logo/loadgistix.png';
  imageBounds: google.maps.LatLngBoundsLiteral = {
    east: 15,
    north: 10,
    south: -10,
    west: -10,
  };



  kmlUrl = 'https://developers.google.com/maps/documentation/javascript/examples/kml/westcampus.kml';





  heatmapOptions = {
    radius: 5
  };
  heatmapData = [{
    lat: 37.782,
    lng: -122.447
  }, {
    lat: 37.782,
    lng: -122.445
  }, {
    lat: 37.782,
    lng: -122.443
  }, {
    lat: 37.782,
    lng: -122.441
  }, {
    lat: 37.782,
    lng: -122.439
  }, {
    lat: 37.782,
    lng: -122.437
  }, {
    lat: 37.782,
    lng: -122.435
  }, {
    lat: 37.785,
    lng: -122.447
  }, {
    lat: 37.785,
    lng: -122.445
  }, {
    lat: 37.785,
    lng: -122.443
  }, {
    lat: 37.785,
    lng: -122.441
  }, {
    lat: 37.785,
    lng: -122.439
  }, {
    lat: 37.785,
    lng: -122.437
  }, {
    lat: 37.785,
    lng: -122.435
  }];







}
