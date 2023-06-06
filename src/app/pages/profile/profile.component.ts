import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Capacitor } from '@capacitor/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from 'firebase/auth';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogImageUploadComponent } from '../../dialogs/dialog-image-upload/dialog-image-upload.component';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { MenuService } from 'src/app/services/menu.service';
import { Preferences } from '@capacitor/preferences';
import { DialogInfoComponent } from 'src/app/dialogs/dialog-info/dialog-info.component';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {
    user: any;
    profileForm: FormGroup;
    activeLink: number = 0;
    avatarChanged = false;
    imageNumber: number = this.getRandomNumber(1, 5);

    constructor(
        private formBuilder: FormBuilder,
        private sanitizer: DomSanitizer,
        private afAuth: AngularFireAuth,
        private router: Router,
        private dialog: MatDialog,
        private apiService: ApiService,
        private _userService: UserService,
        private menuService: MenuService,
        private loadingService: LoadingService
    ) {

        Preferences.get({ key: 'profile-not-completed' }).then(profilePreference => {
            if (profilePreference.value == '1') {
                const dialogConfig = new MatDialogConfig();

                dialogConfig.data = {
                    title: 'Profile Incomplete',
                    alertHeading: 'Your profile has not been created',
                    alertContent: 'Please complete your profile to gain access to Loadgistix'
                };

                dialogConfig.autoFocus = true;
                dialogConfig.disableClose = true;
                dialogConfig.hasBackdrop = true;
                dialogConfig.ariaLabel = 'fffff';
                dialogConfig.width = "100vw";
                dialogConfig.maxWidth = "600px";

                this.dialog.open(DialogInfoComponent,
                    dialogConfig);

                Preferences.set({ key: 'profile-not-completed', value: '0' });
            }
        });

        Preferences.set({ key: 'pageSelected', value: 'profile' });
        Preferences.set({ key: 'menuSelected', value: '' });

        this.menuService.onChangePage('profile');
        this.profileForm = this.formBuilder.group({
            uid: [''],
            parent_id: [''],
            displayName: ['', Validators.required],
            email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
            photoURL: [''],
            role: ['', Validators.required],
            company: ['', Validators.required],
            phoneNumber: [''],
            avatarChanged: [false]
        });

        this._userService.get().subscribe(user => {
            console.log(user);
            this.user = user;
            if (user) {
                this.profileForm.setValue({
                    uid: user.uid,
                    parent_id: '',
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    role: user.role ? user.role : '',
                    company: user.company ? user.company : '',
                    phoneNumber: user.phoneNumber ? user.phoneNumber : '',
                    avatarChanged: false
                });
            }
        });
        setTimeout(() => {
            this.updateImageNumber();
        }, 10000);
    }

    ngOnInit() {
    }

    updateImageNumber() {
        this.imageNumber = this.getRandomNumber(1, 5);
        setTimeout(() => {
            this.updateImageNumber();
        }, 10000);
    }
    getRandomNumber(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    uploadImage(event: Event) {
        event.preventDefault();
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {
            title: 'Upload Image',
            message: 'Please select an image to upload',
            roundCropper: true,
            croppedImage: this.profileForm.value.photoURL
        };

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.ariaLabel = 'fffff';
        dialogConfig.width = "100vw";
        dialogConfig.maxWidth = "600px";
        dialogConfig.panelClass = 'my-dialog';

        const dialogRef = this.dialog.open(DialogImageUploadComponent,
            dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
            if (result !== null) {
                this.avatarChanged = true;
                this.profileForm.controls['avatarChanged'].setValue(true);
                this.profileForm.controls['photoURL'].setValue(result);
            }
        });

    }

    onSubmit() {
        if (this.profileForm.valid) {
            const item: any = this.profileForm.value;

            // Assume we have a UserService to handle all user related operations
            this.apiService.updateProfile(
                item.uid, { item }, this.avatarChanged).then(() => {
                    console.log('Additional data added successfully!');
                    setTimeout(() => {
                        this.menuService.selectItem('dashboard');
                    }, 100);
                }, (error: any) => {
                    console.log('Failed to add additional data.', error);
                });
        }
    }
}
