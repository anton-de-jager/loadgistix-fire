import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core'
import { environment } from 'src/environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class DirectionsService {

  constructor() { }

  async get(from:{lat: number, lon: number}, to:{lat: number, lon: number}): Promise<HttpResponse> {
    const options = {
      url: 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=' + environment.openRouteServiceKey + '&start=' + from.lon + ',' + from.lat + '&end=' + to.lon + ',' + to.lat
    };

    return JSON.parse((await CapacitorHttp.get(options)).data);
  }
}
