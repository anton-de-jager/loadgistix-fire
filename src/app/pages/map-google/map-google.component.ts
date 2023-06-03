import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MenuService } from 'src/app/services/menu.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map-google',
  templateUrl: './map-google.component.html',
  styleUrls: ['./map-google.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapGoogleComponent implements OnInit {

  constructor(
    private menuService: MenuService
) {
}

  ngOnInit(): void {
    this.menuService.onChangePage('Loads Available');
  }

}
