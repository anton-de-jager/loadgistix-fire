import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MenuService } from 'src/app/services/menu.service';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-business-directory',
  templateUrl: './business-directory.component.html',
  styleUrls: ['./business-directory.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BusinessDirectoryComponent implements OnInit, OnDestroy {
  subscriptionDirectories!: Subscription;

  constructor(
    private menuService: MenuService,
    private loadingService: LoadingService
  ) {
    this.menuService.onChangePage('Adverts');
    // this.dataSource = new MatTableDataSource;
  }

  ngOnInit(): void {
    this.menuService.onChangePage('My Adverts');
  }

  // getDrivers() {
  //   this.subscriptionDrivers = this.driverService.getDrivers().subscribe(driverList => {
  //       console.log('driverList', driverList);
  //       this.driverList = driverList;
  //       this.dataSource.data = this.driverList;
  //       this.dataSource.paginator = this.paginatorDriver;
  //       this.dataSource.sort = this.sortDriver;
  //   });


  ngOnDestroy() {
    // this.subscriptionLicenseTypes.unsubscribe();
    // this.subscriptionDrivers.unsubscribe();
  }
}
