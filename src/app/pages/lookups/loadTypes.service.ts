import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { loadType } from '../../models/loadType.model';
import { switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadTypeService {
    loadTypesRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth
    ) {
    }

    async createLoadType(data: loadType) {
        const user = await this.fireAuth.currentUser;
        // data.userId = user!.uid;
        this.firestore.collection('loadTypes').add({
            ...data,
            uid: user!.uid
        }).then((newDocRef) => {
            data.id = newDocRef.id;
            return this.firestore
                .collection('loadTypes')
                .doc(data.id)
                .update(data)
        });
    }
    getLoadTypes() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<loadType>('loadTypes', ref =>
                            ref.orderBy('description')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    updateLoadTypes(item: loadType) {
        return this.firestore
            .collection('loadTypes')
            .doc(item.id)
            .update(item);
    }
    deleteLoadType(id: string) {
        return this.firestore
            .collection('loadTypes')
            .doc(id)
            .delete();
    }
}