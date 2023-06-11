import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, ReplaySubject, switchMap, tap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from 'src/app/interfaces/user';
import { Router } from '@angular/router';
import { MenuService } from './menu.service';
import { Preferences } from '@capacitor/preferences';
import { LoadingService } from './loading.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    currentUser!: firebase.default.User | null;
    private authStatusSub = new BehaviorSubject(this.currentUser);
    currentAuthStatus = this.authStatusSub.asObservable();

    /**
     * Constructor
     */
    constructor(
        private fireAuth: AngularFireAuth,
        private firestore: AngularFirestore,
        private menuService: MenuService,
        private router: Router,
        private loadingService: LoadingService
    ) {
        this.authStatusListener();
    }

    authStatusListener() {
        this.fireAuth.onAuthStateChanged((credential: firebase.default.User | null) => {
            if (credential) {
                //console.log(credential);
                this.authStatusSub.next(credential);
                //console.log('User is logged in');
            }
            else {
                this.authStatusSub.next(null);
                //console.log('User is logged out');
                this.menuService.selectItem('home');
            }
        })
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User | null> {
        return this.fireAuth.authState.pipe(
            switchMap(fbUser => {
                if (fbUser) {
                    return this.firestore.doc<User>(`users/${fbUser.uid}`).valueChanges().pipe(
                        map(fsUser => {
                            return {
                                uid: fbUser.uid!,
                                displayName: fbUser.displayName!,
                                email: fbUser.email!,
                                photoURL: fbUser.photoURL!,
                                emailVerified: fbUser.emailVerified!,
                                isAnonymous: fbUser.isAnonymous!,
                                role: fsUser?.role || '',
                                company: fsUser?.company || '',
                                parent: fsUser?.parent || '',
                                phoneNumber: fsUser?.phoneNumber!,
                                status: fsUser?.status || '',
                                avatarChanged: fsUser?.avatarChanged || false,
                            };
                        })
                    );
                } else {
                    return of(null);
                }
            })
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Promise<void> {
        // Separate the Firestore and Firebase User properties
        const { displayName, photoURL, phoneNumber, email, emailVerified, isAnonymous, ...firestoreUser } = user;

        // update the Firestore User document
        const firestoreUpdate = this.firestore.doc<User>(`users/${user.uid}`).update(firestoreUser);

        // get the current Firebase User
        const firebaseUser = this.fireAuth.currentUser;

        // update the Firebase User object
        const firebaseUpdate = firebaseUser.then(fbUser => {
            if (fbUser) {
                return fbUser.updateProfile({
                    displayName: displayName,
                    photoURL: photoURL
                });
            } else {
                return null;
            }
        });

        // return a Promise that resolves when both updates are complete
        return Promise.all([firestoreUpdate, firebaseUpdate]).then(() => { });
    }

    signOut() {
        this.fireAuth.signOut();
        this.menuService.selectItem('home');
    }


    validateUser() {
        this.user$.subscribe(user => {
            //console.log(user);
            if (user) {
                if (user.emailVerified) {
                    if (!user.role) {
                        this.menuService.selectItem('profile');
                    }
                } else {
                    this.menuService.selectItem('not-confirmed');
                }
            } else {
                this.menuService.selectItem('home');
            }
        });
    }
}
