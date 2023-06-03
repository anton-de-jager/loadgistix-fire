import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { licenceType } from '../../models/licenceType.model';
import { switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LicenceTypeService {
    licenceTypesRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth
    ) {
    }

    async createLicenceType(data: licenceType) {
        const user = await this.fireAuth.currentUser;
        // data.userId = user!.uid;
        this.firestore.collection('licenceTypes').add({
            ...data,
            uid: user!.uid
        }).then((newDocRef) => {
            data.id = newDocRef.id;
            return this.firestore
                .collection('licenceTypes')
                .doc(data.id)
                .update(data)
        });
    }
    getLicenceTypes() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<licenceType>('licenceTypes', ref =>
                            ref.orderBy('code')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    updateLicenceTypes(item: licenceType) {
        return this.firestore
            .collection('licenceTypes')
            .doc(item.id)
            .update(item);
    }
    deleteLicenceType(id: string) {
        return this.firestore
            .collection('licenceTypes')
            .doc(id)
            .delete();
    }
}