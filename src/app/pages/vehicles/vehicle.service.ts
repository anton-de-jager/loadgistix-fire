import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { vehicle } from '../../models/vehicle.model';
import { switchMap } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { base64ToFile } from 'ngx-image-cropper';

@Injectable({
    providedIn: 'root'
})
export class VehicleService {
    vehiclesRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth,
        private fireStorage: AngularFireStorage
    ) {
    }

    async createVehicle(data: vehicle, avatar: string) {
        const user = await this.fireAuth.currentUser;
        data.userId = user!.uid;
        this.firestore.collection('vehicles').add({
            ...data,
            uid: user!.uid
        }).then(async (newDocRef) => {
            data.id = newDocRef.id;
            if (avatar) {
                data.avatar = await this.uploadImage('vehicles', newDocRef.id, avatar);
                return this.firestore
                    .collection('vehicles')
                    .doc(data.id)
                    .update(data);
            } else {
                return this.firestore
                    .collection('vehicles')
                    .doc(data.id)
                    .update(data);
            }
        });
    }
    getVehicles() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<vehicle>('vehicles', ref =>
                            ref.where('uid', '==', user.uid).orderBy('description')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    updateVehicles(item: vehicle, avatar: string) {
        return this.firestore
            .collection('vehicles')
            .doc(item.id)
            .update(item).then(async () => {
                if (avatar) {
                    item.avatar = await this.uploadImage('vehicles', item.id!, avatar);
                    return this.firestore
                        .collection('vehicles')
                        .doc(item.id)
                        .update(item);
                } else {
                    return this.firestore
                        .collection('vehicles')
                        .doc(item.id)
                        .update(item);
                }
            });
    }
    deleteVehicle(id: string) {
        return this.firestore
            .collection('vehicles')
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