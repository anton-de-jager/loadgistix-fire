import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, DocumentData } from '@angular/fire/compat/firestore';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { getFirestore, doc, getDoc, Firestore } from 'firebase/firestore';
import { from } from 'rxjs/internal/observable/from';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private firebaseUser$: Observable<firebase.default.User | null>;
    user$: Observable<User | null>;

    private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

    constructor(
        private fireAuth: AngularFireAuth,
        private firestore: AngularFirestore
    ) {
        this.firebaseUser$ = this.fireAuth.authState;
        this.user$ = this.firebaseUser$.pipe(
            switchMap((firebaseUser) => {
                if (firebaseUser) {
                    const firestore: Firestore = getFirestore();
                    const userRef = doc(firestore, 'users', firebaseUser.uid);
                    return from(getDoc(userRef)).pipe(
                        map((snap: import('firebase/firestore').DocumentSnapshot<DocumentData>) => {
                            const userData = snap.data();

                            const user: User = {
                                uid: firebaseUser.uid,
                                displayName: firebaseUser.displayName || null,
                                email: firebaseUser.email || null,
                                phoneNumber: firebaseUser.phoneNumber || null,
                                photoURL: firebaseUser.photoURL || null,
                                emailVerified: firebaseUser.emailVerified || null,
                                isAnonymous: firebaseUser.isAnonymous || null,
                                role: userData?.['role'] || null,
                                company: userData?.['company'] || null,
                                parent: userData?.['parent'] || null,
                                status: userData?.['status'] || null,
                                avatarChanged: userData?.['avatarChanged'] || null,
                                vehicles: userData?.['vehicles'] || null,
                                loads: userData?.['loads'] || null,
                                directory: userData?.['directory'] || null,
                                adverts: userData?.['adverts'] || null,
                                tms: userData?.['tms'] || null,
                                subscriptionId: userData?.['subscriptionId'] || null,
                            };

                            return user;
                        })
                    );
                } else {
                    return of(null);
                }
            })
        );

        combineLatest([this.firebaseUser$, this.user$]).subscribe(([firebaseUser, user]) => {
            const combinedUser: User | null = { ...(firebaseUser as User), ...(user as User) };
            this.currentUserSubject.next(combinedUser);
        });
    }

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
    }
}
