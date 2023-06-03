import { Component, ViewEncapsulation } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {AuthProvider} from 'ngx-auth-firebaseui';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-dialog-authenticate',
  templateUrl: './dialog-authenticate.component.html',
  styleUrls: ['./dialog-authenticate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogAuthenticateComponent {
  providers = AuthProvider;
  user!: firebase.default.User | null;
  constructor(
    public afAuth: AngularFireAuth,
    private dialog: MatDialog,
    private menuService: MenuService,
    public dialogRef: MatDialogRef<DialogAuthenticateComponent>
  ) {
    // afAuth.authState.subscribe(user => {
    //   this.user = user;
    //   if (this.user) {
    //     this.dialogRef.close();
    // this.menuService.navigateTo('dashboard', '');
    //   }
    // });
  }

  uiShownCallback() {
  }


  cancel() {
    this.dialogRef.close(false);
  }

  printUser(event: any) {
    console.log(event);
    this.dialogRef.close();
    this.menuService.selectPage('/dashboard');
    this.menuService.selectMenu('');
    this.menuService.navigateTo('dashboard', '');
  }

  printError(event: any) {
    console.error(event);
  }
}
