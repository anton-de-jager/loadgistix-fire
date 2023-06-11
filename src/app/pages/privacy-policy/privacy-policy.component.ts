import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrivacyPolicyComponent implements OnInit {

  constructor(
    private menuService: MenuService,
    private loadingService: LoadingService
) {
}

  ngOnInit(): void {
  }

}
