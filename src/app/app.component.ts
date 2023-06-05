import { Component, OnInit } from '@angular/core';
import { MenuService } from './services/menu.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { DialogAuthenticateComponent } from './dialogs/dialog-authenticate/dialog-authenticate.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { User } from './interfaces/user';
import { UserService } from './services/user.service';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { LoaderService } from './services/loader.service';
import { Preferences } from '@capacitor/preferences';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user!: User | null;
  isAuthenticated: boolean = false;
  token$!: Observable<string>;
  messages$!: Observable<any>;
  message: any = null;

  constructor(
    private messaging: AngularFireMessaging,
    public menuService: MenuService,
    public userService: UserService,
    public loadingService: LoadingService,
    private dialog: MatDialog
  ) {
    this.getMenuSelected();

    // messaging.messages.subscribe((message: any) => {
    //   alert(message);
    // });

    if (Capacitor.getPlatform() !== 'web') {
      this.initPushNotifications();
    };
    //this.userService.currentAuthStatus.subscribe(authStatus => this.isAuthenticated = authStatus !== null)
    this.loadingService.setLoading(true, 'app');
    this.userService.get().subscribe((user: User | null) => {
      // console.log(user);
      this.user = user;
      this.isAuthenticated = user !== null && (user == null ? false : user?.emailVerified == true);      
      Preferences.set({key: 'user', value: JSON.stringify(user)});  
      this.loadingService.setLoading(false, 'app');          
    });
  }

  async getMenuSelected() {
    let selectedItem = (await Preferences.get({ key: 'selectedItem' })).value ?? 'home';
    this.menuService.selectItem(selectedItem);
  }

  ngOnInit(): void {
    // this.requestPermission();
    // this.listen();
  }

  // private monitorAuthState = async () => {
  //   this.afa.onAuthStateChanged( user => {
  //     if(user) { console.log(user) }
  //   })
  // }

  initAuth() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = {
      title: 'Authenticate',
      message: 'Sign in / Sign up',
      roundCropper: false
    };

    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.hasBackdrop = true;
    dialogConfig.ariaLabel = 'fffff';
    // dialogConfig.height = "500px";
    // dialogConfig.maxHeight = "90vh";
    dialogConfig.width = "700px";
    dialogConfig.maxWidth = "90vw";
    dialogConfig.panelClass = 'my-dialog';

    const dialogRef = this.dialog.open(DialogAuthenticateComponent,
      dialogConfig);
  }

  initPushNotifications() {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: Token) => {
        alert('Push registration success, token: ' + token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        alert('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

  requestPermission() {

    const messaging = getMessaging();

    getToken(messaging, { vapidKey: environment.firebase.apiKey }).then((currentToken) => {
      if (currentToken) {
        console.log("Hurraaa!!! we got the token.....")
        console.log(currentToken);
        // Send the token to your server and update the UI if necessary
        // ...
      } else {
        // Show permission request UI
        console.log('No registration token available. Request permission to generate one.');
        // ...
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
      // ...
    });

  }
  listen() {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      this.message = payload;
    });
  }

  goto(page: string, menu: string) {
    this.menuService.selectItem(menu);
  }
}
