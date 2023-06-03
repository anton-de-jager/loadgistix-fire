import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";
import { QRCodeModule } from 'angularx-qrcode';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';

import { ApiService } from './services/api.service';
import { LoaderService } from './services/loader.service';
import { MenuService } from './services/menu.service';
import { UserService } from './services/user.service';

import { DialogAuthenticateComponent } from './dialogs/dialog-authenticate/dialog-authenticate.component';
import { DialogAddressComponent } from './dialogs/dialog-address/dialog-address.component';
import { DialogAdvertComponent } from './dialogs/dialog-advert/dialog-advert.component';
import { DialogAppCodeComponent } from './dialogs/dialog-app-code/dialog-app-code.component';
import { DialogBidListComponent } from './dialogs/dialog-bid-list/dialog-bid-list.component';
import { DialogBidComponent } from './dialogs/dialog-bid/dialog-bid.component';
import { DialogDirectoryComponent } from './dialogs/dialog-directory/dialog-directory.component';
import { DialogDriverComponent } from './dialogs/dialog-driver/dialog-driver.component';
import { DialogImageUploadComponent } from './dialogs/dialog-image-upload/dialog-image-upload.component';
import { DialogInfoComponent } from './dialogs/dialog-info/dialog-info.component';
import { DialogLicenceTypeComponent } from './dialogs/dialog-licenceType/dialog-licenceType.component';
import { DialogLoadComponent } from './dialogs/dialog-load/dialog-load.component';
import { DialogLoadCategoryComponent } from './dialogs/dialog-loadCategory/dialog-loadCategory.component';
import { DialogLoadTypeComponent } from './dialogs/dialog-loadType/dialog-loadType.component';
import { DialogQrCodeComponent } from './dialogs/dialog-qr-code/dialog-qr-code.component';
import { DialogReviewComponent } from './dialogs/dialog-review/dialog-review.component';
import { DialogVehicleComponent } from './dialogs/dialog-vehicle/dialog-vehicle.component';
import { DialogVehicleCategoryComponent } from './dialogs/dialog-vehicleCategory/dialog-vehicleCategory.component';
import { DialogVehicleTypeComponent } from './dialogs/dialog-vehicleType/dialog-vehicleType.component';
import { AdvertsComponent } from './pages/adverts/adverts.component';
import { BidsComponent } from './pages/bids/bids.component';
import { BusinessDirectoryComponent } from './pages/business-directory/business-directory.component';
import { DirectoriesComponent } from './pages/directories/directories.component';
import { DirectoryComponent } from './pages/directory/directory.component';
import { DriversComponent } from './pages/drivers/drivers.component';
import { LoadsAvailableComponent } from './pages/loads-available/loads-available.component';
import { LoadsAvailableGoogleComponent } from './pages/loads-available-google/loads-available-google.component';
import { LoadsComponent } from './pages/loads/loads.component';
import { LookupsComponent } from './pages/lookups/lookups.component';
import { MapGoogleComponent } from './pages/map-google/map-google.component';
import { MapLeafletComponent } from './pages/map-leaflet/map-leaflet.component';
import { MapMapboxComponent } from './pages/map-mapbox/map-mapbox.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './pages/terms-and-conditions/terms-and-conditions.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { DriverService } from './pages/drivers/driver.service';
import { LoadService } from './pages/loads/loads.service';
import { LoadCategoryService } from './pages/lookups/loadCategories.service';
import { LoadTypeService } from './pages/lookups/loadTypes.service';
import { VehicleCategoryService } from './pages/lookups/vehicleCategories.service';
import { VehicleTypeService } from './pages/lookups/vehicleTypes.service';
import { VehicleService } from './pages/vehicles/vehicle.service';
import { VariableService } from './services/variable.service';
import { StatusService } from './services/status.service';
import { CommonModule } from '@angular/common';
import { GoogleMapComponent } from './widgets/google-map/google-map.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SpinnerComponent } from './widgets/spinner/spinner.component';
import { AdvertComponent } from './widgets/advert/advert.component';
import { DialogPaypalComponent } from './dialogs/dialog-paypal/dialog-paypal.component';
import { LeafletMapComponent } from './widgets/leaflet-map/leaflet-map.component';
import { MapComponent } from './widgets/map/map.component';
import { StarRatingComponent } from './widgets/star-rating/star-rating.component';
import { FirestoreDatePipe } from './pipes/firestore-date-pipe';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';












import { MatSliderModule } from '@angular/material/slider';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { LayoutModule } from '@angular/cdk/layout';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FacebookSigninDirective } from './directives/facebook-signin.directive';
import { GoogleSigninDirective } from './directives/google-signin.directive';
import { TwitterSigninDirective } from './directives/twitter-signin.directive';
import { GithubSigninDirective } from './directives/github-signin.directive';
import { PhoneSigninDirective } from './directives/phone-signin.directive';
import { EmailSigninDirective } from './directives/email-signin.directive';
import { HttpClientModule } from '@angular/common/http';
import { MatOptionModule } from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent,
    GoogleMapComponent,
    LeafletMapComponent,
    MapComponent,
    SpinnerComponent,
    StarRatingComponent,
    FirestoreDatePipe,

    //pages
    HomeComponent,
    AuthenticationComponent,
    DashboardComponent,
    ProfileComponent,
    MapMapboxComponent,
    MapGoogleComponent,
    MapLeafletComponent,
    LookupsComponent,
    VehiclesComponent,
    DriversComponent,
    LoadsComponent,
    BidsComponent,
    AdvertsComponent,
    DirectoriesComponent,
    BusinessDirectoryComponent,
    LoadsAvailableComponent,
    LoadsAvailableGoogleComponent,
    DirectoryComponent,
    PrivacyPolicyComponent,
    TermsAndConditionsComponent,
    AdvertComponent,

    //dialogs
    DialogAuthenticateComponent,
    DialogImageUploadComponent,
    DialogVehicleCategoryComponent,
    DialogVehicleTypeComponent,
    DialogLoadCategoryComponent,
    DialogLoadTypeComponent,
    DialogAdvertComponent,
    DialogBidComponent,
    DialogDriverComponent,
    DialogLoadComponent,
    DialogVehicleComponent,
    DialogAddressComponent,
    DialogDirectoryComponent,
    DialogAppCodeComponent,
    DialogBidListComponent,
    DialogQrCodeComponent,
    DialogReviewComponent,
    DialogLicenceTypeComponent,
    DialogInfoComponent,
    DialogPaypalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    QRCodeModule,
    FlexLayoutModule,

    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    MatNativeDateModule,
    NgxMatNativeDateModule,
    ImageCropperModule,

    MatMomentDateModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDatepickerModule,
    MatSliderModule,
    MatCardModule,
    MatDividerModule,
    MatInputModule,
    MatListModule,
    MatBadgeModule,
    MatGridListModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatRadioModule,
    MatTooltipModule,
    MatSidenavModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTabsModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatStepperModule,
    MatRippleModule,
    MatTabsModule,
    MatMenuModule,

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),
    provideStorage(() => getStorage()),

    NgxAuthFirebaseUIModule.forRoot(environment.firebase),
    MatPasswordStrengthModule.forRoot()
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true
    },
    ApiService,
    LoaderService,
    MenuService,
    StatusService,
    UserService,
    VariableService,
    VehicleService,
    DriverService,
    LoadService,
    VehicleTypeService,
    VehicleCategoryService,
    LoadTypeService,
    LoadCategoryService,

    GoogleMapComponent,
    LeafletMapComponent,
    MapComponent,
    SpinnerComponent,
    StarRatingComponent,
    FirestoreDatePipe,

    //pages
    HomeComponent,
    AuthenticationComponent,
    DashboardComponent,
    ProfileComponent,
    MapMapboxComponent,
    MapGoogleComponent,
    MapLeafletComponent,
    LookupsComponent,
    VehiclesComponent,
    DriversComponent,
    LoadsComponent,
    BidsComponent,
    AdvertsComponent,
    DirectoriesComponent,
    BusinessDirectoryComponent,
    LoadsAvailableComponent,
    LoadsAvailableGoogleComponent,
    DirectoryComponent,
    PrivacyPolicyComponent,
    TermsAndConditionsComponent,
    AdvertComponent,

    //dialogs
    DialogAuthenticateComponent,
    DialogImageUploadComponent,
    DialogVehicleCategoryComponent,
    DialogVehicleTypeComponent,
    DialogLoadCategoryComponent,
    DialogLoadTypeComponent,
    DialogAdvertComponent,
    DialogBidComponent,
    DialogDriverComponent,
    DialogLoadComponent,
    DialogVehicleComponent,
    DialogAddressComponent,
    DialogDirectoryComponent,
    DialogAppCodeComponent,
    DialogBidListComponent,
    DialogQrCodeComponent,
    DialogReviewComponent,
    DialogLicenceTypeComponent,
    DialogInfoComponent,
    DialogPaypalComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
