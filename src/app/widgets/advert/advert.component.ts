import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { advert } from 'src/app/models/advert.model';
import { ApiService } from 'src/app/services/api.service';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { AdvertService } from 'src/app/pages/adverts/advert.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
    selector: 'advert',
    templateUrl: './advert.component.html',
    styleUrls: ['./advert.component.scss'],
    // encapsulation: ViewEncapsulation.None
})
export class AdvertComponent implements OnInit {
    @Input() side: boolean = false;
    advertItems: advert[] = [];
    timestamp: number = 0;
    loading: boolean = true;
    subscription!: Subscription;

    constructor(
        private apiService: ApiService,
        private _snackBar: MatSnackBar,
        private advertService: AdvertService,
        // public variableService: VariableService,
        // public eventEmitterService: EventEmitterService,
        private _router: Router,
        private loadingService: LoadingService) {
        this.timestamp = new Date().getTime();
    }

    ngOnInit() {
        // this.getAdverts().then(getAdvertsResult => {
        //     this.advertItems = getAdvertsResult;
        //     this.advertItems.push({title: 'Title', subTitle: 'Subtitle', content: 'This is what  want to say', avatar: 'assets/images/no-image.jpg'});
        //     this.advertItems.push({title: 'Title', subTitle: 'Subtitle', content: 'This is what  want to say'});
        //     this.advertItems.push({title: 'Title', subTitle: 'Subtitle', content: 'This is what  want to say', avatar: 'assets/images/no-image.png'});
        //     this.advertItems.push({title: 'Title', subTitle: 'Subtitle', content: 'This is what  want to say'});
        //     this.advertItems.push({title: 'Title', subTitle: 'Subtitle', content: 'This is what  want to say', avatar: 'assets/images/no-image.png'});
        // })
        this.getAdverts();
        const source = interval(600000);
        this.subscription = source.subscribe(val => {
            this.getAdverts();
            this.timestamp = new Date().getTime();
        });
    }

    getAdverts() {
        this.advertService.getAdvertsOpen().subscribe(advertList => {
            //console.log('advertList', advertList);
            this.advertItems = advertList;
        });
    }

    navigateExternal(event: Event, url: string) {
        event.preventDefault();
        if (Capacitor.isNativePlatform()) {
            Browser.open({ url });
        } else {
            window.open(url, '_blank');
        }
    }
}
