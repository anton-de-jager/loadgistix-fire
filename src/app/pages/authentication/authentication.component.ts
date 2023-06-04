import { Component, ViewEncapsulation } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent {
  showOverlay:boolean = false;
  user!: firebase.default.User | null;
  constructor(
    public afAuth: AngularFireAuth,
    private menuService: MenuService
  ) {
    afAuth.authState.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.menuService.selectItem('home');
      }
    });
  }

  uiShownCallback() {
    this.menuService.selectItem('dashboard');
  }

  cancel() {
    this.menuService.selectItem('home');
  }
}
