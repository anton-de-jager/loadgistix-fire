import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { user } from 'src/app/models/user.model';
import { ApiService } from 'src/app/services/api.service';
import { Md5 } from 'ts-md5';
import { Browser } from '@capacitor/browser';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { User } from 'src/app/interfaces/user';
import { environment } from 'src/environments/environment';
import { DialogUrlComponent } from 'src/app/dialogs/dialog-url/dialog-url.component';
// import { App } from '@capacitor/app';
import * as CryptoJS from "crypto-js";
import { Preferences } from '@capacitor/preferences';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
    selector: 'account',
    templateUrl: './account.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
    plans!: any[];
    myData: any;
    user!: User;
    selectedBusinessDirectory = false;
    selectedAdvert = false;
    selectedTms = false;
    selectedVehicle1 = false;
    selectedVehicle5 = false;
    selectedVehicle10 = false;
    selectedVehicle11 = false;
    selectedLoad5 = false;
    selectedLoad10 = false;
    selectedLoad11 = false;
    pricing =
        {
            Advert: [
                { quantity: 1, usd: 11, zar: 195 }
            ],
            Tms: [
                { quantity: 1, usd: 11, zar: 195 }
            ],
            BusinessDirectory: [
                { quantity: 1, usd: 6, zar: 110 }
            ],
            Vehicle: [
                { quantity: 1, usd: 9, zar: 159 },
                { quantity: 5, usd: 34, zar: 600 },
                { quantity: 10, usd: 55, zar: 975 },
                { quantity: 11, usd: 127, zar: 2250 }
            ],
            Load: [
                { quantity: 5, usd: 17, zar: 300 },
                { quantity: 10, usd: 28, zar: 495 },
                { quantity: 11, usd: 82, zar: 1450 }
            ]
        };
    usd = 0;
    zar = 0;
    zarOriginal = 0;
    checkOutReady = false;
    checkOutDone = false;
    activated = false;
    model = {
        cmd: '_paynow',
        receiver: '12100762',
        return_url: 'https://app.loadgistix.com/return',
        cancel_url: 'https://app.loadgistix.com/cancel',
        notify_url: 'https://app.loadgistix.com/notify',
        amount: 5,
        custom_quantity: 1,
        item_name: 'Loadgistix Subscription',
        subscription_type: 1,
        recurring_amount: 5,
        cycles: 0,
        frequency: 3
    };

    /**
     * Constructor
     */
    constructor(
        private dialog: MatDialog,
        private _formBuilder: FormBuilder,
        private apiService: ApiService,
        private loadingService: LoadingService
    ) {
        this.getUser();
        //this.getPayfast('ebddc094-c180-49c2-8174-d2d1d49e5898');
        //this.getSig('ebddc094-c180-49c2-8174-d2d1d49e5898');
        // App.addListener('appStateChange', ({ isActive }) => {
        //     console.log('App state changed. Is active?', isActive);
        //     this.fuseSplashScreenService.hide();
        // });

        // App.addListener('appUrlOpen', data => {
        //     console.log('App opened with URL:', data);
        // });

        // App.addListener('appRestoredResult', data => {
        //     console.log('Restored state:', data);
        //     this.fuseSplashScreenService.hide();
        // });
    }

    async getUser(){
        this.user = JSON.parse((await Preferences.get({ key: 'user' })).value!) as User;
    }

    // getSig(token) {
    //     // var header = pm.request.headers.toObject(true);
    //     // var body = pm.request.body.urlencoded.toObject(true);
    //     // var urlParams = pm.request.url.query.toObject(true);
    //     // var data = {
    //     //     ...header,
    //     //     ...body,
    //     //     ...urlParams
    //     // };

    //     let data = [,];
    //     data['passphrase'] = 'ThisIsMyVibeViewerPassphrase007';
    //     data.merchant-id = environment.merchant_id;
    //     data.token = token;
    //     data.version = 'v1';
    //     data.timestamp = (new Date()).toISOString().slice(0, 19);

    //     //sort variables alphabetically
    //     data = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));

    //     var str1 = "";
    //     for (const [key, value] of data) {
    //         if ((value != '') && (key != 'signature') && (key != 'testing')) {
    //             str1 = str1 + key + '=' + encodeURIComponent(value).replace(/%20/g, '+') + '&';
    //         }
    //     }

    //     str1 = str1.slice(0, -1);

    //     var hash = Md5.hashStr(str1).toString();

    //     data['signature'] = hash;

    //     setTimeout(() => {
    //         this.apiService.payfast(token, 'fetch', {
    //             'Content-Type': 'application/json',
    //             'Access-Control-Allow-Origin': '*',
    //             'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
    //             'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    //             'merchant-id': data.find(x => x[0] == "merchant-id")[1],
    //             'version': data.find(x => x[0] == "version")[1],
    //             'timestamp': data.find(x => x[0] == "timestamp")[1],
    //             'signature': data['signature']
    //         }).subscribe(res => {
    //             //console.log(res);
    //         })
    //     }, 100);
    // }

    // getPayfast(token) {
    //     let myData = {};
    //     // Merchant details
    //     this.myData.merchant-id = environment.merchant_id;
    //     this.myData.token = token;
    //     this.myData.version = 'v1';
    //     this.myData.timestamp = new Date().toISOString();

    //     // Arrange the array by key alphabetically for API calls
    //     let ordered_data = {};
    //     Object.keys(this.myData).sort().forEach(key => {
    //         ordered_data[key] = this.myData[key];
    //     });
    //     this.myData = ordered_data;

    //     setTimeout(() => {
    //         // Create the get string
    //         let getString = '';
    //         for (let key in this.myData) {
    //             getString += key + '=' + encodeURIComponent(this.myData[key]).replace(/%20/g, '+') + '&';
    //         }

    //         setTimeout(() => {
    //             // Remove the last '&'
    //             getString = getString.substring(0, getString.length - 1);
    //             getString += `&passphrase=${encodeURIComponent(environment.passPhrase.trim()).replace(/%20/g, "+")}`;

    //             setTimeout(() => {
    //                 let signature = Md5.hashStr(getString);
    //                 setTimeout(() => {
    //                     this.apiService.payfast(token, 'fetch', {
    //                         'Content-Type': 'application/json',
    //                         'Access-Control-Allow-Origin': '*',
    //                         'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
    //                         'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    //                         'merchant-id': environment.merchant_id,
    //                         'version': 'v1',
    //                         'timestamp': this.myData.timestamp,
    //                         'signature': signature
    //                     }).subscribe(res => {
    //                         //console.log(res);
    //                     })
    //                 }, 100);
    //             }, 100);
    //         }, 100);
    //     }, 100);
    // }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // switch (this.user.vehicles) {
        //     case 1:
        //         this.selectedVehicle1 = true;
        //         break;
        //     case 5:
        //         this.selectedVehicle5 = true;
        //         break;
        //     case 10:
        //         this.selectedVehicle10 = true;
        //         break;
        //     case -1:
        //         this.selectedVehicle11 = true;
        //         break;
        //     default:
        //         break;
        // }
        // switch (this.user.loads) {
        //     case 5:
        //         this.selectedLoad5 = true;
        //         break;
        //     case 10:
        //         this.selectedLoad10 = true;
        //         break;
        //     case -1:
        //         this.selectedLoad11 = true;
        //         break;
        //     default:
        //         break;
        // }
        // this.selectedBusinessDirectory = this.user.directory! > 0;
        // this.selectedAdvert = this.user.adverts! > 0;
        // this.selectedTms = this.user.tms! > 0;
        // setTimeout(() => {
        //     this.usd = this.getUSD();
        //     this.zar = this.getZAR();
        //     this.zarOriginal = Number(this.getZAR().toString());        // }, 100);
    }

    onSelectCardBusinessDirectory() {
        this.checkOutReady = false;
        this.selectedBusinessDirectory = !this.selectedBusinessDirectory;
        this.usd = this.getUSD();
        this.zar = this.getZAR();
    }

    onSelectCardAdvert() {
        this.checkOutReady = false;
        this.selectedAdvert = !this.selectedAdvert;
        this.usd = this.getUSD();
        this.zar = this.getZAR();
    }

    onSelectCardTms() {
        this.checkOutReady = false;
        this.selectedTms = !this.selectedTms;
        this.usd = this.getUSD();
        this.zar = this.getZAR();
    }

    onSelectCardVehicle(index: any) {
        this.checkOutReady = false;
        //this.payPalConfig = null;
        switch (index) {
            case 1:
                this.selectedVehicle1 = !this.selectedVehicle1;
                this.selectedVehicle5 = false;
                this.selectedVehicle10 = false;
                this.selectedVehicle11 = false;
                //if(this.selectedVehicle1){this.payPalConfig = this.initConfig(1);}
                break;
            case 5:
                this.selectedVehicle5 = !this.selectedVehicle5;
                this.selectedVehicle1 = false;
                this.selectedVehicle10 = false;
                this.selectedVehicle11 = false;
                //if(this.selectedVehicle5){this.payPalConfig = this.initConfig(5);}
                break;
            case 10:
                this.selectedVehicle10 = !this.selectedVehicle10;
                this.selectedVehicle1 = false;
                this.selectedVehicle5 = false;
                this.selectedVehicle11 = false;
                //if(this.selectedVehicle10){this.payPalConfig = this.initConfig(10);}
                break;
            case 11:
                this.selectedVehicle11 = !this.selectedVehicle11;
                this.selectedVehicle1 = false;
                this.selectedVehicle5 = false;
                this.selectedVehicle10 = false;
                //if(this.selectedVehicle11){this.payPalConfig = this.initConfig(11);}
                break;
            default:
                break;
        }
        this.usd = this.getUSD();
        this.zar = this.getZAR();
    }

    onSelectCardLoad(index: any) {
        this.checkOutReady = false;
        switch (index) {
            case 5:
                this.selectedLoad5 = !this.selectedLoad5;
                this.selectedLoad10 = false;
                this.selectedLoad11 = false;
                //if(this.selectedLoad5){this.payPalConfig = this.initConfig(5);}
                break;
            case 10:
                this.selectedLoad10 = !this.selectedLoad10;
                this.selectedLoad5 = false;
                this.selectedLoad11 = false;
                //if(this.selectedLoad10){this.payPalConfig = this.initConfig(10);}
                break;
            case 11:
                this.selectedLoad11 = !this.selectedLoad11;
                this.selectedLoad5 = false;
                this.selectedLoad10 = false;
                //if(this.selectedLoad11){this.payPalConfig = this.initConfig(11);}
                break;
            default:
                break;
        }
        this.usd = this.getUSD();
        this.zar = this.getZAR();
    }

    getValue(page: string, quantity: number) {
        switch (page) {
            case 'Vehicle':
                return this.pricing.Vehicle.find(x => x.quantity == quantity) ? this.pricing.Vehicle.find(x => x.quantity == quantity) : { quantity: 0, usd: 0, zar: 0 };
            case 'Load':
                return this.pricing.Load.find(x => x.quantity == quantity) ? this.pricing.Load.find(x => x.quantity == quantity) : { quantity: 0, usd: 0, zar: 0 };
            case 'BusinessDirectory':
                return this.pricing.BusinessDirectory.find(x => x.quantity == quantity) ? this.pricing.BusinessDirectory.find(x => x.quantity == quantity) : { quantity: 0, usd: 0, zar: 0 };
            case 'Advert':
                return this.pricing.Advert.find(x => x.quantity == quantity) ? this.pricing.Advert.find(x => x.quantity == quantity) : { quantity: 0, usd: 0, zar: 0 };
            case 'Tms':
                return this.pricing.Tms.find(x => x.quantity == quantity) ? this.pricing.Tms.find(x => x.quantity == quantity) : { quantity: 0, usd: 0, zar: 0 };
            default:
                return { quantity: 0, usd: 0, zar: 0 };
        }
    }

    getUSD() {
        return (this.selectedAdvert ? this.getValue('Advert', 1)!.usd : 0)
            + (this.selectedTms ? this.getValue('Tms', 1)!.usd : 0)
            + (this.selectedBusinessDirectory ? this.getValue('BusinessDirectory', 1)!.usd : 0)
            + (this.selectedVehicle1 ? this.getValue('Vehicle', 1)!.usd : 0)
            + (this.selectedVehicle5 ? this.getValue('Vehicle', 5)!.usd : 0)
            + (this.selectedVehicle10 ? this.getValue('Vehicle', 10)!.usd : 0)
            + (this.selectedVehicle11 ? this.getValue('Vehicle', 11)!.usd : 0)
            + (this.selectedLoad5 ? this.getValue('Load', 5)!.usd : 0)
            + (this.selectedLoad10 ? this.getValue('Load', 10)!.usd : 0)
            + (this.selectedLoad11 ? this.getValue('Load', 11)!.usd : 0)
    }

    getZAR() {
        return (this.selectedAdvert ? this.getValue('Advert', 1)!.zar : 0)
            + (this.selectedTms ? this.getValue('Tms', 1)!.zar : 0)
            + (this.selectedBusinessDirectory ? this.getValue('BusinessDirectory', 1)!.zar : 0)
            + (this.selectedVehicle1 ? this.getValue('Vehicle', 1)!.zar : 0)
            + (this.selectedVehicle5 ? this.getValue('Vehicle', 5)!.zar : 0)
            + (this.selectedVehicle10 ? this.getValue('Vehicle', 10)!.zar : 0)
            + (this.selectedVehicle11 ? this.getValue('Vehicle', 11)!.zar : 0)
            + (this.selectedLoad5 ? this.getValue('Load', 5)!.zar : 0)
            + (this.selectedLoad10 ? this.getValue('Load', 10)!.zar : 0)
            + (this.selectedLoad11 ? this.getValue('Load', 11)!.zar : 0)
    }

    getQuantity(item: string) {
        switch (item) {
            case 'vehicle':
                if (this.selectedVehicle1) {
                    return 1;
                } else {
                    if (this.selectedVehicle5) {
                        return 5;
                    } else {
                        if (this.selectedVehicle10) {
                            return 10;
                        } else {
                            if (this.selectedVehicle11) {
                                return -1;
                            } else {
                                return 0;
                            }
                        }
                    }
                }
            case 'load':
                if (this.selectedLoad5) {
                    return 5;
                } else {
                    if (this.selectedLoad10) {
                        return 10;
                    } else {
                        if (this.selectedLoad11) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                }
            case 'advert':
                return this.selectedAdvert ? 1 : 0;
            case 'tms':
                return this.selectedTms ? 1 : 0;
            case 'directory':
                return this.selectedBusinessDirectory ? 1 : 0;
            default:
                return 0;
        }
    }

    checkOut() {
        //if (this.user.subscriptionId!.length > 4) {
            // this.apiService.updatePayfast(this.user.subscriptionId!, this.getZAR(), this.getQuantity('vehicle'), this.getQuantity('load'), this.getQuantity('advert'), this.getQuantity('tms'), this.getQuantity('directory')).subscribe(res => {
            //     //console.log(res);
            //     // this.fuseSplashScreenService.hide();
            // });
        //} else {
            // var url = environment.api + 'payfast/subscription';
            // url += '/' + encodeURIComponent(this.user.uid.toString()).replace(/%20/g, '+');
            // url += '/' + encodeURIComponent(this.user.email!).replace(/%20/g, '+');
            // url += '/' + encodeURIComponent(this.getZAR()).replace(/%20/g, '+');
            // url += '/' + encodeURIComponent(this.getQuantity('vehicle').toString()).replace(/%20/g, '+');
            // url += '/' + encodeURIComponent(this.getQuantity('load').toString()).replace(/%20/g, '+');
            // url += '/' + encodeURIComponent(this.getQuantity('advert').toString()).replace(/%20/g, '+');
            // url += '/' + encodeURIComponent(this.getQuantity('tms').toString()).replace(/%20/g, '+');
            // url += '/' + encodeURIComponent(this.getQuantity('directory').toString()).replace(/%20/g, '+');
            // //url += '/' + encodeURIComponent(this.user.id.toString()).replace(/%20/g, '+');

            Browser.open({ url: this.getUrl(), windowName: '_self' });

        //}
    }

    payfast() {
        // Merchant details
        this.myData.merchant_id = environment.merchant_id;
        this.myData.merchant_key = environment.merchant_key;
        this.myData.return_url = environment.returnUrl;
        this.myData.cancel_url = environment.cancelUrl;
        this.myData.notify_url = environment.notifyUrl;
        // Buyer details
        this.myData.name_first = this.user.displayName?.split(',')[0];
        this.myData.name_last = this.user.displayName != this.user.displayName?.split(',')[0] ? this.user.displayName?.replace(this.user.displayName?.split(',')[0] + ' ', '') : 'User';
        this.myData.email_address = this.user.email;
        // Transaction details
        this.myData.m_payment_id = this.user.uid.toString();
        this.myData.amount = this.getZAR();
        this.myData.amount_gross = this.getZAR();
        this.myData.item_name = "Loadgistix Subscription";

        this.myData.subscription_type = "1";
        this.myData.frequency = "3";
        this.myData.cycles = "0";

        this.myData.custom_int1 = this.getQuantity('vehicle').toString();
        this.myData.custom_int2 = this.getQuantity('load').toString();
        this.myData.custom_int3 = this.getQuantity('advert').toString();
        this.myData.custom_int4 = this.getQuantity('tms').toString();
        this.myData.custom_int5 = this.getQuantity('directory').toString();
        this.myData.custom_str1 = this.user.uid.toString();

        // Generate signature
        this.generateSignature(this.myData, environment.passPhrase);

        // let params = '';
        // for (let key in myData) {
        //   if(this.myData.hasOwnProperty(key)){
        //     params = params == '' ? key + '=' + this.myData[key] : params + '&' + key + '=' + this.myData[key];
        //   }
        // }

        // setTimeout(() => {
        //     window.open('https://' + environment.pfHost + '.payfast.co.za/eng/process?' + params, '_blank');
        //     console.log(params);
        //     // this.apiService.payfastSubscribe('https://' + environment.pfHost + '.payfast.co.za/eng/process', params).subscribe(res => {
        //     //     console.log(res);
        //     //     window.location.href = 'https://' + environment.pfHost + '.payfast.co.za/eng/process?' + params;
        //     // })
        // }, 500);

        // htmlForm += '<input type="submit" value="Pay Now" /></form>'; 
        // return htmlForm;
    }

    getUrl() {
        const myData: any = {};
        var url = 'https://' + environment.pfHost + '.payfast.co.za/eng/process';
        // Merchant details
        myData.merchant_id = environment.merchant_id; url += '?merchant_id=' + encodeURIComponent(myData.merchant_id!).replace(/%20/g, '+');
        myData.merchant_key = environment.merchant_key; url += '&merchant_key=' + encodeURIComponent(myData.merchant_key!).replace(/%20/g, '+');
        myData.return_url = environment.returnUrl; url += '&return_url=' + encodeURIComponent(myData.return_url!).replace(/%20/g, '+');
        myData.cancel_url = environment.cancelUrl; url += '&cancel_url=' + encodeURIComponent(myData.cancel_url!).replace(/%20/g, '+');
        myData.notify_url = environment.notifyUrl; url += '&notify_url=' + encodeURIComponent(myData.notify_url!).replace(/%20/g, '+');
        // Buyer details
        myData.name_first = this.user.displayName; url += '&name_first=' + encodeURIComponent(myData.name_first!).replace(/%20/g, '+');
        myData.name_last = this.user.displayName; url += '&name_last=' + encodeURIComponent(myData.name_last!).replace(/%20/g, '+');
        myData.email_address = this.user.email; url += '&email_address=' + encodeURIComponent(myData.email_address!).replace(/%20/g, '+');
        // Transaction details
        myData.m_payment_id = this.user.uid.toString(); url += '&m_payment_id=' + encodeURIComponent(myData.m_payment_id!).replace(/%20/g, '+');
        myData.amount = this.getZAR(); url += '&amount=' + encodeURIComponent(myData.amount!).replace(/%20/g, '+');
        myData.amount_gross = this.getZAR(); url += '&amount_gross=' + encodeURIComponent(myData.amount_gross!).replace(/%20/g, '+');
        myData.item_name = "Loadgistix Subscription"; url += '&item_name=' + encodeURIComponent(myData.item_name!).replace(/%20/g, '+');

        myData.subscription_type = "1"; url += '&subscription_type=' + encodeURIComponent(myData.subscription_type!).replace(/%20/g, '+');
        myData.frequency = "3"; url += '&frequency=' + encodeURIComponent(myData.frequency!).replace(/%20/g, '+');
        myData.cycles = "0"; url += '&cycles=' + encodeURIComponent(myData.cycles!).replace(/%20/g, '+');

        myData.custom_int1 = this.getQuantity('vehicle').toString(); url += '&custom_int1=' + encodeURIComponent(myData.custom_int1!).replace(/%20/g, '+');
        myData.custom_int2 = this.getQuantity('load').toString(); url += '&custom_int2=' + encodeURIComponent(myData.custom_int2!).replace(/%20/g, '+');
        myData.custom_int3 = this.getQuantity('advert').toString(); url += '&custom_int3=' + encodeURIComponent(myData.custom_int3!).replace(/%20/g, '+');
        myData.custom_int4 = this.getQuantity('tms').toString(); url += '&custom_int4=' + encodeURIComponent(myData.custom_int4!).replace(/%20/g, '+');
        myData.custom_int5 = this.getQuantity('directory').toString(); url += '&custom_int5=' + encodeURIComponent(myData.custom_int5!).replace(/%20/g, '+');
        myData.custom_str1 = this.user.uid.toString(); url += '&custom_str1=' + encodeURIComponent(myData.custom_str1!).replace(/%20/g, '+');


        // Generate signature
        const myPassphrase = environment.passPhrase;
        myData.signature = this.generateSignature(myData, myPassphrase); url += '&signature=' + encodeURIComponent(myData.signature!).replace(/%20/g, '+');

        return url;
        // var url = 'https://${environment.pfHost}/eng/process?';
        //     url += encodeURIComponent(this.user.uid.toString()).replace(/%20/g, '+');
        //     url += '&' + encodeURIComponent(this.user.email!).replace(/%20/g, '+');
        //     url += '/' + encodeURIComponent(this.getZAR()).replace(/%20/g, '+');
        //     url += '/' + encodeURIComponent(this.getQuantity('vehicle').toString()).replace(/%20/g, '+');
        //     url += '/' + encodeURIComponent(this.getQuantity('load').toString()).replace(/%20/g, '+');
        //     url += '/' + encodeURIComponent(this.getQuantity('advert').toString()).replace(/%20/g, '+');
        //     url += '/' + encodeURIComponent(this.getQuantity('tms').toString()).replace(/%20/g, '+');
        //     url += '/' + encodeURIComponent(this.getQuantity('directory').toString()).replace(/%20/g, '+');
        //     //url += '/' + encodeURIComponent(this.user.id.toString()).replace(/%20/g, '+');

        //     Browser.open({ url: this.getUrl(), windowName: '_self' });

        // let htmlForm = `<form action="https://${environment.pfHost}/eng/process" method="post">`;
        // for (let key in myData) {
        //     if (myData.hasOwnProperty(key)) {
        //         const value = myData[key];
        //         if (value !== "") {
        //             htmlForm += `<input name="${key}" type="hidden" value="${value.trim()}" />`;
        //         }
        //     }
        // }

        // htmlForm += '<input type="submit" value="Pay Now" /></form>';
        // return htmlForm;
    }

    generateSignature = (data: any, passPhrase: string) => {
        // Create parameter string
        let pfOutput = "";
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                if (data[key] !== "") {
                    pfOutput += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}&`
                }
            }
        }

        // Remove last ampersand
        let getString = pfOutput.slice(0, -1);
        if (passPhrase !== null) {
            getString += `&passphrase=${encodeURIComponent(passPhrase).replace(/%20/g, "+")}`;
        }

        const hash = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(getString));
        const md5 = hash.toString(CryptoJS.enc.Hex)
        return md5;

        //return CryptoJS.createHash("md5").update(getString).digest("hex");
        //return CryptoJS.createHash("md5").update(getString).digest("hex");
    };

    generateAPISignature = (data: any, passPhrase = null) => {
        // // Arrange the array by key alphabetically for API calls
        // let ordered_data:any;
        // let getString = '';
        // let params = '';

        // Object.keys(data).sort().forEach(key => {
        //     ordered_data.key = data[key];
        // });
        // data = ordered_data;

        // setTimeout(() => {
        //     for (let key in data) {
        //         getString += key + '=' + encodeURIComponent(data[key]).replace(/%20/g, '+') + '&';
        //         params += key + '=' + encodeURIComponent(data[key]).replace(/%20/g, '+') + '&';
        //     }

        //     setTimeout(() => {
        //         //Browser.open({ url: 'https://' + environment.pfHost + '.payfast.co.za/eng/process?' + params + 'signature=' + Md5.hashStr(getString + `passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`) });
        //         Browser.open({ url: 'https://' + environment.pfHost + '.payfast.co.za/eng/process?' + getString + `passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`, windowName: '_self' });



        //         // const dialogConfig = new MatDialogConfig();

        //         // dialogConfig.data = { url: 'https://' + environment.pfHost + '.payfast.co.za/eng/process?' + getString + `passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}` };

        //         // dialogConfig.autoFocus = true;
        //         // dialogConfig.disableClose = true;
        //         // dialogConfig.hasBackdrop = true;
        //         // dialogConfig.ariaLabel = 'fffff';
        //         // dialogConfig.width = "800px";

        //         // const dialogRef = this.dialog.open(DialogIFrameComponent,
        //         //     dialogConfig);

        //     }, 100);
        // }, 100);
    }

    // private initConfig(): void {
    //     if (this.user.subscriptionId! == null) {

    //     } else {
    //         this.payPalConfig = {
    //             currency: 'USD',
    //             clientId: environment.paypalClientId,
    //             vault: "true",
    //             intent: "subscription",
    //             createSubscriptionOnClient: (data) => <ICreateSubscriptionRequest>{
    //                 plan_id: environment.paypalPlanId,
    //                 quantity: this.usd,
    //                 custom_id: this.user.id.toString(),
    //             },
    //             advanced: {
    //                 commit: 'true'
    //             },
    //             style: {
    //                 label: 'subscribe',
    //                 layout: 'vertical',
    //                 shape: 'pill'
    //             },
    //             onApprove: (data, actions) => {
    //                 //console.log('onApprove - transaction was approved, but not authorized', data, actions);
    //                 console.log('orderID', data.orderID);
    //                 console.log('payerID', data.payerID);
    //                 console.log('subscriptionID', data.subscriptionID);
    //                 this.apiService.paid({
    //                     userId: this.user.id.toString(),
    //                     orderId: data.orderID,
    //                     subscriptionId: data.subscriptionID,
    //                     price: this.usd,
    //                     vehiclesQuantity: this.getQuantity('vehicle'),
    //                     loadsQuantity: this.getQuantity('load'),
    //                     advertsQuantity: this.getQuantity('advert'),
    //                     directoryQuantity: this.getQuantity('directory')
    //                 }).subscribe(result => {
    //                     this.user.vehicles = this.getQuantity('vehicle');
    //                     this.user.loads = this.getQuantity('load');
    //                     this.user.adverts = this.getQuantity('advert');
    //                     this.user.directory = this.getQuantity('directory');
    //                     this.user.orderId = this.getQuantity('orderId');
    //                     this.user.subscriptionId = this.getQuantity('subscriptionId');
    //                     this.user.subscriptionStatus = this.getQuantity('subscriptionStatus');
    //                     localStorage.setItem('user', JSON.stringify(this.user));
    //                     localStorage.setItem('vehiclesQuantity', JSON.stringify(this.user.vehicles));
    //                     localStorage.setItem('loadsQuantity', JSON.stringify(this.user.loads));
    //                     localStorage.setItem('advertsQuantity', JSON.stringify(this.user.adverts));
    //                     localStorage.setItem('directoryQuantity', JSON.stringify(this.user.directory));
    //                     localStorage.setItem('orderId', JSON.stringify(this.user.orderId));
    //                     localStorage.setItem('subscriptionId', JSON.stringify(this.user.subscriptionId));
    //                     localStorage.setItem('subscriptionStatus', JSON.stringify(this.user.subscriptionStatus));
    //                     this.checkOutDone = true;
    //                     this.checkOutReady = false;
    //                 });
    //                 // facilitatorAccessToken: "A21AAJPkGzeulCJOyjhRyJd8cGYD3FDhXb3zbtc4L101axTg9SUTmpMPfkZX7e8hV67yKC1HB7QkhGZX_JkKdUe0qHimeWyng"
    //                 // orderID: "909241869F8769929"
    //                 // paymentSource: "card"
    //                 // subscriptionID: "I-FJW8G9B8UAC8"
    //             },
    //             onClientAuthorization: (data) => {
    //                 console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
    //                 //this.showSuccess = true;
    //             },
    //             onCancel: (data, actions) => {
    //                 console.log('OnCancel', data, actions);
    //                 //this.showCancel = true;

    //             },
    //             onError: (err) => {
    //                 console.log('OnError', err);
    //                 //this.showError = true;
    //             },
    //             onClick: (data, actions) => {
    //                 console.log('onClick', data, actions);
    //                 //this.resetStatus();
    //             }
    //         };
    //     }
    // }

    activate() {
        this.activated = true;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    actionPayFastJavascript() {
        // Perform your logic here
    }
}
