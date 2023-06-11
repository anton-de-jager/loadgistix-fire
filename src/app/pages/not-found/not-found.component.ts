import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { MenuService } from 'src/app/services/menu.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotFoundComponent implements OnInit {

  constructor(
    private menuService: MenuService,
    private userService: UserService,
    private loadingService: LoadingService
) {
  this.userService.validateUser();
}

  ngOnInit(): void {
  }

}
