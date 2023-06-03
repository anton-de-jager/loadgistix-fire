import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { advertPackage } from '../../models/advertPackage.model';
import { switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdvertPackageService {
    advertPackagesRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth
    ) {
    }

    async createAdvertPackage(data: advertPackage) {
        const user = await this.fireAuth.currentUser;
        // data.userId = user!.uid;
        this.firestore.collection('advertPackages').add({
            ...data,
            uid: user!.uid
        }).then((newDocRef) => {
            data.id = newDocRef.id;
            return this.firestore
                .collection('advertPackages')
                .doc(data.id)
                .update(data)
        });
    }
    getAdvertPackages() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<advertPackage>('advertPackages', ref =>
                            ref.orderBy('description')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    updateAdvertPackages(item: advertPackage) {
        return this.firestore
            .collection('advertPackages')
            .doc(item.id)
            .update(item);
    }
    deleteAdvertPackage(id: string) {
        return this.firestore
            .collection('advertPackages')
            .doc(id)
            .delete();
    }
}