import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { status } from '../models/status.model';
import { switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StatusService {
    statussRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth
    ) {
    }

    async createStatus(data: status) {
        const user = await this.fireAuth.currentUser;
        // data.userId = user!.uid;
        this.firestore.collection('statuss').add({
            ...data,
            uid: user!.uid
        }).then((newDocRef) => {
            data.id = newDocRef.id;
            return this.firestore
                .collection('statuss')
                .doc(data.id)
                .update(data)
        });
    }
    getStatuss() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<status>('statuss', ref =>
                            ref.orderBy('description')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    updateStatuss(item: status) {
        return this.firestore
            .collection('statuss')
            .doc(item.id)
            .update(item);
    }
    deleteStatus(id: string) {
        return this.firestore
            .collection('statuss')
            .doc(id)
            .delete();
    }
}