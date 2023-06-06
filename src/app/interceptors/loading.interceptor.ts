// import { Injectable } from '@angular/core';
// import {
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
//   HttpInterceptor
// } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { finalize } from 'rxjs/operators';
// import { LoaderService } from 'src/app/services/loader.service';

// @Injectable()

import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoaderService } from 'src/app/services/loader.service';
import { LoadingService } from '../services/loading.service';
@Injectable({
  providedIn: 'root'
})
export class LoadingInterceptor implements HttpInterceptor {

  // private totalRequests = 0;

  constructor(
    private loadingService: LoadingService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.showLoader();
    return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        this.onEnd();
      }
    },
      (err: any) => {
        this.onEnd();
      }));
  }
  private onEnd(): void {
    this.hideLoader();
  }
  private showLoader(): void {
    this.loadingService.setLoading(true,'');
  }
  private hideLoader(): void {
    this.loadingService.setLoading(false,'');
  }

  // intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  //   console.log('caught')
  //   this.totalRequests++;
  //   this.loadingService.setLoading(true);
  //   return next.handle(request).pipe(
  //     finalize(() => {
  //       this.totalRequests--;
  //       if (this.totalRequests == 0) {
  //         this.loadingService.setLoading(false);
  //       }
  //     })
  //   );
  // }
}