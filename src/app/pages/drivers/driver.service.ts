import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { driver } from '../../models/driver.model';
import { switchMap } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { base64ToFile } from 'ngx-image-cropper';

@Injectable({
    providedIn: 'root'
})
export class DriverService {
    driversRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth,
        private fireStorage: AngularFireStorage
    ) {
    }

    async createDriver(data: driver, avatar: string) {
        const user = await this.fireAuth.currentUser;
        data.userId = user!.uid;
        this.firestore.collection('drivers').add({
            ...data,
            uid: user!.uid
        }).then(async (newDocRef) => {
            data.id = newDocRef.id;
            if (avatar) {
                data.avatar = await this.uploadImage('drivers', newDocRef.id, avatar);
                return this.firestore
                    .collection('drivers')
                    .doc(data.id)
                    .update(data);
            } else {
                return this.firestore
                    .collection('drivers')
                    .doc(data.id)
                    .update(data);
            }
        });
    }
    getDrivers() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<driver>('drivers', ref =>
                            ref.where('uid', '==', user.uid).orderBy('lastName')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    updateDrivers(item: driver, avatar: string) {
        return this.firestore
            .collection('drivers')
            .doc(item.id)
            .update(item).then(async () => {
                if (avatar) {
                    item.avatar = await this.uploadImage('drivers', item.id!, avatar);
                    return this.firestore
                        .collection('drivers')
                        .doc(item.id)
                        .update(item);
                } else {
                    return this.firestore
                        .collection('drivers')
                        .doc(item.id)
                        .update(item);
                }
            });
    }
    deleteDriver(id: string) {
        return this.firestore
            .collection('drivers')
            .doc(id)
            .delete();
    }

    async uploadImage(collection: string, uid: string, file: any): Promise<string> {
        /**
         * You can add random number in file.name to avoid overwrites,
         * or replace the file.name to a static string if you intend to overwrite
         */
        const fileRef = this.fireStorage.ref(collection).child(uid);

        // Upload file in reference
        if (!!file) {
            const imageFile = base64ToFile(file);
            const result = await fileRef.putString(file.replace('data:image/jpeg;base64,', ''), 'base64', { contentType: 'image/png' });

            return await result.ref.getDownloadURL();
        } else {
            return '';
        }
    }
}